'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/store/auth-store';
import { apiClient } from '@/lib/api-client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Plus,
  Edit,
  Trash2,
  Tag,
  Calendar,
  TrendingUp,
  Check,
  X,
  Copy,
  BarChart3,
} from 'lucide-react';
import { IDiscount, DiscountType, DiscountApplicableTo } from '@academy/shared/types';

interface Course {
  _id: string;
  title: string;
}

export default function DiscountsPage() {
  const router = useRouter();
  const { accessToken, user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [discounts, setDiscounts] = useState<IDiscount[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form state
  const [showModal, setShowModal] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState<IDiscount | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    type: DiscountType.PERCENTAGE,
    value: '',
    applicableTo: DiscountApplicableTo.ALL,
    specificCourseIds: [] as string[],
    maxUses: '',
    validFrom: '',
    validUntil: '',
  });

  useEffect(() => {
    if (!accessToken) {
      router.push('/auth/login');
      return;
    }

    loadData();
  }, [accessToken, router]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      // Load discounts
      const discountsData = await apiClient.get<IDiscount[]>(
        '/discounts',
        accessToken!
      );
      setDiscounts(discountsData);

      // Load courses for dropdown
      const coursesData = await apiClient.get<{ courses: Course[] }>(
        '/courses?limit=1000',
        accessToken!
      );
      setCourses(coursesData.courses || []);
    } catch (err: any) {
      setError(err.message || 'فشل تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (discount?: IDiscount) => {
    if (discount) {
      setEditingDiscount(discount);
      setFormData({
        code: discount.code,
        type: discount.type,
        value: discount.value.toString(),
        applicableTo: discount.applicableTo,
        specificCourseIds: discount.specificCourseIds || [],
        maxUses: discount.maxUses?.toString() || '',
        validFrom: new Date(discount.validFrom).toISOString().split('T')[0],
        validUntil: new Date(discount.validUntil).toISOString().split('T')[0],
      });
    } else {
      setEditingDiscount(null);
      setFormData({
        code: '',
        type: DiscountType.PERCENTAGE,
        value: '',
        applicableTo: DiscountApplicableTo.ALL,
        specificCourseIds: [],
        maxUses: '',
        validFrom: new Date().toISOString().split('T')[0],
        validUntil: '',
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingDiscount(null);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      // Validate
      if (!formData.code.trim()) {
        setError('يجب إدخال كود الخصم');
        return;
      }
      if (!formData.value || parseFloat(formData.value) <= 0) {
        setError('يجب إدخال قيمة خصم صحيحة');
        return;
      }
      if (formData.type === DiscountType.PERCENTAGE && parseFloat(formData.value) > 100) {
        setError('نسبة الخصم لا يمكن أن تتجاوز 100%');
        return;
      }
      if (!formData.validFrom || !formData.validUntil) {
        setError('يجب تحديد تاريخي البداية والانتهاء');
        return;
      }
      if (new Date(formData.validFrom) >= new Date(formData.validUntil)) {
        setError('تاريخ الانتهاء يجب أن يكون بعد تاريخ البداية');
        return;
      }

      const payload = {
        code: formData.code.toUpperCase().trim(),
        type: formData.type,
        value: parseFloat(formData.value),
        applicableTo: formData.applicableTo,
        specificCourseIds:
          formData.applicableTo === DiscountApplicableTo.COURSES && formData.specificCourseIds.length > 0
            ? formData.specificCourseIds
            : undefined,
        maxUses: formData.maxUses ? parseInt(formData.maxUses) : null,
        validFrom: new Date(formData.validFrom),
        validUntil: new Date(formData.validUntil),
      };

      if (editingDiscount) {
        // Update
        await apiClient.patch(
          `/discounts/${editingDiscount._id}`,
          payload,
          accessToken!
        );
        setSuccess('تم تحديث كود الخصم بنجاح!');
      } else {
        // Create
        await apiClient.post('/discounts', payload, accessToken!);
        setSuccess('تم إنشاء كود الخصم بنجاح!');
      }

      handleCloseModal();
      await loadData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'فشل حفظ كود الخصم');
    }
  };

  const handleDelete = async (discountId: string) => {
    if (!confirm('هل أنت متأكد من حذف كود الخصم هذا؟')) {
      return;
    }

    try {
      await apiClient.delete(`/discounts/${discountId}`, accessToken!);
      setSuccess('تم حذف كود الخصم بنجاح!');
      await loadData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'فشل حذف كود الخصم');
    }
  };

  const handleToggleActive = async (discount: IDiscount) => {
    try {
      await apiClient.patch(
        `/discounts/${discount._id}`,
        { isActive: !discount.isActive },
        accessToken!
      );
      await loadData();
    } catch (err: any) {
      setError(err.message || 'فشل تحديث حالة كود الخصم');
    }
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setSuccess(`تم نسخ الكود: ${code}`);
    setTimeout(() => setSuccess(''), 2000);
  };

  const isExpired = (validUntil: Date) => {
    return new Date(validUntil) < new Date();
  };

  const isNotStarted = (validFrom: Date) => {
    return new Date(validFrom) > new Date();
  };

  const getDiscountBadge = (discount: IDiscount) => {
    if (!discount.isActive) {
      return <Badge variant="ghost" size="sm">معطّل</Badge>;
    }
    if (isExpired(discount.validUntil)) {
      return <Badge variant="warning" size="sm">منتهي</Badge>;
    }
    if (isNotStarted(discount.validFrom)) {
      return <Badge variant="default" size="sm">قريباً</Badge>;
    }
    if (discount.maxUses && discount.currentUses >= discount.maxUses) {
      return <Badge variant="warning" size="sm">مكتمل</Badge>;
    }
    return <Badge variant="success" size="sm">نشط</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">أكواد الخصم</h1>
          <p className="text-gray-600 mt-1">إنشاء وإدارة أكواد الخصم للدورات والاشتراكات</p>
        </div>
        <Button onClick={() => handleOpenModal()} className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          إنشاء كود خصم جديد
        </Button>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="bg-red-50 border-r-4 border-red-500 p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <X className="h-5 w-5 text-red-600" />
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border-r-4 border-green-500 p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <Check className="h-5 w-5 text-green-600" />
            <p className="text-green-800">{success}</p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">إجمالي الأكواد</p>
              <h3 className="text-2xl font-bold mt-1">{discounts.length}</h3>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Tag className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">الأكواد النشطة</p>
              <h3 className="text-2xl font-bold mt-1">
                {discounts.filter(d => d.isActive && !isExpired(d.validUntil)).length}
              </h3>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Check className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">إجمالي الاستخدامات</p>
              <h3 className="text-2xl font-bold mt-1">
                {discounts.reduce((sum, d) => sum + d.currentUses, 0)}
              </h3>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <BarChart3 className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">الأكواد المنتهية</p>
              <h3 className="text-2xl font-bold mt-1">
                {discounts.filter(d => isExpired(d.validUntil)).length}
              </h3>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <Calendar className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Discounts List */}
      <Card className="p-6">
        {discounts.length === 0 ? (
          <div className="text-center py-12">
            <Tag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">لا توجد أكواد خصم</h3>
            <p className="text-gray-600 mb-4">ابدأ بإنشاء أول كود خصم للدورات أو الاشتراكات</p>
            <Button onClick={() => handleOpenModal()}>
              <Plus className="h-5 w-5 ml-2" />
              إنشاء كود خصم
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {discounts.map((discount) => (
              <div
                key={discount._id}
                className="border border-gray-200 rounded-lg p-4 hover:border-blue-500 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        <Tag className="h-5 w-5 text-blue-600" />
                        <span className="text-xl font-bold font-mono">{discount.code}</span>
                      </div>
                      <button
                        onClick={() => copyToClipboard(discount.code)}
                        className="p-1 hover:bg-gray-100 rounded"
                        title="نسخ الكود"
                      >
                        <Copy className="h-4 w-4 text-gray-600" />
                      </button>
                      {getDiscountBadge(discount)}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">قيمة الخصم</p>
                        <p className="font-semibold text-gray-900">
                          {discount.type === DiscountType.PERCENTAGE
                            ? `${discount.value}%`
                            : `${discount.value} ج.م`}
                        </p>
                      </div>

                      <div>
                        <p className="text-gray-600">التطبيق على</p>
                        <p className="font-semibold text-gray-900">
                          {discount.applicableTo === DiscountApplicableTo.ALL && 'الكل'}
                          {discount.applicableTo === DiscountApplicableTo.COURSES && 'الدورات'}
                          {discount.applicableTo === DiscountApplicableTo.SUBSCRIPTIONS && 'الاشتراكات'}
                        </p>
                      </div>

                      <div>
                        <p className="text-gray-600">الاستخدامات</p>
                        <p className="font-semibold text-gray-900">
                          {discount.currentUses} / {discount.maxUses || '∞'}
                        </p>
                      </div>

                      <div>
                        <p className="text-gray-600">صالح حتى</p>
                        <p className="font-semibold text-gray-900">
                          {new Date(discount.validUntil).toLocaleDateString('ar-EG')}
                        </p>
                      </div>
                    </div>

                    {discount.specificCourseIds && discount.specificCourseIds.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-xs text-gray-600">
                          مخصص لـ {discount.specificCourseIds.length} دورة محددة
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mr-4">
                    <button
                      onClick={() => handleToggleActive(discount)}
                      className={`p-2 rounded-lg ${
                        discount.isActive ? 'bg-green-100 hover:bg-green-200' : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                      title={discount.isActive ? 'تعطيل' : 'تفعيل'}
                    >
                      {discount.isActive ? (
                        <Check className="h-5 w-5 text-green-600" />
                      ) : (
                        <X className="h-5 w-5 text-gray-600" />
                      )}
                    </button>

                    <button
                      onClick={() => handleOpenModal(discount)}
                      className="p-2 bg-blue-100 hover:bg-blue-200 rounded-lg"
                      title="تعديل"
                    >
                      <Edit className="h-5 w-5 text-blue-600" />
                    </button>

                    <button
                      onClick={() => handleDelete(discount._id)}
                      className="p-2 bg-red-100 hover:bg-red-200 rounded-lg"
                      title="حذف"
                    >
                      <Trash2 className="h-5 w-5 text-red-600" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {editingDiscount ? 'تعديل كود الخصم' : 'إنشاء كود خصم جديد'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Code */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    كود الخصم *
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
                    placeholder="مثال: SUMMER2024"
                    disabled={!!editingDiscount}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">سيتم تحويله تلقائياً لأحرف كبيرة</p>
                </div>

                {/* Type and Value */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      نوع الخصم *
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as DiscountType })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value={DiscountType.PERCENTAGE}>نسبة مئوية (%)</option>
                      <option value={DiscountType.FIXED}>مبلغ ثابت (ج.م)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      قيمة الخصم *
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.value}
                      onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder={formData.type === DiscountType.PERCENTAGE ? '20' : '100'}
                      required
                    />
                  </div>
                </div>

                {/* Applicable To */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    التطبيق على *
                  </label>
                  <select
                    value={formData.applicableTo}
                    onChange={(e) => setFormData({ ...formData, applicableTo: e.target.value as DiscountApplicableTo })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value={DiscountApplicableTo.ALL}>الدورات والاشتراكات</option>
                    <option value={DiscountApplicableTo.COURSES}>الدورات فقط</option>
                    <option value={DiscountApplicableTo.SUBSCRIPTIONS}>الاشتراكات فقط</option>
                  </select>
                </div>

                {/* Specific Courses */}
                {formData.applicableTo === DiscountApplicableTo.COURSES && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      دورات محددة (اختياري)
                    </label>
                    <select
                      multiple
                      value={formData.specificCourseIds}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          specificCourseIds: Array.from(e.target.selectedOptions, (option) => option.value),
                        })
                      }
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-32"
                    >
                      {courses.map((course) => (
                        <option key={course._id} value={course._id}>
                          {course.title}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      اترك فارغاً للتطبيق على جميع الدورات. استخدم Ctrl/Cmd للاختيار المتعدد
                    </p>
                  </div>
                )}

                {/* Max Uses */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    الحد الأقصى للاستخدام (اختياري)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.maxUses}
                    onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="غير محدود"
                  />
                  <p className="text-xs text-gray-500 mt-1">اترك فارغاً لاستخدام غير محدود</p>
                </div>

                {/* Valid From/Until */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      تاريخ البداية *
                    </label>
                    <input
                      type="date"
                      value={formData.validFrom}
                      onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      تاريخ الانتهاء *
                    </label>
                    <input
                      type="date"
                      value={formData.validUntil}
                      onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button
                    type="button"
                    onClick={handleCloseModal}
                    variant="outline"
                  >
                    إلغاء
                  </Button>
                  <Button type="submit">
                    {editingDiscount ? 'حفظ التعديلات' : 'إنشاء كود الخصم'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
