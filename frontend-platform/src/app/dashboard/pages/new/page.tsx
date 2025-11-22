'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/store/auth-store';
import { apiClient } from '@/lib/api-client';
import { ArrowRight } from 'lucide-react';

export default function NewPagePage() {
  const router = useRouter();
  const { accessToken } = useAuth();

  const [formData, setFormData] = useState({
    title: '',
    path: '/',
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const newPage = await apiClient.post<{ _id: string }>(
        '/ui-config/pages',
        formData,
        accessToken!
      );

      router.push(`/dashboard/pages/${newPage._id}`);
    } catch (err: any) {
      setError(err.message || 'فشل إنشاء الصفحة');
      setLoading(false);
    }
  };

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
          <h1 className="text-3xl font-bold text-gray-900">إنشاء صفحة جديدة</h1>
          <p className="text-gray-600 mt-2">أدخل المعلومات الأساسية للصفحة</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-sm p-8">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                عنوان الصفحة *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="مثال: الصفحة الرئيسية"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                المسار (URL Path) *
              </label>
              <input
                type="text"
                required
                value={formData.path}
                onChange={(e) => setFormData({ ...formData, path: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="مثال: / أو /about أو /contact"
                dir="ltr"
              />
              <p className="mt-2 text-sm text-gray-500">
                استخدم "/" للصفحة الرئيسية، أو "/about" للصفحات الأخرى
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الوصف (اختياري)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="وصف مختصر للصفحة (يظهر في محركات البحث)"
              />
            </div>

            <div className="flex items-center gap-4">
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'جاري الإنشاء...' : 'إنشاء الصفحة'}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="px-8 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
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
