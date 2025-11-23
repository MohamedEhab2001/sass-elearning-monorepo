export interface ICommissionTier {
  _id?: string;
  tenantId: string;
  minRevenue: number;
  maxRevenue: number | null;
  commissionRate: number;
  tierName: string;
  order: number;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICommissionCalculation {
  commissionRate: number;
  commissionAmount: number;
  netAmount: number;
  grossAmount: number;
  tierId?: string;
  tierName?: string;
}

export interface IInstructorRevenueSummary {
  instructorId: string;
  tenantId?: string;
  totalRevenue: number;
  totalCommission: number;
  netRevenue: number;
  currentTier?: any;
  nextTier?: any;
  progressToNextTier?: number;
  revenueToNextTier?: number;
}
