'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useTenant } from '../../providers';
import { XCircle, RefreshCw, ArrowRight, HelpCircle, Mail } from 'lucide-react';

export default function PaymentFailedPage() {
  const { tenantSlug, branding } = useTenant();
  const searchParams = useSearchParams();

  const transactionId = searchParams.get('transaction_id');
  const courseName = searchParams.get('course_name') || 'الدورة';
  const courseSlug = searchParams.get('course_slug');
  const errorMessage = searchParams.get('error') || 'حدث خطأ أثناء معالجة الدفع';

  // Common error reasons in Arabic
  const commonReasons = [
    'رصيد غير كافٍ في البطاقة',
    'بيانات البطاقة غير صحيحة',
    'انتهت صلاحية البطاقة',
    'تم رفض العملية من قبل البنك',
    'انتهت مهلة الدفع',
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full">
        {/* Failed Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          {/* Error Icon */}
          <div className="mb-6 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 animate-pulse bg-red-400 rounded-full opacity-20"></div>
              <XCircle className="h-24 w-24 text-red-500 relative" />
            </div>
          </div>

          {/* Error Message */}
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            فشلت عملية الدفع
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            عذراً، لم نتمكن من إتمام عملية الدفع. لم يتم خصم أي مبلغ من حسابك.
          </p>

          {/* Transaction Details */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">حالة الدفع:</span>
                <span className="font-semibold text-red-700 flex items-center gap-2">
                  <XCircle className="h-5 w-5" />
                  فشل
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
              <div className="pt-3 border-t border-red-300">
                <div className="flex items-start justify-between">
                  <span className="text-gray-600">السبب:</span>
                  <span className="text-sm text-gray-700 text-right max-w-xs">{errorMessage}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Common Reasons */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8 text-right">
            <h3 className="font-bold text-yellow-900 mb-3 flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              الأسباب الشائعة لفشل الدفع
            </h3>
            <ul className="space-y-2 text-sm text-yellow-800">
              {commonReasons.map((reason, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-yellow-500 mt-0.5">•</span>
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {courseSlug && (
              <Link
                href={`/a/${tenantSlug}/checkout/course/${courseSlug}`}
                className="block w-full py-4 px-6 rounded-lg text-white font-semibold text-lg transition-all hover:shadow-lg"
                style={{
                  background: `linear-gradient(135deg, rgb(var(--color-primary)) 0%, rgb(var(--color-secondary)) 100%)`,
                }}
              >
                <RefreshCw className="inline-block h-5 w-5 ml-2" />
                إعادة المحاولة
              </Link>
            )}

            <Link
              href={`/a/${tenantSlug}/courses`}
              className="block w-full py-3 px-6 rounded-lg border-2 border-gray-300 text-gray-700 font-semibold transition-all hover:bg-gray-50"
            >
              <ArrowRight className="inline-block h-5 w-5 ml-2" />
              العودة إلى الدورات
            </Link>
          </div>

          {/* Help Section */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-3">
              هل تحتاج إلى مساعدة؟
            </p>
            <div className="flex items-center justify-center gap-4 text-sm">
              <a
                href="#"
                className="flex items-center gap-2 hover:underline"
                style={{ color: `rgb(var(--color-primary))` }}
              >
                <Mail className="h-4 w-4" />
                تواصل مع الدعم
              </a>
              <span className="text-gray-300">|</span>
              <a
                href="#"
                className="flex items-center gap-2 hover:underline"
                style={{ color: `rgb(var(--color-primary))` }}
              >
                <HelpCircle className="h-4 w-4" />
                الأسئلة الشائعة
              </a>
            </div>
          </div>
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
