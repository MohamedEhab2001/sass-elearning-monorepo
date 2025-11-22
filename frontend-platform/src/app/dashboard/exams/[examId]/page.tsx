'use client';

import { useState, useEffect } from 'react';
import { use } from 'react';
import { useRouter } from 'next/navigation';
import { Save, ArrowRight, Plus, X } from 'lucide-react';

interface VisibilityRule {
  customFieldName: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
  value: string;
}

interface CustomField {
  _id: string;
  fieldName: string;
  fieldLabel: string;
  fieldType: string;
}

export default function ExamFormPage({ params }: { params: Promise<{ examId: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const isNew = resolvedParams.examId === 'new';

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    instructions: '',
    duration: '',
    passingScore: 60,
    courseId: '',
    showResultsImmediately: true,
    allowRetake: true,
    maxAttempts: '',
    randomizeQuestions: false,
    randomizeOptions: false,
  });

  const [visibilityRules, setVisibilityRules] = useState<VisibilityRule[]>([]);
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);

  const tenantId = 'YOUR_TENANT_ID';

  useEffect(() => {
    fetchCustomFields();
    if (!isNew) {
      fetchExam();
    }
  }, []);

  const fetchCustomFields = async () => {
    try {
      const response = await fetch(`http://localhost:3000/custom-fields/${tenantId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const data = await response.json();
      setCustomFields(data);
    } catch (error) {
      console.error('Error fetching custom fields:', error);
    }
  };

  const fetchExam = async () => {
    try {
      const response = await fetch(`http://localhost:3000/exams/${resolvedParams.examId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const data = await response.json();
      setFormData({
        title: data.title,
        description: data.description,
        instructions: data.instructions || '',
        duration: data.duration?.toString() || '',
        passingScore: data.passingScore,
        courseId: data.courseId?._id || '',
        showResultsImmediately: data.showResultsImmediately,
        allowRetake: data.allowRetake,
        maxAttempts: data.maxAttempts?.toString() || '',
        randomizeQuestions: data.randomizeQuestions,
        randomizeOptions: data.randomizeOptions,
      });
      setVisibilityRules(data.visibilityRules || []);
    } catch (error) {
      console.error('Error fetching exam:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const payload = {
      ...formData,
      duration: formData.duration ? parseInt(formData.duration) : undefined,
      maxAttempts: formData.maxAttempts ? parseInt(formData.maxAttempts) : undefined,
      courseId: formData.courseId || undefined,
      visibilityRules,
    };

    try {
      const url = isNew
        ? `http://localhost:3000/exams/${tenantId}`
        : `http://localhost:3000/exams/${resolvedParams.examId}`;

      const method = isNew ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        router.push(`/dashboard/exams/${isNew ? data._id : resolvedParams.examId}/questions`);
      } else {
        alert('حدث خطأ أثناء حفظ الامتحان');
      }
    } catch (error) {
      console.error('Error saving exam:', error);
      alert('حدث خطأ أثناء حفظ الامتحان');
    } finally {
      setSaving(false);
    }
  };

  const addVisibilityRule = () => {
    setVisibilityRules([
      ...visibilityRules,
      { customFieldName: '', operator: 'equals', value: '' },
    ]);
  };

  const removeVisibilityRule = (index: number) => {
    setVisibilityRules(visibilityRules.filter((_, i) => i !== index));
  };

  const updateVisibilityRule = (index: number, field: keyof VisibilityRule, value: string) => {
    const updated = [...visibilityRules];
    updated[index] = { ...updated[index], [field]: value };
    setVisibilityRules(updated);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">جاري التحميل...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6" dir="rtl">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.push('/dashboard/exams')}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ArrowRight size={24} />
        </button>
        <h1 className="text-3xl font-bold">{isNew ? 'إنشاء امتحان جديد' : 'تحرير الامتحان'}</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
        {/* Basic Info */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">عنوان الامتحان *</label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg"
            placeholder="أدخل عنوان الامتحان"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">الوصف *</label>
          <textarea
            required
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg"
            rows={3}
            placeholder="أدخل وصف الامتحان"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">التعليمات</label>
          <textarea
            value={formData.instructions}
            onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg"
            rows={3}
            placeholder="تعليمات الامتحان (اختياري)"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">المدة (بالدقائق)</label>
            <input
              type="number"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
              placeholder="غير محدد"
              min="1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">درجة النجاح (%) *</label>
            <input
              type="number"
              required
              value={formData.passingScore}
              onChange={(e) => setFormData({ ...formData, passingScore: parseInt(e.target.value) })}
              className="w-full px-4 py-2 border rounded-lg"
              min="0"
              max="100"
            />
          </div>
        </div>

        {/* Settings */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold mb-4">الإعدادات</h3>

          <div className="space-y-3">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.showResultsImmediately}
                onChange={(e) => setFormData({ ...formData, showResultsImmediately: e.target.checked })}
                className="w-4 h-4"
              />
              <span>عرض النتائج فوراً بعد التسليم</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.allowRetake}
                onChange={(e) => setFormData({ ...formData, allowRetake: e.target.checked })}
                className="w-4 h-4"
              />
              <span>السماح بإعادة الامتحان</span>
            </label>

            {formData.allowRetake && (
              <div className="mr-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الحد الأقصى للمحاولات
                </label>
                <input
                  type="number"
                  value={formData.maxAttempts}
                  onChange={(e) => setFormData({ ...formData, maxAttempts: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="غير محدد"
                  min="1"
                />
              </div>
            )}

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.randomizeQuestions}
                onChange={(e) => setFormData({ ...formData, randomizeQuestions: e.target.checked })}
                className="w-4 h-4"
              />
              <span>ترتيب الأسئلة عشوائياً</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.randomizeOptions}
                onChange={(e) => setFormData({ ...formData, randomizeOptions: e.target.checked })}
                className="w-4 h-4"
              />
              <span>ترتيب الخيارات عشوائياً (للأسئلة متعددة الخيارات)</span>
            </label>
          </div>
        </div>

        {/* Visibility Rules */}
        <div className="border-t pt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">قواعد الظهور</h3>
            <button
              type="button"
              onClick={addVisibilityRule}
              className="flex items-center gap-2 px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus size={16} />
              إضافة قاعدة
            </button>
          </div>

          {visibilityRules.length === 0 ? (
            <p className="text-gray-500 text-sm">لا توجد قواعد (الامتحان مرئي للجميع)</p>
          ) : (
            <div className="space-y-3">
              {visibilityRules.map((rule, index) => (
                <div key={index} className="flex gap-2 items-start p-3 border rounded-lg">
                  <select
                    value={rule.customFieldName}
                    onChange={(e) => updateVisibilityRule(index, 'customFieldName', e.target.value)}
                    className="flex-1 px-3 py-2 border rounded-lg"
                    required
                  >
                    <option value="">اختر حقلاً</option>
                    {customFields.map((field) => (
                      <option key={field._id} value={field.fieldName}>
                        {field.fieldLabel}
                      </option>
                    ))}
                  </select>

                  <select
                    value={rule.operator}
                    onChange={(e) => updateVisibilityRule(index, 'operator', e.target.value)}
                    className="px-3 py-2 border rounded-lg"
                  >
                    <option value="equals">يساوي</option>
                    <option value="not_equals">لا يساوي</option>
                    <option value="contains">يحتوي على</option>
                    <option value="greater_than">أكبر من</option>
                    <option value="less_than">أصغر من</option>
                  </select>

                  <input
                    type="text"
                    value={rule.value}
                    onChange={(e) => updateVisibilityRule(index, 'value', e.target.value)}
                    className="flex-1 px-3 py-2 border rounded-lg"
                    placeholder="القيمة"
                    required
                  />

                  <button
                    type="button"
                    onClick={() => removeVisibilityRule(index)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <X size={20} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-6 border-t">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <Save size={20} />
            {saving ? 'جاري الحفظ...' : 'حفظ'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/dashboard/exams')}
            className="px-6 py-2 border rounded-lg hover:bg-gray-50"
          >
            إلغاء
          </button>
        </div>
      </form>
    </div>
  );
}
