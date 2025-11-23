'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/store/auth-store';
import { apiClient } from '@/lib/api-client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DollarSign, Check, X, Save, Info } from 'lucide-react';

interface SubscriptionPricingSettings {
  subscriptionEnabled: boolean;
  monthlyPrice: number | null;
  annualPrice: number | null;
}

export default function PricingSettingsPage() {
  const router = useRouter();
  const { accessToken, user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [subscriptionEnabled, setSubscriptionEnabled] = useState(false);
  const [monthlyPrice, setMonthlyPrice] = useState<string>('');
  const [annualPrice, setAnnualPrice] = useState<string>('');

  useEffect(() => {
    if (!accessToken) {
      router.push('/auth/login');
      return;
    }

    loadPricingSettings();
  }, [accessToken, router]);

  const loadPricingSettings = async () => {
    try {
      setLoading(true);
      setError('');

      // Get tenant settings
      const tenant = await apiClient.get<any>(
        `/tenants/${user?.tenantId}`,
        accessToken!
      );

      setSubscriptionEnabled(tenant.subscriptionEnabled || false);
      setMonthlyPrice(tenant.monthlyPrice ? tenant.monthlyPrice.toString() : '');
      setAnnualPrice(tenant.annualPrice ? tenant.annualPrice.toString() : '');
    } catch (err: any) {
      setError(err.message || 'فشل تحميل إعدادات التسعير');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      // Validate
      if (subscriptionEnabled) {
        if (!monthlyPrice || parseFloat(monthlyPrice) <= 0) {
          setError('يجب إدخال سعر شهري صحيح');
          return;
        }
        if (!annualPrice || parseFloat(annualPrice) <= 0) {
          setError('يجب إدخال سعر سنوي صحيح');
          return;
        }
      }

      const updateData: SubscriptionPricingSettings = {
        subscriptionEnabled,
        monthlyPrice: subscriptionEnabled ? parseFloat(monthlyPrice) : null,
        annualPrice: subscriptionEnabled ? parseFloat(annualPrice) : null,
      };

      await apiClient.patch(
        `/tenants/${user?.tenantId}`,
        updateData,
        accessToken!
      );

      setSuccess('تم حفظ إعدادات التسعير بنجاح!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'فشل حفظ الإعدادات');
    } finally {
      setSaving(false);
    }
  };

  const calculateMonthlySavings = () => {
    if (!monthlyPrice || !annualPrice) return 0;
    const monthly = parseFloat(monthlyPrice);
    const annual = parseFloat(annualPrice);
    const yearlyMonthly = monthly * 12;
    return yearlyMonthly - annual;
  };

  const calculateSavingsPercentage = () => {
    if (!monthlyPrice || !annualPrice) return 0;
    const savings = calculateMonthlySavings();
    const yearlyMonthly = parseFloat(monthlyPrice) * 12;
    return Math.round((savings / yearlyMonthly) * 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">إعدادات التسعير والاشتراكات</h1>
        <p className="text-gray-600 mt-1">
          قم بتفعيل نظام الاشتراكات وتحديد الأسعار للوصول الشامل لجميع دوراتك
        </p>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="bg-red-50 border-r-4 border-red-500 p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <X className="h-5 w-5 text-red-600" />
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border-r-4 border-green-500 p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <Check className="h-5 w-5 text-green-600" />
            <p className="text-green-800">{success}</p>
          </div>
        </div>
      )}

      {/* Subscription Toggle */}
      <Card className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              تفعيل نظام الاشتراكات
            </h2>
            <p className="text-gray-600 text-sm mb-4">
              عند تفعيل الاشتراكات، يمكن للطلاب الاشتراك شهرياً أو سنوياً للوصول لجميع دوراتك
              بدلاً من شراء كل دورة بشكل منفصل.
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-1">ملاحظة هامة:</p>
                <ul className="space-y-1 list-disc list-inside">
                  <li>الطلاب المشتركون يمكنهم الوصول لجميع دوراتك المنشورة</li>
                  <li>يمكن للطلاب الاختيار بين الشراء الفردي للدورات أو الاشتراك</li>
                  <li>الاشتراكات تتجدد تلقائياً ما لم يقم الطالب بالإلغاء</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mr-4">
            <button
              onClick={() => setSubscriptionEnabled(!subscriptionEnabled)}
              className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors ${
                subscriptionEnabled ? 'bg-green-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                  subscriptionEnabled ? 'translate-x-9' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </Card>

      {/* Pricing Settings */}
      {subscriptionEnabled && (
        <>
          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              تحديد أسعار الاشتراكات
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Monthly Price */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  السعر الشهري
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                    <DollarSign className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={monthlyPrice}
                    onChange={(e) => setMonthlyPrice(e.target.value)}
                    className="block w-full ps-10 pe-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="مثال: 99.00"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  السعر بالجنيه المصري (EGP)
                </p>
              </div>

              {/* Annual Price */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  السعر السنوي
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                    <DollarSign className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={annualPrice}
                    onChange={(e) => setAnnualPrice(e.target.value)}
                    className="block w-full ps-10 pe-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="مثال: 990.00"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  السعر بالجنيه المصري (EGP)
                </p>
              </div>
            </div>

            {/* Savings Calculation */}
            {monthlyPrice && annualPrice && parseFloat(monthlyPrice) > 0 && parseFloat(annualPrice) > 0 && (
              <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-900 mb-2">توفير الاشتراك السنوي</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">السعر الشهري × 12 شهر:</p>
                    <p className="font-bold text-gray-900">
                      {(parseFloat(monthlyPrice) * 12).toFixed(2)} ج.م
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">السعر السنوي:</p>
                    <p className="font-bold text-gray-900">
                      {parseFloat(annualPrice).toFixed(2)} ج.م
                    </p>
                  </div>
                  <div className="col-span-2 pt-3 border-t border-green-300">
                    <p className="text-gray-600">التوفير للطالب:</p>
                    <p className="font-bold text-green-700 text-lg">
                      {calculateMonthlySavings().toFixed(2)} ج.م ({calculateSavingsPercentage()}%)
                    </p>
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* Preview */}
          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              معاينة كيف ستظهر الأسعار للطلاب
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Monthly Plan Preview */}
              <div className="border-2 border-gray-200 rounded-lg p-6 hover:border-blue-500 transition-colors">
                <h3 className="text-lg font-bold text-gray-900 mb-2">الاشتراك الشهري</h3>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-4xl font-bold text-gray-900">
                    {monthlyPrice || '0'}
                  </span>
                  <span className="text-gray-600">ج.م / شهر</span>
                </div>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    الوصول لجميع الدورات
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    تجديد شهري تلقائي
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    إلغاء في أي وقت
                  </li>
                </ul>
              </div>

              {/* Annual Plan Preview */}
              <div className="border-2 border-blue-500 rounded-lg p-6 relative bg-blue-50">
                <div className="absolute -top-3 start-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-xs font-semibold">
                  الأكثر توفيراً
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">الاشتراك السنوي</h3>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-4xl font-bold text-gray-900">
                    {annualPrice || '0'}
                  </span>
                  <span className="text-gray-600">ج.م / سنة</span>
                </div>
                {calculateSavingsPercentage() > 0 && (
                  <p className="text-sm text-green-600 font-semibold mb-4">
                    وفّر {calculateSavingsPercentage()}%
                  </p>
                )}
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    الوصول لجميع الدورات
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    تجديد سنوي تلقائي
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    إلغاء في أي وقت
                  </li>
                </ul>
              </div>
            </div>
          </Card>
        </>
      )}

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2"
          size="lg"
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              جاري الحفظ...
            </>
          ) : (
            <>
              <Save className="h-5 w-5" />
              حفظ الإعدادات
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
