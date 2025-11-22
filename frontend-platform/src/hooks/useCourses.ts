import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import {
  ICourse,
  ICoursesListResponse,
  ICourseCreate,
  ICourseUpdate,
  ICoursePublish,
  ICourseStats,
  CourseStatus,
} from '@academy/shared/types';
import { useAuth } from '@/stores/auth-store';

const COURSES_KEY = 'courses';

/**
 * Fetch all courses with pagination and filters
 */
export function useCourses(
  page: number = 1,
  limit: number = 10,
  status?: CourseStatus,
  search?: string
) {
  const { accessToken } = useAuth();

  return useQuery({
    queryKey: [COURSES_KEY, 'list', page, limit, status, search],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (status) params.append('status', status);
      if (search) params.append('search', search);

      return apiClient.get<ICoursesListResponse>(
        `/courses?${params.toString()}`,
        accessToken
      );
    },
    enabled: !!accessToken,
  });
}

/**
 * Fetch a single course by ID
 */
export function useCourse(courseId: string | undefined) {
  const { accessToken } = useAuth();

  return useQuery({
    queryKey: [COURSES_KEY, courseId],
    queryFn: () => apiClient.get<ICourse>(`/courses/${courseId}`, accessToken),
    enabled: !!courseId && !!accessToken,
  });
}

/**
 * Fetch course statistics for the instructor
 */
export function useCourseStats() {
  const { accessToken } = useAuth();

  return useQuery({
    queryKey: [COURSES_KEY, 'stats'],
    queryFn: () => apiClient.get<ICourseStats>('/courses/stats', accessToken),
    enabled: !!accessToken,
  });
}

/**
 * Create a new course
 */
export function useCreateCourse() {
  const queryClient = useQueryClient();
  const { accessToken } = useAuth();

  return useMutation({
    mutationFn: (data: ICourseCreate) =>
      apiClient.post<ICourse>('/courses', data, accessToken),
    onSuccess: () => {
      // Invalidate courses list and stats
      queryClient.invalidateQueries({ queryKey: [COURSES_KEY, 'list'] });
      queryClient.invalidateQueries({ queryKey: [COURSES_KEY, 'stats'] });
    },
  });
}

/**
 * Update an existing course
 */
export function useUpdateCourse(courseId: string) {
  const queryClient = useQueryClient();
  const { accessToken } = useAuth();

  return useMutation({
    mutationFn: (data: ICourseUpdate) =>
      apiClient.put<ICourse>(`/courses/${courseId}`, data, accessToken),
    onSuccess: (data) => {
      // Update the specific course in cache
      queryClient.setQueryData([COURSES_KEY, courseId], data);
      // Invalidate list to reflect changes
      queryClient.invalidateQueries({ queryKey: [COURSES_KEY, 'list'] });
    },
  });
}

/**
 * Publish or unpublish a course
 */
export function usePublishCourse(courseId: string) {
  const queryClient = useQueryClient();
  const { accessToken } = useAuth();

  return useMutation({
    mutationFn: (data: ICoursePublish) =>
      apiClient.put<ICourse>(`/courses/${courseId}/publish`, data, accessToken),
    onSuccess: (data) => {
      // Update the specific course in cache
      queryClient.setQueryData([COURSES_KEY, courseId], data);
      // Invalidate list and stats
      queryClient.invalidateQueries({ queryKey: [COURSES_KEY, 'list'] });
      queryClient.invalidateQueries({ queryKey: [COURSES_KEY, 'stats'] });
    },
  });
}

/**
 * Delete a course
 */
export function useDeleteCourse() {
  const queryClient = useQueryClient();
  const { accessToken } = useAuth();

  return useMutation({
    mutationFn: (courseId: string) =>
      apiClient.delete<{ message: string }>(`/courses/${courseId}`, accessToken),
    onSuccess: () => {
      // Invalidate all course-related queries
      queryClient.invalidateQueries({ queryKey: [COURSES_KEY] });
    },
  });
}
