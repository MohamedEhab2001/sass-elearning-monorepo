'use client';

import { useState, useEffect } from 'react';
import { use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Save, CheckCircle, XCircle } from 'lucide-react';

interface Answer {
  questionId: string;
  selectedOption?: number;
  essayText?: string;
  points?: number;
  feedback?: string;
  isCorrect?: boolean;
}

interface Question {
  _id: string;
  questionType: 'mcq' | 'essay';
  questionText: string;
  points: number;
  options?: string[];
  correctAnswer?: number;
  rubric?: string;
}

interface Submission {
  _id: string;
  studentId: {
    firstName: string;
    lastName: string;
    email: string;
  };
  examId: {
    title: string;
  };
  answers: Answer[];
  status: string;
  totalPoints: number;
  maxPoints: number;
  percentage: number;
  passed: boolean;
  submittedAt: string;
  timeSpent?: number;
}

export default function SubmissionDetailPage({
  params,
}: {
  params: Promise<{ examId: string; submissionId: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();

  const [submission, setSubmission] = useState<Submission | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [grading, setGrading] = useState<Record<string, { points: number; feedback: string }>>({});

  useEffect(() => {
    fetchSubmission();
    fetchQuestions();
  }, []);

  const fetchSubmission = async () => {
    try {
      const response = await fetch(`http://localhost:3000/exams/submissions/${resolvedParams.submissionId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const data = await response.json();
      setSubmission(data);
    } catch (error) {
      console.error('Error fetching submission:', error);
    }
  };

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3000/exams/${resolvedParams.examId}/questions`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const data = await response.json();
      setQuestions(data);
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGradeEssay = async (questionId: string) => {
    const grade = grading[questionId];
    if (!grade) return;

    try {
      await fetch(`http://localhost:3000/exams/submissions/${resolvedParams.submissionId}/grade-essay`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          questionId,
          points: grade.points,
          feedback: grade.feedback,
        }),
      });

      // Refresh submission
      fetchSubmission();

      // Clear grading state for this question
      const newGrading = { ...grading };
      delete newGrading[questionId];
      setGrading(newGrading);
    } catch (error) {
      console.error('Error grading essay:', error);
      alert('حدث خطأ أثناء تقييم الإجابة');
    }
  };

  const updateGrading = (questionId: string, field: 'points' | 'feedback', value: string | number) => {
    setGrading({
      ...grading,
      [questionId]: {
        ...grading[questionId],
        [field]: value,
      },
    });
  };

  const getAnswer = (questionId: string): Answer | undefined => {
    return submission?.answers.find((a) => a.questionId.toString() === questionId);
  };

  if (loading || !submission) {
    return <div className="flex justify-center items-center h-64">جاري التحميل...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto p-6" dir="rtl">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.push(`/dashboard/exams/${resolvedParams.examId}/submissions`)}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ArrowRight size={24} />
        </button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">تفاصيل الإرسال</h1>
          <p className="text-gray-600">{submission.examId.title}</p>
        </div>
      </div>

      {/* Student Info */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">معلومات الطالب</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-gray-600">الاسم:</span>
            <span className="font-medium mr-2">
              {submission.studentId.firstName} {submission.studentId.lastName}
            </span>
          </div>
          <div>
            <span className="text-gray-600">البريد الإلكتروني:</span>
            <span className="font-medium mr-2">{submission.studentId.email}</span>
          </div>
          <div>
            <span className="text-gray-600">تاريخ التسليم:</span>
            <span className="font-medium mr-2">
              {new Date(submission.submittedAt).toLocaleString('ar-EG')}
            </span>
          </div>
          <div>
            <span className="text-gray-600">الوقت المستغرق:</span>
            <span className="font-medium mr-2">
              {submission.timeSpent
                ? `${Math.floor(submission.timeSpent / 60)}:${(submission.timeSpent % 60).toString().padStart(2, '0')}`
                : 'غير متاح'}
            </span>
          </div>
        </div>
      </div>

      {/* Score Summary */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">النتيجة</h2>
        <div className="grid grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-3xl font-bold text-blue-600">{submission.totalPoints}</div>
            <div className="text-sm text-gray-600">النقاط المكتسبة</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-gray-600">{submission.maxPoints}</div>
            <div className="text-sm text-gray-600">إجمالي النقاط</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-purple-600">{submission.percentage.toFixed(1)}%</div>
            <div className="text-sm text-gray-600">النسبة المئوية</div>
          </div>
          <div>
            <div className="flex items-center justify-center gap-2">
              {submission.passed ? (
                <>
                  <CheckCircle size={32} className="text-green-600" />
                  <span className="text-2xl font-bold text-green-600">ناجح</span>
                </>
              ) : (
                <>
                  <XCircle size={32} className="text-red-600" />
                  <span className="text-2xl font-bold text-red-600">راسب</span>
                </>
              )}
            </div>
            <div className="text-sm text-gray-600">الحالة</div>
          </div>
        </div>
      </div>

      {/* Questions and Answers */}
      <div className="space-y-6">
        {questions.map((question, index) => {
          const answer = getAnswer(question._id);

          return (
            <div key={question._id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-bold text-lg">السؤال {index + 1}</span>
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      {question.questionType === 'mcq' ? 'اختيار من متعدد' : 'سؤال مقالي'}
                    </span>
                    <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                      {question.points} نقطة
                    </span>
                  </div>
                  <p className="text-gray-800">{question.questionText}</p>
                </div>
              </div>

              {question.questionType === 'mcq' && question.options && (
                <div className="mt-4 space-y-2">
                  {question.options.map((option, optIndex) => {
                    const isCorrect = optIndex === question.correctAnswer;
                    const isSelected = answer?.selectedOption === optIndex;

                    return (
                      <div
                        key={optIndex}
                        className={`p-3 rounded-lg border ${
                          isCorrect
                            ? 'bg-green-50 border-green-500'
                            : isSelected
                            ? 'bg-red-50 border-red-500'
                            : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        {option}
                        {isCorrect && (
                          <span className="text-green-600 text-sm font-medium mr-2">✓ الإجابة الصحيحة</span>
                        )}
                        {isSelected && !isCorrect && (
                          <span className="text-red-600 text-sm font-medium mr-2">✗ إجابة الطالب</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {question.questionType === 'essay' && (
                <div className="mt-4">
                  {question.rubric && (
                    <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                      <span className="text-sm font-medium text-blue-900">معايير التقييم: </span>
                      <span className="text-sm text-blue-800">{question.rubric}</span>
                    </div>
                  )}

                  <div className="mb-4 p-4 bg-gray-50 rounded-lg border">
                    <div className="font-medium text-gray-700 mb-2">إجابة الطالب:</div>
                    <p className="text-gray-800 whitespace-pre-wrap">{answer?.essayText || 'لم يجب الطالب'}</p>
                  </div>

                  {answer?.points !== undefined && answer?.points !== null ? (
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <span className="font-medium text-green-900">النقاط المكتسبة: </span>
                          <span className="text-xl font-bold text-green-600">
                            {answer.points}/{question.points}
                          </span>
                        </div>
                      </div>
                      {answer.feedback && (
                        <div className="mt-3">
                          <div className="font-medium text-green-900 mb-1">الملاحظات:</div>
                          <p className="text-green-800">{answer.feedback}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                      <div className="font-medium text-yellow-900 mb-3">تقييم الإجابة</div>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            النقاط (من {question.points})
                          </label>
                          <input
                            type="number"
                            min="0"
                            max={question.points}
                            value={grading[question._id]?.points || ''}
                            onChange={(e) =>
                              updateGrading(question._id, 'points', parseFloat(e.target.value))
                            }
                            className="w-full px-3 py-2 border rounded-lg"
                            placeholder="أدخل النقاط"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            الملاحظات (اختياري)
                          </label>
                          <textarea
                            value={grading[question._id]?.feedback || ''}
                            onChange={(e) => updateGrading(question._id, 'feedback', e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg"
                            rows={3}
                            placeholder="ملاحظات للطالب"
                          />
                        </div>
                        <button
                          onClick={() => handleGradeEssay(question._id)}
                          disabled={!grading[question._id]?.points && grading[question._id]?.points !== 0}
                          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Save size={16} />
                          حفظ التقييم
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* MCQ Points Display */}
              {question.questionType === 'mcq' && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">النقاط المكتسبة: </span>
                  <span className={`text-lg font-bold ${answer?.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                    {answer?.points || 0}/{question.points}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
