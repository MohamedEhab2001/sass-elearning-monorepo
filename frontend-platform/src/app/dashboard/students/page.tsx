'use client';

import { useState, useEffect } from 'react';
import { Search, Download, Filter, X } from 'lucide-react';

interface CustomField {
  _id: string;
  fieldName: string;
  fieldLabel: string;
  fieldType: string;
  options?: string[];
  isActive: boolean;
}

interface Student {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  customFieldValues: Record<string, any>;
  createdAt: string;
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [customFieldFilters, setCustomFieldFilters] = useState<Record<string, any>>({});

  const tenantId = 'YOUR_TENANT_ID'; // Replace with actual tenant ID from auth context

  useEffect(() => {
    fetchCustomFields();
    fetchStudents();
  }, []);

  const fetchCustomFields = async () => {
    try {
      const response = await fetch(`http://localhost:3000/custom-fields/${tenantId}?activeOnly=true`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      setCustomFields(data);
    } catch (error) {
      console.error('Error fetching custom fields:', error);
    }
  };

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3000/users/filter/${tenantId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          searchTerm,
          role: 'student',
          customFields: customFieldFilters,
        }),
      });
      const data = await response.json();
      setStudents(data);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchStudents();
  };

  const handleFilterChange = (fieldName: string, value: any) => {
    setCustomFieldFilters({
      ...customFieldFilters,
      [fieldName]: value,
    });
  };

  const clearFilters = () => {
    setCustomFieldFilters({});
    setSearchTerm('');
    setTimeout(() => fetchStudents(), 0);
  };

  const exportToCSV = () => {
    // Prepare CSV headers
    const headers = ['الاسم الأول', 'اسم العائلة', 'البريد الإلكتروني', 'تاريخ التسجيل'];
    customFields.forEach((field) => {
      headers.push(field.fieldLabel);
    });

    // Prepare CSV rows
    const rows = students.map((student) => {
      const row = [
        student.firstName,
        student.lastName,
        student.email,
        new Date(student.createdAt).toLocaleDateString('ar-EG'),
      ];

      customFields.forEach((field) => {
        row.push(student.customFieldValues[field.fieldName] || '');
      });

      return row;
    });

    // Create CSV content
    const csvContent =
      '\uFEFF' + // UTF-8 BOM for Excel Arabic support
      [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `students_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading && students.length === 0) {
    return <div className="flex justify-center items-center h-64">جاري التحميل...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto p-6" dir="rtl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">قائمة الطلاب</h1>
        <button
          onClick={exportToCSV}
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          disabled={students.length === 0}
        >
          <Download size={20} />
          تصدير CSV
        </button>
      </div>

      <div className="bg-white rounded-lg shadow mb-6 p-4">
        <div className="flex gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="البحث بالاسم أو البريد الإلكتروني..."
              className="w-full pr-10 pl-4 py-2 border rounded-lg"
            />
          </div>
          <button
            onClick={handleSearch}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            بحث
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 border px-4 py-2 rounded-lg hover:bg-gray-50"
          >
            <Filter size={20} />
            فلترة
          </button>
        </div>

        {showFilters && customFields.length > 0 && (
          <div className="border-t pt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {customFields.map((field) => (
                <div key={field._id}>
                  <label className="block text-sm font-medium mb-1">{field.fieldLabel}</label>
                  {field.fieldType === 'select' && field.options ? (
                    <select
                      value={customFieldFilters[field.fieldName] || ''}
                      onChange={(e) => handleFilterChange(field.fieldName, e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg"
                    >
                      <option value="">الكل</option>
                      {field.options.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={field.fieldType === 'number' ? 'number' : field.fieldType === 'date' ? 'date' : 'text'}
                      value={customFieldFilters[field.fieldName] || ''}
                      onChange={(e) => handleFilterChange(field.fieldName, e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg"
                      placeholder={`${field.fieldLabel}...`}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={handleSearch}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                تطبيق الفلاتر
              </button>
              <button
                onClick={clearFilters}
                className="flex items-center gap-2 border px-4 py-2 rounded-lg hover:bg-gray-50"
              >
                <X size={16} />
                إزالة الفلاتر
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {students.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {searchTerm || Object.keys(customFieldFilters).length > 0
              ? 'لا توجد نتائج مطابقة لمعايير البحث'
              : 'لا يوجد طلاب مسجلون حتى الآن'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    الاسم
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    البريد الإلكتروني
                  </th>
                  {customFields.map((field) => (
                    <th
                      key={field._id}
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase"
                    >
                      {field.fieldLabel}
                    </th>
                  ))}
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    تاريخ التسجيل
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {students.map((student) => (
                  <tr key={student._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">
                        {student.firstName} {student.lastName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {student.email}
                    </td>
                    {customFields.map((field) => (
                      <td key={field._id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {student.customFieldValues[field.fieldName] || '-'}
                      </td>
                    ))}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(student.createdAt).toLocaleDateString('ar-EG')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {students.length > 0 && (
        <div className="mt-4 text-sm text-gray-600 text-center">
          عدد الطلاب: {students.length}
        </div>
      )}
    </div>
  );
}
