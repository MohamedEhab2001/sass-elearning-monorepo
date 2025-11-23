import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type DiscountDocument = Discount & Document;

export enum DiscountType {
  PERCENTAGE = 'percentage',
  FIXED = 'fixed',
}

export enum DiscountApplicableTo {
  COURSES = 'courses',
  SUBSCRIPTIONS = 'subscriptions',
  ALL = 'all',
}

@Schema({ timestamps: true })
export class Discount {
  @Prop({ type: Types.ObjectId, ref: 'Tenant', required: true })
  tenantId: Types.ObjectId;

  @Prop({ required: true, uppercase: true, trim: true })
  code: string;

  @Prop({ required: true, enum: DiscountType })
  type: DiscountType;

  @Prop({ required: true })
  value: number; // percentage (0-100) or fixed amount

  @Prop({ required: true, enum: DiscountApplicableTo })
  applicableTo: DiscountApplicableTo;

  @Prop({ type: [Types.ObjectId], ref: 'Course', default: [] })
  specificCourseIds: Types.ObjectId[];

  @Prop({ type: Number, default: null })
  maxUses: number | null; // null = unlimited

  @Prop({ default: 0 })
  currentUses: number;

  @Prop({ required: true })
  validFrom: Date;

  @Prop({ required: true })
  validUntil: Date;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const DiscountSchema = SchemaFactory.createForClass(Discount);

// Indexes
DiscountSchema.index({ tenantId: 1, code: 1 }, { unique: true });
DiscountSchema.index({ isActive: 1, validFrom: 1, validUntil: 1 });
