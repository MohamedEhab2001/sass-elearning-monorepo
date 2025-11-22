/**
 * Enrollment and Progress related types
 */

export interface IEnrollment {
  _id: string;
  studentId: string;
  courseId: string;
  tenantId: string;
  enrolledAt: Date;
  expiresAt: Date | null;
  completedAt: Date | null;
  progressPercentage: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IProgress {
  _id: string;
  enrollmentId: string;
  lessonId: string;
  completedAt: Date | null;
  watchedDuration: number; // in seconds
  createdAt: Date;
  updatedAt: Date;
}
