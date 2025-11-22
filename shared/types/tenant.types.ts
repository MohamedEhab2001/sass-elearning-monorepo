/**
 * Tenant (Academy) related types
 */

import { Status } from './common.types';

export interface ITenant {
  _id: string;
  slug: string;
  name: string;
  ownerId: string;
  description: string | null;
  logo: string | null;
  favicon: string | null;
  colors: {
    primary: string;
    secondary: string;
  };
  fontFamily: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  socialMedia: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    youtube?: string;
    linkedin?: string;
  };
  subscriptionEnabled: boolean;
  monthlyPrice: number | null;
  annualPrice: number | null;
  customDomain: string | null;
  customDomainVerified: boolean;
  totalRevenue: number;
  availableBalance: number;
  totalCommission: number;
  status: Status;
  suspensionReason: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITenantCreate {
  slug: string;
  name: string;
  ownerId: string;
  description?: string;
}

export interface ITenantUpdate {
  name?: string;
  description?: string;
  logo?: string;
  favicon?: string;
  colors?: {
    primary?: string;
    secondary?: string;
  };
  fontFamily?: string;
  email?: string;
  phone?: string;
  address?: string;
  socialMedia?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    youtube?: string;
    linkedin?: string;
  };
  subscriptionEnabled?: boolean;
  monthlyPrice?: number;
  annualPrice?: number;
}
