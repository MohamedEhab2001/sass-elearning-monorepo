'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/store/auth-store';
import { apiClient } from '@/lib/api-client';
import {
  ArrowRight,
  Clock,
  CheckCircle,
  XCircle,
  Ban,
  Filter,
} from 'lucide-react';

interface Payout {
  _id: string;
  instructorId: {
    fullName: string;
    email: string;
    tenantId: {
      name: string;
    };
  };
  amount: number;
  currency: string;
  status: string;
  method: string;
  paymentDetails: any;
  notes: string | null;
  rejectionReason: string | null;
  createdAt: Date;
  processedAt: Date | null;
  completedAt: Date | null;
}

export default function AdminPayoutsPage() {
  const router = useRouter();
  const { accessToken, user } = useAuth();

  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [filteredPayouts, setFilteredPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedPayout, setSelectedPayout] = useState<Payout | null>(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [transactionRef, setTransactionRef] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!accessToken || user?.role !== 'admin') {
      router.push('/auth/login');
      return;
    }

    loadPayouts();
  }, [accessToken, user, router]);

  useEffect(() => {
    filterPayouts();
  }, [payouts, statusFilter]);

  const loadPayouts = async () => {
    try {
      const data = await apiClient.get<Payout[]>('/payments/admin/payouts', accessToken!);
      setPayouts(data);
      setLoading(false);
    } catch (err: any) {
      setError(err.message || 'فشل تحميل طلبات السحب');
      setLoading(false);
    }
  };

  const filterPayouts = () => {
    if (statusFilter === 'all') {
      setFilteredPayouts(payouts);
    } else {
      setFilteredPayouts(payouts.filter((p) => p.status === statusFilter));
    }
  };

  const handleApprove = async () => {
    if (!selectedPayout) return;

    setProcessing(true);
    try {
      await apiClient.patch(
        `/payments/admin/payouts/${selectedPayout._id}/status`,
        {
          status: 'approved',
        },
        accessToken!
      );

      alert('تمت الموافقة على الطلب بنجاح');
      setShowApproveModal(false);
      setSelectedPayout(null);
      loadPayouts();
    } catch (err: any) {
      alert(err.message || 'فشل الموافقة على الطلب');
    } finally {
      setProcessing(false);
    }
  };

  const handleComplete = async () => {
    if (!selectedPayout || !transactionRef) {
      alert('يرجى إدخال رقم المعاملة');
      return;
    }

    setProcessing(true);
    try {
      await apiClient.patch(
        `/payments/admin/payouts/${selectedPayout._id}/status`,
        {
          status: 'completed',
          transactionReference: transactionRef,
        },
        accessToken!
      );

      alert('تم تحديث الحالة إلى مكتمل');
      setShowApproveModal(false);
      setSelectedPayout(null);
      setTransactionRef('');
      loadPayouts();
    } catch (err: any) {
      alert(err.message || 'فشل تحديث الحالة');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedPayout || !rejectionReason) {
      alert('يرجى إدخال سبب الرفض');
      return;
    }

    setProcessing(true);
    try {
      await apiClient.patch(
        `/payments/admin/payouts/${selectedPayout._id}/status`,
        {
          status: 'rejected',
          rejectionReason,
        },
        accessToken!
      );

      alert('تم رفض الطلب');
      setShowRejectModal(false);
      setSelectedPayout(null);
      setRejectionReason('');
      loadPayouts();
    } catch (err: any) {
      alert(err.message || 'فشل رفض الطلب');
    } finally {
      setProcessing(false);
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
    const config = {
      pending: { label: 'معلق', className: 'bg-yellow-100 text-yellow-700', icon: Clock },
      approved: { label: 'موافق عليه', className: 'bg-blue-100 text-blue-700', icon: CheckCircle },
      processing: { label: 'جاري المعالجة', className: 'bg-purple-100 text-purple-700', icon: Clock },
      completed: { label: 'مكتمل', className: 'bg-green-100 text-green-700', icon: CheckCircle },
      rejected: { label: 'مرفوض', className: 'bg-red-100 text-red-700', icon: XCircle },
      cancelled: { label: 'ملغي', className: 'bg-gray-100 text-gray-700', icon: Ban },
    };

    const item = config[status as keyof typeof config] || config.pending;
    const Icon = item.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${item.className}`}>
        <Icon className="h-3 w-3" />
        {item.label}
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

  const pendingCount = payouts.filter((p) => p.status === 'pending').length;
  const pendingAmount = payouts
    .filter((p) => p.status === 'pending')
    .reduce((sum, p) => sum + p.amount, 0);

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
              onClick={() => router.push('/admin')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowRight className="h-5 w-5" />
              رجوع
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">طلبات السحب</h1>
              <p className="text-gray-600 mt-1">
                {pendingCount} طلب معلق • {formatCurrency(pendingAmount)}
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Filter */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex items-center gap-4">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">الكل</option>
              <option value="pending">معلق</option>
              <option value="approved">موافق عليه</option>
              <option value="processing">جاري المعالجة</option>
              <option value="completed">مكتمل</option>
              <option value="rejected">مرفوض</option>
            </select>
            <span className="text-sm text-gray-600">
              {filteredPayouts.length} طلب
            </span>
          </div>
        </div>

        {/* Payouts Table */}
        {filteredPayouts.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <p className="text-gray-600">لا توجد طلبات سحب</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">المدرب</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">المنصة</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">المبلغ</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">الطريقة</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">الحالة</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">التاريخ</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredPayouts.map((payout) => (
                    <tr key={payout._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900">{payout.instructorId.fullName}</p>
                          <p className="text-sm text-gray-500">{payout.instructorId.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {payout.instructorId.tenantId.name}
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-gray-900">{formatCurrency(payout.amount)}</p>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{getMethodLabel(payout.method)}</td>
                      <td className="px-6 py-4">{getStatusBadge(payout.status)}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{formatDate(payout.createdAt)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {payout.status === 'pending' && (
                            <>
                              <button
                                onClick={() => {
                                  setSelectedPayout(payout);
                                  setShowApproveModal(true);
                                }}
                                className="text-green-600 hover:underline text-sm"
                              >
                                موافقة
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedPayout(payout);
                                  setShowRejectModal(true);
                                }}
                                className="text-red-600 hover:underline text-sm"
                              >
                                رفض
                              </button>
                            </>
                          )}
                          {payout.status === 'approved' && (
                            <button
                              onClick={() => {
                                setSelectedPayout(payout);
                                setShowApproveModal(true);
                              }}
                              className="text-blue-600 hover:underline text-sm"
                            >
                              إكمال
                            </button>
                          )}
                          <button
                            onClick={() => alert(JSON.stringify(payout.paymentDetails, null, 2))}
                            className="text-blue-600 hover:underline text-sm"
                          >
                            التفاصيل
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Approve/Complete Modal */}
      {showApproveModal && selectedPayout && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              {selectedPayout.status === 'pending' ? 'الموافقة على الطلب' : 'إكمال الطلب'}
            </h3>
            <div className="mb-4">
              <p className="text-sm text-gray-600">المبلغ:</p>
              <p className="text-lg font-bold text-gray-900">{formatCurrency(selectedPayout.amount)}</p>
            </div>
            {selectedPayout.status === 'approved' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  رقم المعاملة *
                </label>
                <input
                  type="text"
                  value={transactionRef}
                  onChange={(e) => setTransactionRef(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="TXN123456"
                />
              </div>
            )}
            <div className="flex items-center gap-3">
              <button
                onClick={selectedPayout.status === 'pending' ? handleApprove : handleComplete}
                disabled={processing}
                className="flex-1 py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {processing ? 'جاري المعالجة...' : selectedPayout.status === 'pending' ? 'موافقة' : 'إكمال'}
              </button>
              <button
                onClick={() => {
                  setShowApproveModal(false);
                  setSelectedPayout(null);
                  setTransactionRef('');
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedPayout && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">رفض الطلب</h3>
            <div className="mb-4">
              <p className="text-sm text-gray-600">المبلغ:</p>
              <p className="text-lg font-bold text-gray-900">{formatCurrency(selectedPayout.amount)}</p>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">سبب الرفض *</label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="يرجى توضيح سبب رفض الطلب..."
              />
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleReject}
                disabled={processing}
                className="flex-1 py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {processing ? 'جاري المعالجة...' : 'رفض الطلب'}
              </button>
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setSelectedPayout(null);
                  setRejectionReason('');
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
