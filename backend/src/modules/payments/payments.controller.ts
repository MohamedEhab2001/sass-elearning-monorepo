import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  HttpCode,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto, PaymobCallbackDto } from './dto/payment.dto';
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
}
