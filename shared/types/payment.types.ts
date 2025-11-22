/**
 * Payment and Transaction related types
 */

export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

export enum PaymentMethod {
  CARD = 'card',
  WALLET = 'wallet',
  CASH = 'cash',
}

export interface ITransaction {
  _id: string;
  tenantId: string;
  studentId: string;
  courseId?: string;
  subscriptionId?: string;
  amount: number;
  commission: number;
  netAmount: number;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  paymentGatewayRef: string | null;
  createdAt: Date;
  updatedAt: Date;
}
