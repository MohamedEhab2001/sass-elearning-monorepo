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

// Payout types
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

export interface IPayout {
  _id: string;
  tenantId: string;
  instructorId: string;
  amount: number;
  currency: string;
  status: PayoutStatus;
  method: PayoutMethod;
  paymentDetails: {
    accountName?: string;
    accountNumber?: string;
    bankName?: string;
    iban?: string;
    paypalEmail?: string;
    mobileNumber?: string;
    [key: string]: any;
  };
  notes: string | null;
  rejectionReason: string | null;
  processedAt: Date | null;
  completedAt: Date | null;
  processedBy: string | null;
  transactionReference: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreatePayout {
  amount: number;
  method: PayoutMethod;
  paymentDetails: {
    accountName?: string;
    accountNumber?: string;
    bankName?: string;
    iban?: string;
    paypalEmail?: string;
    mobileNumber?: string;
  };
  notes?: string;
}

export interface IRevenueSummary {
  totalRevenue: number;
  totalCommission: number;
  netRevenue: number;
  availableBalance: number;
  pendingPayouts: number;
  completedPayouts: number;
  totalStudents: number;
  totalCourses: number;
}

export interface IRevenueStats {
  period: string;
  revenue: number;
  students: number;
}
