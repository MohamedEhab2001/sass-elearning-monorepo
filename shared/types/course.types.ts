/**
 * Course and Lesson related types
 */

export enum CourseStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

export enum CourseLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
}

export enum LessonType {
  VIDEO = 'video',
  PDF = 'pdf',
  TEXT = 'text',
  QUIZ = 'quiz',
}

export interface IUser {
  _id: string;
  fullName: string;
  email: string;
  profilePicture?: string;
}

export interface ICourse {
  _id: string;
  tenantId: string;
  instructorId: string | IUser;
  title: string;
  slug: string;
  description: string;
  thumbnail: string | null;
  level: CourseLevel;
  price: number;
  isFree: boolean;
  tags: string[];
  whatYouWillLearn: string[];
  requirements: string[];
  category: string | null;
  status: CourseStatus;
  enrollmentCount: number;
  totalRevenue: number;
  averageRating: number;
  totalRatings: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ILesson {
  _id: string;
  tenantId: string;
  courseId: string;
  title: string;
  description: string | null;
  type: LessonType;
  videoUrl: string | null;
  pdfUrl: string | null;
  textContent: string | null;
  duration: number | null; // in seconds
  order: number;
  isFree: boolean;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Request types for creating courses
export interface ICourseCreate {
  title: string;
  description: string;
  thumbnail?: string;
  level: CourseLevel;
  price: number;
  isFree: boolean;
  tags?: string[];
  whatYouWillLearn?: string[];
  requirements?: string[];
  category?: string;
}

// Request types for updating courses
export interface ICourseUpdate {
  title?: string;
  description?: string;
  thumbnail?: string;
  level?: CourseLevel;
  price?: number;
  isFree?: boolean;
  tags?: string[];
  whatYouWillLearn?: string[];
  requirements?: string[];
  category?: string;
  isActive?: boolean;
}

// Request types for publishing courses
export interface ICoursePublish {
  status: CourseStatus;
}

// Request types for creating lessons
export interface ILessonCreate {
  title: string;
  description?: string;
  courseId: string;
  type: LessonType;
  videoUrl?: string;
  pdfUrl?: string;
  textContent?: string;
  duration?: number;
  order: number;
  isFree?: boolean;
  isPublished?: boolean;
}

// Request types for updating lessons
export interface ILessonUpdate {
  title?: string;
  description?: string;
  type?: LessonType;
  videoUrl?: string;
  pdfUrl?: string;
  textContent?: string;
  duration?: number;
  order?: number;
  isFree?: boolean;
  isPublished?: boolean;
}

// Request types for reordering lessons
export interface ILessonReorder {
  courseId: string;
  lessonIds: string[];
}

// Response types for course listings
export interface ICoursesListResponse {
  courses: ICourse[];
  total: number;
  page: number;
  totalPages: number;
}

// Response types for course stats
export interface ICourseStats {
  totalCourses: number;
  publishedCourses: number;
  draftCourses: number;
  totalEnrollments: number;
  totalRevenue: number;
  averageRating: number;
}

// Upload response type
export interface IUploadResponse {
  filename: string;
  originalName: string;
  path: string;
  url: string;
  size: number;
  mimetype: string;
}
