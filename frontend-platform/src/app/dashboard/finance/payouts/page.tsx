'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/store/auth-store';
import { apiClient } from '@/lib/api-client';
import { ArrowRight, Plus, Clock, CheckCircle, XCircle, Ban, TrendingUp, Receipt, Award, DollarSign } from 'lucide-react';

interface CommissionTier {
  _id: string;
  nameAr: string;
  commissionRate: number;
}

interface InstructorRevenueSummary {
  totalRevenue: number;
  totalCommission: number;
  netRevenue: number;
  currentTier: CommissionTier | null;
}

interface RevenueSummary {
  totalRevenue: number;
  totalCommission: number;
  availableBalance: number;
}

interface Payout {
  _id: string;
  amount: number;
  currency: string;
  status: string;
  method: string;
  notes: string | null;
  rejectionReason: string | null;
  processedAt: Date | null;
  completedAt: Date | null;
  createdAt: Date;
}

export default function PayoutsListPage() {
  const router = useRouter();
  const { accessToken, user } = useAuth();

  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [financeSummary, setFinanceSummary] = useState<RevenueSummary | null>(null);
  const [tierSummary, setTierSummary] = useState<InstructorRevenueSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!accessToken) {
      router.push('/auth/login');
      return;
    }

    loadPayouts();
  }, [accessToken, router]);

  const loadPayouts = async () => {
    try {
      const data = await apiClient.get<Payout[]>(
        '/payments/finance/payouts',
        accessToken!
      );
      setPayouts(data);

      // Load financial summary
      try {
        const financeData = await apiClient.get<RevenueSummary>(
          '/payments/finance/summary',
          accessToken!
        );
        setFinanceSummary(financeData);

        // Load commission tier summary
        if (user?.tenantId && user?._id) {
          try {
            const tierData = await apiClient.get<InstructorRevenueSummary>(
              `/commissions/instructor-summary/${user.tenantId}/${user._id}?totalRevenue=${financeData.totalRevenue}&totalCommission=${financeData.totalCommission}`,
              accessToken!
            );
            setTierSummary(tierData);
          } catch (tierErr) {
            console.error('Failed to load tier summary:', tierErr);
          }
        }
      } catch (financeErr) {
        console.error('Failed to load finance summary:', financeErr);
      }

      setLoading(false);
    } catch (err: any) {
      setError(err.message || 'فشل تحميل طلبات السحب');
      setLoading(false);
    }
  };

  const handleCancelPayout = async (payoutId: string) => {
    if (!confirm('هل أنت متأكد من إلغاء طلب السحب؟')) {
      return;
    }

    try {
      await apiClient.patch(
        `/payments/finance/payouts/${payoutId}/cancel`,
        {},
        accessToken!
      );
      loadPayouts();
    } catch (err: any) {
      alert(err.message || 'فشل إلغاء الطلب');
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

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: {
        label: 'قيد الانتظار',
        className: 'bg-yellow-100 text-yellow-700',
        icon: Clock,
      },
      approved: {
        label: 'تم الموافقة',
        className: 'bg-blue-100 text-blue-700',
        icon: CheckCircle,
      },
      processing: {
        label: 'جاري المعالجة',
        className: 'bg-purple-100 text-purple-700',
        icon: Clock,
      },
      completed: {
        label: 'مكتمل',
        className: 'bg-green-100 text-green-700',
        icon: CheckCircle,
      },
      rejected: {
        label: 'مرفوض',
        className: 'bg-red-100 text-red-700',
        icon: XCircle,
      },
      cancelled: {
        label: 'ملغي',
        className: 'bg-gray-100 text-gray-700',
        icon: Ban,
      },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span
        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${config.className}`}
      >
        <Icon className="h-3 w-3" />
        {config.label}
      </span>
    );
  };

  const getMethodLabel = (method: string) => {
    const methods = {
      bank_transfer: 'تحويل بنكي',
      paypal: 'باي بال',
      mobile_wallet: 'محفظة إلكترونية',
    };
    return methods[method as keyof typeof methods] || method;
  };

  const stats = {
    total: payouts.reduce((sum, p) => sum + p.amount, 0),
    pending: payouts.filter((p) => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0),
    completed: payouts.filter((p) => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0),
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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/dashboard/finance')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowRight className="h-5 w-5" />
              رجوع
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">طلبات السحب</h1>
              <p className="text-gray-600 mt-1">إدارة عمليات السحب الخاصة بك</p>
            </div>
          </div>
          <Link
            href="/dashboard/finance/payouts/new"
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-5 w-5" />
            طلب سحب جديد
          </Link>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Revenue Breakdown */}
        {financeSummary && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">تفاصيل الإيرادات والعمولات</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                {/* Total Revenue */}
                <div className="flex items-center justify-between pb-3 border-b">
                  <div className="flex items-center gap-2 text-gray-600">
                    <TrendingUp className="h-5 w-5" />
                    <span>إجمالي الإيرادات</span>
                  </div>
                  <span className="text-lg font-semibold text-gray-900">
                    {formatCurrency(financeSummary.totalRevenue)}
                  </span>
                </div>

                {/* Commission */}
                <div className="flex items-center justify-between pb-3 border-b">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Receipt className="h-5 w-5" />
                    <span>
                      عمولة المنصة
                      {tierSummary?.currentTier && (
                        <span className="mr-1 text-sm">
                          ({tierSummary.currentTier.commissionRate}%)
                        </span>
                      )}
                    </span>
                  </div>
                  <span className="text-lg font-semibold text-red-600">
                    -{formatCurrency(financeSummary.totalCommission)}
                  </span>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                {/* Current Tier */}
                {tierSummary?.currentTier && (
                  <div className="flex items-center justify-between pb-3 border-b">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Award className="h-5 w-5" />
                      <span>المستوى الحالي</span>
                    </div>
                    <span className="text-sm font-medium text-blue-600">
                      {tierSummary.currentTier.nameAr}
                    </span>
                  </div>
                )}

                {/* Available Balance */}
                <div className="flex items-center justify-between pb-3 border-b">
                  <div className="flex items-center gap-2 text-gray-900">
                    <DollarSign className="h-5 w-5" />
                    <span className="font-bold">الرصيد المتاح</span>
                  </div>
                  <span className="text-xl font-bold text-green-600">
                    {formatCurrency(financeSummary.availableBalance)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <p className="text-sm text-gray-600 mb-1">إجمالي المسحوبات</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(stats.total)}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <p className="text-sm text-gray-600 mb-1">قيد الانتظار</p>
            <p className="text-2xl font-bold text-yellow-600">
              {formatCurrency(stats.pending)}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <p className="text-sm text-gray-600 mb-1">المكتملة</p>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(stats.completed)}
            </p>
          </div>
        </div>

        {/* Payouts List */}
        {payouts.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <p className="text-gray-600 mb-4">لا توجد طلبات سحب بعد</p>
            <Link
              href="/dashboard/finance/payouts/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-5 w-5" />
              طلب سحب جديد
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                      المبلغ
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                      الطريقة
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                      الحالة
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                      تاريخ الطلب
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                      الإجراءات
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {payouts.map((payout) => (
                    <tr key={payout._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <p className="font-bold text-gray-900">
                          {formatCurrency(payout.amount)}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {getMethodLabel(payout.method)}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(payout.status)}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {formatDate(payout.createdAt)}
                      </td>
                      <td className="px-6 py-4">
                        {payout.status === 'pending' && (
                          <button
                            onClick={() => handleCancelPayout(payout._id)}
                            className="text-red-600 hover:underline text-sm"
                          >
                            إلغاء
                          </button>
                        )}
                        {payout.status === 'rejected' && payout.rejectionReason && (
                          <button
                            onClick={() =>
                              alert(`سبب الرفض: ${payout.rejectionReason}`)
                            }
                            className="text-blue-600 hover:underline text-sm"
                          >
                            عرض السبب
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
