import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { IEnrollment, IEnrollmentCreate, EnrollmentStatus } from '@academy/shared/types';
import { useAuth } from '@/store/auth-store';

const ENROLLMENTS_KEY = 'enrollments';

/**
 * Get all enrollments for the current student
 */
export function useEnrollments(status?: EnrollmentStatus) {
  const { accessToken } = useAuth();

  return useQuery({
    queryKey: [ENROLLMENTS_KEY, status],
    queryFn: async () => {
      const params = status ? `?status=${status}` : '';
      return apiClient.get<IEnrollment[]>(`/enrollments${params}`, accessToken!);
    },
    enabled: !!accessToken,
  });
}

/**
 * Get enrollment by course ID
 */
export function useEnrollmentByCourse(courseId: string | undefined) {
  const { accessToken } = useAuth();

  return useQuery({
    queryKey: [ENROLLMENTS_KEY, 'course', courseId],
    queryFn: () => apiClient.get<IEnrollment>(`/enrollments/course/${courseId}`, accessToken!),
    enabled: !!courseId && !!accessToken,
  });
}

/**
 * Check if enrolled in a course
 */
export function useIsEnrolled(courseId: string | undefined) {
  const { accessToken } = useAuth();

  return useQuery({
    queryKey: [ENROLLMENTS_KEY, 'check', courseId],
    queryFn: () => apiClient.get<{ isEnrolled: boolean }>(`/enrollments/course/${courseId}/check`, accessToken!),
    enabled: !!courseId && !!accessToken,
  });
}

/**
 * Enroll in a course
 */
export function useEnroll() {
  const queryClient = useQueryClient();
  const { accessToken } = useAuth();

  return useMutation({
    mutationFn: (data: IEnrollmentCreate) =>
      apiClient.post<IEnrollment>('/enrollments', data, accessToken!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ENROLLMENTS_KEY] });
    },
  });
}

/**
 * Cancel enrollment
 */
export function useCancelEnrollment() {
  const queryClient = useQueryClient();
  const { accessToken } = useAuth();

  return useMutation({
    mutationFn: (enrollmentId: string) =>
      apiClient.delete<{ message: string }>(`/enrollments/${enrollmentId}`, accessToken!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ENROLLMENTS_KEY] });
    },
  });
}
