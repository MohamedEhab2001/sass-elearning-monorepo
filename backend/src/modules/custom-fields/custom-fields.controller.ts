import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { CustomFieldsService } from './custom-fields.service';
import { CreateCustomFieldDto, UpdateCustomFieldDto, ReorderCustomFieldsDto } from './dto/custom-field.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AuthenticatedRequest } from '../../common/interfaces/authenticated-request.interface';

@Controller('custom-fields')
export class CustomFieldsController {
  constructor(private readonly customFieldsService: CustomFieldsService) {}

  @Post(':tenantId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('instructor', 'admin')
  async create(
    @Param('tenantId') tenantId: string,
    @Body() createCustomFieldDto: CreateCustomFieldDto,
  ) {
    return this.customFieldsService.create(createCustomFieldDto, tenantId);
  }

  @Get(':tenantId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('instructor', 'admin')
  async findAll(
    @Param('tenantId') tenantId: string,
    @Query('activeOnly') activeOnly?: string,
  ) {
    const active = activeOnly === 'true';
    return this.customFieldsService.findAll(tenantId, active);
  }

  @Get(':tenantId/active')
  async getActiveFields(@Param('tenantId') tenantId: string) {
    // Public endpoint for signup form
    return this.customFieldsService.getActiveFieldsForSignup(tenantId);
  }

  @Get(':tenantId/:fieldId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('instructor', 'admin')
  async findById(
    @Param('tenantId') tenantId: string,
    @Param('fieldId') fieldId: string,
  ) {
    return this.customFieldsService.findById(fieldId, tenantId);
  }

  @Patch(':tenantId/:fieldId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('instructor', 'admin')
  async update(
    @Param('tenantId') tenantId: string,
    @Param('fieldId') fieldId: string,
    @Body() updateCustomFieldDto: UpdateCustomFieldDto,
  ) {
    return this.customFieldsService.update(fieldId, updateCustomFieldDto, tenantId);
  }

  @Delete(':tenantId/:fieldId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('instructor', 'admin')
  async delete(
    @Param('tenantId') tenantId: string,
    @Param('fieldId') fieldId: string,
  ) {
    await this.customFieldsService.delete(fieldId, tenantId);
    return { message: 'تم حذف الحقل المخصص بنجاح' };
  }

  @Post(':tenantId/reorder')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('instructor', 'admin')
  async reorder(
    @Param('tenantId') tenantId: string,
    @Body() reorderDto: ReorderCustomFieldsDto,
  ) {
    return this.customFieldsService.reorder(reorderDto, tenantId);
  }
}
