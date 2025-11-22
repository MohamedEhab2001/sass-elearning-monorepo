import {
  Controller,
  Get,
  Param,
  Query,
  Headers,
  BadRequestException,
} from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CourseStatus } from './schemas/course.schema';
import { TenantsService } from '../tenants/tenants.service';

@Controller('public/courses')
export class PublicCoursesController {
  constructor(
    private readonly coursesService: CoursesService,
    private readonly tenantsService: TenantsService,
  ) {}

  /**
   * Get tenant ID from slug (helper method)
   */
  private async getTenantIdFromSlug(tenantSlug: string): Promise<string> {
    const tenant = await this.tenantsService.findBySlug(tenantSlug);
    if (!tenant) {
      throw new BadRequestException('المنصة غير موجودة');
    }
    return tenant._id.toString();
  }

  /**
   * Get all published courses for a tenant (public catalog)
   */
  @Get('catalog/:tenantSlug')
  async getPublicCatalog(
    @Param('tenantSlug') tenantSlug: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('category') category?: string,
    @Query('level') level?: string,
    @Query('isFree') isFree?: string,
  ) {
    const tenantId = await this.getTenantIdFromSlug(tenantSlug);
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 12;

    // Only show published courses
    const result = await this.coursesService.findAll(
      tenantId,
      undefined, // No instructor filter
      pageNum,
      limitNum,
      CourseStatus.PUBLISHED,
      search,
    );

    // Apply additional filters
    let filteredCourses = result.courses;

    if (category) {
      filteredCourses = filteredCourses.filter((c) => c.category === category);
    }

    if (level) {
      filteredCourses = filteredCourses.filter((c) => c.level === level);
    }

    if (isFree === 'true') {
      filteredCourses = filteredCourses.filter((c) => c.isFree);
    } else if (isFree === 'false') {
      filteredCourses = filteredCourses.filter((c) => !c.isFree);
    }

    return {
      courses: filteredCourses,
      total: filteredCourses.length,
      page: pageNum,
      totalPages: Math.ceil(filteredCourses.length / limitNum),
    };
  }

  /**
   * Get a single published course by slug (public endpoint)
   */
  @Get(':tenantSlug/:courseSlug')
  async getPublicCourse(
    @Param('tenantSlug') tenantSlug: string,
    @Param('courseSlug') courseSlug: string,
  ) {
    const tenantId = await this.getTenantIdFromSlug(tenantSlug);
    return this.coursesService.findBySlug(courseSlug, tenantId);
  }

  /**
   * Get featured/popular courses for a tenant
   */
  @Get('featured/:tenantSlug')
  async getFeaturedCourses(
    @Param('tenantSlug') tenantSlug: string,
    @Query('limit') limit?: string,
  ) {
    const tenantId = await this.getTenantIdFromSlug(tenantSlug);
    const limitNum = limit ? parseInt(limit, 10) : 6;

    const result = await this.coursesService.findAll(
      tenantId,
      undefined,
      1,
      limitNum,
      CourseStatus.PUBLISHED,
    );

    // Sort by enrollment count and rating
    const sortedCourses = result.courses.sort((a, b) => {
      const scoreA = a.enrollmentCount * 0.7 + a.averageRating * 0.3;
      const scoreB = b.enrollmentCount * 0.7 + b.averageRating * 0.3;
      return scoreB - scoreA;
    });

    return {
      courses: sortedCourses.slice(0, limitNum),
      total: sortedCourses.length,
    };
  }

  /**
   * Get categories available in the catalog
   */
  @Get('categories/:tenantSlug')
  async getCategories(@Param('tenantSlug') tenantSlug: string) {
    const tenantId = await this.getTenantIdFromSlug(tenantSlug);

    const courses = await this.coursesService.findAll(
      tenantId,
      undefined,
      1,
      1000, // Get all to extract categories
      CourseStatus.PUBLISHED,
    );

    const categories = [...new Set(courses.courses.map((c) => c.category).filter(Boolean))];

    return { categories };
  }
}
