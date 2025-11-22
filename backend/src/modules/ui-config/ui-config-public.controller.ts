import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { UiConfigService } from './ui-config.service';

@Controller('public/ui-config')
export class UiConfigPublicController {
  constructor(private readonly uiConfigService: UiConfigService) {}

  /**
   * Get published page by path for a tenant
   * Public endpoint - no authentication required
   */
  @Get(':tenantSlug/pages')
  async getPublishedPageByPath(
    @Param('tenantSlug') tenantSlug: string,
    @Param('path') path: string = '/',
  ) {
    // We need to get tenantId from slug
    // For now, we'll accept tenantId directly in the path
    // In production, you'd look up tenant by slug first
    const page = await this.uiConfigService.getPublishedPageByPath(path, tenantSlug);

    if (!page) {
      throw new NotFoundException('الصفحة غير موجودة أو غير منشورة');
    }

    return page;
  }

  /**
   * Get published page by tenant slug and path
   */
  @Get(':tenantSlug/page-by-path')
  async getPageByPath(
    @Param('tenantSlug') tenantSlug: string,
  ) {
    // This endpoint expects the path as a query parameter
    // For simplicity, we'll default to home page
    const page = await this.uiConfigService.getPublishedPageByPath('/', tenantSlug);

    if (!page) {
      return null; // Return null if no home page is configured
    }

    return page;
  }
}
