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
import { Throttle } from '@nestjs/throttler';
import { ExamsService } from './exams.service';
import { QuestionsService } from './questions.service';
import { SubmissionsService } from './submissions.service';
import { CreateExamDto, UpdateExamDto } from './dto/exam.dto';
import { CreateQuestionDto, UpdateQuestionDto } from './dto/question.dto';
import { SubmitExamDto, GradeEssayDto, StartExamDto } from './dto/submission.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('exams')
export class ExamsController {
  constructor(
    private readonly examsService: ExamsService,
    private readonly questionsService: QuestionsService,
    private readonly submissionsService: SubmissionsService,
  ) {}

  // ==================== EXAM ENDPOINTS (INSTRUCTOR) ====================

  @Post(':tenantId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('instructor', 'admin')
  async createExam(
    @Param('tenantId') tenantId: string,
    @Body() createExamDto: CreateExamDto,
    @CurrentUser() user: any,
  ) {
    return this.examsService.create(createExamDto, tenantId, user.userId);
  }

  @Get('tenant/:tenantId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('instructor', 'admin')
  async getExamsByTenant(
    @Param('tenantId') tenantId: string,
    @Query('includeArchived') includeArchived?: string,
  ) {
    return this.examsService.findAll(tenantId, includeArchived === 'true');
  }

  @Get(':examId')
  @UseGuards(JwtAuthGuard)
  async getExam(@Param('examId') examId: string) {
    return this.examsService.findById(examId);
  }

  @Get('course/:courseId')
  @UseGuards(JwtAuthGuard)
  async getExamsByCourse(@Param('courseId') courseId: string) {
    return this.examsService.findByCourseId(courseId);
  }

  @Put(':examId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('instructor', 'admin')
  async updateExam(
    @Param('examId') examId: string,
    @Body() updateExamDto: UpdateExamDto,
  ) {
    return this.examsService.update(examId, updateExamDto);
  }

  @Delete(':examId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('instructor', 'admin')
  async deleteExam(@Param('examId') examId: string) {
    await this.examsService.delete(examId);
    return { message: 'تم حذف الامتحان بنجاح' };
  }

  @Post(':examId/publish')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('instructor', 'admin')
  async publishExam(@Param('examId') examId: string) {
    return this.examsService.publish(examId);
  }

  @Post(':examId/archive')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('instructor', 'admin')
  async archiveExam(@Param('examId') examId: string) {
    return this.examsService.archive(examId);
  }

  // ==================== QUESTION ENDPOINTS (INSTRUCTOR) ====================

  @Post('questions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('instructor', 'admin')
  async createQuestion(@Body() createQuestionDto: CreateQuestionDto) {
    return this.questionsService.create(createQuestionDto);
  }

  @Get(':examId/questions')
  @UseGuards(JwtAuthGuard)
  async getQuestions(@Param('examId') examId: string) {
    return this.questionsService.findByExamId(examId);
  }

  @Put('questions/:questionId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('instructor', 'admin')
  async updateQuestion(
    @Param('questionId') questionId: string,
    @Body() updateQuestionDto: UpdateQuestionDto,
  ) {
    return this.questionsService.update(questionId, updateQuestionDto);
  }

  @Delete('questions/:questionId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('instructor', 'admin')
  async deleteQuestion(@Param('questionId') questionId: string) {
    await this.questionsService.delete(questionId);
    return { message: 'تم حذف السؤال بنجاح' };
  }

  @Post(':examId/questions/reorder')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('instructor', 'admin')
  async reorderQuestions(
    @Param('examId') examId: string,
    @Body() body: { questionOrders: { questionId: string; order: number }[] },
  ) {
    await this.questionsService.reorder(examId, body.questionOrders);
    return { message: 'تم إعادة ترتيب الأسئلة بنجاح' };
  }

  // ==================== SUBMISSION ENDPOINTS (INSTRUCTOR) ====================

  @Get(':examId/submissions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('instructor', 'admin')
  async getSubmissions(@Param('examId') examId: string) {
    return this.submissionsService.getSubmissionsByExam(examId);
  }

  @Get('submissions/:submissionId')
  @UseGuards(JwtAuthGuard)
  async getSubmission(@Param('submissionId') submissionId: string) {
    return this.submissionsService.getSubmission(submissionId);
  }

  @Post('submissions/:submissionId/grade-essay')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('instructor', 'admin')
  async gradeEssay(
    @Param('submissionId') submissionId: string,
    @Body() gradeEssayDto: GradeEssayDto,
    @CurrentUser() user: any,
  ) {
    return this.submissionsService.gradeEssay(submissionId, gradeEssayDto, user.userId);
  }

  // ==================== STUDENT ENDPOINTS ====================

  @Get('student/available/:tenantId')
  @UseGuards(JwtAuthGuard)
  @Roles('student')
  async getAvailableExams(
    @Param('tenantId') tenantId: string,
    @CurrentUser() user: any,
  ) {
    // Get student custom fields from user object
    const studentCustomFields = user.customFieldValues || {};
    return this.examsService.getAvailableExamsForStudent(tenantId, studentCustomFields);
  }

  @Post('student/start')
  @UseGuards(JwtAuthGuard)
  @Roles('student')
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 starts per minute
  async startExam(
    @Body() startExamDto: StartExamDto,
    @CurrentUser() user: any,
  ) {
    const studentCustomFields = user.customFieldValues || {};
    return this.submissionsService.startExam(
      startExamDto.examId,
      user.userId,
      user.tenantId,
      studentCustomFields,
    );
  }

  @Get('student/:examId/questions')
  @UseGuards(JwtAuthGuard)
  @Roles('student')
  async getQuestionsForStudent(@Param('examId') examId: string) {
    const exam = await this.examsService.findById(examId);
    return this.questionsService.getQuestionsForStudent(examId, exam.randomizeQuestions);
  }

  @Post('student/submit')
  @UseGuards(JwtAuthGuard)
  @Roles('student')
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 submits per minute
  async submitExam(
    @Body() submitExamDto: SubmitExamDto,
    @CurrentUser() user: any,
  ) {
    return this.submissionsService.submitExam(submitExamDto, user.userId, user.tenantId);
  }

  @Get('student/my-submissions/:tenantId')
  @UseGuards(JwtAuthGuard)
  @Roles('student')
  async getMySubmissions(
    @Param('tenantId') tenantId: string,
    @CurrentUser() user: any,
  ) {
    return this.submissionsService.getSubmissionsByStudent(user.userId, tenantId);
  }

  @Get('student/:examId/my-submission')
  @UseGuards(JwtAuthGuard)
  @Roles('student')
  async getMySubmission(
    @Param('examId') examId: string,
    @CurrentUser() user: any,
  ) {
    return this.submissionsService.getStudentSubmission(examId, user.userId);
  }
}
