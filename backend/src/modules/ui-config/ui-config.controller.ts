import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  HttpCode,
  Patch,
} from '@nestjs/common';
import { UiConfigService } from './ui-config.service';
import { CreatePageDto, UpdatePageDto, UpdatePageSectionsDto, PublishPageDto } from './dto/page.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('ui-config')
export class UiConfigController {
  constructor(private readonly uiConfigService: UiConfigService) {}

  // ============ ADMIN ENDPOINTS ============

  /**
   * Create a new page
   */
  @Post('pages')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'instructor')
  async createPage(@Body() createPageDto: CreatePageDto, @Request() req) {
    return this.uiConfigService.createPage(
      createPageDto,
      req.user.userId,
      req.user.tenantId,
    );
  }

  /**
   * Get all pages for tenant
   */
  @Get('pages')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'instructor')
  async getPages(@Request() req) {
    return this.uiConfigService.getPages(req.user.tenantId);
  }

  /**
   * Get a single page by ID
   */
  @Get('pages/:pageId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'instructor')
  async getPageById(@Param('pageId') pageId: string, @Request() req) {
    return this.uiConfigService.getPageById(pageId, req.user.tenantId);
  }

  /**
   * Update a page
   */
  @Put('pages/:pageId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'instructor')
  async updatePage(
    @Param('pageId') pageId: string,
    @Body() updatePageDto: UpdatePageDto,
    @Request() req,
  ) {
    return this.uiConfigService.updatePage(
      pageId,
      updatePageDto,
      req.user.userId,
      req.user.tenantId,
    );
  }

  /**
   * Update page sections
   */
  @Patch('pages/:pageId/sections')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'instructor')
  async updatePageSections(
    @Param('pageId') pageId: string,
    @Body() updateSectionsDto: UpdatePageSectionsDto,
    @Request() req,
  ) {
    return this.uiConfigService.updatePageSections(
      pageId,
      updateSectionsDto,
      req.user.userId,
      req.user.tenantId,
    );
  }

  /**
   * Publish or unpublish a page
   */
  @Patch('pages/:pageId/publish')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'instructor')
  async publishPage(
    @Param('pageId') pageId: string,
    @Body() publishPageDto: PublishPageDto,
    @Request() req,
  ) {
    return this.uiConfigService.publishPage(
      pageId,
      publishPageDto.status,
      req.user.userId,
      req.user.tenantId,
    );
  }

  /**
   * Delete a page
   */
  @Delete('pages/:pageId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'instructor')
  @HttpCode(204)
  async deletePage(@Param('pageId') pageId: string, @Request() req) {
    await this.uiConfigService.deletePage(pageId, req.user.tenantId);
  }

  /**
   * Duplicate a page
   */
  @Post('pages/:pageId/duplicate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'instructor')
  async duplicatePage(@Param('pageId') pageId: string, @Request() req) {
    return this.uiConfigService.duplicatePage(
      pageId,
      req.user.userId,
      req.user.tenantId,
    );
  }
}
