'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { authService } from '@/services/auth.service';
import type { IResetPasswordRequest } from '@/../../shared/types';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [formData, setFormData] = useState<IResetPasswordRequest>({
    token: token,
    newPassword: '',
  });

  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{ newPassword?: string; confirmPassword?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [serverError, setServerError] = useState<string>('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === 'newPassword') {
      setFormData((prev) => ({ ...prev, newPassword: value }));
      if (errors.newPassword) {
        setErrors((prev) => ({ ...prev, newPassword: '' }));
      }
    } else if (name === 'confirmPassword') {
      setConfirmPassword(value);
      if (errors.confirmPassword) {
        setErrors((prev) => ({ ...prev, confirmPassword: '' }));
      }
    } else if (name === 'token') {
      setFormData((prev) => ({ ...prev, token: value }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { newPassword?: string; confirmPassword?: string } = {};

    if (!formData.token) {
      setServerError('رمز إعادة التعيين مطلوب');
      return false;
    }

    if (!formData.newPassword) {
      newErrors.newPassword = 'كلمة المرور الجديدة مطلوبة';
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = 'كلمة المرور يجب أن تكون 8 أحرف على الأقل';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'تأكيد كلمة المرور مطلوب';
    } else if (confirmPassword !== formData.newPassword) {
      newErrors.confirmPassword = 'كلمة المرور غير متطابقة';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      await authService.resetPassword(formData);
      setIsSuccess(true);
    } catch (error: any) {
      console.error('Reset password error:', error);
      setServerError(error.message || 'حدث خطأ أثناء إعادة تعيين كلمة المرور');
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
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <h2 className="text-3xl font-bold text-gray-900">
            تم إعادة تعيين كلمة المرور بنجاح!
          </h2>

          <p className="text-gray-600">
            يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة
          </p>

          <Button
            onClick={() => router.push('/login')}
            className="w-full"
            size="lg"
          >
            تسجيل الدخول
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
            إعادة تعيين كلمة المرور
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            أدخل كلمة المرور الجديدة
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {serverError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {serverError}
            </div>
          )}

          <div className="space-y-4">
            {!token && (
              <Input
                label="رمز إعادة التعيين"
                name="token"
                type="text"
                value={formData.token}
                onChange={handleChange}
                disabled={isLoading}
                placeholder="أدخل رمز إعادة التعيين"
              />
            )}

            <Input
              label="كلمة المرور الجديدة"
              name="newPassword"
              type="password"
              value={formData.newPassword}
              onChange={handleChange}
              error={errors.newPassword}
              disabled={isLoading}
              placeholder="••••••••"
            />

            <Input
              label="تأكيد كلمة المرور"
              name="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
              disabled={isLoading}
              placeholder="••••••••"
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={isLoading}
          >
            {isLoading ? 'جاري إعادة التعيين...' : 'إعادة تعيين كلمة المرور'}
          </Button>

          <p className="text-center text-sm text-gray-600">
            <Link href="/login" className="font-medium text-primary hover:text-primary/90">
              العودة إلى تسجيل الدخول
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
