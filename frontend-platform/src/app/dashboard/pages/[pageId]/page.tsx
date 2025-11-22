'use client';

import { useState, useEffect } from 'react';
import { use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/store/auth-store';
import { apiClient } from '@/lib/api-client';
import {
  ArrowRight,
  Plus,
  Eye,
  Save,
  ChevronUp,
  ChevronDown,
  Trash2,
  Settings,
  Layers,
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface PageSection {
  id: string;
  type: string;
  order: number;
  props: Record<string, any>;
  visible: boolean;
}

interface Page {
  _id: string;
  title: string;
  path: string;
  description: string | null;
  status: 'draft' | 'published';
  sections: PageSection[];
}

// Section templates
const SECTION_TEMPLATES = [
  {
    type: 'hero',
    name: 'Hero',
    icon: '🎯',
    description: 'قسم رئيسي مع عنوان وأزرار',
    defaultProps: {
      title: 'مرحباً بك في أكاديميتنا',
      subtitle: 'تعلم مهارات جديدة',
      description: 'ابدأ رحلتك التعليمية معنا',
      primaryButtonText: 'ابدأ الآن',
      primaryButtonLink: '/courses',
      secondaryButtonText: 'تعرف علينا',
      secondaryButtonLink: '/about',
      textColor: 'white',
    },
  },
  {
    type: 'features',
    name: 'المميزات',
    icon: '⭐',
    description: 'عرض المميزات بأيقونات',
    defaultProps: {
      title: 'مميزاتنا',
      subtitle: 'لماذا تختارنا',
      backgroundColor: 'bg-white',
      columns: 3,
      features: [
        {
          icon: 'BookOpen',
          title: 'محتوى عالي الجودة',
          description: 'دورات تعليمية متميزة',
        },
        {
          icon: 'GraduationCap',
          title: 'شهادات معتمدة',
          description: 'احصل على شهادات إتمام',
        },
        {
          icon: 'Users',
          title: 'مجتمع نشط',
          description: 'تواصل مع الطلاب',
        },
      ],
    },
  },
  {
    type: 'courses',
    name: 'الدورات',
    icon: '📚',
    description: 'عرض الدورات المتاحة',
    defaultProps: {
      title: 'الدورات المميزة',
      subtitle: 'اختر دورتك',
      description: 'تصفح مجموعة واسعة من الدورات التعليمية',
      showAllLink: true,
      limit: 6,
      backgroundColor: 'bg-gray-50',
    },
  },
  {
    type: 'testimonials',
    name: 'آراء الطلاب',
    icon: '💬',
    description: 'عرض تقييمات وآراء',
    defaultProps: {
      title: 'آراء طلابنا',
      subtitle: 'ماذا يقول الطلاب',
      backgroundColor: 'bg-white',
      testimonials: [
        {
          name: 'أحمد محمد',
          role: 'طالب',
          rating: 5,
          text: 'دورات رائعة وشرح واضح',
        },
      ],
    },
  },
  {
    type: 'faq',
    name: 'الأسئلة الشائعة',
    icon: '❓',
    description: 'أسئلة وأجوبة',
    defaultProps: {
      title: 'الأسئلة الشائعة',
      subtitle: 'كل ما تحتاج معرفته',
      backgroundColor: 'bg-gray-50',
      faqs: [
        {
          question: 'كيف أبدأ التعلم؟',
          answer: 'قم بالتسجيل واختر الدورة المناسبة',
        },
      ],
    },
  },
  {
    type: 'cta',
    name: 'Call to Action',
    icon: '🎬',
    description: 'دعوة لإجراء',
    defaultProps: {
      title: 'ابدأ التعلم اليوم',
      description: 'انضم إلى آلاف الطلاب',
      buttonText: 'سجل الآن',
      buttonLink: '/auth/signup',
      textColor: 'white',
    },
  },
];

export default function PageBuilderPage({
  params,
}: {
  params: Promise<{ pageId: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { accessToken } = useAuth();

  const [page, setPage] = useState<Page | null>(null);
  const [sections, setSections] = useState<PageSection[]>([]);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!accessToken) {
      router.push('/auth/login');
      return;
    }

    loadPage();
  }, [accessToken, resolvedParams.pageId]);

  const loadPage = async () => {
    try {
      const data = await apiClient.get<Page>(
        `/ui-config/pages/${resolvedParams.pageId}`,
        accessToken!
      );
      setPage(data);
      setSections(data.sections || []);
      setLoading(false);
    } catch (err: any) {
      setError(err.message || 'فشل تحميل الصفحة');
      setLoading(false);
    }
  };

  const addSection = (template: typeof SECTION_TEMPLATES[0]) => {
    const newSection: PageSection = {
      id: uuidv4(),
      type: template.type,
      order: sections.length,
      props: { ...template.defaultProps },
      visible: true,
    };

    setSections([...sections, newSection]);
    setSelectedSectionId(newSection.id);
  };

  const moveSection = (index: number, direction: 'up' | 'down') => {
    const newSections = [...sections];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= newSections.length) {
      return;
    }

    [newSections[index], newSections[targetIndex]] = [
      newSections[targetIndex],
      newSections[index],
    ];

    // Update order property
    newSections.forEach((section, i) => {
      section.order = i;
    });

    setSections(newSections);
  };

  const deleteSection = (index: number) => {
    if (!confirm('هل أنت متأكد من حذف هذا القسم؟')) {
      return;
    }

    const newSections = sections.filter((_, i) => i !== index);
    newSections.forEach((section, i) => {
      section.order = i;
    });

    setSections(newSections);
    setSelectedSectionId(null);
  };

  const updateSectionProps = (sectionId: string, props: Record<string, any>) => {
    setSections(
      sections.map((section) =>
        section.id === sectionId ? { ...section, props: { ...section.props, ...props } } : section
      )
    );
  };

  const toggleSectionVisibility = (index: number) => {
    const newSections = [...sections];
    newSections[index].visible = !newSections[index].visible;
    setSections(newSections);
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');

    try {
      await apiClient.patch(
        `/ui-config/pages/${resolvedParams.pageId}/sections`,
        { sections },
        accessToken!
      );

      alert('تم حفظ التغييرات بنجاح');
      loadPage();
    } catch (err: any) {
      setError(err.message || 'فشل حفظ التغييرات');
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!page) return;

    const newStatus = page.status === 'published' ? 'draft' : 'published';

    try {
      await apiClient.patch(
        `/ui-config/pages/${resolvedParams.pageId}/publish`,
        { status: newStatus },
        accessToken!
      );

      alert(newStatus === 'published' ? 'تم نشر الصفحة بنجاح' : 'تم إلغاء نشر الصفحة');
      loadPage();
    } catch (err: any) {
      alert(err.message || 'فشل تغيير حالة الصفحة');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!page) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">الصفحة غير موجودة</h2>
          <button onClick={() => router.back()} className="text-blue-600 hover:underline">
            رجوع
          </button>
        </div>
      </div>
    );
  }

  const selectedSection = sections.find((s) => s.id === selectedSectionId);

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/dashboard/pages')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowRight className="h-5 w-5" />
              رجوع
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{page.title}</h1>
              <p className="text-sm text-gray-600">{page.path}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                page.status === 'published'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              {page.status === 'published' ? 'منشور' : 'مسودة'}
            </span>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {saving ? 'جاري الحفظ...' : 'حفظ'}
            </button>
            <button
              onClick={handlePublish}
              className="flex items-center gap-2 px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Eye className="h-4 w-4" />
              {page.status === 'published' ? 'إلغاء النشر' : 'نشر'}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="mx-6 mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="flex h-[calc(100vh-80px)]">
        {/* Section Library Sidebar */}
        <div className="w-72 bg-white border-l p-6 overflow-y-auto">
          <div className="flex items-center gap-2 mb-6">
            <Layers className="h-5 w-5 text-gray-600" />
            <h2 className="text-lg font-bold text-gray-900">مكتبة الأقسام</h2>
          </div>

          <div className="space-y-3">
            {SECTION_TEMPLATES.map((template) => (
              <button
                key={template.type}
                onClick={() => addSection(template)}
                className="w-full text-right p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{template.icon}</span>
                  <div>
                    <div className="font-semibold text-gray-900">{template.name}</div>
                    <div className="text-sm text-gray-600">{template.description}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Canvas - Sections List */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              الأقسام ({sections.length})
            </h2>

            {sections.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <Plus className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  ابدأ بإضافة الأقسام
                </h3>
                <p className="text-gray-600">
                  اختر قسماً من المكتبة على اليمين لبناء صفحتك
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {sections.map((section, index) => {
                  const template = SECTION_TEMPLATES.find((t) => t.type === section.type);

                  return (
                    <div
                      key={section.id}
                      className={`bg-white rounded-lg border-2 p-4 cursor-pointer transition-all ${
                        selectedSectionId === section.id
                          ? 'border-blue-500 shadow-md'
                          : 'border-gray-200 hover:border-gray-300'
                      } ${!section.visible ? 'opacity-50' : ''}`}
                      onClick={() => setSelectedSectionId(section.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{template?.icon}</span>
                          <div>
                            <div className="font-semibold text-gray-900">
                              {template?.name || section.type}
                            </div>
                            <div className="text-sm text-gray-600">
                              {section.props.title || 'بدون عنوان'}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              moveSection(index, 'up');
                            }}
                            disabled={index === 0}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-30"
                            title="تحريك لأعلى"
                          >
                            <ChevronUp className="h-4 w-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              moveSection(index, 'down');
                            }}
                            disabled={index === sections.length - 1}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-30"
                            title="تحريك لأسفل"
                          >
                            <ChevronDown className="h-4 w-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleSectionVisibility(index);
                            }}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded"
                            title={section.visible ? 'إخفاء' : 'إظهار'}
                          >
                            <Eye
                              className={`h-4 w-4 ${
                                section.visible ? 'text-green-600' : 'text-gray-400'
                              }`}
                            />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteSection(index);
                            }}
                            className="p-2 text-red-600 hover:bg-red-50 rounded"
                            title="حذف"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Properties Panel */}
        {selectedSection && (
          <div className="w-96 bg-white border-r p-6 overflow-y-auto">
            <div className="flex items-center gap-2 mb-6">
              <Settings className="h-5 w-5 text-gray-600" />
              <h2 className="text-lg font-bold text-gray-900">خصائص القسم</h2>
            </div>

            <div className="space-y-4">
              {/* Render properties based on section type */}
              {Object.entries(selectedSection.props).map(([key, value]) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {key}
                  </label>
                  {typeof value === 'string' ? (
                    <input
                      type="text"
                      value={value}
                      onChange={(e) =>
                        updateSectionProps(selectedSection.id, { [key]: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : typeof value === 'number' ? (
                    <input
                      type="number"
                      value={value}
                      onChange={(e) =>
                        updateSectionProps(selectedSection.id, {
                          [key]: parseInt(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : typeof value === 'boolean' ? (
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) =>
                          updateSectionProps(selectedSection.id, { [key]: e.target.checked })
                        }
                        className="rounded"
                      />
                      <span className="text-sm text-gray-600">تفعيل</span>
                    </label>
                  ) : (
                    <textarea
                      value={JSON.stringify(value, null, 2)}
                      onChange={(e) => {
                        try {
                          const parsed = JSON.parse(e.target.value);
                          updateSectionProps(selectedSection.id, { [key]: parsed });
                        } catch (err) {
                          // Invalid JSON, ignore
                        }
                      }}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
