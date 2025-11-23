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
import { LessonsService } from './lessons.service';
import { CreateLessonDto, UpdateLessonDto, ReorderLessonsDto } from './dto/lesson.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AuthenticatedRequest } from '../../common/interfaces/authenticated-request.interface';

@Controller('lessons')
@UseGuards(JwtAuthGuard)
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  /**
   * Create a new lesson (Instructor only)
   */
  @Post()
  @UseGuards(RolesGuard)
  @Roles('instructor', 'admin')
  async create(@Body() createLessonDto: CreateLessonDto, @Request() req: AuthenticatedRequest) {
    return this.lessonsService.create(
      createLessonDto,
      req.user.userId,
      req.user.tenantId!,
    );
  }

  /**
   * Get all lessons for a course
   */
  @Get('course/:courseId')
  async findAllByCourse(
    @Param('courseId') courseId: string,
    @Request() req: AuthenticatedRequest,
    @Query('includeUnpublished') includeUnpublished?: string,
  ) {
    // Only instructors can see unpublished lessons
    const showUnpublished = includeUnpublished === 'true' &&
      (req.user.role === 'instructor' || req.user.role === 'admin');

    return this.lessonsService.findAllByCourse(
      courseId,
      req.user.tenantId!,
      showUnpublished,
    );
  }

  /**
   * Get a single lesson by ID
   */
  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.lessonsService.findOne(id, req.user.tenantId!);
  }

  /**
   * Update a lesson (Instructor only - own courses)
   */
  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles('instructor', 'admin')
  async update(
    @Param('id') id: string,
    @Body() updateLessonDto: UpdateLessonDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.lessonsService.update(
      id,
      updateLessonDto,
      req.user.userId,
      req.user.tenantId!,
    );
  }

  /**
   * Delete a lesson (Instructor only - own courses)
   */
  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('instructor', 'admin')
  async delete(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.lessonsService.delete(
      id,
      req.user.userId,
      req.user.tenantId!,
    );
  }

  /**
   * Reorder lessons in a course (Instructor only)
   */
  @Put('reorder')
  @UseGuards(RolesGuard)
  @Roles('instructor', 'admin')
  async reorder(@Body() reorderDto: ReorderLessonsDto, @Request() req: AuthenticatedRequest) {
    return this.lessonsService.reorder(
      reorderDto,
      req.user.userId,
      req.user.tenantId!,
    );
  }

  /**
   * Get lesson count for a course
   */
  @Get('course/:courseId/count')
  async getCount(@Param('courseId') courseId: string, @Request() req: AuthenticatedRequest) {
    return {
      count: await this.lessonsService.getCountByCourse(courseId, req.user.tenantId!),
    };
  }

  /**
   * Get total duration for a course
   */
  @Get('course/:courseId/duration')
  async getTotalDuration(@Param('courseId') courseId: string, @Request() req: AuthenticatedRequest) {
    return {
      totalDuration: await this.lessonsService.getTotalDurationByCourse(
        courseId,
        req.user.tenantId!,
      ),
    };
  }

  /**
   * Mark lesson as completed (Student)
   */
  @Post(':id/complete')
  @UseGuards(RolesGuard)
  @Roles('student')
  async markCompleted(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.lessonsService.markCompleted(
      id,
      req.user.userId,
      req.user.tenantId!,
    );
  }
}
