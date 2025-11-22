'use client';

import { useState, useEffect } from 'react';
import { use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTenant } from '../../providers';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/store/auth-store';

interface CustomField {
  _id: string;
  fieldName: string;
  fieldLabel: string;
  fieldType: 'text' | 'select' | 'number' | 'date' | 'email' | 'phone';
  options?: string[];
  required: boolean;
  placeholder?: string;
  order: number;
}

export default function SignupPage({ params }: { params: Promise<{ tenantSlug: string }> }) {
  const resolvedParams = use(params);
  const { tenantSlug, branding, tenant } = useTenant();
  const router = useRouter();
  const { setTokens, setUser } = useAuth();

  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [customFieldValues, setCustomFieldValues] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchCustomFields();
  }, [tenant]);

  const fetchCustomFields = async () => {
    if (!tenant?._id) return;

    try {
      const response = await fetch(`http://localhost:3000/custom-fields/${tenant._id}/active`);
      const data = await response.json();
      setCustomFields(data.sort((a: CustomField, b: CustomField) => a.order - b.order));
    } catch (error) {
      console.error('Error fetching custom fields:', error);
    }
  };

  const validateCustomFields = (): boolean => {
    const errors: Record<string, string> = {};
    let isValid = true;

    customFields.forEach((field) => {
      const value = customFieldValues[field.fieldName];

      // Required field validation
      if (field.required && (!value || value === '')) {
        errors[field.fieldName] = `${field.fieldLabel} مطلوب`;
        isValid = false;
        return;
      }

      // Skip validation if field is not filled (and not required)
      if (!value || value === '') return;

      // Type-specific validation
      switch (field.fieldType) {
        case 'email':
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) {
            errors[field.fieldName] = `${field.fieldLabel} يجب أن يكون بريد إلكتروني صحيح`;
            isValid = false;
          }
          break;

        case 'phone':
          const phoneRegex = /^[0-9+\-\s()]+$/;
          if (!phoneRegex.test(value)) {
            errors[field.fieldName] = `${field.fieldLabel} يجب أن يكون رقم هاتف صحيح`;
            isValid = false;
          }
          break;

        case 'number':
          if (isNaN(Number(value))) {
            errors[field.fieldName] = `${field.fieldLabel} يجب أن يكون رقماً`;
            isValid = false;
          }
          break;
      }
    });

    setFieldErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    if (formData.password !== formData.confirmPassword) {
      setError('كلمات المرور غير متطابقة');
      return;
    }

    if (!validateCustomFields()) {
      setError('يرجى تصحيح الأخطاء في النموذج');
      return;
    }

    setLoading(true);

    try {
      const response = await apiClient.post<any>(`/auth/student-signup/${tenant._id}`, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        customFieldValues,
      });

      setTokens(response.accessToken, response.refreshToken);
      setUser(response.user);

      router.push(`/a/${tenantSlug}/courses`);
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء التسجيل');
    } finally {
      setLoading(false);
    }
  };

  const handleCustomFieldChange = (fieldName: string, value: any) => {
    setCustomFieldValues({
      ...customFieldValues,
      [fieldName]: value,
    });
    // Clear error for this field when user starts typing
    if (fieldErrors[fieldName]) {
      setFieldErrors({
        ...fieldErrors,
        [fieldName]: '',
      });
    }
  };

  const renderCustomField = (field: CustomField) => {
    const hasError = !!fieldErrors[field.fieldName];

    switch (field.fieldType) {
      case 'select':
        return (
          <div key={field._id}>
            <label htmlFor={field.fieldName} className="block text-sm font-medium text-gray-700 mb-2">
              {field.fieldLabel}
              {field.required && <span className="text-red-500 mr-1">*</span>}
            </label>
            <select
              id={field.fieldName}
              value={customFieldValues[field.fieldName] || ''}
              onChange={(e) => handleCustomFieldChange(field.fieldName, e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                hasError ? 'border-red-500' : 'border-gray-300'
              }`}
              required={field.required}
            >
              <option value="">اختر...</option>
              {field.options?.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {hasError && <p className="text-red-500 text-sm mt-1">{fieldErrors[field.fieldName]}</p>}
          </div>
        );

      case 'number':
        return (
          <div key={field._id}>
            <label htmlFor={field.fieldName} className="block text-sm font-medium text-gray-700 mb-2">
              {field.fieldLabel}
              {field.required && <span className="text-red-500 mr-1">*</span>}
            </label>
            <input
              id={field.fieldName}
              type="number"
              value={customFieldValues[field.fieldName] || ''}
              onChange={(e) => handleCustomFieldChange(field.fieldName, e.target.value)}
              placeholder={field.placeholder}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                hasError ? 'border-red-500' : 'border-gray-300'
              }`}
              required={field.required}
              dir="ltr"
            />
            {hasError && <p className="text-red-500 text-sm mt-1">{fieldErrors[field.fieldName]}</p>}
          </div>
        );

      case 'date':
        return (
          <div key={field._id}>
            <label htmlFor={field.fieldName} className="block text-sm font-medium text-gray-700 mb-2">
              {field.fieldLabel}
              {field.required && <span className="text-red-500 mr-1">*</span>}
            </label>
            <input
              id={field.fieldName}
              type="date"
              value={customFieldValues[field.fieldName] || ''}
              onChange={(e) => handleCustomFieldChange(field.fieldName, e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                hasError ? 'border-red-500' : 'border-gray-300'
              }`}
              required={field.required}
              dir="ltr"
            />
            {hasError && <p className="text-red-500 text-sm mt-1">{fieldErrors[field.fieldName]}</p>}
          </div>
        );

      case 'email':
      case 'phone':
      case 'text':
      default:
        return (
          <div key={field._id}>
            <label htmlFor={field.fieldName} className="block text-sm font-medium text-gray-700 mb-2">
              {field.fieldLabel}
              {field.required && <span className="text-red-500 mr-1">*</span>}
            </label>
            <input
              id={field.fieldName}
              type={field.fieldType === 'email' ? 'email' : field.fieldType === 'phone' ? 'tel' : 'text'}
              value={customFieldValues[field.fieldName] || ''}
              onChange={(e) => handleCustomFieldChange(field.fieldName, e.target.value)}
              placeholder={field.placeholder}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                hasError ? 'border-red-500' : 'border-gray-300'
              }`}
              required={field.required}
              dir={field.fieldType === 'email' || field.fieldType === 'phone' ? 'ltr' : 'rtl'}
            />
            {hasError && <p className="text-red-500 text-sm mt-1">{fieldErrors[field.fieldName]}</p>}
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Logo and Title */}
        <div className="text-center">
          {branding.logo && (
            <img src={branding.logo} alt={branding.name} className="h-16 w-auto mx-auto mb-4" />
          )}
          <h2 className="text-3xl font-bold text-gray-900 mb-2">إنشاء حساب جديد</h2>
          <p className="text-gray-600">انضم إلى {branding.name} وابدأ رحلتك التعليمية</p>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                الاسم الأول
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                required
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="أدخل اسمك الأول"
              />
            </div>

            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                اسم العائلة
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                required
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="أدخل اسم العائلة"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                البريد الإلكتروني
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="example@email.com"
                dir="ltr"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                كلمة المرور
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="أدخل كلمة المرور (8 أحرف على الأقل)"
                dir="ltr"
                minLength={8}
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                تأكيد كلمة المرور
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="أعد إدخال كلمة المرور"
                dir="ltr"
              />
            </div>

            {/* Dynamic Custom Fields */}
            {customFields.length > 0 && (
              <>
                <div className="pt-4 border-t">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">معلومات إضافية</h3>
                </div>
                {customFields.map((field) => renderCustomField(field))}
              </>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-lg text-white font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: `linear-gradient(135deg, rgb(var(--color-primary)) 0%, rgb(var(--color-secondary)) 100%)`,
            }}
          >
            {loading ? 'جاري التسجيل...' : 'إنشاء حساب'}
          </button>

          <div className="text-center">
            <p className="text-gray-600">
              لديك حساب بالفعل؟{' '}
              <Link
                href={`/a/${tenantSlug}/auth/login`}
                className="font-semibold hover:underline"
                style={{ color: `rgb(var(--color-primary))` }}
              >
                تسجيل الدخول
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
