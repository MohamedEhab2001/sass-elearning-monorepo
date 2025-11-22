import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { EnrollmentsService } from './enrollments.service';
import { CreateEnrollmentDto } from './dto/enrollment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { EnrollmentStatus } from './schemas/enrollment.schema';

@Controller('enrollments')
@UseGuards(JwtAuthGuard)
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  /**
   * Enroll in a course (Student only)
   */
  @Post()
  @UseGuards(RolesGuard)
  @Roles('student')
  async enroll(@Body() createEnrollmentDto: CreateEnrollmentDto, @Request() req) {
    return this.enrollmentsService.enroll(
      createEnrollmentDto,
      req.user.userId,
      req.user.tenantId,
    );
  }

  /**
   * Get all enrollments for the current student
   */
  @Get()
  @UseGuards(RolesGuard)
  @Roles('student')
  async getMyEnrollments(@Request() req, @Query('status') status?: EnrollmentStatus) {
    return this.enrollmentsService.getStudentEnrollments(
      req.user.userId,
      req.user.tenantId,
      status,
    );
  }

  /**
   * Get enrollment by ID
   */
  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles('student')
  async getEnrollment(@Param('id') id: string, @Request() req) {
    return this.enrollmentsService.getEnrollment(id, req.user.userId, req.user.tenantId);
  }

  /**
   * Get enrollment by course ID
   */
  @Get('course/:courseId')
  @UseGuards(RolesGuard)
  @Roles('student')
  async getEnrollmentByCourse(@Param('courseId') courseId: string, @Request() req) {
    return this.enrollmentsService.getEnrollmentByCourse(
      courseId,
      req.user.userId,
      req.user.tenantId,
    );
  }

  /**
   * Check if enrolled in a course
   */
  @Get('course/:courseId/check')
  @UseGuards(RolesGuard)
  @Roles('student')
  async checkEnrollment(@Param('courseId') courseId: string, @Request() req) {
    const isEnrolled = await this.enrollmentsService.isEnrolled(courseId, req.user.userId);
    return { isEnrolled };
  }

  /**
   * Cancel enrollment
   */
  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('student')
  async cancelEnrollment(@Param('id') id: string, @Request() req) {
    return this.enrollmentsService.cancelEnrollment(id, req.user.userId, req.user.tenantId);
  }

  /**
   * Get enrollment statistics for a course (Instructor only)
   */
  @Get('course/:courseId/stats')
  @UseGuards(RolesGuard)
  @Roles('instructor', 'admin')
  async getCourseStats(@Param('courseId') courseId: string, @Request() req) {
    return this.enrollmentsService.getCourseEnrollmentStats(courseId, req.user.tenantId);
  }
}
