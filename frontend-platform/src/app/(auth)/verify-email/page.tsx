'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { authService } from '@/services/auth.service';

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [isLoading, setIsLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (token) {
      verifyEmail(token);
    }
  }, [token]);

  const verifyEmail = async (verificationToken: string) => {
    setIsLoading(true);
    setError('');

    try {
      await authService.verifyEmail({ token: verificationToken });
      setIsVerified(true);
    } catch (error: any) {
      console.error('Email verification error:', error);
      setError(error.message || 'حدث خطأ أثناء تأكيد البريد الإلكتروني');
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualVerification = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const manualToken = formData.get('token') as string;

    if (manualToken) {
      await verifyEmail(manualToken);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري تأكيد البريد الإلكتروني...</p>
        </div>
      </div>
    );
  }

  if (isVerified) {
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
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <h2 className="text-3xl font-bold text-gray-900">
            تم تأكيد البريد الإلكتروني بنجاح!
          </h2>

          <p className="text-gray-600">
            يمكنك الآن الوصول إلى جميع ميزات المنصة
          </p>

          <Button
            onClick={() => router.push('/dashboard')}
            className="w-full"
            size="lg"
          >
            الانتقال إلى لوحة التحكم
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
            تأكيد البريد الإلكتروني
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {token
              ? 'تحقق من رمز التأكيد المرسل إلى بريدك'
              : 'أدخل رمز التأكيد المرسل إلى بريدك الإلكتروني'}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {!token && (
          <form className="mt-8 space-y-6" onSubmit={handleManualVerification}>
            <div>
              <label htmlFor="token" className="block text-sm font-medium text-gray-700 mb-2">
                رمز التأكيد
              </label>
              <input
                type="text"
                name="token"
                id="token"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="أدخل رمز التأكيد"
              />
            </div>

            <Button type="submit" className="w-full" size="lg">
              تأكيد البريد الإلكتروني
            </Button>

            <p className="text-center text-sm text-gray-600">
              <Link href="/login" className="font-medium text-primary hover:text-primary/90">
                العودة إلى تسجيل الدخول
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
