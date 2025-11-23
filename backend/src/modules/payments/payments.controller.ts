import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  UseGuards,
  Request,
  HttpCode,
  Patch,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto, PaymobCallbackDto } from './dto/payment.dto';
import { CreatePayoutDto, UpdatePayoutStatusDto } from './dto/payout.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AuthenticatedRequest } from '../../common/interfaces/authenticated-request.interface';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  /**
   * Create payment session for course purchase
   */
  @Post('create')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('student')
  async createPayment(@Body() createPaymentDto: CreatePaymentDto, @Request() req: AuthenticatedRequest) {
    return this.paymentsService.createPaymentSession(
      createPaymentDto.courseId,
      req.user.userId,
      req.user.tenantId!,
    );
  }

  /**
   * Handle Paymob callback (webhook)
   */
  @Post('paymob/callback')
  @HttpCode(200)
  async handlePaymobCallback(@Body() callbackData: any) {
    await this.paymentsService.handlePaymobCallback(callbackData);
    return { success: true };
  }

  /**
   * Get transaction by ID
   */
  @Get('transaction/:transactionId')
  @UseGuards(JwtAuthGuard)
  async getTransaction(@Param('transactionId') transactionId: string, @Request() req: AuthenticatedRequest) {
    return this.paymentsService.getTransaction(transactionId, req.user.userId);
  }

  /**
   * Get all transactions for current user
   */
  @Get('my-transactions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('student')
  async getMyTransactions(@Request() req: AuthenticatedRequest) {
    return this.paymentsService.getUserTransactions(req.user.userId, req.user.tenantId!);
  }

  /**
   * Get all transactions for a course (instructor only)
   */
  @Get('course/:courseId/transactions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('instructor', 'admin')
  async getCourseTransactions(@Param('courseId') courseId: string, @Request() req: AuthenticatedRequest) {
    return this.paymentsService.getCourseTransactions(courseId, req.user.tenantId!);
  }

  // ==================== FINANCE & PAYOUT ENDPOINTS ====================

  /**
   * Get revenue summary for instructor
   */
  @Get('finance/summary')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('instructor')
  async getRevenueSummary(@Request() req: AuthenticatedRequest) {
    return this.paymentsService.getInstructorRevenueSummary(
      req.user.userId,
      req.user.tenantId!,
    );
  }

  /**
   * Get instructor transactions
   */
  @Get('finance/transactions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('instructor')
  async getInstructorTransactions(@Request() req: AuthenticatedRequest) {
    return this.paymentsService.getInstructorTransactions(
      req.user.userId,
      req.user.tenantId!,
    );
  }

  /**
   * Create payout request
   */
  @Post('finance/payouts')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('instructor')
  async createPayoutRequest(@Body() createPayoutDto: CreatePayoutDto, @Request() req: AuthenticatedRequest) {
    return this.paymentsService.createPayoutRequest(
      createPayoutDto,
      req.user.userId,
      req.user.tenantId!,
    );
  }

  /**
   * Get instructor payouts
   */
  @Get('finance/payouts')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('instructor')
  async getInstructorPayouts(@Request() req: AuthenticatedRequest) {
    return this.paymentsService.getInstructorPayouts(
      req.user.userId,
      req.user.tenantId!,
    );
  }

  /**
   * Cancel payout request
   */
  @Patch('finance/payouts/:payoutId/cancel')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('instructor')
  async cancelPayoutRequest(@Param('payoutId') payoutId: string, @Request() req: AuthenticatedRequest) {
    return this.paymentsService.cancelPayoutRequest(
      payoutId,
      req.user.userId,
      req.user.tenantId!,
    );
  }

  // ==================== ADMIN PAYOUT ENDPOINTS ====================

  /**
   * Get all pending payouts (admin)
   */
  @Get('admin/payouts/pending')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async getPendingPayouts(@Request() req: AuthenticatedRequest) {
    return this.paymentsService.getPendingPayouts(req.user.tenantId!);
  }

  /**
   * Get all payouts (admin)
   */
  @Get('admin/payouts')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async getAllPayouts(@Request() req: AuthenticatedRequest) {
    return this.paymentsService.getAllPayouts(req.user.tenantId!);
  }

  /**
   * Update payout status (admin)
   */
  @Patch('admin/payouts/:payoutId/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async updatePayoutStatus(
    @Param('payoutId') payoutId: string,
    @Body() updatePayoutStatusDto: UpdatePayoutStatusDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.paymentsService.updatePayoutStatus(
      payoutId,
      updatePayoutStatusDto,
      req.user.userId,
      req.user.tenantId!,
    );
  }
}
