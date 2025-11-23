'use client';

import { useState, useEffect } from 'react';
import { use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useTenant } from '../../providers';
import { useAuth } from '@/store/auth-store';
import { apiClient } from '@/lib/api-client';
import { ShoppingCart, CreditCard, Lock, Check, Star, Tag, ArrowRight } from 'lucide-react';

interface SubscriptionPricing {
  subscriptionEnabled: boolean;
  monthlyPrice: number | null;
  annualPrice: number | null;
}

export default function SubscriptionCheckoutPage({
  params,
}: {
  params: Promise<{ tenantSlug: string }>;
}) {
  const resolvedParams = use(params);
  const { tenantSlug, branding } = useTenant();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { accessToken, user } = useAuth();

  const [pricing, setPricing] = useState<SubscriptionPricing | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [discountCode, setDiscountCode] = useState('');
  const [discountApplied, setDiscountApplied] = useState<any>(null);
  const [validatingDiscount, setValidatingDiscount] = useState(false);

  const plan = searchParams.get('plan') as 'monthly' | 'annual' | null;

  useEffect(() => {
    if (!accessToken) {
      router.push(`/a/${tenantSlug}/auth/login?redirect=/a/${tenantSlug}/checkout/subscription?plan=${plan}`);
      return;
    }

    if (!plan || (plan !== 'monthly' && plan !== 'annual')) {
      router.push(`/a/${tenantSlug}/pricing`);
      return;
    }

    loadPricingData();
  }, [tenantSlug, accessToken, plan, router]);

  const loadPricingData = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/public/tenants/${tenantSlug}`
      );
      const tenant = await response.json();

      setPricing({
        subscriptionEnabled: tenant.subscriptionEnabled || false,
        monthlyPrice: tenant.monthlyPrice,
        annualPrice: tenant.annualPrice,
      });

      if (!tenant.subscriptionEnabled) {
        router.push(`/a/${tenantSlug}/courses`);
      }
    } catch (error) {
      console.error('Failed to load pricing:', error);
      setError('فشل تحميل معلومات التسعير');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyDiscount = async () => {
    if (!discountCode.trim() || !pricing || !plan) return;

    setValidatingDiscount(true);
    setError('');

    try {
      const amount = plan === 'monthly' ? pricing.monthlyPrice! : pricing.annualPrice!;

      const result = await apiClient.post<any>(
        '/discounts/validate',
        {
          code: discountCode.toUpperCase(),
          applicableTo: 'subscription',
          amount,
        },
        accessToken!
      );

      if (result.isValid) {
        setDiscountApplied(result);
      } else {
        setError(result.message || 'كود الخصم غير صالح');
      }
    } catch (err: any) {
      setError(err.message || 'فشل التحقق من كود الخصم');
    } finally {
      setValidatingDiscount(false);
    }
  };

  const handleRemoveDiscount = () => {
    setDiscountApplied(null);
    setDiscountCode('');
  };

  const handleProceedToPayment = async () => {
    if (!pricing || !plan || !accessToken) return;

    setProcessing(true);
    setError('');

    try {
      const amount = plan === 'monthly' ? pricing.monthlyPrice! : pricing.annualPrice!;
      const finalAmount = discountApplied ? discountApplied.discountedAmount : amount;

      const response = await apiClient.post<{ paymentUrl: string; transactionId: string }>(
        '/payments/subscription/create',
        {
          plan,
          amount: finalAmount,
          currency: 'EGP',
          discountCode: discountApplied ? discountCode.toUpperCase() : undefined,
        },
        accessToken
      );

      // Redirect to Paymob payment page
      window.location.href = response.paymentUrl;
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء إنشاء عملية الدفع');
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!pricing || !plan) {
    return null;
  }

  const baseAmount = plan === 'monthly' ? pricing.monthlyPrice! : pricing.annualPrice!;
  const tax = baseAmount * 0.14; // 14% VAT in Egypt
  const subtotalWithTax = baseAmount + tax;

  const finalAmount = discountApplied ? discountApplied.discountedAmount : baseAmount;
  const finalTax = finalAmount * 0.14;
  const total = finalAmount + finalTax;

  const savings = plan === 'annual' && pricing.monthlyPrice && pricing.annualPrice
    ? (pricing.monthlyPrice * 12) - pricing.annualPrice
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href={`/a/${tenantSlug}/pricing`} className="flex items-center gap-2">
              {branding.logo && <img src={branding.logo} alt={branding.name} className="h-10 w-auto" />}
              <span className="text-xl font-bold text-gray-900">{branding.name}</span>
            </Link>
            <div className="flex items-center gap-2 text-gray-600">
              <Lock className="h-5 w-5" />
              <span className="text-sm">دفع آمن ومشفر</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-6">إتمام عملية الاشتراك</h1>

              {error && (
                <div className="bg-red-50 border-r-4 border-red-500 p-4 rounded-lg mb-6">
                  <p className="text-red-800">{error}</p>
                </div>
              )}

              {/* Plan Selection Info */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  الخطة المختارة
                </label>
                <div className="border-2 border-blue-500 rounded-lg p-4 bg-blue-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        {plan === 'monthly' ? 'الاشتراك الشهري' : 'الاشتراك السنوي'}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {plan === 'monthly' ? 'يتجدد كل شهر' : 'يتجدد كل سنة'}
                      </p>
                    </div>
                    <div className="text-end">
                      <div className="text-2xl font-bold text-gray-900">
                        {baseAmount.toFixed(2)} ج.م
                      </div>
                      <div className="text-sm text-gray-600">
                        {plan === 'monthly' ? '/ شهر' : '/ سنة'}
                      </div>
                    </div>
                  </div>

                  {plan === 'annual' && savings > 0 && (
                    <div className="mt-3 pt-3 border-t border-blue-200">
                      <div className="flex items-center gap-2 text-green-700">
                        <Star className="h-5 w-5" />
                        <span className="font-semibold">
                          وفّر {savings.toFixed(2)} ج.م مقارنة بالاشتراك الشهري
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-4 flex justify-center">
                  <Link
                    href={`/a/${tenantSlug}/pricing`}
                    className="text-blue-600 hover:underline text-sm"
                  >
                    تغيير الخطة
                  </Link>
                </div>
              </div>

              {/* Discount Code */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  كود الخصم (اختياري)
                </label>

                {discountApplied ? (
                  <div className="bg-green-50 border-2 border-green-500 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                          <Check className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                          <div className="font-bold text-gray-900">
                            كود الخصم: {discountApplied.discount.code}
                          </div>
                          <div className="text-sm text-gray-600">
                            خصم {discountApplied.discountAmount.toFixed(2)} ج.م
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={handleRemoveDiscount}
                        className="text-red-600 hover:text-red-700 text-sm font-semibold"
                      >
                        إزالة
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-3">
                    <div className="flex-1 relative">
                      <Tag className="absolute start-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        value={discountCode}
                        onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                        placeholder="أدخل كود الخصم"
                        className="w-full ps-10 pe-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
                        disabled={validatingDiscount}
                      />
                    </div>
                    <button
                      onClick={handleApplyDiscount}
                      disabled={!discountCode.trim() || validatingDiscount}
                      className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      {validatingDiscount ? 'جاري التحقق...' : 'تطبيق'}
                    </button>
                  </div>
                )}
              </div>

              {/* Features Included */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-4">ما المضمون في اشتراكك:</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <Check className="h-4 w-4 text-green-600" />
                    </div>
                    <span className="text-gray-700">الوصول الكامل لجميع الدورات التدريبية</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <Check className="h-4 w-4 text-green-600" />
                    </div>
                    <span className="text-gray-700">شهادات معتمدة عند إتمام أي دورة</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <Check className="h-4 w-4 text-green-600" />
                    </div>
                    <span className="text-gray-700">محتوى جديد يضاف بشكل دوري</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <Check className="h-4 w-4 text-green-600" />
                    </div>
                    <span className="text-gray-700">دعم فني على مدار الساعة</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <Check className="h-4 w-4 text-green-600" />
                    </div>
                    <span className="text-gray-700">إمكانية الإلغاء في أي وقت</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">طريقة الدفع</h2>
              <div className="border-2 border-gray-200 rounded-lg p-4 flex items-center gap-3">
                <CreditCard className="h-6 w-6 text-blue-600" />
                <div>
                  <div className="font-semibold text-gray-900">بطاقة الائتمان / الخصم</div>
                  <div className="text-sm text-gray-600">معالجة آمنة عبر Paymob</div>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
                <Lock className="h-4 w-4" />
                <span>جميع المعاملات مشفرة وآمنة 100%</span>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">ملخص الطلب</h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-700">
                  <span>السعر الأساسي</span>
                  <span className="font-semibold">{baseAmount.toFixed(2)} ج.م</span>
                </div>

                {discountApplied && (
                  <div className="flex justify-between text-green-600">
                    <span>الخصم ({discountApplied.discount.code})</span>
                    <span className="font-semibold">-{discountApplied.discountAmount.toFixed(2)} ج.م</span>
                  </div>
                )}

                <div className="flex justify-between text-gray-700">
                  <span>الضريبة (14%)</span>
                  <span className="font-semibold">{finalTax.toFixed(2)} ج.م</span>
                </div>

                <div className="border-t pt-3 flex justify-between text-lg font-bold text-gray-900">
                  <span>الإجمالي</span>
                  <span>{total.toFixed(2)} ج.م</span>
                </div>
              </div>

              <button
                onClick={handleProceedToPayment}
                disabled={processing}
                className="w-full py-3 px-6 rounded-lg font-semibold text-white transition-all flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
                style={{
                  background: processing ? undefined : `linear-gradient(135deg, rgb(var(--color-primary)) 0%, rgb(var(--color-secondary)) 100%)`,
                }}
              >
                {processing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    جاري المعالجة...
                  </>
                ) : (
                  <>
                    متابعة للدفع
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>

              <div className="mt-4 text-xs text-gray-500 text-center">
                بالمتابعة، أنت توافق على
                {' '}
                <Link href={`/a/${tenantSlug}/terms`} className="text-blue-600 hover:underline">
                  الشروط والأحكام
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="mt-6 pt-6 border-t">
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="flex flex-col items-center">
                    <Lock className="h-6 w-6 text-green-600 mb-1" />
                    <span className="text-xs text-gray-600">دفع آمن</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <Shield className="h-6 w-6 text-blue-600 mb-1" />
                    <span className="text-xs text-gray-600">حماية البيانات</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <Check className="h-6 w-6 text-purple-600 mb-1" />
                    <span className="text-xs text-gray-600">ضمان الجودة</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
