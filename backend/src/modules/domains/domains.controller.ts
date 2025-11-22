import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { DomainsService } from './domains.service';
import {
  CreateSubdomainDto,
  CreateCustomDomainDto,
  UpdateDomainDto,
  CheckSubdomainDto,
} from './dto/domain.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('domains')
export class DomainsController {
  constructor(private readonly domainsService: DomainsService) {}

  // ==================== SUBDOMAIN ENDPOINTS ====================

  /**
   * Check if subdomain is available
   */
  @Get('subdomain/check')
  @UseGuards(JwtAuthGuard)
  async checkSubdomainAvailability(@Query('subdomain') subdomain: string) {
    return this.domainsService.checkSubdomainAvailability(subdomain);
  }

  /**
   * Create subdomain for tenant
   */
  @Post('subdomain/:tenantId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'instructor')
  async createSubdomain(
    @Param('tenantId') tenantId: string,
    @Body() createSubdomainDto: CreateSubdomainDto,
    @Request() req: any,
  ) {
    // Instructors can only create subdomain for their own tenant
    if (req.user.role === 'instructor' && req.user.tenantId !== tenantId) {
      throw new Error('Unauthorized');
    }

    return this.domainsService.createSubdomain(createSubdomainDto, tenantId);
  }

  /**
   * Update subdomain for tenant
   */
  @Put('subdomain/:tenantId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'instructor')
  async updateSubdomain(
    @Param('tenantId') tenantId: string,
    @Body() createSubdomainDto: CreateSubdomainDto,
    @Request() req: any,
  ) {
    // Instructors can only update subdomain for their own tenant
    if (req.user.role === 'instructor' && req.user.tenantId !== tenantId) {
      throw new Error('Unauthorized');
    }

    return this.domainsService.updateSubdomain(tenantId, createSubdomainDto.subdomain);
  }

  // ==================== CUSTOM DOMAIN ENDPOINTS ====================

  /**
   * Add custom domain for tenant
   */
  @Post('custom/:tenantId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'instructor')
  async addCustomDomain(
    @Param('tenantId') tenantId: string,
    @Body() createCustomDomainDto: CreateCustomDomainDto,
    @Request() req: any,
  ) {
    // Instructors can only add custom domain for their own tenant
    if (req.user.role === 'instructor' && req.user.tenantId !== tenantId) {
      throw new Error('Unauthorized');
    }

    return this.domainsService.addCustomDomain(createCustomDomainDto, tenantId);
  }

  /**
   * Verify custom domain DNS records
   */
  @Post('custom/:domainId/verify')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'instructor')
  async verifyCustomDomain(@Param('domainId') domainId: string) {
    return this.domainsService.verifyCustomDomain(domainId);
  }

  /**
   * Remove custom domain
   */
  @Delete('custom/:domainId/:tenantId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'instructor')
  async removeCustomDomain(
    @Param('domainId') domainId: string,
    @Param('tenantId') tenantId: string,
    @Request() req: any,
  ) {
    // Instructors can only remove custom domain for their own tenant
    if (req.user.role === 'instructor' && req.user.tenantId !== tenantId) {
      throw new Error('Unauthorized');
    }

    await this.domainsService.removeCustomDomain(domainId, tenantId);
    return { message: 'تم حذف النطاق المخصص بنجاح' };
  }

  // ==================== DOMAIN QUERIES ====================

  /**
   * Get all domains for tenant
   */
  @Get('tenant/:tenantId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'instructor')
  async getTenantDomains(
    @Param('tenantId') tenantId: string,
    @Request() req: any,
  ) {
    // Instructors can only view domains for their own tenant
    if (req.user.role === 'instructor' && req.user.tenantId !== tenantId) {
      throw new Error('Unauthorized');
    }

    return this.domainsService.findByTenant(tenantId);
  }

  /**
   * Get domain by ID
   */
  @Get(':domainId')
  @UseGuards(JwtAuthGuard)
  async getDomain(@Param('domainId') domainId: string) {
    return this.domainsService.findById(domainId);
  }

  /**
   * Update domain settings
   */
  @Put(':domainId/:tenantId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'instructor')
  async updateDomain(
    @Param('domainId') domainId: string,
    @Param('tenantId') tenantId: string,
    @Body() updateDomainDto: UpdateDomainDto,
    @Request() req: any,
  ) {
    // Instructors can only update domains for their own tenant
    if (req.user.role === 'instructor' && req.user.tenantId !== tenantId) {
      throw new Error('Unauthorized');
    }

    return this.domainsService.update(domainId, updateDomainDto, tenantId);
  }

  // ==================== SSL CERTIFICATE ENDPOINTS ====================

  /**
   * Get SSL certificate status
   */
  @Get(':domainId/ssl/status')
  @UseGuards(JwtAuthGuard)
  async getSSLStatus(@Param('domainId') domainId: string) {
    return this.domainsService.getSSLStatus(domainId);
  }

  /**
   * Issue SSL certificate for domain
   */
  @Post(':domainId/ssl/issue')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'instructor')
  async issueSSLCertificate(@Param('domainId') domainId: string) {
    await this.domainsService.issueSSLCertificate(domainId);
    return { message: 'تم إصدار شهادة SSL بنجاح' };
  }

  // ==================== PUBLIC ENDPOINT ====================

  /**
   * Find tenant by domain (used by middleware)
   * This endpoint does not require authentication
   */
  @Get('resolve/tenant')
  async resolveTenant(@Query('hostname') hostname: string) {
    const tenantId = await this.domainsService.findTenantByDomain(hostname);
    return { tenantId };
  }
}
