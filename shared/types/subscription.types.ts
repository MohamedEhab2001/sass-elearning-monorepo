/**
 * Subscription related types
 */

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

export interface ISubscription {
  _id: string;
  tenantId: string;
  studentId: string;
  plan: SubscriptionPlan;
  price: number;
  currency: string;
  status: SubscriptionStatus;
  startDate: Date;
  endDate: Date;
  autoRenew: boolean;
  paymentId?: string;
  cancelledAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSubscriptionDto {
  plan: SubscriptionPlan;
  discountCode?: string;
}

export interface UpdateSubscriptionDto {
  autoRenew?: boolean;
  status?: SubscriptionStatus;
}

export interface SubscriptionPricingSettings {
  subscriptionEnabled: boolean;
  monthlyPrice: number | null;
  annualPrice: number | null;
}
