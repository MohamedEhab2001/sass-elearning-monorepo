'use client';

import { useState, useEffect } from 'react';
import { use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTenant } from '../providers';
import { Check, Star, TrendingUp, Zap, Shield, ArrowRight } from 'lucide-react';

interface SubscriptionPricing {
  subscriptionEnabled: boolean;
  monthlyPrice: number | null;
  annualPrice: number | null;
}

interface Stat {
  label: string;
  value: string;
}

export default function PricingPage({ params }: { params: Promise<{ tenantSlug: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { tenantSlug, branding } = useTenant();

  const [pricing, setPricing] = useState<SubscriptionPricing | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stat[]>([]);

  useEffect(() => {
    loadPricingData();
  }, [tenantSlug]);

  const loadPricingData = async () => {
    try {
      setLoading(true);

      // Fetch tenant subscription pricing
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/public/tenants/${tenantSlug}`
      );
      const tenant = await response.json();

      setPricing({
        subscriptionEnabled: tenant.subscriptionEnabled || false,
        monthlyPrice: tenant.monthlyPrice,
        annualPrice: tenant.annualPrice,
      });

      // Fetch stats
      const coursesResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/public/courses/catalog/${tenantSlug}`
      );
      const coursesData = await coursesResponse.json();
      const totalCourses = coursesData.courses?.length || 0;
      const totalStudents = coursesData.courses?.reduce((sum: number, c: any) => sum + (c.enrollmentCount || 0), 0) || 0;

      setStats([
        { label: 'دورة تدريبية', value: totalCourses.toString() },
        { label: 'طالب نشط', value: totalStudents.toString() },
        { label: 'شهادة معتمدة', value: totalCourses.toString() },
      ]);
    } catch (error) {
      console.error('Failed to load pricing:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateSavings = () => {
    if (!pricing?.monthlyPrice || !pricing?.annualPrice) return { amount: 0, percentage: 0 };

    const yearlyMonthly = pricing.monthlyPrice * 12;
    const savings = yearlyMonthly - pricing.annualPrice;
    const percentage = Math.round((savings / yearlyMonthly) * 100);

    return { amount: savings, percentage };
  };

  const handleSubscribe = (plan: 'monthly' | 'annual') => {
    router.push(`/a/${tenantSlug}/checkout/subscription?plan=${plan}`);
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

  if (!pricing?.subscriptionEnabled) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">🎓</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">الاشتراكات غير متوفرة حالياً</h2>
          <p className="text-gray-600 mb-6">
            يمكنك تصفح الدورات التدريبية وشراء كل دورة بشكل منفصل
          </p>
          <Link
            href={`/a/${tenantSlug}/courses`}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-white font-semibold"
            style={{
              background: `linear-gradient(135deg, rgb(var(--color-primary)) 0%, rgb(var(--color-secondary)) 100%)`,
            }}
          >
            تصفح الدورات
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </div>
    );
  }

  const savings = calculateSavings();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {branding.logo && (
                <img src={branding.logo} alt={branding.name} className="h-12 w-auto" />
              )}
              <h1 className="text-2xl font-bold text-gray-900">{branding.name}</h1>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href={`/a/${tenantSlug}/courses`}
                className="text-gray-600 hover:text-gray-900"
              >
                الدورات
              </Link>
              <Link
                href={`/a/${tenantSlug}/auth/login`}
                className="text-gray-600 hover:text-gray-900"
              >
                تسجيل الدخول
              </Link>
              <Link
                href={`/a/${tenantSlug}/auth/signup`}
                className="px-4 py-2 rounded-lg text-white"
                style={{
                  background: `linear-gradient(135deg, rgb(var(--color-primary)) 0%, rgb(var(--color-secondary)) 100%)`,
                }}
              >
                إنشاء حساب
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 opacity-90"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center text-white">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
            <Zap className="h-5 w-5" />
            <span className="text-sm font-semibold">خطط اشتراك مرنة</span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            استثمر في مستقبلك التعليمي
          </h1>
          <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
            احصل على وصول غير محدود لجميع الدورات التدريبية، الشهادات المعتمدة، والمحتوى الحصري
          </p>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white/20 backdrop-blur-sm rounded-lg p-6">
                <div className="text-4xl font-bold mb-1">{stat.value}+</div>
                <div className="text-sm text-white/80">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Monthly Plan */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-gray-200 hover:border-blue-500 transition-all">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
                <Star className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">الاشتراك الشهري</h3>
              <p className="text-gray-600">مرونة الدفع شهرياً</p>
            </div>

            <div className="text-center mb-8">
              <div className="flex items-baseline justify-center gap-2">
                <span className="text-5xl font-bold text-gray-900">
                  {pricing.monthlyPrice?.toFixed(0)}
                </span>
                <div className="text-start">
                  <div className="text-gray-600">ج.م</div>
                  <div className="text-sm text-gray-500">/ شهر</div>
                </div>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                  <Check className="h-4 w-4 text-green-600" />
                </div>
                <span className="text-gray-700">الوصول لجميع الدورات التدريبية</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                  <Check className="h-4 w-4 text-green-600" />
                </div>
                <span className="text-gray-700">شهادات معتمدة عند الإنجاز</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                  <Check className="h-4 w-4 text-green-600" />
                </div>
                <span className="text-gray-700">محتوى جديد يضاف باستمرار</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                  <Check className="h-4 w-4 text-green-600" />
                </div>
                <span className="text-gray-700">دعم فني على مدار الساعة</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                  <Check className="h-4 w-4 text-green-600" />
                </div>
                <span className="text-gray-700">إلغاء في أي وقت</span>
              </div>
            </div>

            <button
              onClick={() => handleSubscribe('monthly')}
              className="w-full py-3 px-6 rounded-lg font-semibold text-white transition-all hover:shadow-lg"
              style={{
                background: `linear-gradient(135deg, rgb(var(--color-primary)) 0%, rgb(var(--color-secondary)) 100%)`,
              }}
            >
              ابدأ الاشتراك الشهري
            </button>
          </div>

          {/* Annual Plan */}
          <div className="bg-gradient-to-br from-blue-600 to-purple-700 rounded-2xl shadow-2xl p-8 border-2 border-blue-500 relative transform md:scale-105">
            {/* Best Value Badge */}
            <div className="absolute -top-4 start-1/2 -translate-x-1/2">
              <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                الأكثر توفيراً
              </div>
            </div>

            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm mb-4">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">الاشتراك السنوي</h3>
              <p className="text-white/80">وفّر {savings.percentage}% سنوياً</p>
            </div>

            <div className="text-center mb-8">
              <div className="flex items-baseline justify-center gap-2 mb-2">
                <span className="text-5xl font-bold text-white">
                  {pricing.annualPrice?.toFixed(0)}
                </span>
                <div className="text-start">
                  <div className="text-white/90">ج.م</div>
                  <div className="text-sm text-white/70">/ سنة</div>
                </div>
              </div>
              <div className="inline-block bg-green-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                وفّر {savings.amount.toFixed(0)} ج.م
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                  <Check className="h-4 w-4 text-white" />
                </div>
                <span className="text-white">الوصول لجميع الدورات التدريبية</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                  <Check className="h-4 w-4 text-white" />
                </div>
                <span className="text-white">شهادات معتمدة عند الإنجاز</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                  <Check className="h-4 w-4 text-white" />
                </div>
                <span className="text-white">محتوى جديد يضاف باستمرار</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                  <Check className="h-4 w-4 text-white" />
                </div>
                <span className="text-white">دعم فني على مدار الساعة</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                  <Check className="h-4 w-4 text-white" />
                </div>
                <span className="text-white">إلغاء في أي وقت</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-yellow-400/30 flex items-center justify-center">
                  <Star className="h-4 w-4 text-yellow-300" />
                </div>
                <span className="text-white font-semibold">أولوية في الدعم الفني</span>
              </div>
            </div>

            <button
              onClick={() => handleSubscribe('annual')}
              className="w-full py-3 px-6 rounded-lg font-semibold bg-white text-blue-600 transition-all hover:bg-gray-100 hover:shadow-lg"
            >
              ابدأ الاشتراك السنوي
            </button>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-20 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            الأسئلة الشائعة
          </h2>

          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                هل يمكنني إلغاء الاشتراك في أي وقت؟
              </h3>
              <p className="text-gray-600">
                نعم، يمكنك إلغاء اشتراكك في أي وقت من لوحة التحكم الخاصة بك. لن يتم تجديد الاشتراك تلقائياً بعد الإلغاء، ولكن ستحتفظ بالوصول حتى نهاية الفترة المدفوعة.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                ماذا يحدث إذا أضيفت دورات جديدة؟
              </h3>
              <p className="text-gray-600">
                جميع الدورات الجديدة التي يتم إضافتها ستكون متاحة لك تلقائياً طالما أن اشتراكك نشط، دون أي رسوم إضافية.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                هل تقدمون ضماناً لاسترجاع الأموال؟
              </h3>
              <p className="text-gray-600">
                نعم، نقدم ضماناً لاسترجاع الأموال خلال 14 يوماً من تاريخ الاشتراك إذا لم تكن راضياً عن المحتوى.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                ما الفرق بين شراء دورة منفردة والاشتراك؟
              </h3>
              <p className="text-gray-600">
                عند شراء دورة منفردة، تحصل على وصول دائم لتلك الدورة فقط. أما الاشتراك فيمنحك وصولاً لجميع الدورات طالما كان اشتراكك نشطاً.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-700 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h2 className="text-4xl font-bold mb-6">
            هل أنت مستعد لبدء رحلتك التعليمية؟
          </h2>
          <p className="text-xl text-white/90 mb-8">
            انضم إلى آلاف الطلاب الذين يطورون مهاراتهم معنا
          </p>
          <Link
            href={`/a/${tenantSlug}/auth/signup`}
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 rounded-lg font-bold text-lg hover:bg-gray-100 transition-all"
          >
            ابدأ الآن مجاناً
            <ArrowRight className="h-6 w-6" />
          </Link>
        </div>
      </section>
    </div>
  );
}
