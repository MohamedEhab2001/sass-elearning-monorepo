'use client';

import { useState, useEffect } from 'react';
import { use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/store/auth-store';
import { apiClient } from '@/lib/api-client';
import { ArrowRight, Users, BookOpen, DollarSign, Mail } from 'lucide-react';

interface TenantDetails {
  tenant: any;
  stats: {
    instructorCount: number;
    studentCount: number;
    courseCount: number;
    transactionCount: number;
    totalRevenue: number;
    platformCommission: number;
  };
  instructors: any[];
  recentCourses: any[];
}

export default function TenantDetailsPage({
  params,
}: {
  params: Promise<{ tenantId: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { accessToken, user } = useAuth();

  const [details, setDetails] = useState<TenantDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!accessToken || user?.role !== 'admin') {
      router.push('/auth/login');
      return;
    }

    loadTenantDetails();
  }, [accessToken, user, router, resolvedParams.tenantId]);

  const loadTenantDetails = async () => {
    try {
      const data = await apiClient.get<TenantDetails>(
        `/admin/tenants/${resolvedParams.tenantId}`,
        accessToken!
      );
      setDetails(data);
      setLoading(false);
    } catch (err: any) {
      setError(err.message || 'فشل تحميل التفاصيل');
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
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

  if (error || !details) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">حدث خطأ</h2>
          <p className="text-gray-600 mb-4">{error || 'فشل تحميل البيانات'}</p>
          <button onClick={() => router.back()} className="text-blue-600 hover:underline">
            رجوع
          </button>
        </div>
      </div>
    );
  }

  const { tenant, stats, instructors, recentCourses } = details;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/admin/tenants')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowRight className="h-5 w-5" />
            رجوع إلى المنصات
          </button>
          <div className="flex items-center gap-4">
            {tenant.logo && (
              <img src={tenant.logo} alt={tenant.name} className="w-16 h-16 rounded object-cover" />
            )}
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{tenant.name}</h1>
              <p className="text-gray-600">/{tenant.slug}</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-1">المدربين</p>
            <p className="text-2xl font-bold text-gray-900">{stats.instructorCount}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Users className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-1">الطلاب</p>
            <p className="text-2xl font-bold text-gray-900">{stats.studentCount}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <BookOpen className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-1">الدورات</p>
            <p className="text-2xl font-bold text-gray-900">{stats.courseCount}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-1">الإيرادات</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(stats.totalRevenue)}
            </p>
          </div>
        </div>

        {/* Owner Info */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">معلومات المالك</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-600 mb-1">الاسم</p>
              <p className="font-medium text-gray-900">{tenant.ownerId.fullName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">البريد الإلكتروني</p>
              <p className="font-medium text-gray-900">{tenant.ownerId.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">تاريخ التسجيل</p>
              <p className="font-medium text-gray-900">
                {formatDate(tenant.ownerId.createdAt)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">حالة المنصة</p>
              <span
                className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  tenant.status === 'active'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {tenant.status === 'active' ? 'نشط' : 'معطل'}
              </span>
            </div>
          </div>
        </div>

        {/* Financial Summary */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">الملخص المالي</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-gray-600 mb-1">إجمالي الإيرادات</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(stats.totalRevenue)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">عمولة المنصة (15%)</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(stats.platformCommission)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">عدد المعاملات</p>
              <p className="text-2xl font-bold text-gray-900">{stats.transactionCount}</p>
            </div>
          </div>
        </div>

        {/* Instructors List */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            المدربين ({instructors.length})
          </h2>
          {instructors.length === 0 ? (
            <p className="text-gray-600 text-center py-4">لا يوجد مدربين</p>
          ) : (
            <div className="space-y-4">
              {instructors.map((instructor) => (
                <div
                  key={instructor._id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900">{instructor.fullName}</p>
                    <p className="text-sm text-gray-600">{instructor.email}</p>
                  </div>
                  <p className="text-sm text-gray-500">{formatDate(instructor.createdAt)}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Courses */}
        {recentCourses.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">الدورات الحديثة</h2>
            <div className="space-y-4">
              {recentCourses.map((course) => (
                <div
                  key={course._id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    {course.thumbnail && (
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="w-16 h-16 rounded object-cover"
                      />
                    )}
                    <div>
                      <p className="font-medium text-gray-900">{course.title}</p>
                      <p className="text-sm text-gray-600">
                        بواسطة: {course.instructorId.fullName}
                      </p>
                    </div>
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-gray-900">
                      {course.isFree ? 'مجاني' : `${course.price} جنيه`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
