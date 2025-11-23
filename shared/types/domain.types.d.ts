export declare enum DomainType {
    SUBDOMAIN = "subdomain",
    CUSTOM_DOMAIN = "custom_domain"
}
export declare enum DomainStatus {
    PENDING = "pending",
    VERIFIED = "verified",
    FAILED = "failed",
    ACTIVE = "active",
    INACTIVE = "inactive"
}
export declare enum DNSRecordType {
    A = "A",
    CNAME = "CNAME",
    TXT = "TXT"
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
    subdomain?: string;
    customDomain?: string;
    status: DomainStatus;
    verificationToken?: string;
    verifiedAt?: Date;
    requiredDNSRecords?: DNSRecord[];
    sslEnabled: boolean;
    sslIssuedAt?: Date;
    sslExpiresAt?: Date;
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
