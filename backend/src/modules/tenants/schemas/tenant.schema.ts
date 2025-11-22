import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TenantDocument = Tenant & Document;

export enum TenantStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  INACTIVE = 'inactive',
}

@Schema({ timestamps: true })
export class Tenant {
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  slug: string;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  ownerId: Types.ObjectId;

  @Prop({ trim: true, default: null })
  description: string | null;

  @Prop({ default: null })
  logo: string | null;

  @Prop({ default: null })
  favicon: string | null;

  @Prop({ type: Object, default: { primary: '#3B82F6', secondary: '#8B5CF6' } })
  colors: {
    primary: string;
    secondary: string;
  };

  @Prop({ default: 'Cairo' })
  fontFamily: string;

  @Prop({ default: null })
  email: string | null;

  @Prop({ default: null })
  phone: string | null;

  @Prop({ default: null })
  address: string | null;

  @Prop({ type: Object, default: {} })
  socialMedia: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    youtube?: string;
    linkedin?: string;
  };

  @Prop({ default: false })
  subscriptionEnabled: boolean;

  @Prop({ default: null })
  monthlyPrice: number | null;

  @Prop({ default: null })
  annualPrice: number | null;

  @Prop({ default: null })
  customDomain: string | null;

  @Prop({ default: false })
  customDomainVerified: boolean;

  @Prop({ default: 0 })
  totalRevenue: number;

  @Prop({ default: 0 })
  availableBalance: number;

  @Prop({ default: 0 })
  totalCommission: number;

  @Prop({ required: true, enum: TenantStatus, default: TenantStatus.ACTIVE })
  status: TenantStatus;

  @Prop({ default: null })
  suspensionReason: string | null;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const TenantSchema = SchemaFactory.createForClass(Tenant);

// Indexes
TenantSchema.index({ slug: 1 }, { unique: true });
TenantSchema.index({ ownerId: 1 });
TenantSchema.index({ status: 1 });
