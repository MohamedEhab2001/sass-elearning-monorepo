'use client';

import { useState, useEffect } from 'react';
import { use } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Edit, Trash2, ArrowRight, Save, X } from 'lucide-react';

interface Question {
  _id: string;
  questionType: 'mcq' | 'essay';
  questionText: string;
  points: number;
  order: number;
  options?: string[];
  correctAnswer?: number;
  rubric?: string;
}

export default function QuestionsPage({ params }: { params: Promise<{ examId: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();

  const [exam, setExam] = useState<any>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  const [formData, setFormData] = useState({
    questionType: 'mcq' as 'mcq' | 'essay',
    questionText: '',
    points: 1,
    options: ['', '', '', ''],
    correctAnswer: 0,
    rubric: '',
  });

  useEffect(() => {
    fetchExam();
    fetchQuestions();
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload: any = {
      examId: resolvedParams.examId,
      questionType: formData.questionType,
      questionText: formData.questionText,
      points: formData.points,
    };

    if (formData.questionType === 'mcq') {
      payload.options = formData.options.filter((opt) => opt.trim() !== '');
      payload.correctAnswer = formData.correctAnswer;
    } else {
      payload.rubric = formData.rubric;
    }

    try {
      const url = editingQuestion
        ? `http://localhost:3000/exams/questions/${editingQuestion._id}`
        : 'http://localhost:3000/exams/questions';

      const method = editingQuestion ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        fetchQuestions();
        resetForm();
      } else {
        alert('حدث خطأ أثناء حفظ السؤال');
      }
    } catch (error) {
      console.error('Error saving question:', error);
      alert('حدث خطأ أثناء حفظ السؤال');
    }
  };

  const handleEdit = (question: Question) => {
    setEditingQuestion(question);
    setFormData({
      questionType: question.questionType,
      questionText: question.questionText,
      points: question.points,
      options: question.options || ['', '', '', ''],
      correctAnswer: question.correctAnswer || 0,
      rubric: question.rubric || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (questionId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا السؤال؟')) return;

    try {
      await fetch(`http://localhost:3000/exams/questions/${questionId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      fetchQuestions();
    } catch (error) {
      console.error('Error deleting question:', error);
      alert('حدث خطأ أثناء حذف السؤال');
    }
  };

  const resetForm = () => {
    setFormData({
      questionType: 'mcq',
      questionText: '',
      points: 1,
      options: ['', '', '', ''],
      correctAnswer: 0,
      rubric: '',
    });
    setEditingQuestion(null);
    setShowForm(false);
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData({ ...formData, options: newOptions });
  };

  const addOption = () => {
    setFormData({ ...formData, options: [...formData.options, ''] });
  };

  const removeOption = (index: number) => {
    if (formData.options.length <= 2) {
      alert('يجب أن يكون هناك خياران على الأقل');
      return;
    }
    const newOptions = formData.options.filter((_, i) => i !== index);
    setFormData({ ...formData, options: newOptions });
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">جاري التحميل...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto p-6" dir="rtl">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.push('/dashboard/exams')}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ArrowRight size={24} />
        </button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">إدارة الأسئلة</h1>
          {exam && <p className="text-gray-600">{exam.title}</p>}
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          {showForm ? <X size={20} /> : <Plus size={20} />}
          {showForm ? 'إلغاء' : 'إضافة سؤال'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">{editingQuestion ? 'تحرير السؤال' : 'سؤال جديد'}</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">نوع السؤال</label>
              <select
                value={formData.questionType}
                onChange={(e) => setFormData({ ...formData, questionType: e.target.value as 'mcq' | 'essay' })}
                className="w-full px-4 py-2 border rounded-lg"
                disabled={!!editingQuestion}
              >
                <option value="mcq">اختيار من متعدد</option>
                <option value="essay">سؤال مقالي</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">نص السؤال *</label>
              <textarea
                required
                value={formData.questionText}
                onChange={(e) => setFormData({ ...formData, questionText: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
                rows={3}
                placeholder="أدخل نص السؤال"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">النقاط *</label>
              <input
                type="number"
                required
                min="0"
                value={formData.points}
                onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>

            {formData.questionType === 'mcq' ? (
              <>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700">الخيارات *</label>
                    <button
                      type="button"
                      onClick={addOption}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      + إضافة خيار
                    </button>
                  </div>

                  {formData.options.map((option, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="radio"
                        name="correctAnswer"
                        checked={formData.correctAnswer === index}
                        onChange={() => setFormData({ ...formData, correctAnswer: index })}
                        className="mt-3"
                      />
                      <input
                        type="text"
                        required
                        value={option}
                        onChange={(e) => updateOption(index, e.target.value)}
                        className="flex-1 px-4 py-2 border rounded-lg"
                        placeholder={`الخيار ${index + 1}`}
                      />
                      {formData.options.length > 2 && (
                        <button
                          type="button"
                          onClick={() => removeOption(index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <X size={20} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  معايير التقييم (للمدرس)
                </label>
                <textarea
                  value={formData.rubric}
                  onChange={(e) => setFormData({ ...formData, rubric: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  rows={3}
                  placeholder="معايير تقييم هذا السؤال (اختياري)"
                />
              </div>
            )}

            <div className="flex gap-3 pt-4 border-t">
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Save size={20} />
                حفظ
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-2 border rounded-lg hover:bg-gray-50"
              >
                إلغاء
              </button>
            </div>
          </form>
        </div>
      )}

      {questions.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
          لا توجد أسئلة حتى الآن. ابدأ بإضافة أول سؤال!
        </div>
      ) : (
        <div className="space-y-4">
          {questions.map((question, index) => (
            <div key={question._id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-bold text-lg">السؤال {index + 1}</span>
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      {question.questionType === 'mcq' ? 'اختيار من متعدد' : 'سؤال مقالي'}
                    </span>
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                      {question.points} نقطة
                    </span>
                  </div>
                  <p className="text-gray-800">{question.questionText}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(question)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(question._id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              {question.questionType === 'mcq' && question.options && (
                <div className="mt-4 space-y-2">
                  {question.options.map((option, optIndex) => (
                    <div
                      key={optIndex}
                      className={`p-3 rounded-lg border ${
                        optIndex === question.correctAnswer
                          ? 'bg-green-50 border-green-500'
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      {option}
                      {optIndex === question.correctAnswer && (
                        <span className="text-green-600 text-sm font-medium mr-2">✓ الإجابة الصحيحة</span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {question.questionType === 'essay' && question.rubric && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">معايير التقييم: </span>
                  <span className="text-sm text-gray-600">{question.rubric}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {questions.length > 0 && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg text-center">
          <p className="text-blue-800 font-medium">
            إجمالي الأسئلة: {questions.length} | إجمالي النقاط: {questions.reduce((sum, q) => sum + q.points, 0)}
          </p>
        </div>
      )}
    </div>
  );
}
