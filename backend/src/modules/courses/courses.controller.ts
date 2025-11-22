import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CreateCourseDto, UpdateCourseDto, PublishCourseDto } from './dto/course.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CourseStatus } from './schemas/course.schema';

@Controller('courses')
@UseGuards(JwtAuthGuard)
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  /**
   * Create a new course (Instructor only)
   */
  @Post()
  @UseGuards(RolesGuard)
  @Roles('instructor', 'admin')
  async create(@Body() createCourseDto: CreateCourseDto, @Request() req) {
    return this.coursesService.create(
      createCourseDto,
      req.user.userId,
      req.user.tenantId,
    );
  }

  /**
   * Get all courses for the tenant
   */
  @Get()
  async findAll(
    @Request() req,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: CourseStatus,
    @Query('search') search?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;

    // If user is instructor, only show their courses
    const instructorId = req.user.role === 'instructor' ? req.user.userId : undefined;

    return this.coursesService.findAll(
      req.user.tenantId,
      instructorId,
      pageNum,
      limitNum,
      status,
      search,
    );
  }

  /**
   * Get instructor's course statistics
   */
  @Get('stats')
  @UseGuards(RolesGuard)
  @Roles('instructor', 'admin')
  async getStats(@Request() req) {
    return this.coursesService.getStats(req.user.userId, req.user.tenantId);
  }

  /**
   * Get a single course by ID
   */
  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req) {
    return this.coursesService.findOne(id, req.user.tenantId);
  }

  /**
   * Get a course by slug (public endpoint)
   */
  @Get('slug/:slug')
  async findBySlug(@Param('slug') slug: string, @Request() req) {
    return this.coursesService.findBySlug(slug, req.user.tenantId);
  }

  /**
   * Update a course (Instructor only - own courses)
   */
  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles('instructor', 'admin')
  async update(
    @Param('id') id: string,
    @Body() updateCourseDto: UpdateCourseDto,
    @Request() req,
  ) {
    return this.coursesService.update(
      id,
      updateCourseDto,
      req.user.userId,
      req.user.tenantId,
    );
  }

  /**
   * Publish or unpublish a course (Instructor only - own courses)
   */
  @Put(':id/publish')
  @UseGuards(RolesGuard)
  @Roles('instructor', 'admin')
  async publish(
    @Param('id') id: string,
    @Body() publishCourseDto: PublishCourseDto,
    @Request() req,
  ) {
    return this.coursesService.publish(
      id,
      publishCourseDto,
      req.user.userId,
      req.user.tenantId,
    );
  }

  /**
   * Delete a course (Instructor only - own courses)
   */
  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('instructor', 'admin')
  async delete(@Param('id') id: string, @Request() req) {
    return this.coursesService.delete(
      id,
      req.user.userId,
      req.user.tenantId,
    );
  }
}
