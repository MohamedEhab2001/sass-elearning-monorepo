'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCourse, useUpdateCourse, usePublishCourse } from '@/hooks/useCourses';
import { useLessons, useCreateLesson, useUpdateLesson, useDeleteLesson } from '@/hooks/useLessons';
import { useUploadThumbnail } from '@/hooks/useUploads';
import {
  CourseStatus,
  CourseLevel,
  ICourseUpdate,
  ILessonCreate,
  ILessonUpdate,
  LessonType,
  ILesson,
} from '@academy/shared/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowRight,
  Upload,
  Save,
  Eye,
  EyeOff,
  BookOpen,
  Plus,
  Edit,
  Trash2,
  Video,
  FileText,
  File,
  Users,
  DollarSign,
  Star,
} from 'lucide-react';

type Tab = 'info' | 'content' | 'analytics';

export default function EditCoursePage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;

  const [activeTab, setActiveTab] = useState<Tab>('info');
  const [showLessonForm, setShowLessonForm] = useState(false);
  const [editingLesson, setEditingLesson] = useState<ILesson | null>(null);

  const { data: course, isLoading } = useCourse(courseId);
  const { data: lessons } = useLessons(courseId, true);
  const updateMutation = useUpdateCourse(courseId);
  const publishMutation = usePublishCourse(courseId);
  const uploadMutation = useUploadThumbnail();
  const createLessonMutation = useCreateLesson(courseId);
  const updateLessonMutation = useUpdateLesson(editingLesson?._id || '', courseId);
  const deleteLessonMutation = useDeleteLesson(courseId);

  const [formData, setFormData] = useState<ICourseUpdate>({});
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>('');

  const [lessonFormData, setLessonFormData] = useState<ILessonCreate>({
    title: '',
    description: '',
    courseId,
    type: LessonType.VIDEO,
    order: 0,
    isFree: false,
    isPublished: true,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return <div className="text-center py-12">الدورة غير موجودة</div>;
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (type === 'number') {
      setFormData((prev) => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnailFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateCourse = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      let updatedData = { ...formData };

      if (thumbnailFile) {
        const uploadResult = await uploadMutation.mutateAsync(thumbnailFile);
        updatedData.thumbnail = uploadResult.url;
      }

      await updateMutation.mutateAsync(updatedData);
      alert('تم تحديث الدورة بنجاح');
      setFormData({});
      setThumbnailFile(null);
      setThumbnailPreview('');
    } catch (error: any) {
      alert(error.message || 'حدث خطأ أثناء تحديث الدورة');
    }
  };

  const handlePublish = async (status: CourseStatus) => {
    try {
      await publishMutation.mutateAsync({ status });
      alert(status === CourseStatus.PUBLISHED ? 'تم نشر الدورة بنجاح' : 'تم إلغاء نشر الدورة');
    } catch (error: any) {
      alert(error.message || 'حدث خطأ');
    }
  };

  const handleLessonFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setLessonFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (type === 'number') {
      setLessonFormData((prev) => ({ ...prev, [name]: parseInt(value) || 0 }));
    } else {
      setLessonFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleCreateLesson = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingLesson) {
        await updateLessonMutation.mutateAsync(lessonFormData as ILessonUpdate);
      } else {
        await createLessonMutation.mutateAsync(lessonFormData);
      }
      setShowLessonForm(false);
      setEditingLesson(null);
      resetLessonForm();
    } catch (error: any) {
      alert(error.message || 'حدث خطأ');
    }
  };

  const handleEditLesson = (lesson: ILesson) => {
    setEditingLesson(lesson);
    setLessonFormData({
      title: lesson.title,
      description: lesson.description || '',
      courseId,
      type: lesson.type,
      videoUrl: lesson.videoUrl || '',
      pdfUrl: lesson.pdfUrl || '',
      textContent: lesson.textContent || '',
      duration: lesson.duration || 0,
      order: lesson.order,
      isFree: lesson.isFree,
      isPublished: lesson.isPublished,
    });
    setShowLessonForm(true);
  };

  const handleDeleteLesson = async (lessonId: string) => {
    if (confirm('هل أنت متأكد من حذف هذا الدرس؟')) {
      await deleteLessonMutation.mutateAsync(lessonId);
    }
  };

  const resetLessonForm = () => {
    setLessonFormData({
      title: '',
      description: '',
      courseId,
      type: LessonType.VIDEO,
      order: (lessons?.length || 0),
      isFree: false,
      isPublished: true,
    });
  };

  const getLessonIcon = (type: LessonType) => {
    switch (type) {
      case LessonType.VIDEO:
        return <Video className="h-5 w-5 text-blue-600" />;
      case LessonType.PDF:
        return <File className="h-5 w-5 text-red-600" />;
      case LessonType.TEXT:
        return <FileText className="h-5 w-5 text-green-600" />;
      default:
        return <BookOpen className="h-5 w-5 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/courses">
            <Button variant="outline" size="sm">
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{course.title}</h1>
            <p className="text-gray-600 mt-1">تحرير تفاصيل الدورة</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {course.status === CourseStatus.PUBLISHED ? (
            <Button
              variant="outline"
              onClick={() => handlePublish(CourseStatus.DRAFT)}
              disabled={publishMutation.isPending}
            >
              <EyeOff className="h-4 w-4 ml-2" />
              إلغاء النشر
            </Button>
          ) : (
            <Button
              onClick={() => handlePublish(CourseStatus.PUBLISHED)}
              disabled={publishMutation.isPending}
            >
              <Eye className="h-4 w-4 ml-2" />
              نشر الدورة
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Card className="p-2">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('info')}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'info'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            معلومات الدورة
          </button>
          <button
            onClick={() => setActiveTab('content')}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'content'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            المحتوى والدروس
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'analytics'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            التحليلات
          </button>
        </div>
      </Card>

      {/* Tab Content - Course Info */}
      {activeTab === 'info' && (
        <form onSubmit={handleUpdateCourse} className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">المعلومات الأساسية</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">عنوان الدورة</label>
                <input
                  type="text"
                  name="title"
                  defaultValue={course.title}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">الوصف</label>
                <textarea
                  name="description"
                  defaultValue={course.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">المستوى</label>
                  <select
                    name="level"
                    defaultValue={course.level}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={CourseLevel.BEGINNER}>مبتدئ</option>
                    <option value={CourseLevel.INTERMEDIATE}>متوسط</option>
                    <option value={CourseLevel.ADVANCED}>متقدم</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">التصنيف</label>
                  <input
                    type="text"
                    name="category"
                    defaultValue={course.category || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">صورة الدورة</label>
                {(thumbnailPreview || course.thumbnail) && (
                  <div className="relative w-full h-48 rounded-lg overflow-hidden mb-4">
                    <img
                      src={thumbnailPreview || course.thumbnail || ''}
                      alt="Thumbnail"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                  <div className="flex flex-col items-center justify-center">
                    <Upload className="h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600">اضغط لرفع صورة جديدة</p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleThumbnailChange}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="isFree"
                  defaultChecked={course.isFree}
                  onChange={handleInputChange}
                  className="h-5 w-5 text-blue-600 rounded"
                />
                <label className="text-sm font-medium text-gray-700">دورة مجانية</label>
              </div>

              {!course.isFree && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">السعر ($)</label>
                  <input
                    type="number"
                    name="price"
                    defaultValue={course.price}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
            </div>

            <div className="mt-6">
              <Button type="submit" disabled={updateMutation.isPending || uploadMutation.isPending}>
                <Save className="h-4 w-4 ml-2" />
                {updateMutation.isPending ? 'جاري الحفظ...' : 'حفظ التغييرات'}
              </Button>
            </div>
          </Card>
        </form>
      )}

      {/* Tab Content - Lessons */}
      {activeTab === 'content' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">دروس الدورة ({lessons?.length || 0})</h2>
            <Button
              onClick={() => {
                setEditingLesson(null);
                resetLessonForm();
                setShowLessonForm(true);
              }}
            >
              <Plus className="h-4 w-4 ml-2" />
              إضافة درس جديد
            </Button>
          </div>

          {showLessonForm && (
            <Card className="p-6">
              <h3 className="text-lg font-bold mb-4">
                {editingLesson ? 'تعديل الدرس' : 'درس جديد'}
              </h3>

              <form onSubmit={handleCreateLesson} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">عنوان الدرس</label>
                  <input
                    type="text"
                    name="title"
                    value={lessonFormData.title}
                    onChange={handleLessonFormChange}
                    required
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">الوصف</label>
                  <textarea
                    name="description"
                    value={lessonFormData.description}
                    onChange={handleLessonFormChange}
                    rows={3}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">نوع الدرس</label>
                    <select
                      name="type"
                      value={lessonFormData.type}
                      onChange={handleLessonFormChange}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value={LessonType.VIDEO}>فيديو</option>
                      <option value={LessonType.PDF}>PDF</option>
                      <option value={LessonType.TEXT}>نص</option>
                      <option value={LessonType.QUIZ}>اختبار</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">المدة (دقائق)</label>
                    <input
                      type="number"
                      name="duration"
                      value={lessonFormData.duration || ''}
                      onChange={handleLessonFormChange}
                      min="0"
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {lessonFormData.type === LessonType.VIDEO && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">رابط الفيديو</label>
                    <input
                      type="url"
                      name="videoUrl"
                      value={lessonFormData.videoUrl || ''}
                      onChange={handleLessonFormChange}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://..."
                    />
                  </div>
                )}

                {lessonFormData.type === LessonType.PDF && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">رابط PDF</label>
                    <input
                      type="url"
                      name="pdfUrl"
                      value={lessonFormData.pdfUrl || ''}
                      onChange={handleLessonFormChange}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://..."
                    />
                  </div>
                )}

                {lessonFormData.type === LessonType.TEXT && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">محتوى الدرس</label>
                    <textarea
                      name="textContent"
                      value={lessonFormData.textContent || ''}
                      onChange={handleLessonFormChange}
                      rows={6}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}

                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="isFree"
                      checked={lessonFormData.isFree}
                      onChange={handleLessonFormChange}
                      className="h-5 w-5 text-blue-600 rounded"
                    />
                    <span className="text-sm font-medium text-gray-700">درس مجاني</span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="isPublished"
                      checked={lessonFormData.isPublished}
                      onChange={handleLessonFormChange}
                      className="h-5 w-5 text-blue-600 rounded"
                    />
                    <span className="text-sm font-medium text-gray-700">منشور</span>
                  </label>
                </div>

                <div className="flex gap-3">
                  <Button
                    type="submit"
                    disabled={createLessonMutation.isPending || updateLessonMutation.isPending}
                  >
                    {editingLesson ? 'تحديث الدرس' : 'إضافة الدرس'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowLessonForm(false);
                      setEditingLesson(null);
                      resetLessonForm();
                    }}
                  >
                    إلغاء
                  </Button>
                </div>
              </form>
            </Card>
          )}

          <div className="space-y-3">
            {lessons && lessons.length > 0 ? (
              lessons.map((lesson: ILesson) => (
                <Card key={lesson._id} className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      {getLessonIcon(lesson.type)}
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{lesson.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{lesson.description}</p>
                        <div className="flex items-center gap-4 mt-2">
                          {lesson.duration && (
                            <span className="text-xs text-gray-500">{lesson.duration} دقيقة</span>
                          )}
                          {lesson.isFree && (
                            <Badge variant="success" size="sm">
                              مجاني
                            </Badge>
                          )}
                          {lesson.isPublished ? (
                            <Badge variant="success" size="sm">
                              منشور
                            </Badge>
                          ) : (
                            <Badge variant="ghost" size="sm">
                              غير منشور
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditLesson(lesson)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteLesson(lesson._id)}
                        disabled={deleteLessonMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <Card className="p-12 text-center">
                <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900">لا توجد دروس بعد</h3>
                <p className="text-gray-600 mt-2">ابدأ بإضافة الدروس لهذه الدورة</p>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Tab Content - Analytics */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">عدد الطلاب</p>
                  <h3 className="text-3xl font-bold mt-1">{course.enrollmentCount}</h3>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Users className="h-8 w-8 text-purple-600" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">الإيرادات</p>
                  <h3 className="text-3xl font-bold mt-1">${course.totalRevenue.toFixed(2)}</h3>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <DollarSign className="h-8 w-8 text-green-600" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">التقييم</p>
                  <h3 className="text-3xl font-bold mt-1">
                    {course.averageRating.toFixed(1)}
                    <span className="text-lg text-gray-500 mr-1">/ 5</span>
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">({course.totalRatings} تقييم)</p>
                </div>
                <div className="p-3 bg-amber-100 rounded-lg">
                  <Star className="h-8 w-8 text-amber-600" />
                </div>
              </div>
            </Card>
          </div>

          <Card className="p-6">
            <h3 className="text-lg font-bold mb-4">نظرة عامة</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">عدد الدروس</span>
                <span className="font-semibold">{lessons?.length || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">الحالة</span>
                <span className="font-semibold">
                  {course.status === CourseStatus.PUBLISHED
                    ? 'منشورة'
                    : course.status === CourseStatus.DRAFT
                    ? 'مسودة'
                    : 'مؤرشفة'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">المستوى</span>
                <span className="font-semibold">
                  {course.level === CourseLevel.BEGINNER
                    ? 'مبتدئ'
                    : course.level === CourseLevel.INTERMEDIATE
                    ? 'متوسط'
                    : 'متقدم'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">تاريخ الإنشاء</span>
                <span className="font-semibold">
                  {new Date(course.createdAt).toLocaleDateString('ar-EG')}
                </span>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
