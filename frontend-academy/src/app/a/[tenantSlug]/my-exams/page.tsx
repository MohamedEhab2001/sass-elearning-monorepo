'use client';

import { useState, useEffect } from 'react';
import { use } from 'react';
import { useRouter } from 'next/navigation';
import { useTenant } from '../providers';
import { CheckCircle, XCircle, Clock, Eye } from 'lucide-react';

interface Submission {
  _id: string;
  examId: {
    _id: string;
    title: string;
    description: string;
    passingScore: number;
  };
  totalPoints: number;
  maxPoints: number;
  percentage: number;
  passed: boolean;
  status: 'in_progress' | 'submitted' | 'graded';
  submittedAt: string;
  timeSpent?: number;
  attemptNumber: number;
}

export default function MyExamsPage({ params }: { params: Promise<{ tenantSlug: string }> }) {
  const resolvedParams = use(params);
  const { tenant } = useTenant();
  const router = useRouter();

  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'passed' | 'failed'>('all');

  useEffect(() => {
    if (tenant?._id) {
      fetchSubmissions();
    }
  }, [tenant]);

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3000/exams/student/my-submissions/${tenant._id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
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
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const formatTime = (seconds?: number): string => {
    if (!seconds) return 'غير متاح';
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const filteredSubmissions = submissions.filter((s) => {
    if (filter === 'passed') return s.passed;
    if (filter === 'failed') return !s.passed && s.status === 'graded';
    return true;
  });

  const stats = {
    total: submissions.length,
    passed: submissions.filter((s) => s.passed).length,
    failed: submissions.filter((s) => !s.passed && s.status === 'graded').length,
    pending: submissions.filter((s) => s.status === 'submitted').length,
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">جاري التحميل...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6" dir="rtl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">سجل امتحاناتي</h1>
        <p className="text-gray-600">جميع محاولاتك في الامتحانات</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <div className="text-3xl font-bold text-blue-600">{stats.total}</div>
          <div className="text-sm text-gray-600 mt-1">إجمالي المحاولات</div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 text-center">
          <div className="text-3xl font-bold text-green-600">{stats.passed}</div>
          <div className="text-sm text-gray-600 mt-1">ناجح</div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 text-center">
          <div className="text-3xl font-bold text-red-600">{stats.failed}</div>
          <div className="text-sm text-gray-600 mt-1">راسب</div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 text-center">
          <div className="text-3xl font-bold text-yellow-600">{stats.pending}</div>
          <div className="text-sm text-gray-600 mt-1">بانتظار التصحيح</div>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            الكل ({submissions.length})
          </button>
          <button
            onClick={() => setFilter('passed')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'passed' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            ناجح ({stats.passed})
          </button>
          <button
            onClick={() => setFilter('failed')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'failed' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            راسب ({stats.failed})
          </button>
        </div>
      </div>

      {/* Submissions List */}
      {filteredSubmissions.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-500 text-lg">لا توجد نتائج</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الامتحان</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الحالة</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">النتيجة</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">النقاط</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الوقت</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">التاريخ</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المحاولة</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">عرض</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredSubmissions.map((submission) => (
                <tr key={submission._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{submission.examId.title}</div>
                    <div className="text-sm text-gray-500 line-clamp-1">{submission.examId.description}</div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(submission.status)}</td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    {submission.status === 'graded' || submission.status === 'submitted' ? (
                      <div className="flex items-center gap-2">
                        <span className={`font-bold text-lg ${submission.passed ? 'text-green-600' : 'text-red-600'}`}>
                          {submission.percentage.toFixed(1)}%
                        </span>
                        {submission.passed ? (
                          <CheckCircle size={20} className="text-green-600" />
                        ) : (
                          <XCircle size={20} className="text-red-600" />
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-500">-</span>
                    )}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-medium">
                      {submission.totalPoints}/{submission.maxPoints}
                    </span>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Clock size={14} />
                      {formatTime(submission.timeSpent)}
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {new Date(submission.submittedAt).toLocaleDateString('ar-EG', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    المحاولة {submission.attemptNumber}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() =>
                        router.push(`/a/${resolvedParams.tenantSlug}/exams/${submission.examId._id}/result`)
                      }
                      className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      <Eye size={14} />
                      عرض
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
