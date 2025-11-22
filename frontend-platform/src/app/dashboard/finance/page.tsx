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
  Award,
  Target,
} from 'lucide-react';

interface CommissionTier {
  _id: string;
  nameAr: string;
  nameEn: string;
  minRevenue: number;
  maxRevenue: number | null;
  commissionRate: number;
}

interface InstructorRevenueSummary {
  instructorId: string;
  tenantId: string;
  totalRevenue: number;
  totalCommission: number;
  netRevenue: number;
  currentTier: CommissionTier | null;
  nextTier: CommissionTier | null;
  progressToNextTier?: number;
}

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
  const { accessToken, user } = useAuth();

  const [summary, setSummary] = useState<RevenueSummary | null>(null);
  const [tierSummary, setTierSummary] = useState<InstructorRevenueSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!accessToken) {
      router.push('/auth/login');
      return;
    }

    loadFinanceData();
  }, [accessToken, router]);

  const loadFinanceData = async () => {
    try {
      const data = await apiClient.get<RevenueSummary>(
        '/payments/finance/summary',
        accessToken!
      );
      setSummary(data);

      // Load commission tier summary
      if (user?.tenantId && user?._id) {
        try {
          const tierData = await apiClient.get<InstructorRevenueSummary>(
            `/commissions/instructor-summary/${user.tenantId}/${user._id}?totalRevenue=${data.totalRevenue}&totalCommission=${data.totalCommission}`,
            accessToken!
          );
          setTierSummary(tierData);
        } catch (tierErr) {
          console.error('Failed to load tier summary:', tierErr);
          // Don't fail the whole page if tier info fails
        }
      }

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

  const currentCommissionRate = tierSummary?.currentTier?.commissionRate ?? 0;

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
      description: currentCommissionRate > 0
        ? `بعد خصم العمولة (${currentCommissionRate}%)`
        : 'بعد خصم العمولة',
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
      label: tierSummary?.currentTier
        ? `عمولة المنصة (${currentCommissionRate}%)`
        : 'عمولة المنصة',
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

        {/* Commission Tier Section */}
        {tierSummary && (
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg p-6 mb-8 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white/20 rounded-lg">
                  <Award className="h-8 w-8" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">
                    {tierSummary.currentTier
                      ? tierSummary.currentTier.nameAr
                      : 'لا يوجد مستوى'}
                  </h2>
                  <p className="text-sm opacity-90">
                    {tierSummary.currentTier
                      ? `نسبة العمولة: ${tierSummary.currentTier.commissionRate}%`
                      : 'لم يتم تطبيق عمولة بعد'}
                  </p>
                </div>
              </div>
              {tierSummary.currentTier && (
                <div className="text-right">
                  <p className="text-sm opacity-90">نطاق الإيرادات</p>
                  <p className="text-lg font-semibold">
                    {formatCurrency(tierSummary.currentTier.minRevenue)}
                    {tierSummary.currentTier.maxRevenue
                      ? ` - ${formatCurrency(tierSummary.currentTier.maxRevenue)}`
                      : '+'}
                  </p>
                </div>
              )}
            </div>

            {/* Progress to Next Tier */}
            {tierSummary.nextTier && (
              <div className="mt-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    <span className="font-medium">
                      التقدم نحو المستوى التالي: {tierSummary.nextTier.nameAr}
                    </span>
                  </div>
                  <span className="text-sm">
                    {tierSummary.progressToNextTier?.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-white h-full rounded-full transition-all duration-500"
                    style={{ width: `${tierSummary.progressToNextTier || 0}%` }}
                  ></div>
                </div>
                <div className="flex items-center justify-between mt-2 text-sm opacity-90">
                  <span>إيراداتك الحالية: {formatCurrency(tierSummary.totalRevenue)}</span>
                  <span>
                    المطلوب للمستوى التالي: {formatCurrency(tierSummary.nextTier.minRevenue)}
                  </span>
                </div>
                <div className="mt-3 bg-white/10 rounded-lg p-3">
                  <p className="text-sm">
                    عند الوصول للمستوى التالي، ستنخفض نسبة العمولة إلى{' '}
                    <span className="font-bold">{tierSummary.nextTier.commissionRate}%</span>
                    {' '}وستحصل على أرباح أكثر من كل عملية بيع!
                  </p>
                </div>
              </div>
            )}

            {/* No Next Tier - Highest Tier Reached */}
            {tierSummary.currentTier && !tierSummary.nextTier && (
              <div className="mt-4 bg-white/10 rounded-lg p-4 flex items-center gap-3">
                <Award className="h-6 w-6" />
                <p className="font-medium">
                  تهانينا! لقد وصلت إلى أعلى مستوى في برنامج العمولات
                </p>
              </div>
            )}
          </div>
        )}

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
            {tierSummary?.currentTier ? (
              <li>
                • يتم خصم عمولة منصة بنسبة {currentCommissionRate}% من كل معاملة
                {tierSummary.nextTier && (
                  <span>
                    {' '}(يمكنك خفضها إلى {tierSummary.nextTier.commissionRate}% بزيادة إيراداتك)
                  </span>
                )}
              </li>
            ) : (
              <li>• لا يوجد عمولة حاليًا على معاملاتك</li>
            )}
            <li>• الحد الأدنى لطلب السحب هو 100 جنيه</li>
            <li>• يتم معالجة طلبات السحب خلال 3-5 أيام عمل</li>
            <li>• تأكد من إدخال معلومات الدفع بشكل صحيح</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
