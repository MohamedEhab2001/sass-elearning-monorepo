import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CommissionTierDocument = CommissionTier & Document;

@Schema({ timestamps: true })
export class CommissionTier {
  @Prop({ type: Types.ObjectId, ref: 'Tenant', required: true, index: true })
  tenantId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, trim: true })
  nameAr: string; // Arabic name

  @Prop({ required: true, min: 0, default: 0 })
  minRevenue: number; // Minimum revenue to qualify for this tier

  @Prop({ default: null })
  maxRevenue: number | null; // Maximum revenue (null for highest tier)

  @Prop({ required: true, min: 0, max: 100 })
  commissionRate: number; // Commission percentage (0-100)

  @Prop({ required: true, default: 0 })
  order: number; // Display order

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const CommissionTierSchema = SchemaFactory.createForClass(CommissionTier);

// Indexes
CommissionTierSchema.index({ tenantId: 1, isActive: 1 });
CommissionTierSchema.index({ tenantId: 1, order: 1 });
CommissionTierSchema.index({ tenantId: 1, minRevenue: 1, maxRevenue: 1 });
