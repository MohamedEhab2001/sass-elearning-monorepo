import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type EnrollmentDocument = Enrollment & Document;

export enum EnrollmentStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
}

@Schema({ timestamps: true })
export class Enrollment {
  @Prop({ type: Types.ObjectId, ref: 'Tenant', required: true, index: true })
  tenantId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  studentId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Course', required: true, index: true })
  courseId: Types.ObjectId;

  @Prop({ type: String, enum: EnrollmentStatus, default: EnrollmentStatus.ACTIVE })
  status: EnrollmentStatus;

  @Prop({ type: Number, default: 0, min: 0, max: 100 })
  progressPercentage: number;

  @Prop({ type: Date, default: null })
  completedAt: Date | null;

  @Prop({ type: Date, default: null })
  expiresAt: Date | null;

  @Prop({ type: Number, default: 0 })
  pricePaid: number;

  @Prop({ type: String, default: null })
  paymentId: string | null;

  @Prop({ type: Date, default: Date.now })
  enrolledAt: Date;

  @Prop({ type: Date, default: null })
  lastAccessedAt: Date | null;

  @Prop({ type: Number, default: 0 })
  totalTimeSpent: number; // in seconds

  @Prop({ type: Boolean, default: false })
  certificateIssued: boolean;

  createdAt: Date;
  updatedAt: Date;
}

export const EnrollmentSchema = SchemaFactory.createForClass(Enrollment);

// Indexes for better query performance
EnrollmentSchema.index({ tenantId: 1, studentId: 1 });
EnrollmentSchema.index({ tenantId: 1, courseId: 1 });
EnrollmentSchema.index({ studentId: 1, courseId: 1 }, { unique: true });
EnrollmentSchema.index({ status: 1 });
