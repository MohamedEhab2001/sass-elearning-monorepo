'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/store/auth-store';
import { apiClient } from '@/lib/api-client';
import {
  DollarSign,
  TrendingUp,
  Users,
  BookOpen,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Receipt,
  Wallet,
} from 'lucide-react';

interface RevenueSummary {
  totalRevenue: number;
  totalCommission: number;
  netRevenue: number;
  availableBalance: number;
  pendingPayouts: number;
  completedPayouts: number;
  totalStudents: number;
  totalCourses: number;
}

export default function FinanceOverviewPage() {
  const router = useRouter();
  const { accessToken } = useAuth();

  const [summary, setSummary] = useState<RevenueSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!accessToken) {
      router.push('/auth/login');
      return;
    }

    loadFinanceSummary();
  }, [accessToken, router]);

  const loadFinanceSummary = async () => {
    try {
      const data = await apiClient.get<RevenueSummary>(
        '/payments/finance/summary',
        accessToken!
      );
      setSummary(data);
      setLoading(false);
    } catch (err: any) {
      setError(err.message || 'فشل تحميل البيانات المالية');
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

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">حدث خطأ</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.back()}
            className="text-blue-600 hover:underline"
          >
            رجوع
          </button>
        </div>
      </div>
    );
  }

  if (!summary) return null;

  const kpis = [
    {
      title: 'إجمالي الإيرادات',
      value: formatCurrency(summary.totalRevenue),
      icon: DollarSign,
      color: 'blue',
      description: 'إجمالي المبيعات',
    },
    {
      title: 'صافي الإيرادات',
      value: formatCurrency(summary.netRevenue),
      icon: TrendingUp,
      color: 'green',
      description: 'بعد خصم العمولة (15%)',
    },
    {
      title: 'الرصيد المتاح',
      value: formatCurrency(summary.availableBalance),
      icon: Wallet,
      color: 'purple',
      description: 'متاح للسحب',
    },
    {
      title: 'إجمالي الطلاب',
      value: summary.totalStudents.toString(),
      icon: Users,
      color: 'orange',
      description: 'عدد الطلاب الفريد',
    },
  ];

  const stats = [
    {
      label: 'عمولة المنصة (15%)',
      value: formatCurrency(summary.totalCommission),
      icon: Receipt,
    },
    {
      label: 'مدفوعات قيد الانتظار',
      value: formatCurrency(summary.pendingPayouts),
      icon: ArrowUpRight,
    },
    {
      label: 'مدفوعات مكتملة',
      value: formatCurrency(summary.completedPayouts),
      icon: ArrowDownRight,
    },
    {
      label: 'عدد الدورات',
      value: summary.totalCourses.toString(),
      icon: BookOpen,
    },
  ];

  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600',
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">لوحة التحكم المالية</h1>
          <p className="text-gray-600">نظرة عامة على أرباحك ومدفوعاتك</p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {kpis.map((kpi, index) => {
            const Icon = kpi.icon;
            return (
              <div key={index} className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`p-3 rounded-lg ${
                      colorClasses[kpi.color as keyof typeof colorClasses]
                    }`}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                </div>
                <h3 className="text-sm font-medium text-gray-600 mb-1">
                  {kpi.title}
                </h3>
                <p className="text-2xl font-bold text-gray-900 mb-1">{kpi.value}</p>
                <p className="text-xs text-gray-500">{kpi.description}</p>
              </div>
            );
          })}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-xl shadow-sm p-6 flex items-center gap-4"
              >
                <div className="p-3 bg-gray-100 rounded-lg">
                  <Icon className="h-6 w-6 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  <p className="text-lg font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            href="/dashboard/finance/transactions"
            className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Receipt className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">المعاملات</h3>
                <p className="text-sm text-gray-600">عرض جميع المعاملات</p>
              </div>
            </div>
          </Link>

          <Link
            href="/dashboard/finance/payouts"
            className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Wallet className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">طلبات السحب</h3>
                <p className="text-sm text-gray-600">إدارة عمليات السحب</p>
              </div>
            </div>
          </Link>

          <Link
            href="/dashboard/finance/payouts/new"
            className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow text-white"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-lg">
                <ArrowUpRight className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold mb-1">طلب سحب جديد</h3>
                <p className="text-sm opacity-90">
                  الرصيد المتاح: {formatCurrency(summary.availableBalance)}
                </p>
              </div>
            </div>
          </Link>
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="font-bold text-blue-900 mb-2">ملاحظة هامة</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• يتم خصم عمولة منصة بنسبة 15% من كل معاملة</li>
            <li>• الحد الأدنى لطلب السحب هو 100 جنيه</li>
            <li>• يتم معالجة طلبات السحب خلال 3-5 أيام عمل</li>
            <li>• تأكد من إدخال معلومات الدفع بشكل صحيح</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
