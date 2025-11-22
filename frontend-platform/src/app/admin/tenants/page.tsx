'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/store/auth-store';
import { apiClient } from '@/lib/api-client';
import { ArrowRight, Search, Eye, Users, BookOpen, DollarSign } from 'lucide-react';

interface Tenant {
  _id: string;
  name: string;
  slug: string;
  description: string | null;
  logo: string | null;
  status: string;
  ownerId: {
    fullName: string;
    email: string;
  };
  createdAt: Date;
  stats: {
    instructors: number;
    students: number;
    courses: number;
    revenue: number;
  };
}

export default function TenantsListPage() {
  const router = useRouter();
  const { accessToken, user } = useAuth();

  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [filteredTenants, setFilteredTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!accessToken || user?.role !== 'admin') {
      router.push('/auth/login');
      return;
    }

    loadTenants();
  }, [accessToken, user, router]);

  useEffect(() => {
    if (searchTerm) {
      setFilteredTenants(
        tenants.filter(
          (t) =>
            t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.ownerId.fullName.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    } else {
      setFilteredTenants(tenants);
    }
  }, [searchTerm, tenants]);

  const loadTenants = async () => {
    try {
      const data = await apiClient.get<Tenant[]>('/admin/tenants', accessToken!);
      setTenants(data);
      setFilteredTenants(data);
      setLoading(false);
    } catch (err: any) {
      setError(err.message || 'فشل تحميل المنصات');
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
    return new Date(date).toLocaleDateString('ar-EG');
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
              onClick={() => router.push('/admin')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowRight className="h-5 w-5" />
              رجوع
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">المنصات</h1>
              <p className="text-gray-600 mt-1">إجمالي {filteredTenants.length} منصة</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Search */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="relative">
            <Search className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="بحث في المنصات..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Tenants Table */}
        {filteredTenants.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <p className="text-gray-600">لا توجد منصات</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                      المنصة
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                      المالك
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                      الإحصائيات
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                      الإيرادات
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                      الحالة
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                      تاريخ الإنشاء
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                      الإجراءات
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredTenants.map((tenant) => (
                    <tr key={tenant._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {tenant.logo && (
                            <img
                              src={tenant.logo}
                              alt={tenant.name}
                              className="w-10 h-10 rounded object-cover"
                            />
                          )}
                          <div>
                            <p className="font-medium text-gray-900">{tenant.name}</p>
                            <p className="text-sm text-gray-500">/{tenant.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900">
                            {tenant.ownerId.fullName}
                          </p>
                          <p className="text-sm text-gray-500">{tenant.ownerId.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4 text-gray-400" />
                            <span>{tenant.stats.instructors}م</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4 text-gray-400" />
                            <span>{tenant.stats.students}ط</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <BookOpen className="h-4 w-4 text-gray-400" />
                            <span>{tenant.stats.courses}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 text-sm">
                          <DollarSign className="h-4 w-4 text-green-600" />
                          <span className="font-medium text-gray-900">
                            {formatCurrency(tenant.stats.revenue)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                            tenant.status === 'active'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {tenant.status === 'active' ? 'نشط' : 'معطل'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {formatDate(tenant.createdAt)}
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          href={`/admin/tenants/${tenant._id}`}
                          className="flex items-center gap-1 text-blue-600 hover:underline text-sm"
                        >
                          <Eye className="h-4 w-4" />
                          عرض
                        </Link>
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
