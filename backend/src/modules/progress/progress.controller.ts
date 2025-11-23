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
} from '@nestjs/common';
import { ProgressService } from './progress.service';
import { UpdateProgressDto } from './dto/progress.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AuthenticatedRequest } from '../../common/interfaces/authenticated-request.interface';

@Controller('progress')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('student')
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  /**
   * Update progress for a lesson
   */
  @Put()
  async updateProgress(@Body() updateProgressDto: UpdateProgressDto, @Request() req: AuthenticatedRequest) {
    return this.progressService.updateProgress(
      updateProgressDto,
      req.user.userId,
      req.user.tenantId!,
    );
  }

  /**
   * Get all progress for a course
   */
  @Get('course/:courseId')
  async getCourseProgress(@Param('courseId') courseId: string, @Request() req: AuthenticatedRequest) {
    return this.progressService.getCourseProgress(
      courseId,
      req.user.userId,
      req.user.tenantId!,
    );
  }

  /**
   * Get progress for a specific lesson
   */
  @Get('lesson/:lessonId')
  async getLessonProgress(@Param('lessonId') lessonId: string, @Request() req: AuthenticatedRequest) {
    return this.progressService.getLessonProgress(
      lessonId,
      req.user.userId,
      req.user.tenantId!,
    );
  }

  /**
   * Get course completion percentage
   */
  @Get('course/:courseId/percentage')
  async getCourseCompletionPercentage(@Param('courseId') courseId: string, @Request() req: AuthenticatedRequest) {
    const percentage = await this.progressService.getCourseCompletionPercentage(
      courseId,
      req.user.userId,
      req.user.tenantId!,
    );
    return { percentage };
  }

  /**
   * Get next lesson for a course
   */
  @Get('course/:courseId/next')
  async getNextLesson(@Param('courseId') courseId: string, @Request() req: AuthenticatedRequest) {
    return this.progressService.getNextLesson(
      courseId,
      req.user.userId,
      req.user.tenantId!,
    );
  }

  /**
   * Mark lesson as completed
   */
  @Post('lesson/:lessonId/complete')
  async markLessonCompleted(@Param('lessonId') lessonId: string, @Request() req: AuthenticatedRequest) {
    return this.progressService.markLessonCompleted(
      lessonId,
      req.user.userId,
      req.user.tenantId!,
    );
  }

  /**
   * Reset course progress
   */
  @Delete('course/:courseId')
  async resetCourseProgress(@Param('courseId') courseId: string, @Request() req: AuthenticatedRequest) {
    return this.progressService.resetCourseProgress(
      courseId,
      req.user.userId,
      req.user.tenantId!,
    );
  }
}
