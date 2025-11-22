/**
 * Payment and Transaction related types
 */

import { ICourse } from './course.types';

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

export interface ITransaction {
  _id: string;
  tenantId: string;
  userId: string;
  courseId: string | ICourse;
  provider: PaymentProvider;
  status: TransactionStatus;
  amount: number;
  currency: string;
  transactionId: string;
  providerTransactionId: string | null;
  providerOrderId: string | null;
  metadata: Record<string, any>;
  failureReason: string | null;
  completedAt: Date | null;
  refundedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// Request types
export interface ICreatePayment {
  courseId: string;
  amount: number;
  currency?: string;
}

// Response types
export interface IPaymentSession {
  paymentUrl: string;
  transactionId: string;
}

export interface IPaymentCallback {
  transactionId: string;
  success: boolean;
  amount: number;
}
