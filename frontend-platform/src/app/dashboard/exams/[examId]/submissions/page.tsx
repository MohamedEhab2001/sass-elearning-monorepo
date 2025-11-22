'use client';

import { useState, useEffect } from 'react';
import { use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Eye, CheckCircle, Clock } from 'lucide-react';

interface Submission {
  _id: string;
  studentId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  status: 'in_progress' | 'submitted' | 'graded';
  totalPoints: number;
  maxPoints: number;
  percentage: number;
  passed: boolean;
  submittedAt: string;
  timeSpent?: number;
  attemptNumber: number;
}

export default function SubmissionsPage({ params }: { params: Promise<{ examId: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();

  const [exam, setExam] = useState<any>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExam();
    fetchSubmissions();
  }, []);

  const fetchExam = async () => {
    try {
      const response = await fetch(`http://localhost:3000/exams/${resolvedParams.examId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const data = await response.json();
      setExam(data);
    } catch (error) {
      console.error('Error fetching exam:', error);
    }
  };

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3000/exams/${resolvedParams.examId}/submissions`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const data = await response.json();
      setSubmissions(data);
    } catch (error) {
      console.error('Error fetching submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      in_progress: 'bg-yellow-100 text-yellow-800',
      submitted: 'bg-blue-100 text-blue-800',
      graded: 'bg-green-100 text-green-800',
    };

    const labels = {
      in_progress: 'قيد التقدم',
      submitted: 'تم التسليم',
      graded: 'تم التصحيح',
    };

    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const formatTime = (seconds?: number) => {
    if (!seconds) return 'غير متاح';
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">جاري التحميل...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto p-6" dir="rtl">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.push('/dashboard/exams')}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ArrowRight size={24} />
        </button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">إرسالات الطلاب</h1>
          {exam && <p className="text-gray-600">{exam.title}</p>}
        </div>
      </div>

      {submissions.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
          لا توجد إرسالات حتى الآن
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow mb-4 p-4">
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">{submissions.length}</div>
                <div className="text-sm text-gray-600">إجمالي الإرسالات</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {submissions.filter((s) => s.status === 'graded').length}
                </div>
                <div className="text-sm text-gray-600">تم التصحيح</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-600">
                  {submissions.filter((s) => s.status === 'submitted').length}
                </div>
                <div className="text-sm text-gray-600">بانتظار التصحيح</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {submissions.filter((s) => s.passed).length}
                </div>
                <div className="text-sm text-gray-600">ناجح</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الطالب</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الحالة</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">النقاط</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">النسبة</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الوقت المستغرق</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">تاريخ التسليم</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المحاولة</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {submissions.map((submission) => (
                  <tr key={submission._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">
                        {submission.studentId.firstName} {submission.studentId.lastName}
                      </div>
                      <div className="text-sm text-gray-500">{submission.studentId.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(submission.status)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-medium">
                        {submission.totalPoints}/{submission.maxPoints}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-medium ${
                            submission.passed ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          {submission.percentage.toFixed(1)}%
                        </span>
                        {submission.passed && <CheckCircle size={16} className="text-green-600" />}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatTime(submission.timeSpent)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(submission.submittedAt).toLocaleString('ar-EG')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      المحاولة {submission.attemptNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => router.push(`/dashboard/exams/${resolvedParams.examId}/submissions/${submission._id}`)}
                        className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        <Eye size={14} />
                        {submission.status === 'submitted' ? 'تصحيح' : 'عرض'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
