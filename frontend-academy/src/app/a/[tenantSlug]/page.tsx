'use client';

import { useState, useEffect } from 'react';
import { use } from 'react';
import Link from 'next/link';
import { useTenant } from './providers';
import DynamicSectionRenderer from '@/components/DynamicSectionRenderer';
import { BookOpen, GraduationCap, Users } from 'lucide-react';

interface PageSection {
  id: string;
  type: string;
  order: number;
  props: Record<string, any>;
  visible: boolean;
}

interface PageConfig {
  _id: string;
  title: string;
  path: string;
  sections: PageSection[];
}

export default function AcademyHomePage({
  params,
}: {
  params: Promise<{ tenantSlug: string }>;
}) {
  const resolvedParams = use(params);
  const { tenantSlug, branding } = useTenant();

  const [pageConfig, setPageConfig] = useState<PageConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    // Fetch page configuration from backend
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/public/ui-config/${tenantSlug}/page-by-path`)
      .then((res) => {
        if (!res.ok) {
          throw new Error('Failed to fetch page config');
        }
        return res.json();
      })
      .then((data) => {
        setPageConfig(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load page config:', err);
        setError(true);
        setLoading(false);
      });
  }, [tenantSlug]);

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

  // If page config exists, render dynamic sections
  if (pageConfig && pageConfig.sections && pageConfig.sections.length > 0) {
    return (
      <div className="min-h-screen">
        <DynamicSectionRenderer
          sections={pageConfig.sections}
          tenantSlug={tenantSlug}
          primaryColor={`rgb(${branding.colors.primary})`}
          secondaryColor={`rgb(${branding.colors.secondary})`}
        />
      </div>
    );
  }

  // Fallback: Default home page if no page config found
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section
        className="py-20 md:py-32"
        style={{
          background: `linear-gradient(135deg, rgb(var(--color-primary)) 0%, rgb(var(--color-secondary)) 100%)`,
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-white">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              مرحباً بك في {branding.name}
            </h1>
            <p className="text-xl md:text-2xl mb-10 opacity-90">
              ابدأ رحلتك التعليمية معنا واكتسب مهارات جديدة
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href={`/a/${tenantSlug}/courses`}
                className="px-8 py-4 bg-white text-gray-900 rounded-lg font-semibold text-lg transition-all hover:shadow-xl hover:scale-105"
              >
                تصفح الدورات
              </Link>
              <Link
                href={`/a/${tenantSlug}/auth/signup`}
                className="px-8 py-4 border-2 border-white text-white rounded-lg font-semibold text-lg transition-all hover:bg-white hover:text-gray-900"
              >
                إنشاء حساب
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              لماذا تختارنا؟
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div
                className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
                style={{
                  background: `linear-gradient(135deg, rgb(var(--color-primary)) 0%, rgb(var(--color-secondary)) 100%)`,
                }}
              >
                <BookOpen className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                محتوى عالي الجودة
              </h3>
              <p className="text-gray-600">
                دورات تعليمية متميزة من أفضل المدربين
              </p>
            </div>

            <div className="text-center p-6">
              <div
                className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
                style={{
                  background: `linear-gradient(135deg, rgb(var(--color-primary)) 0%, rgb(var(--color-secondary)) 100%)`,
                }}
              >
                <GraduationCap className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                شهادات معتمدة
              </h3>
              <p className="text-gray-600">
                احصل على شهادات إتمام لجميع الدورات
              </p>
            </div>

            <div className="text-center p-6">
              <div
                className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
                style={{
                  background: `linear-gradient(135deg, rgb(var(--color-primary)) 0%, rgb(var(--color-secondary)) 100%)`,
                }}
              >
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                مجتمع نشط
              </h3>
              <p className="text-gray-600">
                تواصل مع الطلاب والمدربين
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        className="py-16 md:py-20"
        style={{
          background: `linear-gradient(135deg, rgb(var(--color-primary)) 0%, rgb(var(--color-secondary)) 100%)`,
        }}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              ابدأ التعلم اليوم
            </h2>
            <p className="text-lg md:text-xl mb-8 opacity-90">
              انضم إلى آلاف الطلاب الذين يتعلمون معنا
            </p>
            <Link
              href={`/a/${tenantSlug}/auth/signup`}
              className="inline-block px-8 py-4 bg-white text-gray-900 rounded-lg font-semibold text-lg transition-all hover:shadow-xl hover:scale-105"
            >
              سجل الآن مجاناً
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
