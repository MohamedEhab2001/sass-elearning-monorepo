/**
 * Course and Lesson related types
 */

export enum CourseStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

export enum LessonType {
  VIDEO = 'video',
  PDF = 'pdf',
  TEXT = 'text',
}

export interface ICourse {
  _id: string;
  tenantId: string;
  title: string;
  slug: string;
  description: string;
  thumbnail: string | null;
  price: number;
  status: CourseStatus;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ILesson {
  _id: string;
  courseId: string;
  title: string;
  type: LessonType;
  content: string; // URL for video/PDF, or text content
  duration: number | null; // in seconds for video
  order: number;
  isFree: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICourseCreate {
  title: string;
  slug: string;
  description: string;
  price: number;
  thumbnail?: string;
}

export interface ILessonCreate {
  courseId: string;
  title: string;
  type: LessonType;
  content: string;
  duration?: number;
  order: number;
  isFree?: boolean;
}
