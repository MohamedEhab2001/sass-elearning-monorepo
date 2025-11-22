'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/store/auth-store';
import { apiClient } from '@/lib/api-client';
import { ArrowRight, Search, Filter, Download } from 'lucide-react';

interface Transaction {
  _id: string;
  courseId: {
    title: string;
    thumbnail: string | null;
  };
  userId: {
    fullName: string;
    email: string;
  };
  amount: number;
  currency: string;
  transactionId: string;
  completedAt: Date;
  createdAt: Date;
}

export default function TransactionsListPage() {
  const router = useRouter();
  const { accessToken } = useAuth();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');

  useEffect(() => {
    if (!accessToken) {
      router.push('/auth/login');
      return;
    }

    loadTransactions();
  }, [accessToken, router]);

  useEffect(() => {
    filterAndSortTransactions();
  }, [transactions, searchTerm, sortBy]);

  const loadTransactions = async () => {
    try {
      const data = await apiClient.get<Transaction[]>(
        '/payments/finance/transactions',
        accessToken!
      );
      setTransactions(data);
      setLoading(false);
    } catch (err: any) {
      setError(err.message || 'فشل تحميل المعاملات');
      setLoading(false);
    }
  };

  const filterAndSortTransactions = () => {
    let filtered = [...transactions];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (t) =>
          t.courseId.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.userId.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.userId.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.transactionId.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else {
        return b.amount - a.amount;
      }
    });

    setFilteredTransactions(filtered);
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

  const totalRevenue = transactions.reduce((sum, t) => sum + t.amount, 0);
  const commission = totalRevenue * 0.15;
  const netRevenue = totalRevenue - commission;

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
              <h1 className="text-3xl font-bold text-gray-900">المعاملات</h1>
              <p className="text-gray-600 mt-1">
                إجمالي {filteredTransactions.length} معاملة
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <p className="text-sm text-gray-600 mb-1">إجمالي الإيرادات</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(totalRevenue)}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <p className="text-sm text-gray-600 mb-1">عمولة المنصة (15%)</p>
            <p className="text-2xl font-bold text-red-600">
              -{formatCurrency(commission)}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <p className="text-sm text-gray-600 mb-1">صافي الإيرادات</p>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(netRevenue)}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="بحث في المعاملات..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'amount')}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="date">ترتيب حسب التاريخ</option>
              <option value="amount">ترتيب حسب المبلغ</option>
            </select>
          </div>
        </div>

        {/* Transactions Table */}
        {filteredTransactions.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <p className="text-gray-600 mb-2">لا توجد معاملات</p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="text-blue-600 hover:underline text-sm"
              >
                مسح البحث
              </button>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                      الدورة
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                      الطالب
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                      المبلغ
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                      التاريخ
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                      رقم المعاملة
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredTransactions.map((transaction) => (
                    <tr key={transaction._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {transaction.courseId.thumbnail && (
                            <img
                              src={transaction.courseId.thumbnail}
                              alt={transaction.courseId.title}
                              className="w-12 h-12 rounded object-cover"
                            />
                          )}
                          <div>
                            <p className="font-medium text-gray-900">
                              {transaction.courseId.title}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900">
                            {transaction.userId.fullName}
                          </p>
                          <p className="text-sm text-gray-600">
                            {transaction.userId.email}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-bold text-gray-900">
                            {formatCurrency(transaction.amount)}
                          </p>
                          <p className="text-xs text-gray-500">
                            صافي: {formatCurrency(transaction.amount * 0.85)}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {formatDate(transaction.createdAt)}
                      </td>
                      <td className="px-6 py-4">
                        <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                          {transaction.transactionId}
                        </code>
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
