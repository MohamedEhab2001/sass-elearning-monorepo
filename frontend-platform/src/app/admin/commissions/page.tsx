'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X, GripVertical, Calculator } from 'lucide-react';

interface CommissionTier {
  _id: string;
  name: string;
  nameAr: string;
  minRevenue: number;
  maxRevenue?: number;
  commissionRate: number;
  order: number;
  isActive: boolean;
}

export default function CommissionTiersPage() {
  const [tiers, setTiers] = useState<CommissionTier[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTier, setEditingTier] = useState<CommissionTier | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    nameAr: '',
    minRevenue: 0,
    maxRevenue: '',
    commissionRate: 0,
  });

  // Calculator state
  const [showCalculator, setShowCalculator] = useState(false);
  const [calcRevenue, setCalcRevenue] = useState('');
  const [calcAmount, setCalcAmount] = useState('');
  const [calcResult, setCalcResult] = useState<any>(null);

  const tenantId = 'YOUR_TENANT_ID'; // Replace with actual tenant ID

  useEffect(() => {
    fetchTiers();
  }, []);

  const fetchTiers = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3000/commissions/tiers/${tenantId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const data = await response.json();
      setTiers(data);
    } catch (error) {
      console.error('Error fetching tiers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      name: formData.name,
      nameAr: formData.nameAr,
      minRevenue: formData.minRevenue,
      maxRevenue: formData.maxRevenue ? parseFloat(formData.maxRevenue) : undefined,
      commissionRate: formData.commissionRate,
    };

    try {
      const url = editingTier
        ? `http://localhost:3000/commissions/tiers/${editingTier._id}`
        : `http://localhost:3000/commissions/tiers/${tenantId}`;

      const method = editingTier ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        fetchTiers();
        resetForm();
      } else {
        const error = await response.json();
        alert(error.message || 'حدث خطأ أثناء حفظ المستوى');
      }
    } catch (error) {
      console.error('Error saving tier:', error);
      alert('حدث خطأ أثناء حفظ المستوى');
    }
  };

  const handleEdit = (tier: CommissionTier) => {
    setEditingTier(tier);
    setFormData({
      name: tier.name,
      nameAr: tier.nameAr,
      minRevenue: tier.minRevenue,
      maxRevenue: tier.maxRevenue?.toString() || '',
      commissionRate: tier.commissionRate,
    });
    setShowForm(true);
  };

  const handleDelete = async (tierId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المستوى؟')) return;

    try {
      await fetch(`http://localhost:3000/commissions/tiers/${tierId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      fetchTiers();
    } catch (error) {
      console.error('Error deleting tier:', error);
      alert('حدث خطأ أثناء حذف المستوى');
    }
  };

  const toggleActive = async (tier: CommissionTier) => {
    try {
      await fetch(`http://localhost:3000/commissions/tiers/${tier._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ isActive: !tier.isActive }),
      });
      fetchTiers();
    } catch (error) {
      console.error('Error toggling tier:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      nameAr: '',
      minRevenue: 0,
      maxRevenue: '',
      commissionRate: 0,
    });
    setEditingTier(null);
    setShowForm(false);
  };

  const handleCalculate = async () => {
    if (!calcRevenue || !calcAmount) {
      alert('يرجى إدخال الإيرادات والمبلغ');
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:3000/commissions/calculate/${tenantId}?revenue=${calcRevenue}&amount=${calcAmount}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        },
      );
      const data = await response.json();
      setCalcResult(data);
    } catch (error) {
      console.error('Error calculating commission:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP' }).format(amount);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">جاري التحميل...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6" dir="rtl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">مستويات العمولة</h1>
          <p className="text-gray-600">إدارة نسب العمولة حسب إيرادات المدرس</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowCalculator(!showCalculator)}
            className="flex items-center gap-2 border px-4 py-2 rounded-lg hover:bg-gray-50"
          >
            <Calculator size={20} />
            حاسبة العمولة
          </button>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            {showForm ? <X size={20} /> : <Plus size={20} />}
            {showForm ? 'إلغاء' : 'إضافة مستوى'}
          </button>
        </div>
      </div>

      {/* Calculator */}
      {showCalculator && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">حاسبة العمولة</h2>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                إجمالي إيرادات المدرس
              </label>
              <input
                type="number"
                value={calcRevenue}
                onChange={(e) => setCalcRevenue(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">مبلغ المعاملة</label>
              <input
                type="number"
                value={calcAmount}
                onChange={(e) => setCalcAmount(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg"
                placeholder="0.00"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={handleCalculate}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                حساب
              </button>
            </div>
          </div>

          {calcResult && (
            <div className="grid grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="text-center">
                <div className="text-sm text-gray-600">المبلغ الإجمالي</div>
                <div className="text-lg font-bold text-gray-900">
                  {formatCurrency(calcResult.grossAmount)}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600">نسبة العمولة</div>
                <div className="text-lg font-bold text-blue-600">{calcResult.commissionRate}%</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600">العمولة</div>
                <div className="text-lg font-bold text-red-600">
                  {formatCurrency(calcResult.commissionAmount)}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600">صافي المدرس</div>
                <div className="text-lg font-bold text-green-600">
                  {formatCurrency(calcResult.netAmount)}
                </div>
              </div>
              {calcResult.tierName && (
                <div className="col-span-4 text-center text-sm text-gray-600">
                  المستوى: {calcResult.tierName}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">{editingTier ? 'تحرير المستوى' : 'مستوى جديد'}</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الاسم (English) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="Bronze, Silver, Gold..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الاسم (العربية) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.nameAr}
                  onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="برونزي، فضي، ذهبي..."
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الحد الأدنى للإيرادات *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.minRevenue}
                  onChange={(e) => setFormData({ ...formData, minRevenue: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الحد الأقصى للإيرادات
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.maxRevenue}
                  onChange={(e) => setFormData({ ...formData, maxRevenue: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="اتركه فارغاً لأعلى مستوى"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  نسبة العمولة (%) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  max="100"
                  step="0.1"
                  value={formData.commissionRate}
                  onChange={(e) => setFormData({ ...formData, commissionRate: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Save size={20} />
                حفظ
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-2 border rounded-lg hover:bg-gray-50"
              >
                إلغاء
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tiers List */}
      {tiers.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
          لا توجد مستويات حتى الآن. ابدأ بإضافة أول مستوى!
        </div>
      ) : (
        <div className="space-y-4">
          {tiers.map((tier, index) => (
            <div
              key={tier._id}
              className={`bg-white rounded-lg shadow p-6 ${!tier.isActive ? 'opacity-60' : ''}`}
            >
              <div className="flex items-center gap-4">
                <div className="cursor-move text-gray-400">
                  <GripVertical size={20} />
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold">{tier.nameAr}</h3>
                    <span className="text-sm text-gray-500">({tier.name})</span>
                    {!tier.isActive && (
                      <span className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs">غير نشط</span>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-6 text-sm">
                    <div>
                      <span className="text-gray-600">نطاق الإيرادات:</span>
                      <span className="font-medium mr-2">
                        {formatCurrency(tier.minRevenue)} -{' '}
                        {tier.maxRevenue ? formatCurrency(tier.maxRevenue) : 'غير محدود'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">نسبة العمولة:</span>
                      <span className="font-bold text-blue-600 text-lg mr-2">
                        {tier.commissionRate}%
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">الترتيب:</span>
                      <span className="font-medium mr-2">{tier.order + 1}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => toggleActive(tier)}
                    className={`px-3 py-1 rounded text-sm ${
                      tier.isActive
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {tier.isActive ? 'نشط' : 'غير نشط'}
                  </button>
                  <button
                    onClick={() => handleEdit(tier)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(tier._id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tiers.length > 0 && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-bold text-blue-900 mb-2">كيف تعمل مستويات العمولة؟</h4>
          <ul className="text-sm text-blue-800 space-y-1 mr-4">
            <li>• يتم تحديد مستوى المدرس بناءً على إجمالي إيراداته</li>
            <li>• كلما زادت الإيرادات، انخفضت نسبة العمولة (مكافأة للمدرسين الناجحين)</li>
            <li>• يتم تطبيق العمولة تلقائياً على كل معاملة جديدة</li>
            <li>• المعاملات السابقة تحتفظ بنسب العمولة الأصلية</li>
          </ul>
        </div>
      )}
    </div>
  );
}
