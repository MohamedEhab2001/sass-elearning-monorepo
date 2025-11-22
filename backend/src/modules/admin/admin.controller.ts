import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  /**
   * Get platform statistics
   */
  @Get('stats')
  async getPlatformStats() {
    return this.adminService.getPlatformStats();
  }

  /**
   * Get all tenants with stats
   */
  @Get('tenants')
  async getAllTenants() {
    return this.adminService.getAllTenants();
  }

  /**
   * Get tenant details by ID
   */
  @Get('tenants/:tenantId')
  async getTenantById(@Param('tenantId') tenantId: string) {
    return this.adminService.getTenantById(tenantId);
  }

  /**
   * Get all instructors across platform
   */
  @Get('instructors')
  async getAllInstructors() {
    return this.adminService.getAllInstructors();
  }
}
