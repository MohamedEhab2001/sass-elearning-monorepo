'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCreateCourse } from '@/hooks/useCourses';
import { useUploadThumbnail } from '@/hooks/useUploads';
import { CourseLevel, ICourseCreate } from '@academy/shared/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Upload, Plus, X } from 'lucide-react';
import Link from 'next/link';

export default function NewCoursePage() {
  const router = useRouter();
  const createMutation = useCreateCourse();
  const uploadMutation = useUploadThumbnail();

  const [formData, setFormData] = useState<ICourseCreate>({
    title: '',
    description: '',
    level: CourseLevel.BEGINNER,
    price: 0,
    isFree: true,
    tags: [],
    whatYouWillLearn: [''],
    requirements: [''],
    category: '',
  });

  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>('');
  const [currentTag, setCurrentTag] = useState('');

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
        ...(name === 'isFree' && checked ? { price: 0 } : {}),
      }));
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

  const addTag = () => {
    if (currentTag.trim() && !formData.tags?.includes(currentTag.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...(prev.tags || []), currentTag.trim()],
      }));
      setCurrentTag('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags?.filter((t) => t !== tag) || [],
    }));
  };

  const addLearningPoint = () => {
    setFormData((prev) => ({
      ...prev,
      whatYouWillLearn: [...(prev.whatYouWillLearn || []), ''],
    }));
  };

  const updateLearningPoint = (index: number, value: string) => {
    const updated = [...(formData.whatYouWillLearn || [])];
    updated[index] = value;
    setFormData((prev) => ({ ...prev, whatYouWillLearn: updated }));
  };

  const removeLearningPoint = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      whatYouWillLearn: prev.whatYouWillLearn?.filter((_, i) => i !== index) || [],
    }));
  };

  const addRequirement = () => {
    setFormData((prev) => ({
      ...prev,
      requirements: [...(prev.requirements || []), ''],
    }));
  };

  const updateRequirement = (index: number, value: string) => {
    const updated = [...(formData.requirements || [])];
    updated[index] = value;
    setFormData((prev) => ({ ...prev, requirements: updated }));
  };

  const removeRequirement = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      requirements: prev.requirements?.filter((_, i) => i !== index) || [],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      let thumbnailUrl = '';

      // Upload thumbnail if selected
      if (thumbnailFile) {
        const uploadResult = await uploadMutation.mutateAsync(thumbnailFile);
        thumbnailUrl = uploadResult.url;
      }

      // Filter out empty learning points and requirements
      const cleanedData: ICourseCreate = {
        ...formData,
        thumbnail: thumbnailUrl || undefined,
        whatYouWillLearn: formData.whatYouWillLearn?.filter((item) => item.trim()) || [],
        requirements: formData.requirements?.filter((item) => item.trim()) || [],
      };

      const newCourse = await createMutation.mutateAsync(cleanedData);
      router.push(`/dashboard/courses/${newCourse._id}`);
    } catch (error: any) {
      alert(error.message || 'حدث خطأ أثناء إنشاء الدورة');
    }
  };

  const isLoading = createMutation.isPending || uploadMutation.isPending;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/courses">
          <Button variant="outline" size="sm">
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">إنشاء دورة جديدة</h1>
          <p className="text-gray-600 mt-1">املأ البيانات التالية لإنشاء دورة تدريبية جديدة</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">المعلومات الأساسية</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                عنوان الدورة <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="أدخل عنوان الدورة"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                وصف الدورة <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows={4}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="اكتب وصفاً تفصيلياً للدورة"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  مستوى الدورة <span className="text-red-500">*</span>
                </label>
                <select
                  name="level"
                  value={formData.level}
                  onChange={handleInputChange}
                  required
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
                  value={formData.category || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="مثال: تطوير الويب"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Thumbnail */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">صورة الدورة</h2>

          <div className="space-y-4">
            {thumbnailPreview && (
              <div className="relative w-full h-48 rounded-lg overflow-hidden">
                <img src={thumbnailPreview} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}

            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
              <div className="flex flex-col items-center justify-center">
                <Upload className="h-8 w-8 text-gray-400 mb-2" />
                <p className="text-sm text-gray-600">اضغط لرفع صورة</p>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleThumbnailChange}
                className="hidden"
              />
            </label>
          </div>
        </Card>

        {/* Pricing */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">التسعير</h2>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                name="isFree"
                checked={formData.isFree}
                onChange={handleInputChange}
                className="h-5 w-5 text-blue-600 rounded"
              />
              <label className="text-sm font-medium text-gray-700">دورة مجانية</label>
            </div>

            {!formData.isFree && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  السعر ($) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                />
              </div>
            )}
          </div>
        </Card>

        {/* Tags */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">الكلمات المفتاحية</h2>

          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={currentTag}
                onChange={(e) => setCurrentTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="أضف كلمة مفتاحية"
              />
              <Button type="button" onClick={addTag} variant="outline">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {formData.tags && formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="hover:text-blue-900"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* What You'll Learn */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">ماذا ستتعلم؟</h2>

          <div className="space-y-3">
            {formData.whatYouWillLearn?.map((point, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={point}
                  onChange={(e) => updateLearningPoint(index, e.target.value)}
                  className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="نقطة تعليمية"
                />
                <Button
                  type="button"
                  onClick={() => removeLearningPoint(index)}
                  variant="outline"
                  size="sm"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}

            <Button type="button" onClick={addLearningPoint} variant="outline" className="w-full">
              <Plus className="h-4 w-4 ml-2" />
              إضافة نقطة
            </Button>
          </div>
        </Card>

        {/* Requirements */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">المتطلبات</h2>

          <div className="space-y-3">
            {formData.requirements?.map((req, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={req}
                  onChange={(e) => updateRequirement(index, e.target.value)}
                  className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="متطلب"
                />
                <Button
                  type="button"
                  onClick={() => removeRequirement(index)}
                  variant="outline"
                  size="sm"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}

            <Button type="button" onClick={addRequirement} variant="outline" className="w-full">
              <Plus className="h-4 w-4 ml-2" />
              إضافة متطلب
            </Button>
          </div>
        </Card>

        {/* Submit */}
        <div className="flex gap-4">
          <Button type="submit" disabled={isLoading} className="flex-1">
            {isLoading ? 'جاري الإنشاء...' : 'إنشاء الدورة'}
          </Button>
          <Link href="/dashboard/courses" className="flex-1">
            <Button type="button" variant="outline" className="w-full">
              إلغاء
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
