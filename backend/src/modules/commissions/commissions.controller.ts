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
} from '@nestjs/common';
import { CommissionsService } from './commissions.service';
import { CreateCommissionTierDto, UpdateCommissionTierDto, ReorderCommissionTiersDto } from './dto/commission-tier.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('commissions')
export class CommissionsController {
  constructor(private readonly commissionsService: CommissionsService) {}

  // ==================== ADMIN ENDPOINTS ====================

  @Post('tiers/:tenantId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async createTier(
    @Param('tenantId') tenantId: string,
    @Body() createCommissionTierDto: CreateCommissionTierDto,
  ) {
    return this.commissionsService.create(createCommissionTierDto, tenantId);
  }

  @Get('tiers/:tenantId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'instructor')
  async getTiers(
    @Param('tenantId') tenantId: string,
    @Query('activeOnly') activeOnly?: string,
  ) {
    return this.commissionsService.findAll(tenantId, activeOnly === 'true');
  }

  @Get('tiers/detail/:tierId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async getTier(@Param('tierId') tierId: string) {
    return this.commissionsService.findById(tierId);
  }

  @Put('tiers/:tierId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async updateTier(
    @Param('tierId') tierId: string,
    @Body() updateCommissionTierDto: UpdateCommissionTierDto,
  ) {
    return this.commissionsService.update(tierId, updateCommissionTierDto);
  }

  @Delete('tiers/:tierId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async deleteTier(@Param('tierId') tierId: string) {
    await this.commissionsService.delete(tierId);
    return { message: 'تم حذف المستوى بنجاح' };
  }

  @Post('tiers/:tenantId/reorder')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async reorderTiers(
    @Param('tenantId') tenantId: string,
    @Body() reorderDto: ReorderCommissionTiersDto,
  ) {
    await this.commissionsService.reorder(tenantId, reorderDto);
    return { message: 'تم إعادة ترتيب المستويات بنجاح' };
  }

  // ==================== CALCULATION ENDPOINTS ====================

  @Get('calculate/:tenantId')
  @UseGuards(JwtAuthGuard)
  async calculateCommission(
    @Param('tenantId') tenantId: string,
    @Query('revenue') revenue: string,
    @Query('amount') amount: string,
  ) {
    const instructorRevenue = parseFloat(revenue);
    const transactionAmount = parseFloat(amount);

    return this.commissionsService.calculateCommission(tenantId, instructorRevenue, transactionAmount);
  }

  // ==================== INSTRUCTOR ENDPOINTS ====================

  @Get('instructor-summary/:tenantId/:instructorId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'instructor')
  async getInstructorRevenueSummary(
    @Param('tenantId') tenantId: string,
    @Param('instructorId') instructorId: string,
    @Query('totalRevenue') totalRevenue: string,
    @Query('totalCommission') totalCommission: string,
  ) {
    const revenue = parseFloat(totalRevenue);
    const commission = parseFloat(totalCommission);

    return this.commissionsService.getInstructorRevenueSummary(tenantId, instructorId, revenue, commission);
  }
}
