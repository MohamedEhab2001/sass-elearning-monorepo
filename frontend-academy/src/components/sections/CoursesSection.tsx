'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Star, Users, ArrowLeft } from 'lucide-react';

interface Course {
  _id: string;
  title: string;
  slug: string;
  description: string;
  thumbnail: string | null;
  price: number;
  isFree: boolean;
  averageRating: number;
  totalRatings: number;
  enrollmentCount: number;
  instructorId: {
    fullName: string;
  };
}

export interface CoursesSectionProps {
  title?: string;
  subtitle?: string;
  description?: string;
  showAllLink?: boolean;
  limit?: number;
  backgroundColor?: string;
  tenantSlug: string;
}

export default function CoursesSection({
  title = 'الدورات المميزة',
  subtitle,
  description,
  showAllLink = true,
  limit = 6,
  backgroundColor = 'bg-gray-50',
  tenantSlug,
}: CoursesSectionProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/public/courses/${tenantSlug}?limit=${limit}`)
      .then((res) => res.json())
      .then((data) => {
        setCourses(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load courses:', err);
        setLoading(false);
      });
  }, [tenantSlug, limit]);

  if (loading) {
    return (
      <section className={`py-16 md:py-24 ${backgroundColor}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
            <p className="mt-4 text-gray-600">جاري تحميل الدورات...</p>
          </div>
        </div>
      </section>
    );
  }

  if (courses.length === 0) {
    return null;
  }

  return (
    <section className={`py-16 md:py-24 ${backgroundColor}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          {subtitle && (
            <p className="text-sm font-semibold mb-2" style={{ color: `rgb(var(--color-primary))` }}>
              {subtitle}
            </p>
          )}
          {title && (
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {title}
            </h2>
          )}
          {description && (
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              {description}
            </p>
          )}
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {courses.map((course) => (
            <Link
              key={course._id}
              href={`/a/${tenantSlug}/courses/${course.slug}`}
              className="bg-white rounded-xl shadow-md overflow-hidden transition-all hover:shadow-xl hover:scale-105"
            >
              {course.thumbnail && (
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-full h-48 object-cover"
                />
              )}

              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                  {course.title}
                </h3>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {course.description}
                </p>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="font-semibold">{course.averageRating.toFixed(1)}</span>
                    <span className="text-gray-500">({course.totalRatings})</span>
                  </div>

                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Users className="h-4 w-4" />
                    <span>{course.enrollmentCount}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    {course.instructorId.fullName}
                  </span>

                  {course.isFree ? (
                    <span className="font-bold text-green-600">مجاني</span>
                  ) : (
                    <span className="font-bold text-gray-900">{course.price} جنيه</span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* View All Link */}
        {showAllLink && (
          <div className="text-center">
            <Link
              href={`/a/${tenantSlug}/courses`}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-lg text-white font-semibold transition-all hover:shadow-lg"
              style={{
                background: `linear-gradient(135deg, rgb(var(--color-primary)) 0%, rgb(var(--color-secondary)) 100%)`,
              }}
            >
              عرض جميع الدورات
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
