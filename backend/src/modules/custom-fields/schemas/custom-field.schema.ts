import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CustomFieldDocument = CustomField & Document;

export enum CustomFieldType {
  TEXT = 'text',
  SELECT = 'select',
  NUMBER = 'number',
  DATE = 'date',
  EMAIL = 'email',
  PHONE = 'phone',
}

@Schema({ timestamps: true })
export class CustomField {
  @Prop({ type: Types.ObjectId, ref: 'Tenant', required: true, index: true })
  tenantId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  fieldName: string; // Internal key (e.g., "company_name")

  @Prop({ required: true })
  fieldLabel: string; // Display label in Arabic (e.g., "اسم الشركة")

  @Prop({ required: true, enum: CustomFieldType })
  fieldType: CustomFieldType;

  @Prop({ type: [String], default: [] })
  options: string[]; // For SELECT type

  @Prop({ default: false })
  required: boolean;

  @Prop({ type: String, default: null })
  placeholder: string | null;

  @Prop({ required: true, default: 0 })
  order: number; // Display order

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const CustomFieldSchema = SchemaFactory.createForClass(CustomField);

// Indexes
CustomFieldSchema.index({ tenantId: 1, order: 1 });
CustomFieldSchema.index({ tenantId: 1, fieldName: 1 }, { unique: true });
CustomFieldSchema.index({ tenantId: 1, isActive: 1 });
