'use client';

import { useState } from 'react';
import { use} from 'react';
import Link from 'next/link';
import { useTenant } from '../providers';
import { Search, Filter, Star, Users, DollarSign } from 'lucide-react';

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
}

export default function CourseCatalogPage({ params }: { params: Promise<{ tenantSlug: string }> }) {
  const resolvedParams = use(params);
  const { tenantSlug, branding } = useTenant();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [priceFilter, setPriceFilter] = useState('');

  // Fetch courses on mount
  useState(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/public/courses/catalog/${tenantSlug}`)
      .then((res) => res.json())
      .then((data) => {
        setCourses(data.courses || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load courses:', err);
        setLoading(false);
      });
  });

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

  return (
    <div className="min-h-screen">
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
      <section className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            ابدأ رحلتك التعليمية اليوم
          </h2>
          <p className="text-xl mb-8 text-white/90">
            اكتشف مئات الدورات التدريبية في مختلف المجالات
          </p>

          {/* Search */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ابحث عن دورة..."
                className="w-full px-6 py-4 pr-14 rounded-lg text-gray-900 focus:outline-none focus:ring-4 focus:ring-white/30"
              />
              <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-400" />
            </div>
          </div>
        </div>
      </section>

      {/* Filters and Courses */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-8">
          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">جميع المستويات</option>
            <option value="beginner">مبتدئ</option>
            <option value="intermediate">متوسط</option>
            <option value="advanced">متقدم</option>
          </select>

          <select
            value={priceFilter}
            onChange={(e) => setPriceFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">جميع الأسعار</option>
            <option value="free">مجاني</option>
            <option value="paid">مدفوع</option>
          </select>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses
            .filter((course) => {
              if (search && !course.title.toLowerCase().includes(search.toLowerCase())) return false;
              if (levelFilter && course.level !== levelFilter) return false;
              if (priceFilter === 'free' && !course.isFree) return false;
              if (priceFilter === 'paid' && course.isFree) return false;
              return true;
            })
            .map((course) => (
              <Link
                key={course._id}
                href={`/a/${tenantSlug}/courses/${course.slug}`}
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
                    <span className="text-white text-3xl font-bold">{course.title[0]}</span>
                  </div>
                )}

                {/* Content */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-bold text-gray-900 line-clamp-2">{course.title}</h3>
                    {course.isFree ? (
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                        مجاني
                      </span>
                    ) : (
                      <span className="text-lg font-bold text-blue-600">${course.price}</span>
                    )}
                  </div>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{course.description}</p>

                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-amber-500 fill-current" />
                        <span>{course.averageRating.toFixed(1)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{course.enrollmentCount}</span>
                      </div>
                    </div>
                    <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                      {levelLabels[course.level] || course.level}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
        </div>

        {/* No results */}
        {courses.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">لا توجد دورات متاحة حالياً</p>
          </div>
        )}
      </section>
    </div>
  );
}
