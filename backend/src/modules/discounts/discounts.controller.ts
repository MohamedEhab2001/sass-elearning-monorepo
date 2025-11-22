import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { DiscountsService } from './discounts.service';
import { CreateDiscountDto, UpdateDiscountDto, ValidateDiscountDto } from './dto/discount.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('discounts')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DiscountsController {
  constructor(private readonly discountsService: DiscountsService) {}

  @Post(':tenantId')
  @Roles('instructor', 'admin')
  async create(
    @Param('tenantId') tenantId: string,
    @Body() createDiscountDto: CreateDiscountDto,
  ) {
    return this.discountsService.create(createDiscountDto, tenantId);
  }

  @Get(':tenantId')
  @Roles('instructor', 'admin')
  async findAll(@Param('tenantId') tenantId: string) {
    return this.discountsService.findAll(tenantId);
  }

  @Get(':tenantId/:discountId')
  @Roles('instructor', 'admin')
  async findById(
    @Param('tenantId') tenantId: string,
    @Param('discountId') discountId: string,
  ) {
    return this.discountsService.findById(discountId, tenantId);
  }

  @Patch(':tenantId/:discountId')
  @Roles('instructor', 'admin')
  async update(
    @Param('tenantId') tenantId: string,
    @Param('discountId') discountId: string,
    @Body() updateDiscountDto: UpdateDiscountDto,
  ) {
    return this.discountsService.update(discountId, updateDiscountDto, tenantId);
  }

  @Delete(':tenantId/:discountId')
  @Roles('instructor', 'admin')
  async delete(
    @Param('tenantId') tenantId: string,
    @Param('discountId') discountId: string,
  ) {
    await this.discountsService.delete(discountId, tenantId);
    return { message: 'تم حذف كود الخصم بنجاح' };
  }

  @Post(':tenantId/validate')
  async validate(
    @Param('tenantId') tenantId: string,
    @Body() validateDiscountDto: ValidateDiscountDto,
  ) {
    return this.discountsService.validate(validateDiscountDto, tenantId);
  }
}
