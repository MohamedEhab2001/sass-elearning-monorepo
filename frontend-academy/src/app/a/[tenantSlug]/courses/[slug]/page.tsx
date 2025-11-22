'use client';

import { useState, useEffect } from 'react';
import { use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTenant } from '../../providers';
import { useAuth } from '@/store/auth-store';
import { useEnroll, useIsEnrolled } from '@/hooks/useEnrollments';
import { Star, Users, Clock, BookOpen, Check, Play } from 'lucide-react';

interface Course {
  _id: string;
  title: string;
  slug: string;
  description: string;
  thumbnail: string | null;
  level: string;
  price: number;
  isFree: boolean;
  averageRating: number;
  totalRatings: number;
  enrollmentCount: number;
  category: string | null;
  whatYouWillLearn: string[];
  requirements: string[];
  instructorId: {
    fullName: string;
    email: string;
  };
}

export default function CourseDetailsPage({
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

  const enrollMutation = useEnroll();
  const { data: enrollmentCheck } = useIsEnrolled(course?._id);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/public/courses/${tenantSlug}/${resolvedParams.slug}`)
      .then((res) => res.json())
      .then((data) => {
        setCourse(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load course:', err);
        setLoading(false);
      });
  }, [tenantSlug, resolvedParams.slug]);

  const handleEnroll = async () => {
    if (!accessToken) {
      router.push(`/a/${tenantSlug}/auth/login`);
      return;
    }

    if (!course) return;

    try {
      await enrollMutation.mutateAsync({
        courseId: course._id,
        pricePaid: course.isFree ? 0 : course.price,
      });
      router.push(`/a/${tenantSlug}/my-courses`);
    } catch (error: any) {
      alert(error.message || 'حدث خطأ أثناء التسجيل في الدورة');
    }
  };

  const levelLabels: Record<string, string> = {
    beginner: 'مبتدئ',
    intermediate: 'متوسط',
    advanced: 'متقدم',
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
          <h2 className="text-2xl font-bold text-gray-900 mb-2">الدورة غير موجودة</h2>
          <Link
            href={`/a/${tenantSlug}/courses`}
            className="text-blue-600 hover:underline"
          >
            العودة إلى الدورات
          </Link>
        </div>
      </div>
    );
  }

  const isEnrolled = enrollmentCheck?.isEnrolled || false;

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
            {accessToken ? (
              <Link
                href={`/a/${tenantSlug}/my-courses`}
                className="text-gray-600 hover:text-gray-900"
              >
                دوراتي
              </Link>
            ) : (
              <div className="flex items-center gap-4">
                <Link href={`/a/${tenantSlug}/auth/login`} className="text-gray-600 hover:text-gray-900">
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
            )}
          </div>
        </div>
      </header>

      {/* Course Hero */}
      <section className="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="mb-4">
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                  {levelLabels[course.level] || course.level}
                </span>
                {course.category && (
                  <span className="mr-2 px-3 py-1 bg-white/20 rounded-full text-sm">
                    {course.category}
                  </span>
                )}
              </div>

              <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
              <p className="text-xl text-white/90 mb-6">{course.description}</p>

              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-400 fill-current" />
                  <span className="font-semibold">{course.averageRating.toFixed(1)}</span>
                  <span className="text-white/70">({course.totalRatings} تقييم)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  <span>{course.enrollmentCount} طالب</span>
                </div>
              </div>

              <div className="mt-6 flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                  {course.instructorId.fullName[0]}
                </div>
                <div>
                  <p className="text-sm text-white/70">المدرب</p>
                  <p className="font-semibold">{course.instructorId.fullName}</p>
                </div>
              </div>
            </div>

            {/* Enrollment Card */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-xl p-6 text-gray-900 sticky top-4">
                {course.thumbnail && (
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                )}

                <div className="mb-6">
                  {course.isFree ? (
                    <div className="text-3xl font-bold text-green-600">مجاني</div>
                  ) : (
                    <div className="text-3xl font-bold">${course.price}</div>
                  )}
                </div>

                {isEnrolled ? (
                  <Link
                    href={`/a/${tenantSlug}/my-courses`}
                    className="block w-full py-3 px-4 rounded-lg text-white text-center font-semibold mb-3"
                    style={{
                      background: `linear-gradient(135deg, rgb(var(--color-primary)) 0%, rgb(var(--color-secondary)) 100%)`,
                    }}
                  >
                    <Play className="inline-block h-5 w-5 ml-2" />
                    متابعة التعلم
                  </Link>
                ) : (
                  <button
                    onClick={handleEnroll}
                    disabled={enrollMutation.isPending}
                    className="w-full py-3 px-4 rounded-lg text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      background: `linear-gradient(135deg, rgb(var(--color-primary)) 0%, rgb(var(--color-secondary)) 100%)`,
                    }}
                  >
                    {enrollMutation.isPending ? 'جاري التسجيل...' : course.isFree ? 'التسجيل مجاناً' : 'اشترك الآن'}
                  </button>
                )}

                <p className="text-center text-sm text-gray-500 mt-3">
                  ضمان استرداد الأموال لمدة 30 يوماً
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Course Content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* What You'll Learn */}
            {course.whatYouWillLearn && course.whatYouWillLearn.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-2xl font-bold mb-4">ماذا ستتعلم؟</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {course.whatYouWillLearn.map((item, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Requirements */}
            {course.requirements && course.requirements.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-2xl font-bold mb-4">المتطلبات</h2>
                <ul className="space-y-2">
                  {course.requirements.map((req, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <BookOpen className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Description */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-2xl font-bold mb-4">وصف الدورة</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">{course.description}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
