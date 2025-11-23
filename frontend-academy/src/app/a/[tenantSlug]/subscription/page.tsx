'use client';

import { useState, useEffect } from 'react';
import { use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTenant } from '../providers';
import { useAuth } from '@/store/auth-store';
import { apiClient } from '@/lib/api-client';
import {
  Check,
  X,
  Calendar,
  CreditCard,
  AlertCircle,
  RefreshCw,
  XCircle,
  Star,
  TrendingUp,
} from 'lucide-react';

interface Subscription {
  _id: string;
  plan: 'monthly' | 'annual';
  price: number;
  currency: string;
  status: 'active' | 'cancelled' | 'expired' | 'pending';
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  cancelledAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function SubscriptionManagementPage({
  params,
}: {
  params: Promise<{ tenantSlug: string }>;
}) {
  const resolvedParams = use(params);
  const { tenantSlug, branding } = useTenant();
  const router = useRouter();
  const { accessToken, user } = useAuth();

  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!accessToken) {
      router.push(`/a/${tenantSlug}/auth/login`);
      return;
    }

    loadSubscription();
  }, [accessToken, tenantSlug, router]);

  const loadSubscription = async () => {
    try {
      setLoading(true);
      setError('');

      const data = await apiClient.get<Subscription>(
        '/subscriptions/my-subscription',
        accessToken!
      );

      setSubscription(data);
    } catch (err: any) {
      if (err.status === 404) {
        setSubscription(null);
      } else {
        setError(err.message || 'فشل تحميل معلومات الاشتراك');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!subscription || !accessToken) return;

    if (!confirm('هل أنت متأكد من إلغاء الاشتراك؟ ستحتفظ بالوصول حتى نهاية الفترة المدفوعة.')) {
      return;
    }

    setProcessing(true);
    setError('');
    setSuccess('');

    try {
      await apiClient.post(
        `/subscriptions/${subscription._id}/cancel`,
        {},
        accessToken!
      );

      setSuccess('تم إلغاء الاشتراك بنجاح. ستحتفظ بالوصول حتى ' + new Date(subscription.endDate).toLocaleDateString('ar-EG'));
      await loadSubscription();
    } catch (err: any) {
      setError(err.message || 'فشل إلغاء الاشتراك');
    } finally {
      setProcessing(false);
    }
  };

  const handleReactivateSubscription = async () => {
    if (!subscription || !accessToken) return;

    setProcessing(true);
    setError('');
    setSuccess('');

    try {
      await apiClient.post(
        `/subscriptions/${subscription._id}/reactivate`,
        {},
        accessToken!
      );

      setSuccess('تم إعادة تفعيل الاشتراك بنجاح!');
      await loadSubscription();
    } catch (err: any) {
      setError(err.message || 'فشل إعادة تفعيل الاشتراك');
    } finally {
      setProcessing(false);
    }
  };

  const getDaysRemaining = () => {
    if (!subscription) return 0;
    const endDate = new Date(subscription.endDate);
    const today = new Date();
    const diff = endDate.getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const getStatusBadge = () => {
    if (!subscription) return null;

    const statusConfig = {
      active: { label: 'نشط', color: 'bg-green-100 text-green-800', icon: Check },
      cancelled: { label: 'ملغي', color: 'bg-orange-100 text-orange-800', icon: XCircle },
      expired: { label: 'منتهي', color: 'bg-red-100 text-red-800', icon: X },
      pending: { label: 'قيد الانتظار', color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle },
    };

    const config = statusConfig[subscription.status];
    const Icon = config.icon;

    return (
      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${config.color} font-semibold`}>
        <Icon className="h-5 w-5" />
        {config.label}
      </div>
    );
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

  if (!subscription) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center gap-4">
              {branding.logo && <img src={branding.logo} alt={branding.name} className="h-12 w-auto" />}
              <h1 className="text-2xl font-bold text-gray-900">{branding.name}</h1>
            </div>
          </div>
        </header>

        {/* No Subscription */}
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-6">
              <Star className="h-10 w-10 text-blue-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">ليس لديك اشتراك نشط</h2>
            <p className="text-xl text-gray-600 mb-8">
              احصل على وصول غير محدود لجميع الدورات التدريبية من خلال الاشتراك
            </p>

            <div className="flex justify-center gap-4">
              <Link
                href={`/a/${tenantSlug}/pricing`}
                className="px-8 py-3 rounded-lg font-semibold text-white text-lg"
                style={{
                  background: `linear-gradient(135deg, rgb(var(--color-primary)) 0%, rgb(var(--color-secondary)) 100%)`,
                }}
              >
                عرض خطط الاشتراك
              </Link>
              <Link
                href={`/a/${tenantSlug}/courses`}
                className="px-8 py-3 rounded-lg font-semibold text-gray-700 border-2 border-gray-300 hover:border-gray-400"
              >
                تصفح الدورات
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const daysRemaining = getDaysRemaining();
  const isExpiringSoon = daysRemaining <= 7 && daysRemaining > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {branding.logo && <img src={branding.logo} alt={branding.name} className="h-12 w-auto" />}
              <h1 className="text-2xl font-bold text-gray-900">{branding.name}</h1>
            </div>
            <Link href={`/a/${tenantSlug}/my-courses`} className="text-blue-600 hover:underline">
              دوراتي
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">إدارة الاشتراك</h1>

        {/* Messages */}
        {error && (
          <div className="bg-red-50 border-r-4 border-red-500 p-4 rounded-lg mb-6">
            <div className="flex items-center gap-2">
              <X className="h-5 w-5 text-red-600" />
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border-r-4 border-green-500 p-4 rounded-lg mb-6">
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5 text-green-600" />
              <p className="text-green-800">{success}</p>
            </div>
          </div>
        )}

        {/* Expiring Soon Warning */}
        {isExpiringSoon && subscription.status === 'active' && (
          <div className="bg-orange-50 border-r-4 border-orange-500 p-4 rounded-lg mb-6">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-600" />
              <p className="text-orange-800">
                <strong>تنبيه:</strong> اشتراكك سينتهي خلال {daysRemaining} يوم
              </p>
            </div>
          </div>
        )}

        {/* Subscription Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {subscription.plan === 'monthly' ? 'الاشتراك الشهري' : 'الاشتراك السنوي'}
              </h2>
              <p className="text-gray-600">
                {subscription.plan === 'monthly' ? 'يتجدد كل شهر' : 'يتجدد كل سنة'}
              </p>
            </div>
            {getStatusBadge()}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Price */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-gray-600 mb-1">
                <CreditCard className="h-5 w-5" />
                <span className="text-sm">السعر</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {subscription.price.toFixed(2)} {subscription.currency}
              </div>
              <div className="text-sm text-gray-600">
                {subscription.plan === 'monthly' ? '/ شهر' : '/ سنة'}
              </div>
            </div>

            {/* End Date */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-gray-600 mb-1">
                <Calendar className="h-5 w-5" />
                <span className="text-sm">
                  {subscription.status === 'cancelled' ? 'ينتهي في' : 'تاريخ التجديد'}
                </span>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {new Date(subscription.endDate).toLocaleDateString('ar-EG', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </div>
              {daysRemaining > 0 && (
                <div className="text-sm text-gray-600">
                  بعد {daysRemaining} يوم
                </div>
              )}
            </div>
          </div>

          {/* Features */}
          <div className="border-t pt-6 mb-6">
            <h3 className="font-semibold text-gray-900 mb-4">المزايا المتضمنة:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <Check className="h-4 w-4 text-green-600" />
                </div>
                <span className="text-gray-700">وصول غير محدود لجميع الدورات</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <Check className="h-4 w-4 text-green-600" />
                </div>
                <span className="text-gray-700">شهادات معتمدة</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <Check className="h-4 w-4 text-green-600" />
                </div>
                <span className="text-gray-700">محتوى جديد شهرياً</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <Check className="h-4 w-4 text-green-600" />
                </div>
                <span className="text-gray-700">دعم فني مجاني</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="border-t pt-6 flex flex-col md:flex-row gap-4">
            {subscription.status === 'active' && subscription.autoRenew && (
              <>
                <div className="flex-1 bg-blue-50 rounded-lg p-4 flex items-center gap-3">
                  <RefreshCw className="h-5 w-5 text-blue-600 flex-shrink-0" />
                  <div>
                    <div className="font-semibold text-gray-900">التجديد التلقائي مفعّل</div>
                    <div className="text-sm text-gray-600">
                      سيتم تجديد اشتراكك تلقائياً في {new Date(subscription.endDate).toLocaleDateString('ar-EG')}
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleCancelSubscription}
                  disabled={processing}
                  className="px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  {processing ? 'جاري المعالجة...' : 'إلغاء الاشتراك'}
                </button>
              </>
            )}

            {subscription.status === 'cancelled' && daysRemaining > 0 && (
              <>
                <div className="flex-1 bg-orange-50 rounded-lg p-4 flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-orange-600 flex-shrink-0" />
                  <div>
                    <div className="font-semibold text-gray-900">تم إلغاء الاشتراك</div>
                    <div className="text-sm text-gray-600">
                      ستحتفظ بالوصول حتى {new Date(subscription.endDate).toLocaleDateString('ar-EG')}
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleReactivateSubscription}
                  disabled={processing}
                  className="px-6 py-3 rounded-lg font-semibold text-white whitespace-nowrap disabled:bg-gray-400 disabled:cursor-not-allowed"
                  style={{
                    background: processing ? undefined : `linear-gradient(135deg, rgb(var(--color-primary)) 0%, rgb(var(--color-secondary)) 100%)`,
                  }}
                >
                  {processing ? 'جاري المعالجة...' : 'إعادة تفعيل الاشتراك'}
                </button>
              </>
            )}

            {subscription.status === 'expired' && (
              <>
                <div className="flex-1 bg-red-50 rounded-lg p-4 flex items-center gap-3">
                  <X className="h-5 w-5 text-red-600 flex-shrink-0" />
                  <div>
                    <div className="font-semibold text-gray-900">انتهى الاشتراك</div>
                    <div className="text-sm text-gray-600">
                      اشترك مجدداً للاستمرار في الوصول لجميع الدورات
                    </div>
                  </div>
                </div>
                <Link
                  href={`/a/${tenantSlug}/pricing`}
                  className="px-6 py-3 rounded-lg font-semibold text-white whitespace-nowrap"
                  style={{
                    background: `linear-gradient(135deg, rgb(var(--color-primary)) 0%, rgb(var(--color-secondary)) 100%)`,
                  }}
                >
                  تجديد الاشتراك
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Billing History */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">تاريخ الفواتير</h2>

          <div className="space-y-3">
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-gray-900">
                    {subscription.plan === 'monthly' ? 'اشتراك شهري' : 'اشتراك سنوي'}
                  </div>
                  <div className="text-sm text-gray-600">
                    {new Date(subscription.createdAt).toLocaleDateString('ar-EG', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </div>
                </div>
                <div className="text-end">
                  <div className="font-bold text-gray-900">
                    {subscription.price.toFixed(2)} {subscription.currency}
                  </div>
                  <div className="text-sm text-green-600 font-semibold">مدفوع</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
