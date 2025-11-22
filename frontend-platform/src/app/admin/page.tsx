'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/store/auth-store';
import { apiClient } from '@/lib/api-client';
import {
  Users,
  Building2,
  GraduationCap,
  BookOpen,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  ArrowUpRight,
} from 'lucide-react';

interface PlatformStats {
  totalTenants: number;
  totalInstructors: number;
  totalStudents: number;
  totalCourses: number;
  totalRevenue: number;
  platformCommission: number;
  pendingPayoutsCount: number;
  pendingPayoutsAmount: number;
  completedPayoutsAmount: number;
  growth: {
    newTenants: number;
    newInstructors: number;
    newStudents: number;
    recentRevenue: number;
  };
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const { accessToken, user } = useAuth();

  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect() => {
    if (!accessToken) {
      router.push('/auth/login');
      return;
    }

    // Check if user is admin
    if (user?.role !== 'admin') {
      router.push('/dashboard');
      return;
    }

    loadStats();
  }, [accessToken, user, router]);

  const loadStats = async () => {
    try {
      const data = await apiClient.get<PlatformStats>('/admin/stats', accessToken!);
      setStats(data);
      setLoading(false);
    } catch (err: any) {
      setError(err.message || 'فشل تحميل الإحصائيات');
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

  if (error || !stats) {
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

  const mainKpis = [
    {
      title: 'إجمالي المنصات',
      value: stats.totalTenants.toString(),
      icon: Building2,
      color: 'blue',
      growth: stats.growth.newTenants,
      link: '/admin/tenants',
    },
    {
      title: 'إجمالي المدربين',
      value: stats.totalInstructors.toString(),
      icon: GraduationCap,
      color: 'green',
      growth: stats.growth.newInstructors,
      link: '/admin/instructors',
    },
    {
      title: 'إجمالي الطلاب',
      value: stats.totalStudents.toString(),
      icon: Users,
      color: 'purple',
      growth: stats.growth.newStudents,
    },
    {
      title: 'إجمالي الدورات',
      value: stats.totalCourses.toString(),
      icon: BookOpen,
      color: 'orange',
    },
  ];

  const revenueStats = [
    {
      label: 'إجمالي الإيرادات',
      value: formatCurrency(stats.totalRevenue),
      icon: DollarSign,
      color: 'blue',
    },
    {
      label: 'عمولة المنصة (15%)',
      value: formatCurrency(stats.platformCommission),
      icon: TrendingUp,
      color: 'green',
    },
    {
      label: 'مدفوعات معلقة',
      value: formatCurrency(stats.pendingPayoutsAmount),
      icon: Clock,
      color: 'yellow',
      count: stats.pendingPayoutsCount,
      link: '/admin/payouts',
    },
    {
      label: 'مدفوعات مكتملة',
      value: formatCurrency(stats.completedPayoutsAmount),
      icon: CheckCircle,
      color: 'green',
    },
  ];

  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600',
    yellow: 'bg-yellow-100 text-yellow-600',
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">لوحة تحكم المسؤول</h1>
          <p className="text-gray-600">نظرة شاملة على المنصة</p>
        </div>

        {/* Main KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {mainKpis.map((kpi, index) => {
            const Icon = kpi.icon;
            const CardWrapper = kpi.link ? Link : 'div';
            const cardProps = kpi.link ? { href: kpi.link } : {};

            return (
              <CardWrapper
                key={index}
                {...cardProps}
                className={`bg-white rounded-xl shadow-sm p-6 ${
                  kpi.link ? 'hover:shadow-md transition-shadow cursor-pointer' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`p-3 rounded-lg ${
                      colorClasses[kpi.color as keyof typeof colorClasses]
                    }`}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  {kpi.growth !== undefined && kpi.growth > 0 && (
                    <div className="flex items-center gap-1 text-green-600 text-sm">
                      <ArrowUpRight className="h-4 w-4" />
                      <span>+{kpi.growth}</span>
                    </div>
                  )}
                </div>
                <h3 className="text-sm font-medium text-gray-600 mb-1">{kpi.title}</h3>
                <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
                {kpi.growth !== undefined && (
                  <p className="text-xs text-gray-500 mt-1">جديد خلال 30 يوم</p>
                )}
              </CardWrapper>
            );
          })}
        </div>

        {/* Revenue Stats */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">الإحصائيات المالية</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {revenueStats.map((stat, index) => {
              const Icon = stat.icon;
              const CardWrapper = stat.link ? Link : 'div';
              const cardProps = stat.link ? { href: stat.link } : {};

              return (
                <CardWrapper
                  key={index}
                  {...cardProps}
                  className={`bg-white rounded-xl shadow-sm p-6 ${
                    stat.link ? 'hover:shadow-md transition-shadow cursor-pointer' : ''
                  }`}
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div
                      className={`p-3 rounded-lg ${
                        colorClasses[stat.color as keyof typeof colorClasses]
                      }`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                  <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                  {stat.count !== undefined && (
                    <p className="text-xs text-gray-500 mt-1">{stat.count} طلب</p>
                  )}
                </CardWrapper>
              );
            })}
          </div>
        </div>

        {/* Growth Stats */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">النمو (آخر 30 يوم)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-gray-600 mb-1">منصات جديدة</p>
              <p className="text-2xl font-bold text-blue-600">+{stats.growth.newTenants}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">مدربين جدد</p>
              <p className="text-2xl font-bold text-green-600">+{stats.growth.newInstructors}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">طلاب جدد</p>
              <p className="text-2xl font-bold text-purple-600">+{stats.growth.newStudents}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">إيرادات حديثة</p>
              <p className="text-2xl font-bold text-orange-600">
                {formatCurrency(stats.growth.recentRevenue)}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            href="/admin/tenants"
            className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <Building2 className="h-8 w-8 text-blue-600 mb-3" />
            <h3 className="font-bold text-gray-900 mb-1">إدارة المنصات</h3>
            <p className="text-sm text-gray-600">عرض وإدارة جميع المنصات</p>
          </Link>

          <Link
            href="/admin/payouts"
            className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <DollarSign className="h-8 w-8 text-green-600 mb-3" />
            <h3 className="font-bold text-gray-900 mb-1">طلبات السحب</h3>
            <p className="text-sm text-gray-600">
              {stats.pendingPayoutsCount} طلب معلق
            </p>
          </Link>

          <Link
            href="/admin/instructors"
            className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <GraduationCap className="h-8 w-8 text-purple-600 mb-3" />
            <h3 className="font-bold text-gray-900 mb-1">المدربين</h3>
            <p className="text-sm text-gray-600">عرض جميع المدربين</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
