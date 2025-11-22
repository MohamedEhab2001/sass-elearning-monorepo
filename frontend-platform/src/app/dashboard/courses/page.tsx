'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCourses, useCourseStats, useDeleteCourse } from '@/hooks/useCourses';
import { CourseStatus, ICourse } from '@academy/shared/types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, Plus, Edit, Trash2, Eye, Users, DollarSign, Star } from 'lucide-react';

export default function CoursesPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<CourseStatus | undefined>();
  const [search, setSearch] = useState('');

  const { data: coursesData, isLoading } = useCourses(page, 10, statusFilter, search);
  const { data: stats } = useCourseStats();
  const deleteMutation = useDeleteCourse();

  const handleDelete = async (courseId: string) => {
    if (confirm('هل أنت متأكد من حذف هذه الدورة؟')) {
      await deleteMutation.mutateAsync(courseId);
    }
  };

  const getStatusBadge = (status: CourseStatus) => {
    const variants = {
      draft: 'ghost' as const,
      published: 'success' as const,
      archived: 'warning' as const,
    };

    const labels = {
      draft: 'مسودة',
      published: 'منشورة',
      archived: 'مؤرشفة',
    };

    return (
      <Badge variant={variants[status]} size="sm">
        {labels[status]}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">دوراتي التدريبية</h1>
          <p className="text-gray-600 mt-1">إدارة جميع الدورات التدريبية الخاصة بك</p>
        </div>
        <Link href="/dashboard/courses/new">
          <Button className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            إضافة دورة جديدة
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-6" variant="gradient">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">إجمالي الدورات</p>
                <h3 className="text-2xl font-bold mt-1">{stats.totalCourses}</h3>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6" variant="gradient">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">الدورات المنشورة</p>
                <h3 className="text-2xl font-bold mt-1">{stats.publishedCourses}</h3>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Eye className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6" variant="gradient">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">إجمالي الطلاب</p>
                <h3 className="text-2xl font-bold mt-1">{stats.totalEnrollments}</h3>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6" variant="gradient">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">إجمالي الإيرادات</p>
                <h3 className="text-2xl font-bold mt-1">${stats.totalRevenue.toFixed(2)}</h3>
              </div>
              <div className="p-3 bg-amber-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            placeholder="ابحث عن دورة..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={statusFilter || ''}
            onChange={(e) => setStatusFilter(e.target.value as CourseStatus || undefined)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">جميع الحالات</option>
            <option value="draft">مسودة</option>
            <option value="published">منشورة</option>
            <option value="archived">مؤرشفة</option>
          </select>
        </div>
      </Card>

      {/* Courses List */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">جاري التحميل...</p>
        </div>
      ) : coursesData?.courses && coursesData.courses.length > 0 ? (
        <div className="space-y-4">
          {coursesData.courses.map((course: ICourse) => (
            <Card key={course._id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-6">
                {/* Thumbnail */}
                <div className="flex-shrink-0">
                  {course.thumbnail ? (
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-32 h-24 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-32 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <BookOpen className="h-12 w-12 text-white" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <Link
                        href={`/dashboard/courses/${course._id}`}
                        className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors"
                      >
                        {course.title}
                      </Link>
                      <p className="text-gray-600 mt-1 line-clamp-2">{course.description}</p>
                    </div>
                    {getStatusBadge(course.status)}
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-6 mt-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>{course.enrollmentCount} طالب</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-amber-500" />
                      <span>{course.averageRating.toFixed(1)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      <span>{course.isFree ? 'مجاني' : `$${course.price}`}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 mt-4">
                    <Link href={`/dashboard/courses/${course._id}`}>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 ml-2" />
                        تعديل
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(course._id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4 ml-2" />
                      حذف
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">لا توجد دورات بعد</h3>
          <p className="text-gray-600 mb-6">ابدأ بإنشاء دورتك التدريبية الأولى</p>
          <Link href="/dashboard/courses/new">
            <Button>
              <Plus className="h-5 w-5 ml-2" />
              إضافة دورة جديدة
            </Button>
          </Link>
        </Card>
      )}

      {/* Pagination */}
      {coursesData && coursesData.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            السابق
          </Button>
          <span className="px-4 py-2 text-gray-700">
            صفحة {page} من {coursesData.totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.min(coursesData.totalPages, p + 1))}
            disabled={page === coursesData.totalPages}
          >
            التالي
          </Button>
        </div>
      )}
    </div>
  );
}
