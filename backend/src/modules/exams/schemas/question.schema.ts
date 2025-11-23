import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { QuestionType } from '../../../../shared/types/exam.types';

export type QuestionDocument = Question & Document;

@Schema({ timestamps: true })
export class Question {
  @Prop({ type: Types.ObjectId, ref: 'Exam', required: true, index: true })
  examId: Types.ObjectId;

  @Prop({ required: true, enum: QuestionType })
  questionType: QuestionType;

  @Prop({ required: true })
  questionText: string;

  @Prop({ required: true, min: 0, default: 1 })
  points: number;

  @Prop({ required: true, default: 0 })
  order: number;

  // For MCQ
  @Prop({ type: [String], default: [] })
  options: string[];

  @Prop({ type: Number, default: null })
  correctAnswer: number | null; // Index of correct option

  // For Essay
  @Prop({ type: String, default: null })
  rubric: string | null; // Grading rubric for instructors

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const QuestionSchema = SchemaFactory.createForClass(Question);

// Indexes
QuestionSchema.index({ examId: 1, order: 1 });
