import { Injectable, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { Domain, DomainDocument } from './schemas/domain.schema';
import { CreateSubdomainDto, CreateCustomDomainDto, UpdateDomainDto } from './dto/domain.dto';
import {
  DomainType,
  DomainStatus,
  DNSRecordType,
  ISubdomainAvailability,
  IDomainVerificationResult,
  ISSLCertificate,
} from '../../../../shared/types/domain.types';
import * as crypto from 'crypto';
import * as dns from 'dns';
import { promisify } from 'util';

const resolveTxt = promisify(dns.resolveTxt);
const resolve4 = promisify(dns.resolve4);
const resolveCname = promisify(dns.resolveCname);

@Injectable()
export class DomainsService {
  private readonly platformDomain: string;
  private readonly platformIP: string;

  constructor(
    @InjectModel(Domain.name) private domainModel: Model<DomainDocument>,
    private configService: ConfigService,
  ) {
    this.platformDomain = this.configService.get<string>('PLATFORM_DOMAIN') || 'platform.com';
    this.platformIP = this.configService.get<string>('PLATFORM_IP') || '0.0.0.0';
  }

  // ============================================================================
  // SUBDOMAIN MANAGEMENT
  // ============================================================================

  /**
   * Check if subdomain is available
   */
  async checkSubdomainAvailability(subdomain: string): Promise<ISubdomainAvailability> {
    const normalizedSubdomain = subdomain.toLowerCase().trim();

    // Check reserved subdomains
    const reserved = ['www', 'api', 'admin', 'app', 'mail', 'ftp', 'localhost', 'dev', 'staging', 'test'];
    if (reserved.includes(normalizedSubdomain)) {
      return {
        subdomain: normalizedSubdomain,
        available: false,
      };
    }

    // Check if already taken
    const existing = await this.domainModel.findOne({ subdomain: normalizedSubdomain }).exec();

    if (existing) {
      // Generate suggestions
      const suggestions = await this.generateSubdomainSuggestions(normalizedSubdomain);
      return {
        subdomain: normalizedSubdomain,
        available: false,
        suggestions,
      };
    }

    return {
      subdomain: normalizedSubdomain,
      available: true,
    };
  }

  /**
   * Generate subdomain suggestions
   */
  private async generateSubdomainSuggestions(subdomain: string): Promise<string[]> {
    const suggestions: string[] = [];
    const suffixes = ['academy', 'edu', 'online', 'learn', '2024', '2025'];

    for (const suffix of suffixes) {
      const suggestion = `${subdomain}-${suffix}`;
      const available = await this.checkSubdomainAvailability(suggestion);
      if (available.available) {
        suggestions.push(suggestion);
        if (suggestions.length >= 3) break;
      }
    }

    return suggestions;
  }

  /**
   * Create subdomain for tenant
   */
  async createSubdomain(
    createSubdomainDto: CreateSubdomainDto,
    tenantId: string,
  ): Promise<DomainDocument> {
    const { subdomain } = createSubdomainDto;

    // Check availability
    const availability = await this.checkSubdomainAvailability(subdomain);
    if (!availability.available) {
      throw new ConflictException('Subdomain is not available');
    }

    // Check if tenant already has a subdomain
    const existingSubdomain = await this.domainModel.findOne({
      tenantId: new Types.ObjectId(tenantId),
      type: DomainType.SUBDOMAIN,
    }).exec();

    if (existingSubdomain) {
      throw new ConflictException('Tenant already has a subdomain. Use update instead.');
    }

    // Create subdomain
    const domain = new this.domainModel({
      tenantId: new Types.ObjectId(tenantId),
      type: DomainType.SUBDOMAIN,
      subdomain: subdomain.toLowerCase(),
      status: DomainStatus.ACTIVE, // Subdomains are immediately active
      isPrimary: true,
      isActive: true,
      verifiedAt: new Date(),
    });

    return domain.save();
  }

  /**
   * Update subdomain
   */
  async updateSubdomain(
    tenantId: string,
    newSubdomain: string,
  ): Promise<DomainDocument> {
    // Check availability
    const availability = await this.checkSubdomainAvailability(newSubdomain);
    if (!availability.available) {
      throw new ConflictException('Subdomain is not available');
    }

    // Find existing subdomain
    const existingSubdomain = await this.domainModel.findOne({
      tenantId: new Types.ObjectId(tenantId),
      type: DomainType.SUBDOMAIN,
    }).exec();

    if (!existingSubdomain) {
      throw new NotFoundException('Tenant does not have a subdomain');
    }

    // Update subdomain
    existingSubdomain.subdomain = newSubdomain.toLowerCase();

    return existingSubdomain.save();
  }

  // ============================================================================
  // CUSTOM DOMAIN MANAGEMENT
  // ============================================================================

  /**
   * Add custom domain for tenant
   */
  async addCustomDomain(
    createCustomDomainDto: CreateCustomDomainDto,
    tenantId: string,
  ): Promise<DomainDocument> {
    const { customDomain } = createCustomDomainDto;

    // Check if domain already exists
    const existing = await this.domainModel.findOne({
      customDomain: customDomain.toLowerCase(),
    }).exec();

    if (existing) {
      throw new ConflictException('Custom domain is already in use');
    }

    // Generate verification token
    const verificationToken = this.generateVerificationToken();

    // Determine required DNS records
    const requiredDNSRecords = [
      {
        type: DNSRecordType.A,
        name: '@',
        value: this.platformIP,
      },
      {
        type: DNSRecordType.A,
        name: 'www',
        value: this.platformIP,
      },
      {
        type: DNSRecordType.TXT,
        name: '_verification',
        value: verificationToken,
      },
    ];

    // Create custom domain record
    const domain = new this.domainModel({
      tenantId: new Types.ObjectId(tenantId),
      type: DomainType.CUSTOM_DOMAIN,
      customDomain: customDomain.toLowerCase(),
      status: DomainStatus.PENDING,
      verificationToken,
      requiredDNSRecords,
      isPrimary: false,
      isActive: false,
    });

    return domain.save();
  }

  /**
   * Verify custom domain DNS records
   */
  async verifyCustomDomain(domainId: string): Promise<IDomainVerificationResult> {
    const domain = await this.domainModel.findById(domainId).exec();

    if (!domain) {
      throw new NotFoundException('Domain not found');
    }

    if (domain.type !== DomainType.CUSTOM_DOMAIN) {
      throw new BadRequestException('Only custom domains require verification');
    }

    const customDomain = domain.customDomain!;
    const verificationResults: IDomainVerificationResult['records'] = [];
    let allValid = true;

    // Verify each required DNS record
    for (const record of domain.requiredDNSRecords) {
      try {
        let actualValue: string | undefined;
        let valid = false;

        if (record.type === DNSRecordType.A) {
          const hostname = record.name === '@' ? customDomain : `${record.name}.${customDomain}`;
          const addresses = await resolve4(hostname);
          actualValue = addresses[0];
          valid = addresses.includes(record.value);
        } else if (record.type === DNSRecordType.CNAME) {
          const hostname = record.name === '@' ? customDomain : `${record.name}.${customDomain}`;
          const cnames = await resolveCname(hostname);
          actualValue = cnames[0];
          valid = cnames.includes(record.value);
        } else if (record.type === DNSRecordType.TXT) {
          const hostname = record.name === '@' ? customDomain : `${record.name}.${customDomain}`;
          const txtRecords = await resolveTxt(hostname);
          actualValue = txtRecords.flat()[0];
          valid = txtRecords.flat().includes(record.value);
        }

        verificationResults.push({
          type: record.type,
          required: record.value,
          actual: actualValue,
          valid,
        });

        if (!valid) allValid = false;
      } catch (error) {
        verificationResults.push({
          type: record.type,
          required: record.value,
          valid: false,
        });
        allValid = false;
      }
    }

    // Update domain status
    if (allValid) {
      domain.status = DomainStatus.VERIFIED;
      domain.verifiedAt = new Date();
      domain.isActive = true;
      await domain.save();
    } else {
      domain.status = DomainStatus.FAILED;
      domain.lastCheckedAt = new Date();
      await domain.save();
    }

    return {
      verified: allValid,
      records: verificationResults,
      message: allValid
        ? 'Domain verified successfully'
        : 'DNS records do not match required configuration',
    };
  }

  /**
   * Remove custom domain
   */
  async removeCustomDomain(domainId: string, tenantId: string): Promise<void> {
    const domain = await this.domainModel.findOne({
      _id: domainId,
      tenantId: new Types.ObjectId(tenantId),
      type: DomainType.CUSTOM_DOMAIN,
    }).exec();

    if (!domain) {
      throw new NotFoundException('Custom domain not found');
    }

    await domain.deleteOne();
  }

  // ============================================================================
  // DOMAIN QUERIES
  // ============================================================================

  /**
   * Get all domains for tenant
   */
  async findByTenant(tenantId: string): Promise<DomainDocument[]> {
    return this.domainModel
      .find({ tenantId: new Types.ObjectId(tenantId) })
      .sort({ isPrimary: -1, createdAt: -1 })
      .exec();
  }

  /**
   * Get domain by ID
   */
  async findById(domainId: string): Promise<DomainDocument> {
    const domain = await this.domainModel.findById(domainId).exec();

    if (!domain) {
      throw new NotFoundException('Domain not found');
    }

    return domain;
  }

  /**
   * Find tenant by domain or subdomain
   */
  async findTenantByDomain(hostname: string): Promise<string | null> {
    const normalizedHostname = hostname.toLowerCase();

    // Try to match custom domain (exact match or www variant)
    let domain = await this.domainModel
      .findOne({
        customDomain: normalizedHostname,
        status: DomainStatus.VERIFIED,
        isActive: true,
      })
      .exec();

    // Try without www
    if (!domain && normalizedHostname.startsWith('www.')) {
      const withoutWww = normalizedHostname.substring(4);
      domain = await this.domainModel
        .findOne({
          customDomain: withoutWww,
          status: DomainStatus.VERIFIED,
          isActive: true,
        })
        .exec();
    }

    // Try to extract subdomain from platform domain
    if (!domain && normalizedHostname.endsWith(`.${this.platformDomain}`)) {
      const subdomain = normalizedHostname.replace(`.${this.platformDomain}`, '');
      domain = await this.domainModel
        .findOne({
          subdomain,
          status: DomainStatus.ACTIVE,
          isActive: true,
        })
        .exec();
    }

    return domain ? domain.tenantId.toString() : null;
  }

  /**
   * Update domain settings
   */
  async update(
    domainId: string,
    updateDomainDto: UpdateDomainDto,
    tenantId: string,
  ): Promise<DomainDocument> {
    const domain = await this.domainModel.findOne({
      _id: domainId,
      tenantId: new Types.ObjectId(tenantId),
    }).exec();

    if (!domain) {
      throw new NotFoundException('Domain not found');
    }

    // If setting as primary, unset other primary domains
    if (updateDomainDto.isPrimary === true) {
      await this.domainModel.updateMany(
        {
          tenantId: new Types.ObjectId(tenantId),
          _id: { $ne: domainId },
        },
        { isPrimary: false },
      ).exec();
    }

    Object.assign(domain, updateDomainDto);
    return domain.save();
  }

  // ============================================================================
  // SSL CERTIFICATE MANAGEMENT
  // ============================================================================

  /**
   * Get SSL certificate status for domain
   * Note: This is a placeholder. Actual implementation would integrate with
   * Let's Encrypt or similar service.
   */
  async getSSLStatus(domainId: string): Promise<ISSLCertificate> {
    const domain = await this.findById(domainId);

    const domainName = domain.customDomain || `${domain.subdomain}.${this.platformDomain}`;

    return {
      domain: domainName,
      issued: domain.sslEnabled,
      issuedAt: domain.sslIssuedAt,
      expiresAt: domain.sslExpiresAt,
      renewalRequired: domain.sslExpiresAt
        ? new Date(domain.sslExpiresAt).getTime() - Date.now() < 30 * 24 * 60 * 60 * 1000
        : false,
    };
  }

  /**
   * Issue SSL certificate for domain
   * Note: This is a placeholder. Actual implementation would call Let's Encrypt API
   */
  async issueSSLCertificate(domainId: string): Promise<void> {
    const domain = await this.findById(domainId);

    // Verify domain is verified for custom domains
    if (domain.type === DomainType.CUSTOM_DOMAIN && domain.status !== DomainStatus.VERIFIED) {
      throw new BadRequestException('Domain must be verified before issuing SSL certificate');
    }

    // TODO: Integrate with Let's Encrypt or similar service
    // For now, just mark as enabled with 90-day validity
    domain.sslEnabled = true;
    domain.sslIssuedAt = new Date();
    domain.sslExpiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);

    await domain.save();
  }

  // ============================================================================
  // HELPERS
  // ============================================================================

  /**
   * Generate verification token for custom domain
   */
  private generateVerificationToken(): string {
    return `verify-${crypto.randomBytes(16).toString('hex')}`;
  }
}
