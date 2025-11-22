/**
 * Commission and Revenue Tier related types
 */

export interface ICommissionTier {
  _id: string;
  tenantId: string;
  name: string;
  nameAr: string; // Arabic name
  minRevenue: number; // Minimum revenue to qualify for this tier (in platform currency)
  maxRevenue?: number; // Maximum revenue (null for highest tier)
  commissionRate: number; // Commission percentage (0-100)
  order: number; // Display order
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICommissionCalculation {
  grossAmount: number; // Original transaction amount
  commissionRate: number; // Applied commission rate (%)
  commissionAmount: number; // Commission amount deducted
  netAmount: number; // Amount instructor receives
  tierId: string;
  tierName: string;
}

export interface IInstructorRevenueSummary {
  instructorId: string;
  tenantId: string;
  totalRevenue: number; // Gross revenue (before commission)
  totalCommission: number; // Total commission deducted
  netRevenue: number; // Net revenue (after commission)
  currentTier: ICommissionTier | null;
  nextTier: ICommissionTier | null;
  progressToNextTier?: number; // Percentage progress to next tier (0-100)
}

// DTOs
export interface CreateCommissionTierDto {
  name: string;
  nameAr: string;
  minRevenue: number;
  maxRevenue?: number;
  commissionRate: number;
}

export interface UpdateCommissionTierDto {
  name?: string;
  nameAr?: string;
  minRevenue?: number;
  maxRevenue?: number;
  commissionRate?: number;
  isActive?: boolean;
}

export interface ReorderCommissionTiersDto {
  tierOrders: {
    tierId: string;
    order: number;
  }[];
}
