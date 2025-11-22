/**
 * Exam and Question related types
 */

export enum ExamType {
  MCQ = 'mcq',
  ESSAY = 'essay',
  MIXED = 'mixed',
}

export enum QuestionType {
  MCQ = 'mcq',
  ESSAY = 'essay',
}

export interface IExam {
  _id: string;
  tenantId: string;
  courseId: string | null;
  title: string;
  description: string;
  type: ExamType;
  duration: number; // in minutes
  passingScore: number;
  maxAttempts: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IQuestion {
  _id: string;
  examId: string;
  type: QuestionType;
  question: string;
  options?: string[]; // for MCQ
  correctAnswer?: string; // for MCQ
  points: number;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IExamSubmission {
  _id: string;
  examId: string;
  studentId: string;
  answers: Record<string, string>; // questionId -> answer
  score: number | null;
  totalPoints: number;
  isPassed: boolean | null;
  submittedAt: Date;
  gradedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
