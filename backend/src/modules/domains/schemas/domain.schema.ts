import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { DomainType, DomainStatus, DNSRecord } from '../../../../../shared/types/domain.types';

export type DomainDocument = Domain & Document;

@Schema({ timestamps: true })
export class Domain {
  @Prop({ type: Types.ObjectId, ref: 'Tenant', required: true, index: true })
  tenantId: Types.ObjectId;

  @Prop({ type: String, enum: DomainType, required: true })
  type: DomainType;

  // Subdomain (unique across platform)
  @Prop({ type: String, lowercase: true, trim: true, sparse: true, unique: true })
  subdomain: string;

  // Custom domain (unique across platform)
  @Prop({ type: String, lowercase: true, trim: true, sparse: true, unique: true })
  customDomain: string;

  // Verification
  @Prop({ type: String, enum: DomainStatus, default: DomainStatus.PENDING })
  status: DomainStatus;

  @Prop({ type: String })
  verificationToken: string;

  @Prop({ type: Date })
  verifiedAt: Date;

  // DNS records required for custom domain
  @Prop({ type: Array, default: [] })
  requiredDNSRecords: DNSRecord[];

  // SSL
  @Prop({ type: Boolean, default: false })
  sslEnabled: boolean;

  @Prop({ type: Date })
  sslIssuedAt: Date;

  @Prop({ type: Date })
  sslExpiresAt: Date;

  // Metadata
  @Prop({ type: Boolean, default: false })
  isPrimary: boolean;

  @Prop({ type: Boolean, default: true })
  isActive: boolean;

  @Prop({ type: Date })
  lastCheckedAt: Date;
}

export const DomainSchema = SchemaFactory.createForClass(Domain);

// Indexes
DomainSchema.index({ tenantId: 1, isPrimary: 1 });
DomainSchema.index({ subdomain: 1 }, { sparse: true });
DomainSchema.index({ customDomain: 1 }, { sparse: true });
DomainSchema.index({ status: 1 });

// Validation: Ensure either subdomain or customDomain is present
DomainSchema.pre('save', function (next) {
  if (!this.subdomain && !this.customDomain) {
    next(new Error('Either subdomain or customDomain must be provided'));
  }
  if (this.subdomain && this.customDomain) {
    next(new Error('Cannot have both subdomain and customDomain on same record'));
  }
  next();
});
