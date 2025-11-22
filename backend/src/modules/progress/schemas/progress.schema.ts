import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ProgressDocument = Progress & Document;

@Schema({ timestamps: true })
export class Progress {
  @Prop({ type: Types.ObjectId, ref: 'Tenant', required: true, index: true })
  tenantId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  studentId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Course', required: true, index: true })
  courseId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Lesson', required: true, index: true })
  lessonId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Enrollment', required: true, index: true })
  enrollmentId: Types.ObjectId;

  @Prop({ type: Boolean, default: false })
  completed: boolean;

  @Prop({ type: Date, default: null })
  completedAt: Date | null;

  @Prop({ type: Number, default: 0 })
  videoPosition: number; // in seconds - for resuming video playback

  @Prop({ type: Number, default: 0 })
  timeSpent: number; // in seconds

  @Prop({ type: Date, default: Date.now })
  lastAccessedAt: Date;

  @Prop({ type: Number, default: 0, min: 0, max: 100 })
  progressPercentage: number; // 0-100 for partial completion

  @Prop({ type: Object, default: {} })
  metadata: Record<string, any>; // For quiz scores, notes, etc.

  createdAt: Date;
  updatedAt: Date;
}

export const ProgressSchema = SchemaFactory.createForClass(Progress);

// Indexes for better query performance
ProgressSchema.index({ tenantId: 1, studentId: 1, courseId: 1 });
ProgressSchema.index({ enrollmentId: 1, lessonId: 1 });
ProgressSchema.index({ studentId: 1, lessonId: 1 }, { unique: true });
ProgressSchema.index({ completed: 1 });
