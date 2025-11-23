/**
 * Exam and assessment related types
 */

export enum QuestionType {
  MCQ = 'mcq',
  ESSAY = 'essay',
}

export enum ExamStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

export enum SubmissionStatus {
  IN_PROGRESS = 'in_progress',
  SUBMITTED = 'submitted',
  GRADED = 'graded',
}

export interface VisibilityRule {
  type: 'always' | 'after_purchase' | 'after_completion' | 'after_lesson' | 'custom_field';
  lessonId?: string;
  customFieldName?: string;
  operator?: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than';
  value?: string | string[] | number;
}

export interface IAnswer {
  questionId: string;
  answer?: string | string[]; // string for essay, string[] for MCQ
  selectedOption?: string; // For MCQ
  essayText?: string; // For essay questions
  isCorrect?: boolean;
  points?: number;
  feedback?: string;
}

export interface IExam {
  _id: string;
  tenantId: string;
  courseId?: string;
  title: string;
  description: string;
  duration: number; // in minutes
  passingScore: number; // percentage
  attemptsAllowed: number;
  status: ExamStatus;
  visibilityRules: VisibilityRule[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IQuestion {
  _id: string;
  examId: string;
  type: QuestionType;
  question: string;
  options?: string[]; // For MCQ
  correctAnswer?: string | string[]; // For MCQ
  points: number;
  order: number;
  explanation?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IExamSubmission {
  _id: string;
  examId: string;
  studentId: string;
  tenantId: string;
  answers: IAnswer[];
  score: number;
  maxScore: number;
  passed: boolean;
  status: SubmissionStatus;
  startedAt: Date;
  submittedAt?: Date;
  timeSpent?: number; // in seconds
  attemptNumber: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateExamDto {
  courseId?: string;
  title: string;
  description: string;
  duration: number;
  passingScore: number;
  attemptsAllowed: number;
  visibilityRules: VisibilityRule[];
}

export interface UpdateExamDto {
  title?: string;
  description?: string;
  duration?: number;
  passingScore?: number;
  attemptsAllowed?: number;
  status?: ExamStatus;
  visibilityRules?: VisibilityRule[];
}

export interface CreateQuestionDto {
  examId: string;
  type: QuestionType;
  question: string;
  options?: string[];
  correctAnswer?: string | string[];
  points: number;
  explanation?: string;
}

export interface UpdateQuestionDto {
  question?: string;
  options?: string[];
  correctAnswer?: string | string[];
  points?: number;
  explanation?: string;
}
