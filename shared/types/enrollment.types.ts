/**
 * Enrollment and Progress related types
 */

import { ICourse } from './course.types';
import { ILesson } from './course.types';

export enum EnrollmentStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
}

export interface IEnrollment {
  _id: string;
  tenantId: string;
  studentId: string;
  courseId: string | ICourse;
  status: EnrollmentStatus;
  progressPercentage: number;
  completedAt: Date | null;
  expiresAt: Date | null;
  pricePaid: number;
  paymentId: string | null;
  enrolledAt: Date;
  lastAccessedAt: Date | null;
  totalTimeSpent: number; // in seconds
  certificateIssued: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IProgress {
  _id: string;
  tenantId: string;
  studentId: string;
  courseId: string;
  lessonId: string | ILesson;
  enrollmentId: string;
  completed: boolean;
  completedAt: Date | null;
  videoPosition: number; // in seconds
  timeSpent: number; // in seconds
  lastAccessedAt: Date;
  progressPercentage: number; // 0-100
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

// Request types for creating enrollments
export interface IEnrollmentCreate {
  courseId: string;
  pricePaid?: number;
  paymentId?: string;
}

// Request types for updating progress
export interface IProgressUpdate {
  lessonId: string;
  completed?: boolean;
  videoPosition?: number;
  timeSpent?: number;
  progressPercentage?: number;
  metadata?: Record<string, any>;
}

// Response types
export interface IEnrollmentStats {
  totalEnrollments: number;
  activeEnrollments: number;
  completedEnrollments: number;
  averageProgress: number;
  totalRevenue: number;
}

export interface ICourseProgress {
  courseId: string;
  totalLessons: number;
  completedLessons: number;
  progressPercentage: number;
  lessons: IProgress[];
}
