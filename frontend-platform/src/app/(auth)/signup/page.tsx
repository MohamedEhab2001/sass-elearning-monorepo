'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/auth-context';
import { authService } from '@/services/auth.service';
import type { ISignupRequest } from '@/../../shared/types';

export default function SignupPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [formData, setFormData] = useState<ISignupRequest>({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    academyName: '',
    academySlug: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof ISignupRequest, string>>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string>('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Auto-generate slug from academy name
    if (name === 'academyName') {
      const slug = value
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\u0600-\u06FFa-z0-9-]/g, '');
      setFormData((prev) => ({ ...prev, academySlug: slug }));
    }

    // Clear error when user starts typing
    if (errors[name as keyof ISignupRequest]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof ISignupRequest, string>> = {};

    if (!formData.email) {
      newErrors.email = 'البريد الإلكتروني مطلوب';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'البريد الإلكتروني غير صحيح';
    }

    if (!formData.password) {
      newErrors.password = 'كلمة المرور مطلوبة';
    } else if (formData.password.length < 8) {
      newErrors.password = 'كلمة المرور يجب أن تكون 8 أحرف على الأقل';
    }

    if (!formData.firstName) {
      newErrors.firstName = 'الاسم الأول مطلوب';
    }

    if (!formData.lastName) {
      newErrors.lastName = 'اسم العائلة مطلوب';
    }

    if (!formData.academyName) {
      newErrors.academyName = 'اسم الأكاديمية مطلوب';
    }

    if (!formData.academySlug) {
      newErrors.academySlug = 'رابط الأكاديمية مطلوب';
    } else if (!/^[a-z0-9-]+$/.test(formData.academySlug)) {
      newErrors.academySlug = 'الرابط يجب أن يحتوي على أحرف إنجليزية صغيرة وأرقام وشرطات فقط';
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
      const response = await authService.signup(formData);

      // Log the user in
      login(response.accessToken, response.user, response.tenant);

      // Show verification message if token is present (dev mode)
      if (response.verificationToken) {
        console.log('Verification token:', response.verificationToken);
      }

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Signup error:', error);
      setServerError(error.message || 'حدث خطأ أثناء إنشاء الحساب');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
            إنشاء أكاديميتك التعليمية
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            ابدأ رحلتك في التعليم الإلكتروني الآن
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {serverError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {serverError}
            </div>
          )}

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="الاسم الأول"
                name="firstName"
                type="text"
                value={formData.firstName}
                onChange={handleChange}
                error={errors.firstName}
                disabled={isLoading}
                placeholder="محمد"
              />

              <Input
                label="اسم العائلة"
                name="lastName"
                type="text"
                value={formData.lastName}
                onChange={handleChange}
                error={errors.lastName}
                disabled={isLoading}
                placeholder="أحمد"
              />
            </div>

            <Input
              label="البريد الإلكتروني"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              disabled={isLoading}
              placeholder="example@domain.com"
            />

            <Input
              label="كلمة المرور"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              disabled={isLoading}
              placeholder="••••••••"
            />

            <Input
              label="اسم الأكاديمية"
              name="academyName"
              type="text"
              value={formData.academyName}
              onChange={handleChange}
              error={errors.academyName}
              disabled={isLoading}
              placeholder="أكاديمية النجاح"
            />

            <Input
              label="رابط الأكاديمية"
              name="academySlug"
              type="text"
              value={formData.academySlug}
              onChange={handleChange}
              error={errors.academySlug}
              disabled={isLoading}
              placeholder="academy-success"
            />
            <p className="text-xs text-gray-500 mt-1">
              سيكون رابط أكاديميتك: {formData.academySlug || 'academy-slug'}.academy.com
            </p>
          </div>

          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={isLoading}
          >
            {isLoading ? 'جاري إنشاء الحساب...' : 'إنشاء الحساب'}
          </Button>

          <p className="text-center text-sm text-gray-600">
            لديك حساب بالفعل؟{' '}
            <Link href="/login" className="font-medium text-primary hover:text-primary/90">
              تسجيل الدخول
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
