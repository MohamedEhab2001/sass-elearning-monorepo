'use client';

import { useState, useEffect } from 'react';
import { use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTenant } from '../../../providers';
import { useAuth } from '@/store/auth-store';
import { apiClient } from '@/lib/api-client';
import { ShoppingCart, CreditCard, Lock, ArrowRight } from 'lucide-react';

interface Course {
  _id: string;
  title: string;
  slug: string;
  description: string;
  thumbnail: string | null;
  price: number;
  isFree: boolean;
  instructorId: {
    fullName: string;
  };
}

export default function CheckoutPage({
  params,
}: {
  params: Promise<{ tenantSlug: string; slug: string }>;
}) {
  const resolvedParams = use(params);
  const { tenantSlug, branding } = useTenant();
  const router = useRouter();
  const { accessToken, user } = useAuth();

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!accessToken) {
      router.push(`/a/${tenantSlug}/auth/login`);
      return;
    }

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/public/courses/${tenantSlug}/${resolvedParams.slug}`)
      .then((res) => res.json())
      .then((data) => {
        setCourse(data);
        setLoading(false);

        if (data.isFree) {
          router.push(`/a/${tenantSlug}/courses/${data.slug}`);
        }
      })
      .catch((err) => {
        console.error('Failed to load course:', err);
        setError('فشل تحميل معلومات الدورة');
        setLoading(false);
      });
  }, [tenantSlug, resolvedParams.slug, accessToken, router]);

  const handleProceedToPayment = async () => {
    if (!course || !accessToken) return;

    setProcessing(true);
    setError('');

    try {
      const response = await apiClient.post<{ paymentUrl: string; transactionId: string }>(
        '/payments/create',
        {
          courseId: course._id,
          amount: course.price,
          currency: 'EGP',
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

  // Format number to Arabic
  const formatArabicNumber = (num: number): string => {
    const arabicNumbers = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    return num
      .toString()
      .split('')
      .map((digit) => (digit >= '0' && digit <= '9' ? arabicNumbers[parseInt(digit)] : digit))
      .join('');
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

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">الدورة غير موجودة</h2>
          <Link href={`/a/${tenantSlug}/courses`} className="text-blue-600 hover:underline">
            العودة إلى الدورات
          </Link>
        </div>
      </div>
    );
  }

  const tax = course.price * 0.14; // 14% VAT in Egypt
  const total = course.price + tax;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href={`/a/${tenantSlug}/courses`} className="flex items-center gap-2">
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
              <h1 className="text-2xl font-bold text-gray-900 mb-6">إتمام عملية الشراء</h1>

              {error && (
                <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              {/* User Info */}
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">معلومات المشتري</h2>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">الاسم:</span>
                    <span className="font-medium text-gray-900">{user?.fullName}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">البريد الإلكتروني:</span>
                    <span className="font-medium text-gray-900" dir="ltr">
                      {user?.email}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">طريقة الدفع</h2>
                <div className="border-2 border-blue-500 rounded-lg p-4 bg-blue-50">
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-6 w-6 text-blue-600" />
                    <div>
                      <p className="font-semibold text-gray-900">بطاقة الائتمان / الدفع الإلكتروني</p>
                      <p className="text-sm text-gray-600">Paymob - بوابة دفع آمنة</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Terms */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  بالمتابعة إلى الدفع، فإنك توافق على{' '}
                  <Link href="#" className="text-blue-600 hover:underline">
                    شروط الخدمة
                  </Link>{' '}
                  و
                  <Link href="#" className="text-blue-600 hover:underline">
                    {' '}
                    سياسة الخصوصية
                  </Link>
                </p>
              </div>

              {/* Payment Button */}
              <button
                onClick={handleProceedToPayment}
                disabled={processing}
                className="w-full py-4 px-6 rounded-lg text-white font-semibold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                style={{
                  background: `linear-gradient(135deg, rgb(var(--color-primary)) 0%, rgb(var(--color-secondary)) 100%)`,
                }}
              >
                {processing ? (
                  <>
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    جاري التحويل إلى بوابة الدفع...
                  </>
                ) : (
                  <>
                    <Lock className="h-5 w-5" />
                    المتابعة إلى الدفع الآمن
                  </>
                )}
              </button>
            </div>

            {/* Security Notice */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Lock className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-green-900 mb-1">عملية دفع آمنة ومشفرة</p>
                  <p className="text-sm text-green-700">
                    جميع المعاملات محمية بتشفير SSL. لا نقوم بتخزين معلومات بطاقتك الائتمانية.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-4">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <ShoppingCart className="h-6 w-6" />
                ملخص الطلب
              </h2>

              {/* Course Info */}
              <div className="mb-6">
                {course.thumbnail && (
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-32 object-cover rounded-lg mb-3"
                  />
                )}
                <h3 className="font-semibold text-gray-900 mb-2">{course.title}</h3>
                <p className="text-sm text-gray-600">بواسطة {course.instructorId.fullName}</p>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 mb-6 pb-6 border-b">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">سعر الدورة:</span>
                  <span className="font-semibold" dir="ltr">
                    {formatArabicNumber(course.price)} جنيه
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">ضريبة القيمة المضافة (14%):</span>
                  <span className="font-semibold" dir="ltr">
                    {formatArabicNumber(Math.round(tax))} جنيه
                  </span>
                </div>
              </div>

              {/* Total */}
              <div className="flex items-center justify-between mb-6">
                <span className="text-xl font-bold text-gray-900">المجموع الكلي:</span>
                <span className="text-2xl font-bold" dir="ltr" style={{ color: `rgb(var(--color-primary))` }}>
                  {formatArabicNumber(Math.round(total))} جنيه
                </span>
              </div>

              {/* Money-back Guarantee */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900 font-semibold mb-1">ضمان استرداد الأموال</p>
                <p className="text-xs text-blue-700">
                  يمكنك استرداد أموالك بالكامل خلال 30 يوماً إذا لم تكن راضياً عن الدورة
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
