import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { SubmissionStatus, IAnswer } from '../../../../shared/types/exam.types';

export type ExamSubmissionDocument = ExamSubmission & Document;

@Schema({ timestamps: true })
export class ExamSubmission {
  @Prop({ type: Types.ObjectId, ref: 'Exam', required: true, index: true })
  examId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  studentId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Tenant', required: true, index: true })
  tenantId: Types.ObjectId;

  @Prop({ type: Array, required: true, default: [] })
  answers: IAnswer[];

  @Prop({ required: true, enum: SubmissionStatus, default: SubmissionStatus.IN_PROGRESS, index: true })
  status: SubmissionStatus;

  // Scoring
  @Prop({ default: 0 })
  totalPoints: number;

  @Prop({ default: 0 })
  maxPoints: number;

  @Prop({ default: 0 })
  percentage: number;

  @Prop({ default: false })
  passed: boolean;

  // Grading
  @Prop({ default: null })
  autoGradedAt: Date | null;

  @Prop({ default: null })
  manuallyGradedAt: Date | null;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  gradedBy: Types.ObjectId | null;

  // Timing
  @Prop({ required: true })
  startedAt: Date;

  @Prop({ default: null })
  submittedAt: Date | null;

  @Prop({ default: null })
  timeSpent: number | null; // In seconds

  @Prop({ required: true, default: 1 })
  attemptNumber: number;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const ExamSubmissionSchema = SchemaFactory.createForClass(ExamSubmission);

// Indexes
ExamSubmissionSchema.index({ examId: 1, studentId: 1 });
ExamSubmissionSchema.index({ tenantId: 1, status: 1 });
ExamSubmissionSchema.index({ studentId: 1, status: 1 });
