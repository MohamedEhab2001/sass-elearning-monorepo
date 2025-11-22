'use client';

import { useState, useEffect, useRef } from 'react';
import { use } from 'react';
import { useRouter } from 'next/navigation';
import { useTenant } from '../../providers';
import { useAuth } from '@/store/auth-store';
import { Clock, Send, AlertCircle } from 'lucide-react';

interface Question {
  _id: string;
  questionType: 'mcq' | 'essay';
  questionText: string;
  points: number;
  options?: string[];
}

interface Exam {
  _id: string;
  title: string;
  description: string;
  instructions?: string;
  duration?: number;
  passingScore: number;
}

export default function TakeExamPage({ params }: { params: Promise<{ tenantSlug: string; examId: string }> }) {
  const resolvedParams = use(params);
  const { tenant } = useTenant();
  const router = useRouter();

  const [exam, setExam] = useState<Exam | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, { selectedOption?: number; essayText?: string }>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [submissionId, setSubmissionId] = useState<string | null>(null);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchExam();
    startExam();
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (exam?.duration && timeLeft === null) {
      setTimeLeft(exam.duration * 60);
    }
  }, [exam]);

  useEffect(() => {
    if (timeLeft !== null && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev !== null && prev <= 1) {
            handleAutoSubmit();
            return 0;
          }
          return prev !== null ? prev - 1 : null;
        });
      }, 1000);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [timeLeft]);

  const fetchExam = async () => {
    try {
      const response = await fetch(`http://localhost:3000/exams/${resolvedParams.examId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
      });
      const data = await response.json();
      setExam(data);
    } catch (error) {
      console.error('Error fetching exam:', error);
    }
  };

  const startExam = async () => {
    setLoading(true);
    try {
      // Start exam (create submission)
      const startResponse = await fetch('http://localhost:3000/exams/student/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({ examId: resolvedParams.examId }),
      });

      const submission = await startResponse.json();
      setSubmissionId(submission._id);
      setStartTime(Date.now());

      // Fetch questions
      const questionsResponse = await fetch(
        `http://localhost:3000/exams/student/${resolvedParams.examId}/questions`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
        },
      );
      const questionsData = await questionsResponse.json();
      setQuestions(questionsData);
    } catch (error) {
      console.error('Error starting exam:', error);
      alert('حدث خطأ أثناء بدء الامتحان');
      router.push(`/a/${resolvedParams.tenantSlug}/exams`);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId: string, type: 'mcq' | 'essay', value: number | string) => {
    setAnswers({
      ...answers,
      [questionId]: type === 'mcq' ? { selectedOption: value as number } : { essayText: value as string },
    });
  };

  const handleAutoSubmit = async () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    await handleSubmit(true);
  };

  const handleSubmit = async (autoSubmit = false) => {
    if (!autoSubmit) {
      const unanswered = questions.filter((q) => !answers[q._id]);
      if (unanswered.length > 0) {
        const confirm = window.confirm(
          `لديك ${unanswered.length} سؤال/أسئلة لم تجب عليها. هل تريد التسليم على أي حال؟`
        );
        if (!confirm) return;
      } else {
        const confirm = window.confirm('هل أنت متأكد من تسليم الامتحان؟');
        if (!confirm) return;
      }
    }

    setSubmitting(true);

    const timeSpent = Math.floor((Date.now() - startTime) / 1000);

    const payload = {
      examId: resolvedParams.examId,
      answers: questions.map((q) => ({
        questionId: q._id,
        ...(answers[q._id] || {}),
      })),
      timeSpent,
    };

    try {
      const response = await fetch('http://localhost:3000/exams/student/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const result = await response.json();
        router.push(`/a/${resolvedParams.tenantSlug}/exams/${resolvedParams.examId}/result`);
      } else {
        alert('حدث خطأ أثناء تسليم الامتحان');
      }
    } catch (error) {
      console.error('Error submitting exam:', error);
      alert('حدث خطأ أثناء تسليم الامتحان');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getAnsweredCount = (): number => {
    return Object.keys(answers).length;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">جاري تحميل الامتحان...</div>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-red-600">حدث خطأ في تحميل الامتحان</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 bg-white shadow-md z-50">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">{exam.title}</h1>
              <p className="text-sm text-gray-600">
                {getAnsweredCount()} من {questions.length} تم الإجابة
              </p>
            </div>

            <div className="flex items-center gap-6">
              {timeLeft !== null && (
                <div
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-lg ${
                    timeLeft < 300
                      ? 'bg-red-100 text-red-700'
                      : timeLeft < 600
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-green-100 text-green-700'
                  }`}
                >
                  <Clock size={24} />
                  {formatTime(timeLeft)}
                </div>
              )}

              <button
                onClick={() => handleSubmit(false)}
                disabled={submitting}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold disabled:opacity-50"
              >
                <Send size={20} />
                {submitting ? 'جاري التسليم...' : 'تسليم الامتحان'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 pt-32 pb-12">
        {exam.instructions && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <div className="flex items-start gap-3">
              <AlertCircle size={24} className="text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-blue-900 mb-2">تعليمات الامتحان</h3>
                <p className="text-blue-800 whitespace-pre-wrap">{exam.instructions}</p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-8">
          {questions.map((question, index) => (
            <div key={question._id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                      {question.points} نقطة
                    </span>
                    <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                      {question.questionType === 'mcq' ? 'اختيار من متعدد' : 'سؤال مقالي'}
                    </span>
                  </div>
                  <p className="text-lg text-gray-800 mb-4">{question.questionText}</p>

                  {question.questionType === 'mcq' && question.options ? (
                    <div className="space-y-3">
                      {question.options.map((option, optIndex) => (
                        <label
                          key={optIndex}
                          className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                            answers[question._id]?.selectedOption === optIndex
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-blue-300'
                          }`}
                        >
                          <input
                            type="radio"
                            name={`question-${question._id}`}
                            value={optIndex}
                            checked={answers[question._id]?.selectedOption === optIndex}
                            onChange={() => handleAnswerChange(question._id, 'mcq', optIndex)}
                            className="mt-1"
                          />
                          <span className="flex-1 text-gray-800">{option}</span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <textarea
                      value={answers[question._id]?.essayText || ''}
                      onChange={(e) => handleAnswerChange(question._id, 'essay', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                      rows={6}
                      placeholder="اكتب إجابتك هنا..."
                    />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Submit Button */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={() => handleSubmit(false)}
            disabled={submitting}
            className="flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold text-lg disabled:opacity-50 shadow-lg"
          >
            <Send size={24} />
            {submitting ? 'جاري التسليم...' : 'تسليم الامتحان'}
          </button>
        </div>
      </div>
    </div>
  );
}
