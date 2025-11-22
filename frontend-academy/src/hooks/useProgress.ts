import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { IProgress, IProgressUpdate } from '@academy/shared/types';
import { useAuth } from '@/store/auth-store';

const PROGRESS_KEY = 'progress';

/**
 * Get all progress for a course
 */
export function useCourseProgress(courseId: string | undefined) {
  const { accessToken } = useAuth();

  return useQuery({
    queryKey: [PROGRESS_KEY, 'course', courseId],
    queryFn: () => apiClient.get<IProgress[]>(`/progress/course/${courseId}`, accessToken!),
    enabled: !!courseId && !!accessToken,
  });
}

/**
 * Get progress for a specific lesson
 */
export function useLessonProgress(lessonId: string | undefined) {
  const { accessToken } = useAuth();

  return useQuery({
    queryKey: [PROGRESS_KEY, 'lesson', lessonId],
    queryFn: () => apiClient.get<IProgress>(`/progress/lesson/${lessonId}`, accessToken!),
    enabled: !!lessonId && !!accessToken,
  });
}

/**
 * Get course completion percentage
 */
export function useCourseCompletion(courseId: string | undefined) {
  const { accessToken } = useAuth();

  return useQuery({
    queryKey: [PROGRESS_KEY, 'completion', courseId],
    queryFn: () => apiClient.get<{ percentage: number }>(`/progress/course/${courseId}/percentage`, accessToken!),
    enabled: !!courseId && !!accessToken,
  });
}

/**
 * Get next lesson for a course
 */
export function useNextLesson(courseId: string | undefined) {
  const { accessToken } = useAuth();

  return useQuery({
    queryKey: [PROGRESS_KEY, 'next', courseId],
    queryFn: () => apiClient.get<any>(`/progress/course/${courseId}/next`, accessToken!),
    enabled: !!courseId && !!accessToken,
  });
}

/**
 * Update progress for a lesson
 */
export function useUpdateProgress(courseId?: string) {
  const queryClient = useQueryClient();
  const { accessToken } = useAuth();

  return useMutation({
    mutationFn: (data: IProgressUpdate) =>
      apiClient.put<IProgress>('/progress', data, accessToken!),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [PROGRESS_KEY, 'lesson', variables.lessonId] });
      if (courseId) {
        queryClient.invalidateQueries({ queryKey: [PROGRESS_KEY, 'course', courseId] });
        queryClient.invalidateQueries({ queryKey: [PROGRESS_KEY, 'completion', courseId] });
        queryClient.invalidateQueries({ queryKey: [PROGRESS_KEY, 'next', courseId] });
      }
    },
  });
}

/**
 * Mark lesson as completed
 */
export function useMarkLessonCompleted(courseId?: string) {
  const queryClient = useQueryClient();
  const { accessToken } = useAuth();

  return useMutation({
    mutationFn: (lessonId: string) =>
      apiClient.post<IProgress>(`/progress/lesson/${lessonId}/complete`, {}, accessToken!),
    onSuccess: (_, lessonId) => {
      queryClient.invalidateQueries({ queryKey: [PROGRESS_KEY, 'lesson', lessonId] });
      if (courseId) {
        queryClient.invalidateQueries({ queryKey: [PROGRESS_KEY, 'course', courseId] });
        queryClient.invalidateQueries({ queryKey: [PROGRESS_KEY, 'completion', courseId] });
      }
    },
  });
}
