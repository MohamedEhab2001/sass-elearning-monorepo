import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type LessonDocument = Lesson & Document;

export enum LessonType {
  VIDEO = 'video',
  PDF = 'pdf',
  TEXT = 'text',
  QUIZ = 'quiz',
}

@Schema({ timestamps: true })
export class Lesson {
  @Prop({ required: true })
  title: string;

  @Prop({ type: String })
  description: string | null;

  @Prop({ type: Types.ObjectId, ref: 'Course', required: true, index: true })
  courseId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Tenant', required: true, index: true })
  tenantId: Types.ObjectId;

  @Prop({ type: String, enum: LessonType, required: true })
  type: LessonType;

  @Prop({ type: String })
  videoUrl: string | null;

  @Prop({ type: String })
  pdfUrl: string | null;

  @Prop({ type: String })
  textContent: string | null;

  @Prop({ type: Number, default: 0 })
  duration: number; // in seconds

  @Prop({ type: Number, required: true })
  order: number;

  @Prop({ type: Boolean, default: false })
  isFree: boolean;

  @Prop({ type: Boolean, default: true })
  isPublished: boolean;

  @Prop({ type: Object })
  metadata: Record<string, any>;

  createdAt: Date;
  updatedAt: Date;
}

export const LessonSchema = SchemaFactory.createForClass(Lesson);

// Indexes for performance
LessonSchema.index({ courseId: 1, order: 1 });
LessonSchema.index({ tenantId: 1 });
