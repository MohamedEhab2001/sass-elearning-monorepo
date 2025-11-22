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
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  /**
   * Create payment session for course purchase
   */
  @Post('create')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('student')
  async createPayment(@Body() createPaymentDto: CreatePaymentDto, @Request() req) {
    return this.paymentsService.createPaymentSession(
      createPaymentDto.courseId,
      req.user.userId,
      req.user.tenantId,
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
  async getTransaction(@Param('transactionId') transactionId: string, @Request() req) {
    return this.paymentsService.getTransaction(transactionId, req.user.userId);
  }

  /**
   * Get all transactions for current user
   */
  @Get('my-transactions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('student')
  async getMyTransactions(@Request() req) {
    return this.paymentsService.getUserTransactions(req.user.userId, req.user.tenantId);
  }

  /**
   * Get all transactions for a course (instructor only)
   */
  @Get('course/:courseId/transactions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('instructor', 'admin')
  async getCourseTransactions(@Param('courseId') courseId: string, @Request() req) {
    return this.paymentsService.getCourseTransactions(courseId, req.user.tenantId);
  }

  // ==================== FINANCE & PAYOUT ENDPOINTS ====================

  /**
   * Get revenue summary for instructor
   */
  @Get('finance/summary')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('instructor')
  async getRevenueSummary(@Request() req) {
    return this.paymentsService.getInstructorRevenueSummary(
      req.user.userId,
      req.user.tenantId,
    );
  }

  /**
   * Get instructor transactions
   */
  @Get('finance/transactions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('instructor')
  async getInstructorTransactions(@Request() req) {
    return this.paymentsService.getInstructorTransactions(
      req.user.userId,
      req.user.tenantId,
    );
  }

  /**
   * Create payout request
   */
  @Post('finance/payouts')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('instructor')
  async createPayoutRequest(@Body() createPayoutDto: CreatePayoutDto, @Request() req) {
    return this.paymentsService.createPayoutRequest(
      createPayoutDto,
      req.user.userId,
      req.user.tenantId,
    );
  }

  /**
   * Get instructor payouts
   */
  @Get('finance/payouts')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('instructor')
  async getInstructorPayouts(@Request() req) {
    return this.paymentsService.getInstructorPayouts(
      req.user.userId,
      req.user.tenantId,
    );
  }

  /**
   * Cancel payout request
   */
  @Patch('finance/payouts/:payoutId/cancel')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('instructor')
  async cancelPayoutRequest(@Param('payoutId') payoutId: string, @Request() req) {
    return this.paymentsService.cancelPayoutRequest(
      payoutId,
      req.user.userId,
      req.user.tenantId,
    );
  }

  // ==================== ADMIN PAYOUT ENDPOINTS ====================

  /**
   * Get all pending payouts (admin)
   */
  @Get('admin/payouts/pending')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async getPendingPayouts(@Request() req) {
    return this.paymentsService.getPendingPayouts(req.user.tenantId);
  }

  /**
   * Get all payouts (admin)
   */
  @Get('admin/payouts')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async getAllPayouts(@Request() req) {
    return this.paymentsService.getAllPayouts(req.user.tenantId);
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
    @Request() req,
  ) {
    return this.paymentsService.updatePayoutStatus(
      payoutId,
      updatePayoutStatusDto,
      req.user.userId,
      req.user.tenantId,
    );
  }
}
