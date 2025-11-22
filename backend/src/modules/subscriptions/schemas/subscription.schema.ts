import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type SubscriptionDocument = Subscription & Document;

export enum SubscriptionPlan {
  MONTHLY = 'monthly',
  ANNUAL = 'annual',
}

export enum SubscriptionStatus {
  ACTIVE = 'active',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
  PENDING = 'pending',
}

@Schema({ timestamps: true })
export class Subscription {
  @Prop({ type: Types.ObjectId, ref: 'Tenant', required: true })
  tenantId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  studentId: Types.ObjectId;

  @Prop({ required: true, enum: SubscriptionPlan })
  plan: SubscriptionPlan;

  @Prop({ required: true })
  price: number;

  @Prop({ required: true, default: 'EGP' })
  currency: string;

  @Prop({ required: true, enum: SubscriptionStatus, default: SubscriptionStatus.PENDING })
  status: SubscriptionStatus;

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  endDate: Date;

  @Prop({ default: true })
  autoRenew: boolean;

  @Prop({ default: null })
  paymentId: string | null;

  @Prop({ default: null })
  cancelledAt: Date | null;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const SubscriptionSchema = SchemaFactory.createForClass(Subscription);

// Indexes
SubscriptionSchema.index({ tenantId: 1, studentId: 1 });
SubscriptionSchema.index({ status: 1, endDate: 1 });
SubscriptionSchema.index({ studentId: 1, status: 1 });
