'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, FileText, Edit, Trash2, Eye, Archive, CheckCircle } from 'lucide-react';

interface Exam {
  _id: string;
  title: string;
  description: string;
  status: 'draft' | 'published' | 'archived';
  passingScore: number;
  duration?: number;
  courseId?: {
    _id: string;
    title: string;
  };
  createdBy: {
    firstName: string;
    lastName: string;
  };
  createdAt: string;
}

export default function ExamsPage() {
  const router = useRouter();
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [includeArchived, setIncludeArchived] = useState(false);

  const tenantId = 'YOUR_TENANT_ID'; // Replace with actual tenant ID from auth

  useEffect(() => {
    fetchExams();
  }, [includeArchived]);

  const fetchExams = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:3000/exams/tenant/${tenantId}?includeArchived=${includeArchived}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        },
      );
      const data = await response.json();
      setExams(data);
    } catch (error) {
      console.error('Error fetching exams:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (examId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الامتحان؟')) return;

    try {
      await fetch(`http://localhost:3000/exams/${examId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      fetchExams();
    } catch (error) {
      console.error('Error deleting exam:', error);
      alert('حدث خطأ أثناء حذف الامتحان');
    }
  };

  const handlePublish = async (examId: string) => {
    try {
      await fetch(`http://localhost:3000/exams/${examId}/publish`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      fetchExams();
    } catch (error) {
      console.error('Error publishing exam:', error);
      alert('حدث خطأ أثناء نشر الامتحان');
    }
  };

  const handleArchive = async (examId: string) => {
    if (!confirm('هل أنت متأكد من أرشفة هذا الامتحان؟')) return;

    try {
      await fetch(`http://localhost:3000/exams/${examId}/archive`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      fetchExams();
    } catch (error) {
      console.error('Error archiving exam:', error);
      alert('حدث خطأ أثناء أرشفة الامتحان');
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      draft: 'bg-gray-100 text-gray-800',
      published: 'bg-green-100 text-green-800',
      archived: 'bg-yellow-100 text-yellow-800',
    };

    const labels = {
      draft: 'مسودة',
      published: 'منشور',
      archived: 'مؤرشف',
    };

    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">جاري التحميل...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto p-6" dir="rtl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">الامتحانات</h1>
        <button
          onClick={() => router.push('/dashboard/exams/new')}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus size={20} />
          إنشاء امتحان جديد
        </button>
      </div>

      <div className="bg-white rounded-lg shadow mb-6 p-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={includeArchived}
            onChange={(e) => setIncludeArchived(e.target.checked)}
            className="w-4 h-4"
          />
          <span>عرض الامتحانات المؤرشفة</span>
        </label>
      </div>

      {exams.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
          لا توجد امتحانات حتى الآن
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {exams.map((exam) => (
            <div key={exam._id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-xl font-bold">{exam.title}</h2>
                    {getStatusBadge(exam.status)}
                  </div>
                  <p className="text-gray-600 mb-2">{exam.description}</p>
                  {exam.courseId && (
                    <p className="text-sm text-gray-500">الدورة: {exam.courseId.title}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
                <div>
                  <span className="text-gray-600">درجة النجاح:</span>
                  <span className="font-medium mr-2">{exam.passingScore}%</span>
                </div>
                <div>
                  <span className="text-gray-600">المدة:</span>
                  <span className="font-medium mr-2">
                    {exam.duration ? `${exam.duration} دقيقة` : 'غير محدد'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">بواسطة:</span>
                  <span className="font-medium mr-2">
                    {exam.createdBy.firstName} {exam.createdBy.lastName}
                  </span>
                </div>
              </div>

              <div className="flex gap-2 border-t pt-4">
                <button
                  onClick={() => router.push(`/dashboard/exams/${exam._id}`)}
                  className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  <Edit size={16} />
                  تحرير
                </button>
                <button
                  onClick={() => router.push(`/dashboard/exams/${exam._id}/questions`)}
                  className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  <FileText size={16} />
                  الأسئلة
                </button>
                <button
                  onClick={() => router.push(`/dashboard/exams/${exam._id}/submissions`)}
                  className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  <Eye size={16} />
                  الإرسالات
                </button>
                {exam.status === 'draft' && (
                  <button
                    onClick={() => handlePublish(exam._id)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    <CheckCircle size={16} />
                    نشر
                  </button>
                )}
                {exam.status === 'published' && (
                  <button
                    onClick={() => handleArchive(exam._id)}
                    className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
                  >
                    <Archive size={16} />
                    أرشفة
                  </button>
                )}
                <button
                  onClick={() => handleDelete(exam._id)}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 mr-auto"
                >
                  <Trash2 size={16} />
                  حذف
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
