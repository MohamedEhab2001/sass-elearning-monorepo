import { useQuery, useMutation, useQueryClient } from '@tantml:react-query';
import { apiClient } from '@/lib/api-client';
import {
  ILesson,
  ILessonCreate,
  ILessonUpdate,
  ILessonReorder,
} from '@academy/shared/types';
import { useAuth } from '@/stores/auth-store';

const LESSONS_KEY = 'lessons';

/**
 * Fetch all lessons for a specific course
 */
export function useLessons(courseId: string | undefined, includeUnpublished: boolean = true) {
  const { accessToken } = useAuth();

  return useQuery({
    queryKey: [LESSONS_KEY, 'course', courseId, includeUnpublished],
    queryFn: async () => {
      const params = includeUnpublished ? '?includeUnpublished=true' : '';
      return apiClient.get<ILesson[]>(
        `/lessons/course/${courseId}${params}`,
        accessToken
      );
    },
    enabled: !!courseId && !!accessToken,
  });
}

/**
 * Fetch a single lesson by ID
 */
export function useLesson(lessonId: string | undefined) {
  const { accessToken } = useAuth();

  return useQuery({
    queryKey: [LESSONS_KEY, lessonId],
    queryFn: () => apiClient.get<ILesson>(`/lessons/${lessonId}`, accessToken),
    enabled: !!lessonId && !!accessToken,
  });
}

/**
 * Get lesson count for a course
 */
export function useLessonCount(courseId: string | undefined) {
  const { accessToken } = useAuth();

  return useQuery({
    queryKey: [LESSONS_KEY, 'count', courseId],
    queryFn: () =>
      apiClient.get<{ count: number }>(
        `/lessons/course/${courseId}/count`,
        accessToken
      ),
    enabled: !!courseId && !!accessToken,
  });
}

/**
 * Get total duration for a course
 */
export function useLessonDuration(courseId: string | undefined) {
  const { accessToken } = useAuth();

  return useQuery({
    queryKey: [LESSONS_KEY, 'duration', courseId],
    queryFn: () =>
      apiClient.get<{ totalDuration: number }>(
        `/lessons/course/${courseId}/duration`,
        accessToken
      ),
    enabled: !!courseId && !!accessToken,
  });
}

/**
 * Create a new lesson
 */
export function useCreateLesson(courseId: string) {
  const queryClient = useQueryClient();
  const { accessToken } = useAuth();

  return useMutation({
    mutationFn: (data: ILessonCreate) =>
      apiClient.post<ILesson>('/lessons', data, accessToken),
    onSuccess: () => {
      // Invalidate lessons list for this course
      queryClient.invalidateQueries({ queryKey: [LESSONS_KEY, 'course', courseId] });
      queryClient.invalidateQueries({ queryKey: [LESSONS_KEY, 'count', courseId] });
      queryClient.invalidateQueries({ queryKey: [LESSONS_KEY, 'duration', courseId] });
    },
  });
}

/**
 * Update an existing lesson
 */
export function useUpdateLesson(lessonId: string, courseId: string) {
  const queryClient = useQueryClient();
  const { accessToken } = useAuth();

  return useMutation({
    mutationFn: (data: ILessonUpdate) =>
      apiClient.put<ILesson>(`/lessons/${lessonId}`, data, accessToken),
    onSuccess: (data) => {
      // Update the specific lesson in cache
      queryClient.setQueryData([LESSONS_KEY, lessonId], data);
      // Invalidate list to reflect changes
      queryClient.invalidateQueries({ queryKey: [LESSONS_KEY, 'course', courseId] });
      queryClient.invalidateQueries({ queryKey: [LESSONS_KEY, 'duration', courseId] });
    },
  });
}

/**
 * Delete a lesson
 */
export function useDeleteLesson(courseId: string) {
  const queryClient = useQueryClient();
  const { accessToken } = useAuth();

  return useMutation({
    mutationFn: (lessonId: string) =>
      apiClient.delete<{ message: string }>(`/lessons/${lessonId}`, accessToken),
    onSuccess: () => {
      // Invalidate all lesson-related queries for this course
      queryClient.invalidateQueries({ queryKey: [LESSONS_KEY, 'course', courseId] });
      queryClient.invalidateQueries({ queryKey: [LESSONS_KEY, 'count', courseId] });
      queryClient.invalidateQueries({ queryKey: [LESSONS_KEY, 'duration', courseId] });
    },
  });
}

/**
 * Reorder lessons in a course
 */
export function useReorderLessons(courseId: string) {
  const queryClient = useQueryClient();
  const { accessToken } = useAuth();

  return useMutation({
    mutationFn: (data: ILessonReorder) =>
      apiClient.put<{ message: string }>('/lessons/reorder', data, accessToken),
    onSuccess: () => {
      // Invalidate lessons list to reflect new order
      queryClient.invalidateQueries({ queryKey: [LESSONS_KEY, 'course', courseId] });
    },
  });
}

/**
 * Mark lesson as completed (for students)
 */
export function useCompleteLesson() {
  const queryClient = useQueryClient();
  const { accessToken } = useAuth();

  return useMutation({
    mutationFn: (lessonId: string) =>
      apiClient.post<{ message: string }>(
        `/lessons/${lessonId}/complete`,
        {},
        accessToken
      ),
    onSuccess: (_, lessonId) => {
      // Update the lesson in cache
      queryClient.invalidateQueries({ queryKey: [LESSONS_KEY, lessonId] });
    },
  });
}
