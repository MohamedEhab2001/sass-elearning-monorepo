import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Transaction, TransactionDocument, TransactionStatus, PaymentProvider } from './schemas/transaction.schema';
import { Course, CourseDocument } from '../courses/schemas/course.schema';
import { User, UserDocument } from '../users/schemas/user.schema';
import { Tenant, TenantDocument } from '../tenants/schemas/tenant.schema';
import { PaymobService } from './paymob.service';
import { EnrollmentsService } from '../enrollments/enrollments.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectModel(Transaction.name) private transactionModel: Model<TransactionDocument>,
    @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Tenant.name) private tenantModel: Model<TenantDocument>,
    private paymobService: PaymobService,
    private enrollmentsService: EnrollmentsService,
  ) {}

  /**
   * Create payment session for course purchase
   */
  async createPaymentSession(
    courseId: string,
    userId: string,
    tenantId: string,
  ): Promise<{
    paymentUrl: string;
    transactionId: string;
  }> {
    // Verify course exists and get price
    const course = await this.courseModel
      .findOne({
        _id: new Types.ObjectId(courseId),
        tenantId: new Types.ObjectId(tenantId),
      })
      .exec();

    if (!course) {
      throw new NotFoundException('الدورة غير موجودة');
    }

    if (course.isFree) {
      throw new BadRequestException('هذه الدورة مجانية');
    }

    // Get tenant info
    const tenant = await this.tenantModel
      .findById(new Types.ObjectId(tenantId))
      .exec();

    if (!tenant) {
      throw new NotFoundException('المنصة غير موجودة');
    }

    // Get user info
    const user = await this.userModel
      .findById(new Types.ObjectId(userId))
      .exec();

    if (!user) {
      throw new NotFoundException('المستخدم غير موجود');
    }

    // Check if already enrolled
    const isEnrolled = await this.enrollmentsService.isEnrolled(courseId, userId);
    if (isEnrolled) {
      throw new BadRequestException('أنت مسجل بالفعل في هذه الدورة');
    }

    // Create transaction record
    const transactionId = uuidv4();
    const transaction = new this.transactionModel({
      tenantId: new Types.ObjectId(tenantId),
      userId: new Types.ObjectId(userId),
      courseId: new Types.ObjectId(courseId),
      provider: PaymentProvider.PAYMOB,
      status: TransactionStatus.PENDING,
      amount: course.price,
      currency: 'EGP',
      transactionId,
      metadata: {
        courseName: course.title,
        userEmail: user.email,
      },
    });

    await transaction.save();

    // Create payment session with Paymob
    const nameParts = user.fullName.split(' ');
    const paymentSession = await this.paymobService.createPaymentSession(
      course.price,
      {
        email: user.email,
        firstName: nameParts[0] || 'Student',
        lastName: nameParts.slice(1).join(' ') || 'User',
        phone: '01000000000', // Default phone, can be updated from user profile
      },
      {
        tenantSlug: tenant.slug,
        courseSlug: course.slug,
        transactionId,
      },
    );

    // Update transaction with Paymob order ID
    transaction.providerOrderId = paymentSession.orderId;
    transaction.metadata = {
      ...transaction.metadata,
      paymentToken: paymentSession.paymentToken,
    };
    await transaction.save();

    return {
      paymentUrl: paymentSession.paymentUrl,
      transactionId: transaction.transactionId,
    };
  }

  /**
   * Handle payment callback from Paymob
   */
  async handlePaymobCallback(callbackData: any): Promise<void> {
    const verification = await this.paymobService.verifyCallback(callbackData);

    if (!verification.isValid) {
      console.error('Invalid payment callback:', callbackData);
      return;
    }

    // Find transaction by provider order ID
    const transaction = await this.transactionModel
      .findOne({
        providerOrderId: verification.orderId,
      })
      .exec();

    if (!transaction) {
      console.error('Transaction not found for order:', verification.orderId);
      return;
    }

    // Update transaction status
    transaction.providerTransactionId = verification.transactionId;

    if (verification.success) {
      transaction.status = TransactionStatus.COMPLETED;
      transaction.completedAt = new Date();

      // Create enrollment
      try {
        await this.enrollmentsService.enroll(
          {
            courseId: transaction.courseId.toString(),
            pricePaid: transaction.amount,
            paymentId: transaction.transactionId,
          },
          transaction.userId.toString(),
          transaction.tenantId.toString(),
        );
      } catch (error) {
        console.error('Failed to create enrollment after payment:', error);
        // Transaction is successful but enrollment failed
        // This should be handled manually or with retry logic
      }
    } else {
      transaction.status = TransactionStatus.FAILED;
      transaction.failureReason = 'Payment was not successful';
    }

    await transaction.save();
  }

  /**
   * Get transaction by ID
   */
  async getTransaction(transactionId: string, userId: string): Promise<Transaction> {
    const transaction = await this.transactionModel
      .findOne({
        transactionId,
        userId: new Types.ObjectId(userId),
      })
      .populate('courseId', 'title thumbnail')
      .exec();

    if (!transaction) {
      throw new NotFoundException('المعاملة غير موجودة');
    }

    return transaction;
  }

  /**
   * Get all transactions for a user
   */
  async getUserTransactions(userId: string, tenantId: string): Promise<Transaction[]> {
    return this.transactionModel
      .find({
        userId: new Types.ObjectId(userId),
        tenantId: new Types.ObjectId(tenantId),
      })
      .populate('courseId', 'title thumbnail')
      .sort({ createdAt: -1 })
      .exec();
  }

  /**
   * Get all transactions for a course (instructor view)
   */
  async getCourseTransactions(courseId: string, tenantId: string): Promise<Transaction[]> {
    return this.transactionModel
      .find({
        courseId: new Types.ObjectId(courseId),
        tenantId: new Types.ObjectId(tenantId),
        status: TransactionStatus.COMPLETED,
      })
      .populate('userId', 'fullName email')
      .sort({ createdAt: -1 })
      .exec();
  }
}
