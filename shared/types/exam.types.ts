/**
 * Exam and Assessment related types
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
  customFieldName: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
  value: any;
}

export interface IQuestion {
  _id: string;
  examId: string;
  questionType: QuestionType;
  questionText: string;
  points: number;
  order: number;

  // For MCQ
  options?: string[];
  correctAnswer?: number; // Index of correct option

  // For Essay
  rubric?: string; // Grading rubric for instructors

  createdAt: Date;
  updatedAt: Date;
}

export interface IExam {
  _id: string;
  tenantId: string;
  courseId?: string; // Optional: link to specific course
  title: string;
  description: string;
  instructions?: string;
  duration?: number; // Duration in minutes (null = unlimited)
  passingScore: number; // Percentage (0-100)
  status: ExamStatus;

  // Visibility rules
  visibilityRules: VisibilityRule[];

  // Settings
  showResultsImmediately: boolean; // Show results after submission
  allowRetake: boolean;
  maxAttempts?: number; // null = unlimited
  randomizeQuestions: boolean;
  randomizeOptions: boolean;

  createdBy: string; // Instructor ID
  createdAt: Date;
  updatedAt: Date;
}

export interface IAnswer {
  questionId: string;

  // For MCQ
  selectedOption?: number;

  // For Essay
  essayText?: string;

  // Grading
  points?: number;
  feedback?: string;
  isCorrect?: boolean; // For MCQ
}

export interface IExamSubmission {
  _id: string;
  examId: string;
  studentId: string;
  tenantId: string;

  answers: IAnswer[];

  status: SubmissionStatus;

  // Scoring
  totalPoints: number;
  maxPoints: number;
  percentage: number;
  passed: boolean;

  // Grading
  autoGradedAt?: Date;
  manuallyGradedAt?: Date;
  gradedBy?: string; // Instructor ID who manually graded

  // Timing
  startedAt: Date;
  submittedAt?: Date;
  timeSpent?: number; // In seconds

  attemptNumber: number;

  createdAt: Date;
  updatedAt: Date;
}

// DTOs
export interface CreateExamDto {
  courseId?: string;
  title: string;
  description: string;
  instructions?: string;
  duration?: number;
  passingScore: number;
  visibilityRules?: VisibilityRule[];
  showResultsImmediately?: boolean;
  allowRetake?: boolean;
  maxAttempts?: number;
  randomizeQuestions?: boolean;
  randomizeOptions?: boolean;
}

export interface UpdateExamDto {
  courseId?: string;
  title?: string;
  description?: string;
  instructions?: string;
  duration?: number;
  passingScore?: number;
  status?: ExamStatus;
  visibilityRules?: VisibilityRule[];
  showResultsImmediately?: boolean;
  allowRetake?: boolean;
  maxAttempts?: number;
  randomizeQuestions?: boolean;
  randomizeOptions?: boolean;
}

export interface CreateQuestionDto {
  examId: string;
  questionType: QuestionType;
  questionText: string;
  points: number;
  order?: number;
  options?: string[];
  correctAnswer?: number;
  rubric?: string;
}

export interface UpdateQuestionDto {
  questionText?: string;
  points?: number;
  order?: number;
  options?: string[];
  correctAnswer?: number;
  rubric?: string;
}

export interface SubmitExamDto {
  examId: string;
  answers: {
    questionId: string;
    selectedOption?: number;
    essayText?: string;
  }[];
  timeSpent?: number;
}

export interface GradeEssayDto {
  questionId: string;
  points: number;
  feedback?: string;
}
