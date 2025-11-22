'use client';

import { useState, useEffect, useRef } from 'react';
import { use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTenant } from '../../../../providers';
import { useAuth } from '@/store/auth-store';
import { useCourseProgress, useUpdateProgress, useMarkLessonCompleted } from '@/hooks/useProgress';
import {
  Menu,
  X,
  CheckCircle,
  Circle,
  ChevronLeft,
  ChevronRight,
  Video,
  FileText,
  File
} from 'lucide-react';

interface Lesson {
  _id: string;
  title: string;
  description: string | null;
  type: string;
  videoUrl: string | null;
  pdfUrl: string | null;
  textContent: string | null;
  duration: number | null;
  order: number;
  isFree: boolean;
  isPublished: boolean;
}

export default function CoursePlayerPage({
  params,
}: {
  params: Promise<{ tenantSlug: string; course: string; lesson: string }>;
}) {
  const resolvedParams = use(params);
  const { tenantSlug, branding } = useTenant();
  const router = useRouter();
  const { accessToken } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);

  const [courseId, setCourseId] = useState('');
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);

  const { data: progressData } = useCourseProgress(courseId);
  const updateProgressMutation = useUpdateProgress(courseId);
  const markCompletedMutation = useMarkLessonCompleted(courseId);

  useEffect(() => {
    if (!accessToken) {
      router.push(`/a/${tenantSlug}/auth/login`);
      return;
    }

    // Fetch lessons for the course
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/lessons/course/${resolvedParams.lesson}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setLessons(data);
        setCourseId(resolvedParams.lesson);

        // Find current lesson or use first lesson
        const current = data.find((l: Lesson) => l._id === resolvedParams.lesson) || data[0];
        setCurrentLesson(current);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load lessons:', err);
        setLoading(false);
      });
  }, [resolvedParams.lesson, accessToken, tenantSlug, router]);

  // Load saved video position
  useEffect(() => {
    if (!currentLesson || !progressData || !videoRef.current) return;

    const progress = progressData.find((p: any) => p.lessonId._id === currentLesson._id);
    if (progress && progress.videoPosition) {
      videoRef.current.currentTime = progress.videoPosition;
    }
  }, [currentLesson, progressData]);

  // Save video position every 5 seconds
  useEffect(() => {
    if (!currentLesson || currentLesson.type !== 'video' || !videoRef.current) return;

    const interval = setInterval(() => {
      if (videoRef.current && !videoRef.current.paused) {
        updateProgressMutation.mutate({
          lessonId: currentLesson._id,
          videoPosition: videoRef.current.currentTime,
          timeSpent: 5,
        });
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [currentLesson, updateProgressMutation]);

  const handleMarkComplete = async () => {
    if (!currentLesson) return;

    try {
      await markCompletedMutation.mutateAsync(currentLesson._id);

      // Move to next lesson
      const currentIndex = lessons.findIndex((l) => l._id === currentLesson._id);
      if (currentIndex < lessons.length - 1) {
        setCurrentLesson(lessons[currentIndex + 1]);
      }
    } catch (error) {
      console.error('Failed to mark lesson as complete:', error);
    }
  };

  const isLessonCompleted = (lessonId: string) => {
    if (!progressData) return false;
    const progress = progressData.find((p: any) => p.lessonId._id === lessonId);
    return progress?.completed || false;
  };

  const getLessonIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="h-5 w-5" />;
      case 'pdf':
        return <File className="h-5 w-5" />;
      case 'text':
        return <FileText className="h-5 w-5" />;
      default:
        return <Circle className="h-5 w-5" />;
    }
  };

  if (loading || !currentLesson) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-900">
      {/* Top Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-white hover:text-gray-300 lg:hidden"
          >
            {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
          <Link href={`/a/${tenantSlug}/my-courses`} className="text-white hover:text-gray-300">
            {branding.name}
          </Link>
        </div>

        <button
          onClick={handleMarkComplete}
          disabled={markCompletedMutation.isPending || isLessonCompleted(currentLesson._id)}
          className="px-4 py-2 rounded-lg text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <CheckCircle className="h-5 w-5" />
          {isLessonCompleted(currentLesson._id) ? 'مكتمل' : 'إتمام الدرس'}
        </button>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Lesson Content */}
          <div className="flex-1 bg-black flex items-center justify-center">
            {currentLesson.type === 'video' && currentLesson.videoUrl ? (
              <video
                ref={videoRef}
                src={currentLesson.videoUrl}
                controls
                className="w-full h-full"
                controlsList="nodownload"
              >
                متصفحك لا يدعم تشغيل الفيديو
              </video>
            ) : currentLesson.type === 'pdf' && currentLesson.pdfUrl ? (
              <iframe
                src={currentLesson.pdfUrl}
                className="w-full h-full"
                title={currentLesson.title}
              />
            ) : currentLesson.type === 'text' && currentLesson.textContent ? (
              <div className="max-w-4xl mx-auto p-8 bg-white rounded-lg overflow-y-auto max-h-full">
                <h2 className="text-2xl font-bold mb-4 text-gray-900">{currentLesson.title}</h2>
                {currentLesson.description && (
                  <p className="text-gray-600 mb-6">{currentLesson.description}</p>
                )}
                <div className="prose prose-lg max-w-none text-gray-900">
                  <div dangerouslySetInnerHTML={{ __html: currentLesson.textContent }} />
                </div>
              </div>
            ) : (
              <div className="text-white text-center">
                <p>محتوى الدرس غير متاح</p>
              </div>
            )}
          </div>

          {/* Lesson Info */}
          <div className="bg-gray-800 px-6 py-4 border-t border-gray-700">
            <h1 className="text-xl font-bold text-white mb-2">{currentLesson.title}</h1>
            {currentLesson.description && (
              <p className="text-gray-400 text-sm">{currentLesson.description}</p>
            )}
          </div>
        </div>

        {/* Sidebar - Lessons List */}
        <div
          className={`${
            sidebarOpen ? 'block' : 'hidden'
          } lg:block w-full lg:w-96 bg-gray-800 border-l border-gray-700 overflow-y-auto`}
        >
          <div className="p-4 border-b border-gray-700">
            <h2 className="text-lg font-bold text-white">محتوى الدورة</h2>
            <p className="text-sm text-gray-400 mt-1">
              {lessons.filter((l) => isLessonCompleted(l._id)).length} / {lessons.length} دروس مكتملة
            </p>
          </div>

          <div className="divide-y divide-gray-700">
            {lessons.map((lesson, index) => {
              const completed = isLessonCompleted(lesson._id);
              const isCurrent = lesson._id === currentLesson._id;

              return (
                <button
                  key={lesson._id}
                  onClick={() => setCurrentLesson(lesson)}
                  className={`w-full text-right p-4 hover:bg-gray-700 transition-colors ${
                    isCurrent ? 'bg-gray-700' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {completed ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <Circle className="h-5 w-5 text-gray-500" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-gray-400 text-sm">#{index + 1}</span>
                        <span className="text-gray-500">{getLessonIcon(lesson.type)}</span>
                      </div>
                      <h3
                        className={`font-medium ${
                          isCurrent ? 'text-white' : 'text-gray-300'
                        } line-clamp-2`}
                      >
                        {lesson.title}
                      </h3>
                      {lesson.duration && (
                        <p className="text-xs text-gray-500 mt-1">{lesson.duration} دقيقة</p>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
