/**
 * Domain & Subdomain Types
 *
 * Types for managing tenant domains, subdomains, and custom domain configuration
 */

export enum DomainType {
  SUBDOMAIN = 'subdomain',
  CUSTOM_DOMAIN = 'custom_domain',
}

export enum DomainStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  FAILED = 'failed',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export enum DNSRecordType {
  A = 'A',
  CNAME = 'CNAME',
  TXT = 'TXT',
}

export interface DNSRecord {
  type: DNSRecordType;
  name: string;
  value: string;
  ttl?: number;
}

export interface IDomain {
  _id: string;
  tenantId: string;
  type: DomainType;

  // Subdomain (e.g., 'academy-name' from 'academy-name.platform.com')
  subdomain?: string;

  // Custom domain (e.g., 'www.academy-name.com')
  customDomain?: string;

  // Verification
  status: DomainStatus;
  verificationToken?: string;
  verifiedAt?: Date;

  // DNS records required for custom domain
  requiredDNSRecords?: DNSRecord[];

  // SSL
  sslEnabled: boolean;
  sslIssuedAt?: Date;
  sslExpiresAt?: Date;

  // Metadata
  isPrimary: boolean;
  isActive: boolean;
  lastCheckedAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

export interface ISubdomainAvailability {
  subdomain: string;
  available: boolean;
  suggestions?: string[];
}

export interface IDomainVerificationResult {
  verified: boolean;
  records: {
    type: DNSRecordType;
    required: string;
    actual?: string;
    valid: boolean;
  }[];
  message: string;
}

export interface ISSLCertificate {
  domain: string;
  issued: boolean;
  issuedAt?: Date;
  expiresAt?: Date;
  renewalRequired: boolean;
}
