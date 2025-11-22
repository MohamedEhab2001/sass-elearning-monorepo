'use client';

import { useState, useEffect } from 'react';
import { use } from 'react';
import { useRouter } from 'next/navigation';
import { useTenant } from '../../../providers';
import { CheckCircle, XCircle, Award, Clock, ArrowRight, RotateCcw } from 'lucide-react';

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
}

interface Submission {
  _id: string;
  examId: {
    _id: string;
    title: string;
    passingScore: number;
    showResultsImmediately: boolean;
    allowRetake: boolean;
  };
  answers: Answer[];
  status: string;
  totalPoints: number;
  maxPoints: number;
  percentage: number;
  passed: boolean;
  submittedAt: string;
  timeSpent?: number;
  attemptNumber: number;
}

export default function ExamResultPage({ params }: { params: Promise<{ tenantSlug: string; examId: string }> }) {
  const resolvedParams = use(params);
  const { tenantSlug } = useTenant();
  const router = useRouter();

  const [submission, setSubmission] = useState<Submission | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubmission();
    fetchQuestions();
  }, []);

  const fetchSubmission = async () => {
    try {
      const response = await fetch(
        `http://localhost:3000/exams/student/${resolvedParams.examId}/my-submission`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
        },
      );
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
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
      });
      const data = await response.json();
      setQuestions(data);
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAnswer = (questionId: string): Answer | undefined => {
    return submission?.answers.find((a) => a.questionId.toString() === questionId);
  };

  const formatTime = (seconds?: number): string => {
    if (!seconds) return 'غير متاح';
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading || !submission) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">جاري التحميل...</div>
      </div>
    );
  }

  const showAnswers = submission.examId.showResultsImmediately || submission.status === 'graded';

  return (
    <div className="min-h-screen bg-gray-50 py-12" dir="rtl">
      <div className="max-w-5xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push(`/a/${resolvedParams.tenantSlug}/exams`)}
            className="flex items-center gap-2 text-blue-600 hover:underline mb-4"
          >
            <ArrowRight size={20} />
            العودة إلى الامتحانات
          </button>
          <h1 className="text-4xl font-bold mb-2">{submission.examId.title}</h1>
          <p className="text-gray-600">المحاولة رقم {submission.attemptNumber}</p>
        </div>

        {/* Result Summary */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="text-center mb-8">
            {submission.passed ? (
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-green-100 mb-4">
                <CheckCircle size={64} className="text-green-600" />
              </div>
            ) : (
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-red-100 mb-4">
                <XCircle size={64} className="text-red-600" />
              </div>
            )}

            <h2 className="text-3xl font-bold mb-2">
              {submission.passed ? 'مبروك! لقد نجحت' : 'للأسف، لم تنجح في الامتحان'}
            </h2>
            <p className="text-gray-600">
              {submission.passed
                ? 'لقد حققت درجة النجاح المطلوبة'
                : `تحتاج إلى ${submission.examId.passingScore}% للنجاح`}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-3xl font-bold text-blue-600">{submission.percentage.toFixed(1)}%</div>
              <div className="text-sm text-gray-600 mt-1">النسبة المئوية</div>
            </div>

            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-3xl font-bold text-purple-600">
                {submission.totalPoints}/{submission.maxPoints}
              </div>
              <div className="text-sm text-gray-600 mt-1">النقاط</div>
            </div>

            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-3xl font-bold text-green-600">{formatTime(submission.timeSpent)}</div>
              <div className="text-sm text-gray-600 mt-1">الوقت المستغرق</div>
            </div>

            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-3xl font-bold text-orange-600">{submission.examId.passingScore}%</div>
              <div className="text-sm text-gray-600 mt-1">درجة النجاح</div>
            </div>
          </div>

          {submission.examId.allowRetake && (
            <div className="mt-8 text-center">
              <button
                onClick={() => router.push(`/a/${resolvedParams.tenantSlug}/exams/${resolvedParams.examId}`)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
              >
                <RotateCcw size={20} />
                إعادة الامتحان
              </button>
            </div>
          )}
        </div>

        {/* Questions and Answers */}
        {showAnswers && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-4">مراجعة الإجابات</h2>

            {questions.map((question, index) => {
              const answer = getAnswer(question._id);
              const isCorrect = answer?.isCorrect;
              const earnedPoints = answer?.points || 0;

              return (
                <div key={question._id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold">
                        {index + 1}
                      </div>
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                          {question.points} نقطة
                        </span>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            earnedPoints === question.points
                              ? 'bg-green-100 text-green-700'
                              : earnedPoints > 0
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {earnedPoints}/{question.points}
                        </span>
                      </div>

                      <p className="text-lg text-gray-800 mb-4">{question.questionText}</p>

                      {question.questionType === 'mcq' && question.options ? (
                        <div className="space-y-2">
                          {question.options.map((option, optIndex) => {
                            const isSelected = answer?.selectedOption === optIndex;

                            return (
                              <div
                                key={optIndex}
                                className={`p-3 rounded-lg border-2 ${
                                  isSelected && isCorrect
                                    ? 'bg-green-50 border-green-500'
                                    : isSelected && !isCorrect
                                    ? 'bg-red-50 border-red-500'
                                    : 'bg-gray-50 border-gray-200'
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  {isSelected && (
                                    <span className="font-bold">
                                      {isCorrect ? '✓' : '✗'}
                                    </span>
                                  )}
                                  <span>{option}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div>
                          <div className="mb-3 p-4 bg-gray-50 rounded-lg border">
                            <div className="font-medium text-gray-700 mb-2">إجابتك:</div>
                            <p className="text-gray-800 whitespace-pre-wrap">
                              {answer?.essayText || 'لم تجب على هذا السؤال'}
                            </p>
                          </div>

                          {answer?.feedback && submission.status === 'graded' && (
                            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                              <div className="font-medium text-blue-900 mb-2">ملاحظات المدرس:</div>
                              <p className="text-blue-800">{answer.feedback}</p>
                            </div>
                          )}

                          {submission.status === 'submitted' && question.questionType === 'essay' && (
                            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                              <p className="text-yellow-800">
                                <strong>ملاحظة:</strong> هذا السؤال قيد التصحيح من قبل المدرس
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!showAnswers && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
            <p className="text-blue-800">
              سيتم عرض النتائج التفصيلية بعد انتهاء المدرس من تصحيح جميع الأسئلة
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
