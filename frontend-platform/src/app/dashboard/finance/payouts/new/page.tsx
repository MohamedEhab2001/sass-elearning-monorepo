'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/store/auth-store';
import { apiClient } from '@/lib/api-client';
import { ArrowRight, DollarSign, AlertCircle } from 'lucide-react';

interface RevenueSummary {
  availableBalance: number;
}

export default function NewPayoutPage() {
  const router = useRouter();
  const { accessToken } = useAuth();

  const [summary, setSummary] = useState<RevenueSummary | null>(null);
  const [formData, setFormData] = useState({
    amount: '',
    method: 'bank_transfer',
    accountName: '',
    accountNumber: '',
    bankName: '',
    iban: '',
    paypalEmail: '',
    mobileNumber: '',
    notes: '',
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!accessToken) {
      router.push('/auth/login');
      return;
    }

    loadSummary();
  }, [accessToken, router]);

  const loadSummary = async () => {
    try {
      const data = await apiClient.get<RevenueSummary>(
        '/payments/finance/summary',
        accessToken!
      );
      setSummary(data);
      setLoading(false);
    } catch (err: any) {
      setError(err.message || 'فشل تحميل البيانات');
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const amount = parseFloat(formData.amount);

    if (isNaN(amount) || amount <= 0) {
      setError('يرجى إدخال مبلغ صحيح');
      return;
    }

    if (amount < 100) {
      setError('الحد الأدنى للسحب هو 100 جنيه');
      return;
    }

    if (summary && amount > summary.availableBalance) {
      setError('المبلغ المطلوب أكبر من الرصيد المتاح');
      return;
    }

    // Prepare payment details based on method
    let paymentDetails: any = {};

    if (formData.method === 'bank_transfer') {
      if (!formData.accountName || !formData.accountNumber || !formData.bankName) {
        setError('يرجى إدخال جميع بيانات الحساب البنكي');
        return;
      }
      paymentDetails = {
        accountName: formData.accountName,
        accountNumber: formData.accountNumber,
        bankName: formData.bankName,
        iban: formData.iban || undefined,
      };
    } else if (formData.method === 'paypal') {
      if (!formData.paypalEmail) {
        setError('يرجى إدخال بريد باي بال الإلكتروني');
        return;
      }
      paymentDetails = {
        paypalEmail: formData.paypalEmail,
      };
    } else if (formData.method === 'mobile_wallet') {
      if (!formData.mobileNumber) {
        setError('يرجى إدخال رقم المحفظة الإلكترونية');
        return;
      }
      paymentDetails = {
        mobileNumber: formData.mobileNumber,
      };
    }

    setSubmitting(true);

    try {
      await apiClient.post(
        '/payments/finance/payouts',
        {
          amount,
          method: formData.method,
          paymentDetails,
          notes: formData.notes || undefined,
        },
        accessToken!
      );

      alert('تم إرسال طلب السحب بنجاح');
      router.push('/dashboard/finance/payouts');
    } catch (err: any) {
      setError(err.message || 'فشل إرسال الطلب');
      setSubmitting(false);
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

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowRight className="h-5 w-5" />
            رجوع
          </button>
          <h1 className="text-3xl font-bold text-gray-900">طلب سحب جديد</h1>
          <p className="text-gray-600 mt-2">
            الرصيد المتاح: {summary ? formatCurrency(summary.availableBalance) : '...'}
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-sm p-8">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-2">
              <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                المبلغ المطلوب *
              </label>
              <div className="relative">
                <DollarSign className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="100"
                  min="100"
                  max={summary?.availableBalance}
                />
              </div>
              <p className="mt-2 text-sm text-gray-500">
                الحد الأدنى: 100 جنيه • الحد الأقصى: {summary ? formatCurrency(summary.availableBalance) : '...'}
              </p>
            </div>

            {/* Method */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                طريقة الدفع *
              </label>
              <select
                value={formData.method}
                onChange={(e) => setFormData({ ...formData, method: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="bank_transfer">تحويل بنكي</option>
                <option value="paypal">باي بال</option>
                <option value="mobile_wallet">محفظة إلكترونية</option>
              </select>
            </div>

            {/* Bank Transfer Fields */}
            {formData.method === 'bank_transfer' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    اسم صاحب الحساب *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.accountName}
                    onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="محمد أحمد"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    رقم الحساب *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.accountNumber}
                    onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="1234567890"
                    dir="ltr"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    اسم البنك *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.bankName}
                    onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="البنك الأهلي المصري"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    IBAN (اختياري)
                  </label>
                  <input
                    type="text"
                    value={formData.iban}
                    onChange={(e) => setFormData({ ...formData, iban: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="EG123456789012345678901234"
                    dir="ltr"
                  />
                </div>
              </>
            )}

            {/* PayPal Fields */}
            {formData.method === 'paypal' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  بريد باي بال الإلكتروني *
                </label>
                <input
                  type="email"
                  required
                  value={formData.paypalEmail}
                  onChange={(e) => setFormData({ ...formData, paypalEmail: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="email@paypal.com"
                  dir="ltr"
                />
              </div>
            )}

            {/* Mobile Wallet Fields */}
            {formData.method === 'mobile_wallet' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  رقم المحفظة الإلكترونية *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.mobileNumber}
                  onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="01012345678"
                  dir="ltr"
                />
              </div>
            )}

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ملاحظات (اختياري)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="أي ملاحظات إضافية..."
              />
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900 font-semibold mb-2">معلومات هامة:</p>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• سيتم مراجعة طلبك خلال 24-48 ساعة</li>
                <li>• قد يستغرق التحويل 3-5 أيام عمل</li>
                <li>• تأكد من صحة البيانات المدخلة</li>
                <li>• يمكنك إلغاء الطلب قبل الموافقة عليه</li>
              </ul>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-3 px-6 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'جاري الإرسال...' : 'إرسال الطلب'}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                إلغاء
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
