'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, GripVertical, Save, X } from 'lucide-react';

interface CustomField {
  _id: string;
  fieldName: string;
  fieldLabel: string;
  fieldType: 'text' | 'select' | 'number' | 'date' | 'email' | 'phone';
  options?: string[];
  required: boolean;
  placeholder?: string;
  order: number;
  isActive: boolean;
}

export default function CustomFieldsPage() {
  const [fields, setFields] = useState<CustomField[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingField, setEditingField] = useState<CustomField | null>(null);
  const [formData, setFormData] = useState({
    fieldName: '',
    fieldLabel: '',
    fieldType: 'text' as CustomField['fieldType'],
    options: [] as string[],
    required: false,
    placeholder: '',
  });
  const [optionInput, setOptionInput] = useState('');

  const tenantId = 'YOUR_TENANT_ID'; // Replace with actual tenant ID from auth context

  useEffect(() => {
    fetchFields();
  }, []);

  const fetchFields = async () => {
    try {
      const response = await fetch(`http://localhost:3000/custom-fields/${tenantId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      setFields(data);
    } catch (error) {
      console.error('Error fetching fields:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingField
        ? `http://localhost:3000/custom-fields/${tenantId}/${editingField._id}`
        : `http://localhost:3000/custom-fields/${tenantId}`;

      const method = editingField ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchFields();
        resetForm();
      }
    } catch (error) {
      console.error('Error saving field:', error);
    }
  };

  const handleDelete = async (fieldId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الحقل؟')) return;

    try {
      const response = await fetch(`http://localhost:3000/custom-fields/${tenantId}/${fieldId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        await fetchFields();
      }
    } catch (error) {
      console.error('Error deleting field:', error);
    }
  };

  const toggleActive = async (field: CustomField) => {
    try {
      const response = await fetch(`http://localhost:3000/custom-fields/${tenantId}/${field._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ isActive: !field.isActive }),
      });

      if (response.ok) {
        await fetchFields();
      }
    } catch (error) {
      console.error('Error toggling field:', error);
    }
  };

  const handleEdit = (field: CustomField) => {
    setEditingField(field);
    setFormData({
      fieldName: field.fieldName,
      fieldLabel: field.fieldLabel,
      fieldType: field.fieldType,
      options: field.options || [],
      required: field.required,
      placeholder: field.placeholder || '',
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      fieldName: '',
      fieldLabel: '',
      fieldType: 'text',
      options: [],
      required: false,
      placeholder: '',
    });
    setOptionInput('');
    setEditingField(null);
    setShowForm(false);
  };

  const addOption = () => {
    if (optionInput.trim()) {
      setFormData({
        ...formData,
        options: [...formData.options, optionInput.trim()],
      });
      setOptionInput('');
    }
  };

  const removeOption = (index: number) => {
    setFormData({
      ...formData,
      options: formData.options.filter((_, i) => i !== index),
    });
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">جاري التحميل...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6" dir="rtl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">إدارة الحقول المخصصة</h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus size={20} />
          إضافة حقل جديد
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">
                {editingField ? 'تعديل الحقل' : 'إضافة حقل جديد'}
              </h2>
              <button onClick={resetForm} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">اسم الحقل (بالإنجليزية)</label>
                <input
                  type="text"
                  value={formData.fieldName}
                  onChange={(e) => setFormData({ ...formData, fieldName: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="company_name"
                  required
                  disabled={!!editingField}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">تسمية الحقل (عربي)</label>
                <input
                  type="text"
                  value={formData.fieldLabel}
                  onChange={(e) => setFormData({ ...formData, fieldLabel: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="اسم الشركة"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">نوع الحقل</label>
                <select
                  value={formData.fieldType}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      fieldType: e.target.value as CustomField['fieldType'],
                    })
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                  disabled={!!editingField}
                >
                  <option value="text">نص</option>
                  <option value="select">اختيار من قائمة</option>
                  <option value="number">رقم</option>
                  <option value="date">تاريخ</option>
                  <option value="email">بريد إلكتروني</option>
                  <option value="phone">رقم هاتف</option>
                </select>
              </div>

              {formData.fieldType === 'select' && (
                <div>
                  <label className="block text-sm font-medium mb-1">الخيارات</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={optionInput}
                      onChange={(e) => setOptionInput(e.target.value)}
                      className="flex-1 px-3 py-2 border rounded-lg"
                      placeholder="أضف خيار"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addOption();
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={addOption}
                      className="bg-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300"
                    >
                      إضافة
                    </button>
                  </div>
                  <div className="space-y-1">
                    {formData.options.map((option, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                        <span>{option}</span>
                        <button
                          type="button"
                          onClick={() => removeOption(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1">نص توضيحي</label>
                <input
                  type="text"
                  value={formData.placeholder}
                  onChange={(e) => setFormData({ ...formData, placeholder: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="مثال: أدخل اسم الشركة"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="required"
                  checked={formData.required}
                  onChange={(e) => setFormData({ ...formData, required: e.target.checked })}
                  className="w-4 h-4"
                />
                <label htmlFor="required" className="text-sm font-medium">
                  حقل إلزامي
                </label>
              </div>

              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  <Save size={20} />
                  حفظ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow">
        {fields.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            لا توجد حقول مخصصة. قم بإضافة حقل جديد للبدء.
          </div>
        ) : (
          <div className="divide-y">
            {fields.map((field) => (
              <div
                key={field._id}
                className="p-4 flex items-center justify-between hover:bg-gray-50"
              >
                <div className="flex items-center gap-4 flex-1">
                  <GripVertical className="text-gray-400 cursor-move" size={20} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{field.fieldLabel}</h3>
                      {field.required && (
                        <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">
                          إلزامي
                        </span>
                      )}
                      {!field.isActive && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                          غير نشط
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      {field.fieldName} • {field.fieldType}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={field.isActive}
                      onChange={() => toggleActive(field)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>

                  <button
                    onClick={() => handleEdit(field)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                  >
                    <Edit2 size={18} />
                  </button>

                  <button
                    onClick={() => handleDelete(field._id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
