import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PageDocument = Page & Document;

export enum PageStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
}

@Schema({ _id: false })
export class PageSection {
  @Prop({ required: true })
  id: string; // Unique ID for the section within the page

  @Prop({ required: true })
  type: string; // hero, features, courses, testimonials, faq, cta, etc.

  @Prop({ required: true, default: 0 })
  order: number;

  @Prop({ type: Object, default: {} })
  props: Record<string, any>; // Section-specific properties

  @Prop({ default: true })
  visible: boolean;
}

export const PageSectionSchema = SchemaFactory.createForClass(PageSection);

@Schema({ timestamps: true })
export class Page {
  @Prop({ type: Types.ObjectId, ref: 'Tenant', required: true, index: true })
  tenantId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  title: string; // Page title (for admin reference)

  @Prop({ required: true, trim: true })
  path: string; // URL path (e.g., "/", "/about", "/contact")

  @Prop({ type: String, trim: true, default: null })
  description: string | null; // Meta description for SEO

  @Prop({ type: String, enum: PageStatus, default: PageStatus.DRAFT })
  status: PageStatus;

  @Prop({ type: [PageSectionSchema], default: [] })
  sections: PageSection[];

  @Prop({ type: Date, default: null })
  publishedAt: Date | null;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  lastModifiedBy: Types.ObjectId | null;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const PageSchema = SchemaFactory.createForClass(Page);

// Indexes
PageSchema.index({ tenantId: 1, path: 1 }, { unique: true });
PageSchema.index({ tenantId: 1, status: 1 });
PageSchema.index({ createdBy: 1 });
