import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PayoutDocument = Payout & Document;

export enum PayoutStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
}

export enum PayoutMethod {
  BANK_TRANSFER = 'bank_transfer',
  PAYPAL = 'paypal',
  MOBILE_WALLET = 'mobile_wallet',
}

@Schema({ timestamps: true })
export class Payout {
  @Prop({ type: Types.ObjectId, ref: 'Tenant', required: true, index: true })
  tenantId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  instructorId: Types.ObjectId;

  @Prop({ required: true })
  amount: number;

  @Prop({ default: 'EGP' })
  currency: string;

  @Prop({ type: String, enum: PayoutStatus, default: PayoutStatus.PENDING, index: true })
  status: PayoutStatus;

  @Prop({ type: String, enum: PayoutMethod, required: true })
  method: PayoutMethod;

  @Prop({ type: Object, required: true })
  paymentDetails: {
    accountName?: string;
    accountNumber?: string;
    bankName?: string;
    iban?: string;
    paypalEmail?: string;
    mobileNumber?: string;
    [key: string]: any;
  };

  @Prop({ trim: true, default: null })
  notes: string | null;

  @Prop({ trim: true, default: null })
  rejectionReason: string | null;

  @Prop({ default: null })
  processedAt: Date | null;

  @Prop({ default: null })
  completedAt: Date | null;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  processedBy: Types.ObjectId | null;

  @Prop({ trim: true, default: null })
  transactionReference: string | null;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const PayoutSchema = SchemaFactory.createForClass(Payout);

// Indexes
PayoutSchema.index({ tenantId: 1, instructorId: 1 });
PayoutSchema.index({ status: 1, createdAt: -1 });
PayoutSchema.index({ instructorId: 1, createdAt: -1 });
