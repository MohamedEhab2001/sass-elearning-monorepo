import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TransactionDocument = Transaction & Document;

export enum TransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  CANCELLED = 'cancelled',
}

export enum PaymentProvider {
  PAYMOB = 'paymob',
  STRIPE = 'stripe',
  PAYPAL = 'paypal',
}

@Schema({ timestamps: true })
export class Transaction {
  @Prop({ type: Types.ObjectId, ref: 'Tenant', required: true, index: true })
  tenantId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Course', required: true, index: true })
  courseId: Types.ObjectId;

  @Prop({ type: String, enum: PaymentProvider, required: true })
  provider: PaymentProvider;

  @Prop({ type: String, enum: TransactionStatus, default: TransactionStatus.PENDING })
  status: TransactionStatus;

  @Prop({ type: Number, required: true })
  amount: number;

  @Prop({ type: String, default: 'EGP' })
  currency: string;

  @Prop({ type: String, required: true, unique: true })
  transactionId: string;

  @Prop({ type: String, default: null })
  providerTransactionId: string | null;

  @Prop({ type: String, default: null })
  providerOrderId: string | null;

  @Prop({ type: Object, default: {} })
  metadata: Record<string, any>;

  @Prop({ type: String, default: null })
  failureReason: string | null;

  @Prop({ type: Date, default: null })
  completedAt: Date | null;

  @Prop({ type: Date, default: null })
  refundedAt: Date | null;

  createdAt: Date;
  updatedAt: Date;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);

// Indexes for better query performance
TransactionSchema.index({ tenantId: 1, userId: 1 });
TransactionSchema.index({ transactionId: 1 }, { unique: true });
TransactionSchema.index({ providerTransactionId: 1 });
TransactionSchema.index({ status: 1 });
