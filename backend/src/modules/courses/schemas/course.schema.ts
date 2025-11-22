import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CourseDocument = Course & Document;

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

@Schema({ timestamps: true })
export class Course {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  slug: string;

  @Prop({ required: true })
  description: string;

  @Prop({ type: String })
  thumbnail: string | null;

  @Prop({ type: Types.ObjectId, ref: 'Tenant', required: true, index: true })
  tenantId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  instructorId: Types.ObjectId;

  @Prop({ type: String, enum: CourseStatus, default: CourseStatus.DRAFT })
  status: CourseStatus;

  @Prop({ type: String, enum: CourseLevel, default: CourseLevel.BEGINNER })
  level: CourseLevel;

  @Prop({ type: Number, default: 0 })
  price: number;

  @Prop({ type: Boolean, default: false })
  isFree: boolean;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ type: [String], default: [] })
  whatYouWillLearn: string[];

  @Prop({ type: [String], default: [] })
  requirements: string[];

  @Prop({ type: String })
  category: string | null;

  @Prop({ type: Number, default: 0 })
  enrollmentCount: number;

  @Prop({ type: Number, default: 0 })
  totalRevenue: number;

  @Prop({ type: Number, default: 0 })
  averageRating: number;

  @Prop({ type: Number, default: 0 })
  totalReviews: number;

  @Prop({ type: Date })
  publishedAt: Date | null;

  @Prop({ type: Boolean, default: true })
  isActive: boolean;

  createdAt: Date;
  updatedAt: Date;
}

export const CourseSchema = SchemaFactory.createForClass(Course);

// Indexes for performance
CourseSchema.index({ tenantId: 1, status: 1 });
CourseSchema.index({ slug: 1, tenantId: 1 }, { unique: true });
CourseSchema.index({ instructorId: 1 });
