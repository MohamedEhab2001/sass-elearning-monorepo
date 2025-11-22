import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ExamStatus, VisibilityRule } from '../../../../shared/types/exam.types';

export type ExamDocument = Exam & Document;

@Schema({ timestamps: true })
export class Exam {
  @Prop({ type: Types.ObjectId, ref: 'Tenant', required: true, index: true })
  tenantId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Course', default: null, index: true })
  courseId: Types.ObjectId | null;

  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ default: null })
  instructions: string | null;

  @Prop({ default: null })
  duration: number | null; // Duration in minutes

  @Prop({ required: true, min: 0, max: 100, default: 60 })
  passingScore: number; // Percentage (0-100)

  @Prop({ required: true, enum: ExamStatus, default: ExamStatus.DRAFT, index: true })
  status: ExamStatus;

  // Visibility rules
  @Prop({ type: Array, default: [] })
  visibilityRules: VisibilityRule[];

  // Settings
  @Prop({ default: true })
  showResultsImmediately: boolean;

  @Prop({ default: true })
  allowRetake: boolean;

  @Prop({ default: null })
  maxAttempts: number | null;

  @Prop({ default: false })
  randomizeQuestions: boolean;

  @Prop({ default: false })
  randomizeOptions: boolean;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const ExamSchema = SchemaFactory.createForClass(Exam);

// Indexes
ExamSchema.index({ tenantId: 1, status: 1 });
ExamSchema.index({ courseId: 1 });
ExamSchema.index({ createdBy: 1 });
