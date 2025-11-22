'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useTenant } from '../../providers';
import { CheckCircle, ArrowRight, BookOpen } from 'lucide-react';

export default function PaymentSuccessPage() {
  const { tenantSlug, branding } = useTenant();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [countdown, setCountdown] = useState(10);

  const transactionId = searchParams.get('transaction_id');
  const courseName = searchParams.get('course_name') || 'الدورة';

  useEffect(() => {
    // Countdown to auto-redirect
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push(`/a/${tenantSlug}/my-courses`);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [tenantSlug, router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full">
        {/* Success Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          {/* Success Icon */}
          <div className="mb-6 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 animate-ping bg-green-400 rounded-full opacity-20"></div>
              <CheckCircle className="h-24 w-24 text-green-500 relative" />
            </div>
          </div>

          {/* Success Message */}
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            تمت عملية الدفع بنجاح! 🎉
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            مبروك! لقد تم تسجيلك في الدورة بنجاح وأصبح بإمكانك الوصول إليها الآن
          </p>

          {/* Transaction Details */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">حالة الدفع:</span>
                <span className="font-semibold text-green-700 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  مكتمل
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">الدورة:</span>
                <span className="font-semibold text-gray-900">{courseName}</span>
              </div>
              {transactionId && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">رقم العملية:</span>
                  <span className="font-mono text-sm text-gray-700">{transactionId}</span>
                </div>
              )}
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8 text-right">
            <h3 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              الخطوات التالية
            </h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">•</span>
                <span>ستصلك رسالة تأكيد على البريد الإلكتروني</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">•</span>
                <span>يمكنك البدء في مشاهدة الدورة فوراً من صفحة "دوراتي"</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">•</span>
                <span>يمكنك استرداد المبلغ بالكامل خلال 30 يوماً إذا لم تكن راضياً</span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Link
              href={`/a/${tenantSlug}/my-courses`}
              className="block w-full py-4 px-6 rounded-lg text-white font-semibold text-lg transition-all hover:shadow-lg"
              style={{
                background: `linear-gradient(135deg, rgb(var(--color-primary)) 0%, rgb(var(--color-secondary)) 100%)`,
              }}
            >
              <BookOpen className="inline-block h-5 w-5 ml-2" />
              الذهاب إلى دوراتي
            </Link>

            <Link
              href={`/a/${tenantSlug}/courses`}
              className="block w-full py-3 px-6 rounded-lg border-2 border-gray-300 text-gray-700 font-semibold transition-all hover:bg-gray-50"
            >
              تصفح المزيد من الدورات
            </Link>
          </div>

          {/* Auto-redirect Notice */}
          <p className="mt-6 text-sm text-gray-500">
            سيتم توجيهك تلقائياً إلى صفحة "دوراتي" خلال {countdown} ثانية...
          </p>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <Link
            href={`/a/${tenantSlug}/courses`}
            className="flex items-center justify-center gap-2 text-gray-600 hover:text-gray-900"
          >
            {branding.logo && <img src={branding.logo} alt={branding.name} className="h-8 w-auto" />}
            <span className="font-semibold">{branding.name}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
