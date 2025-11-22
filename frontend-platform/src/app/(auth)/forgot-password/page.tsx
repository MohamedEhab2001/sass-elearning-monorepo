'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { authService } from '@/services/auth.service';
import type { IForgotPasswordRequest } from '@/../../shared/types';

export default function ForgotPasswordPage() {
  const [formData, setFormData] = useState<IForgotPasswordRequest>({
    email: '',
  });

  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [resetToken, setResetToken] = useState<string>(''); // For dev mode

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ email: e.target.value });
    if (error) setError('');
  };

  const validateForm = (): boolean => {
    if (!formData.email) {
      setError('البريد الإلكتروني مطلوب');
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('البريد الإلكتروني غير صحيح');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await authService.forgotPassword(formData);
      setIsSuccess(true);

      // In dev mode, show the reset token
      if (response.resetToken) {
        setResetToken(response.resetToken);
        console.log('Reset token:', response.resetToken);
      }
    } catch (error: any) {
      console.error('Forgot password error:', error);
      setError(error.message || 'حدث خطأ أثناء إرسال رسالة إعادة التعيين');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="bg-green-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto">
            <svg
              className="w-10 h-10 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>

          <h2 className="text-3xl font-bold text-gray-900">
            تحقق من بريدك الإلكتروني
          </h2>

          <p className="text-gray-600">
            تم إرسال رسالة إعادة تعيين كلمة المرور إلى <strong>{formData.email}</strong>
          </p>

          {resetToken && (
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg text-right">
              <p className="text-sm text-yellow-800 mb-2">
                <strong>وضع التطوير:</strong> رمز إعادة التعيين:
              </p>
              <code className="block bg-yellow-100 p-2 rounded text-sm break-all">
                {resetToken}
              </code>
              <Link
                href={`/reset-password?token=${resetToken}`}
                className="inline-block mt-3 text-sm text-primary hover:underline"
              >
                الانتقال إلى صفحة إعادة التعيين
              </Link>
            </div>
          )}

          <p className="text-sm text-gray-500">
            لم تستلم الرسالة؟ تحقق من مجلد البريد المزعج
          </p>

          <Link href="/login">
            <Button variant="outline" className="w-full">
              العودة إلى تسجيل الدخول
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
            نسيت كلمة المرور؟
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة التعيين
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <Input
            label="البريد الإلكتروني"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            disabled={isLoading}
            placeholder="example@domain.com"
          />

          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={isLoading}
          >
            {isLoading ? 'جاري الإرسال...' : 'إرسال رابط إعادة التعيين'}
          </Button>

          <p className="text-center text-sm text-gray-600">
            تذكرت كلمة المرور؟{' '}
            <Link href="/login" className="font-medium text-primary hover:text-primary/90">
              تسجيل الدخول
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
