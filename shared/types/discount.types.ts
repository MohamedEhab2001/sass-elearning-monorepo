/**
 * Discount code related types
 */

export enum DiscountType {
  PERCENTAGE = 'percentage',
  FIXED = 'fixed',
}

export enum DiscountApplicableTo {
  COURSES = 'courses',
  SUBSCRIPTIONS = 'subscriptions',
  ALL = 'all',
}

export interface IDiscount {
  _id: string;
  tenantId: string;
  code: string;
  type: DiscountType;
  value: number; // percentage (0-100) or fixed amount
  applicableTo: DiscountApplicableTo;
  specificCourseIds?: string[]; // if applicable to specific courses only
  maxUses?: number | null; // null for unlimited
  currentUses: number;
  validFrom: Date;
  validUntil: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateDiscountDto {
  code: string;
  type: DiscountType;
  value: number;
  applicableTo: DiscountApplicableTo;
  specificCourseIds?: string[];
  maxUses?: number | null;
  validFrom: Date;
  validUntil: Date;
}

export interface UpdateDiscountDto {
  value?: number;
  maxUses?: number | null;
  validFrom?: Date;
  validUntil?: Date;
  isActive?: boolean;
}

export interface ValidateDiscountDto {
  code: string;
  applicableTo: 'course' | 'subscription';
  courseId?: string;
  amount: number;
}

export interface DiscountValidationResult {
  isValid: boolean;
  discount?: IDiscount;
  originalAmount: number;
  discountedAmount: number;
  discountAmount: number;
  message?: string;
}
