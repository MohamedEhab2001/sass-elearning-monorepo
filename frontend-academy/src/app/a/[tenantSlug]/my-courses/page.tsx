'use client';

import { use } from 'react';
import Link from 'next/link';
import { useTenant } from '../providers';
import { useAuth } from '@/store/auth-store';
import { useEnrollments } from '@/hooks/useEnrollments';
import { useCourseProgress } from '@/hooks/useProgress';
import { BookOpen, Clock, TrendingUp, Play, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function MyCoursesPage({ params }: { params: Promise<{ tenantSlug: string }> }) {
  const resolvedParams = use(params);
  const { tenantSlug, branding } = useTenant();
  const router = useRouter();
  const { user, logout, accessToken } = useAuth();
  const { data: enrollments, isLoading } = useEnrollments();

  const handleLogout = () => {
    logout();
    router.push(`/a/${tenantSlug}/courses`);
  };

  if (!accessToken) {
    router.push(`/a/${tenantSlug}/auth/login`);
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

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
            <div className="flex items-center gap-4">
              <span className="text-gray-600">مرحباً، {user?.fullName}</span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <LogOut className="h-5 w-5" />
                تسجيل الخروج
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-2">دوراتي التدريبية</h1>
          <p className="text-xl text-white/90">تابع تقدمك وأكمل رحلتك التعليمية</p>
        </div>
      </section>

      {/* Courses List */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {enrollments && enrollments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrollments.map((enrollment: any) => {
              const course = typeof enrollment.courseId === 'object' ? enrollment.courseId : null;
              if (!course) return null;

              return (
                <Link
                  key={enrollment._id}
                  href={`/a/${tenantSlug}/learn/${course.slug}/${course._id}`}
                  className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow"
                >
                  {/* Thumbnail */}
                  {course.thumbnail ? (
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <BookOpen className="h-16 w-16 text-white" />
                    </div>
                  )}

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                      {course.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{course.description}</p>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                        <span>التقدم</span>
                        <span>{enrollment.progressPercentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full transition-all duration-300"
                          style={{
                            width: `${enrollment.progressPercentage}%`,
                            background: `linear-gradient(90deg, rgb(var(--color-primary)) 0%, rgb(var(--color-secondary)) 100%)`,
                          }}
                        />
                      </div>
                    </div>

                    {/* Action Button */}
                    <button
                      className="w-full py-2 px-4 rounded-lg text-white font-semibold flex items-center justify-center gap-2"
                      style={{
                        background: `linear-gradient(135deg, rgb(var(--color-primary)) 0%, rgb(var(--color-secondary)) 100%)`,
                      }}
                    >
                      <Play className="h-4 w-4" />
                      {enrollment.progressPercentage > 0 ? 'متابعة التعلم' : 'ابدأ الآن'}
                    </button>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <BookOpen className="h-24 w-24 text-gray-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">لا توجد دورات بعد</h3>
            <p className="text-gray-600 mb-6">ابدأ رحلتك التعليمية بالتسجيل في دورة</p>
            <Link
              href={`/a/${tenantSlug}/courses`}
              className="inline-block px-6 py-3 rounded-lg text-white font-semibold"
              style={{
                background: `linear-gradient(135deg, rgb(var(--color-primary)) 0%, rgb(var(--color-secondary)) 100%)`,
              }}
            >
              تصفح الدورات
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
