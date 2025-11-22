'use client';

import { useState, useEffect } from 'react';
import { use } from 'react';
import { useRouter } from 'next/navigation';
import { useTenant } from '../providers';
import { useAuth } from '@/store/auth-store';
import { FileText, Clock, Award, Play } from 'lucide-react';

interface Exam {
  _id: string;
  title: string;
  description: string;
  instructions?: string;
  duration?: number;
  passingScore: number;
  courseId?: {
    _id: string;
    title: string;
  };
}

interface MySubmission {
  _id: string;
  examId: string;
  percentage: number;
  passed: boolean;
  attemptNumber: number;
  status: string;
}

export default function ExamsPage({ params }: { params: Promise<{ tenantSlug: string }> }) {
  const resolvedParams = use(params);
  const { tenant } = useTenant();
  const { user } = useAuth();
  const router = useRouter();

  const [exams, setExams] = useState<Exam[]>([]);
  const [submissions, setSubmissions] = useState<MySubmission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (tenant?._id) {
      fetchExams();
      fetchMySubmissions();
    }
  }, [tenant]);

  const fetchExams = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3000/exams/student/available/${tenant._id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      const data = await response.json();
      setExams(data);
    } catch (error) {
      console.error('Error fetching exams:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMySubmissions = async () => {
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
    }
  };

  const getExamStatus = (examId: string) => {
    const examSubmissions = submissions.filter((s) => s.examId === examId);
    if (examSubmissions.length === 0) return null;

    const bestSubmission = examSubmissions.reduce((best, current) =>
      current.percentage > best.percentage ? current : best
    );

    return {
      attempts: examSubmissions.length,
      bestScore: bestSubmission.percentage,
      passed: bestSubmission.passed,
    };
  };

  const handleStartExam = (examId: string) => {
    router.push(`/a/${resolvedParams.tenantSlug}/exams/${examId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">جاري التحميل...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6" dir="rtl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">الامتحانات المتاحة</h1>
        <p className="text-gray-600">اختبر معرفتك واحصل على الشهادات</p>
      </div>

      {exams.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <FileText size={64} className="mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-700 mb-2">لا توجد امتحانات متاحة</h2>
          <p className="text-gray-600">لا توجد امتحانات متاحة لك في الوقت الحالي</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {exams.map((exam) => {
            const status = getExamStatus(exam._id);

            return (
              <div
                key={exam._id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6"
              >
                <div className="mb-4">
                  <h2 className="text-2xl font-bold mb-2">{exam.title}</h2>
                  {exam.courseId && (
                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      {exam.courseId.title}
                    </span>
                  )}
                </div>

                <p className="text-gray-700 mb-4">{exam.description}</p>

                <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock size={18} />
                    <span>المدة: {exam.duration ? `${exam.duration} دقيقة` : 'غير محدد'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Award size={18} />
                    <span>درجة النجاح: {exam.passingScore}%</span>
                  </div>
                </div>

                {status && (
                  <div
                    className={`mb-4 p-4 rounded-lg ${
                      status.passed ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="font-medium">أفضل نتيجة: </span>
                        <span
                          className={`text-lg font-bold ${
                            status.passed ? 'text-green-600' : 'text-yellow-600'
                          }`}
                        >
                          {status.bestScore.toFixed(1)}%
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">المحاولات: {status.attempts}</div>
                    </div>
                  </div>
                )}

                <button
                  onClick={() => handleStartExam(exam._id)}
                  className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-lg text-white font-semibold transition-all"
                  style={{
                    background: `linear-gradient(135deg, rgb(var(--color-primary)) 0%, rgb(var(--color-secondary)) 100%)`,
                  }}
                >
                  <Play size={20} />
                  {status ? 'إعادة الامتحان' : 'بدء الامتحان'}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
