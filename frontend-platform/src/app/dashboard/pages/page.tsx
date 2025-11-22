'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/store/auth-store';
import { apiClient } from '@/lib/api-client';
import { Plus, Edit, Copy, Trash2, Eye, EyeOff, FileText } from 'lucide-react';

interface Page {
  _id: string;
  title: string;
  path: string;
  description: string | null;
  status: 'draft' | 'published';
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  createdBy: {
    fullName: string;
  };
  sections: any[];
}

export default function PagesListPage() {
  const router = useRouter();
  const { accessToken } = useAuth();
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!accessToken) {
      router.push('/auth/login');
      return;
    }

    loadPages();
  }, [accessToken, router]);

  const loadPages = async () => {
    try {
      const data = await apiClient.get<Page[]>('/ui-config/pages', accessToken!);
      setPages(data);
      setLoading(false);
    } catch (err: any) {
      setError(err.message || 'فشل تحميل الصفحات');
      setLoading(false);
    }
  };

  const handleDelete = async (pageId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه الصفحة؟')) {
      return;
    }

    try {
      await apiClient.delete(`/ui-config/pages/${pageId}`, accessToken!);
      setPages(pages.filter((p) => p._id !== pageId));
    } catch (err: any) {
      alert(err.message || 'فشل حذف الصفحة');
    }
  };

  const handleDuplicate = async (pageId: string) => {
    try {
      const newPage = await apiClient.post<Page>(
        `/ui-config/pages/${pageId}/duplicate`,
        {},
        accessToken!
      );
      setPages([newPage, ...pages]);
    } catch (err: any) {
      alert(err.message || 'فشل نسخ الصفحة');
    }
  };

  const handleToggleStatus = async (pageId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'published' ? 'draft' : 'published';

    try {
      const updatedPage = await apiClient.patch<Page>(
        `/ui-config/pages/${pageId}/publish`,
        { status: newStatus },
        accessToken!
      );

      setPages(pages.map((p) => (p._id === pageId ? updatedPage : p)));
    } catch (err: any) {
      alert(err.message || 'فشل تغيير حالة الصفحة');
    }
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
          <div>
            <h1 className="text-3xl font-bold text-gray-900">إدارة الصفحات</h1>
            <p className="text-gray-600 mt-2">قم بإنشاء وتخصيص صفحات موقعك</p>
          </div>
          <Link
            href="/dashboard/pages/new"
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-5 w-5" />
            صفحة جديدة
          </Link>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Pages List */}
        {pages.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              لا توجد صفحات بعد
            </h3>
            <p className="text-gray-600 mb-6">
              ابدأ بإنشاء صفحتك الأولى باستخدام Page Builder
            </p>
            <Link
              href="/dashboard/pages/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-5 w-5" />
              إنشاء صفحة جديدة
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                    العنوان
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                    المسار
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                    الحالة
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                    الأقسام
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                    آخر تحديث
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                    الإجراءات
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {pages.map((page) => (
                  <tr key={page._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-semibold text-gray-900">{page.title}</div>
                        {page.description && (
                          <div className="text-sm text-gray-600 mt-1">
                            {page.description}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                        {page.path}
                      </code>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                          page.status === 'published'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {page.status === 'published' ? (
                          <>
                            <Eye className="h-3 w-3" />
                            منشور
                          </>
                        ) : (
                          <>
                            <EyeOff className="h-3 w-3" />
                            مسودة
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {page.sections.length} قسم
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(page.updatedAt).toLocaleDateString('ar-EG')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => router.push(`/dashboard/pages/${page._id}`)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="تعديل"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(page._id, page.status)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title={page.status === 'published' ? 'إلغاء النشر' : 'نشر'}
                        >
                          {page.status === 'published' ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDuplicate(page._id)}
                          className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                          title="نسخ"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(page._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="حذف"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
