import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserDocument = User & Document;

export enum UserRole {
  ADMIN = 'admin',
  INSTRUCTOR = 'instructor',
  STUDENT = 'student',
}

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true, trim: true })
  firstName: string;

  @Prop({ required: true, trim: true })
  lastName: string;

  @Prop({ required: true, enum: UserRole })
  role: UserRole;

  @Prop({ type: Types.ObjectId, ref: 'Tenant', default: null })
  tenantId: Types.ObjectId | null;

  @Prop({ default: false })
  isEmailVerified: boolean;

  @Prop({ default: null })
  emailVerificationToken: string | null;

  @Prop({ default: null })
  emailVerificationExpires: Date | null;

  @Prop({ default: null })
  passwordResetToken: string | null;

  @Prop({ default: null })
  passwordResetExpires: Date | null;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: null })
  lastLoginAt: Date | null;

  @Prop({ type: Object, default: {} })
  customFieldValues: Record<string, any>; // Custom field values for students

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Indexes
UserSchema.index({ email: 1 });
UserSchema.index({ tenantId: 1 });
UserSchema.index({ role: 1 });
