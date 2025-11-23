import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Transaction, TransactionDocument, TransactionStatus, PaymentProvider } from './schemas/transaction.schema';
import { Payout, PayoutDocument, PayoutStatus } from './schemas/payout.schema';
import { Course, CourseDocument } from '../courses/schemas/course.schema';
import { User, UserDocument } from '../users/schemas/user.schema';
import { Tenant, TenantDocument } from '../tenants/schemas/tenant.schema';
import { SubscriptionPlan } from '../subscriptions/schemas/subscription.schema';
import { PaymobService } from './paymob.service';
import { EnrollmentsService } from '../enrollments/enrollments.service';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import { DiscountsService } from '../discounts/discounts.service';
import { EmailsService } from '../emails/emails.service';
import { CommissionsService } from '../commissions/commissions.service';
import { CreatePayoutDto, UpdatePayoutStatusDto } from './dto/payout.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectModel(Transaction.name) private transactionModel: Model<TransactionDocument>,
    @InjectModel(Payout.name) private payoutModel: Model<PayoutDocument>,
    @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Tenant.name) private tenantModel: Model<TenantDocument>,
    private paymobService: PaymobService,
    private enrollmentsService: EnrollmentsService,
    private subscriptionsService: SubscriptionsService,
    private discountsService: DiscountsService,
    private emailsService: EmailsService,
    private commissionsService: CommissionsService,
  ) {}

  /**
   * Create payment session for course purchase (with optional discount code)
   */
  async createPaymentSession(
    courseId: string,
    userId: string,
    tenantId: string,
    discountCode?: string,
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

    // Validate and apply discount code if provided
    let finalAmount = course.price;
    let discountAmount = 0;
    let discountCodeUsed: string | null = null;

    if (discountCode) {
      const validation = await this.discountsService.validate(
        {
          code: discountCode,
          applicableTo: 'course',
          courseId,
          amount: course.price,
        },
        tenantId,
      );

      if (validation.isValid) {
        finalAmount = validation.discountedAmount;
        discountAmount = validation.discountAmount;
        discountCodeUsed = discountCode;

        // Increment discount usage
        await this.discountsService.incrementUsage(validation.discount._id.toString());
      } else {
        throw new BadRequestException(validation.message || 'كود الخصم غير صالح');
      }
    }

    // Create transaction record
    const transactionId = uuidv4();
    const transaction = new this.transactionModel({
      tenantId: new Types.ObjectId(tenantId),
      userId: new Types.ObjectId(userId),
      courseId: new Types.ObjectId(courseId),
      provider: PaymentProvider.PAYMOB,
      status: TransactionStatus.PENDING,
      amount: finalAmount,
      originalAmount: course.price,
      discountAmount,
      discountCode: discountCodeUsed,
      currency: 'EGP',
      transactionId,
      metadata: {
        courseName: course.title,
        userEmail: user.email,
      },
    });

    await transaction.save();

    // Create payment session with Paymob (using final amount after discount)
    const nameParts = user.fullName.split(' ');
    const paymentSession = await this.paymobService.createPaymentSession(
      finalAmount,
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
   * Create payment session for subscription purchase (with optional discount code)
   */
  async createSubscriptionPaymentSession(
    plan: 'monthly' | 'annual',
    userId: string,
    tenantId: string,
    discountCode?: string,
  ): Promise<{
    paymentUrl: string;
    transactionId: string;
  }> {
    // Get tenant info and verify subscriptions are enabled
    const tenant = await this.tenantModel
      .findById(new Types.ObjectId(tenantId))
      .exec();

    if (!tenant) {
      throw new NotFoundException('المنصة غير موجودة');
    }

    if (!tenant.subscriptionEnabled) {
      throw new BadRequestException('الاشتراكات غير مفعلة لهذه المنصة');
    }

    // Get subscription price
    const subscriptionPrice = plan === 'monthly' ? tenant.monthlyPrice : tenant.annualPrice;

    if (!subscriptionPrice) {
      throw new BadRequestException('سعر الاشتراك غير محدد');
    }

    // Get user info
    const user = await this.userModel
      .findById(new Types.ObjectId(userId))
      .exec();

    if (!user) {
      throw new NotFoundException('المستخدم غير موجود');
    }

    // Check if user already has active subscription
    const hasActiveSubscription = await this.subscriptionsService.hasActiveSubscription(
      userId,
      tenantId,
    );

    if (hasActiveSubscription) {
      throw new BadRequestException('لديك اشتراك نشط بالفعل');
    }

    // Validate and apply discount code if provided
    let finalAmount = subscriptionPrice;
    let discountAmount = 0;
    let discountCodeUsed: string | null = null;

    if (discountCode) {
      const validation = await this.discountsService.validate(
        {
          code: discountCode,
          applicableTo: 'subscription',
          amount: subscriptionPrice,
        },
        tenantId,
      );

      if (validation.isValid) {
        finalAmount = validation.discountedAmount;
        discountAmount = validation.discountAmount;
        discountCodeUsed = discountCode;

        // Increment discount usage
        await this.discountsService.incrementUsage(validation.discount._id.toString());
      } else {
        throw new BadRequestException(validation.message || 'كود الخصم غير صالح');
      }
    }

    // Create pending subscription
    const pendingSubscription = await this.subscriptionsService.create(
      { plan: plan as SubscriptionPlan },
      userId,
      tenantId,
    );

    // Create transaction record
    const transactionId = uuidv4();
    const transaction = new this.transactionModel({
      tenantId: new Types.ObjectId(tenantId),
      userId: new Types.ObjectId(userId),
      subscriptionId: new Types.ObjectId((pendingSubscription as any)._id),
      provider: PaymentProvider.PAYMOB,
      status: TransactionStatus.PENDING,
      amount: finalAmount,
      originalAmount: subscriptionPrice,
      discountAmount,
      discountCode: discountCodeUsed,
      currency: 'EGP',
      transactionId,
      metadata: {
        subscriptionPlan: plan as string,
        userEmail: user.email,
      },
    });

    await transaction.save();

    // Create payment session with Paymob (using final amount after discount)
    const nameParts = user.fullName.split(' ');
    const paymentSession = await this.paymobService.createPaymentSession(
      finalAmount,
      {
        email: user.email,
        firstName: nameParts[0] || 'Student',
        lastName: nameParts.slice(1).join(' ') || 'User',
        phone: '01000000000', // Default phone, can be updated from user profile
      },
      {
        tenantSlug: tenant.slug,
        subscriptionPlan: plan,
        transactionId,
      },
    );

    // Update transaction with Paymob order ID
    transaction.providerOrderId = paymentSession.orderId;
    transaction.metadata = {
      ...transaction.metadata,
      paymentToken: paymentSession.paymentToken,
      subscriptionId: (pendingSubscription as any)._id.toString(),
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
      .populate('userId')
      .populate('courseId')
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

      // Calculate and store commission for course transactions
      if (transaction.courseId) {
        try {
          const course = await this.courseModel.findById(transaction.courseId).exec();
          if (course && course.instructorId) {
            // Get instructor's total revenue to determine tier
            const instructorRevenue = await this.getInstructorTotalRevenue(
              course.instructorId.toString(),
              transaction.tenantId.toString(),
            );

            // Calculate commission
            const commissionCalc = await this.commissionsService.calculateCommission(
              transaction.tenantId.toString(),
              instructorRevenue,
              transaction.amount,
            );

            // Store commission data in transaction
            transaction.commissionRate = commissionCalc.commissionRate;
            transaction.commissionAmount = commissionCalc.commissionAmount;
            transaction.instructorNetAmount = commissionCalc.netAmount;
            if (commissionCalc.tierId) {
              transaction.commissionTierId = new Types.ObjectId(commissionCalc.tierId);
            }
          }
        } catch (error) {
          console.error('Failed to calculate commission:', error);
          // Continue with transaction completion even if commission calculation fails
        }
      }

      // Check if this is a course or subscription payment
      if (transaction.courseId) {
        // Course payment - create enrollment
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
        }

        // Send purchase receipt email
        try {
          const user = transaction.userId as any;
          const course = transaction.courseId as any;
          await this.emailsService.sendPurchaseReceipt(user.email, {
            studentName: user.fullName,
            courseTitle: course.title,
            amount: transaction.amount,
            transactionId: transaction.transactionId,
            purchaseDate: transaction.completedAt,
          });
        } catch (error) {
          console.error('[PaymentsService] Failed to send purchase receipt email:', error);
        }
      } else if (transaction.subscriptionId) {
        // Subscription payment - activate subscription
        try {
          await this.subscriptionsService.activateAfterPayment(
            transaction.subscriptionId.toString(),
            transaction.transactionId,
            transaction.userId.toString(),
            transaction.tenantId.toString(),
          );
        } catch (error) {
          console.error('Failed to activate subscription after payment:', error);
        }

        // TODO: Send subscription confirmation email (can be added later)
      }
    } else {
      transaction.status = TransactionStatus.FAILED;
      transaction.failureReason = 'Payment was not successful';

      // Send payment failure email
      try {
        const user = transaction.userId as any;
        if (transaction.courseId) {
          const course = transaction.courseId as any;
          await this.emailsService.sendPaymentFailure(user.email, {
            studentName: user.fullName,
            courseTitle: course.title,
            reason: transaction.failureReason || 'فشلت عملية الدفع',
          });
        }
        // TODO: Handle subscription payment failure email
      } catch (error) {
        console.error('[PaymentsService] Failed to send payment failure email:', error);
      }
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

  // ==================== FINANCE & PAYOUT METHODS ====================

  /**
   * Get revenue summary for instructor
   */
  async getInstructorRevenueSummary(instructorId: string, tenantId: string): Promise<any> {
    const tenantIdObj = new Types.ObjectId(tenantId);
    const instructorIdObj = new Types.ObjectId(instructorId);

    // Get all courses by this instructor
    const courses = await this.courseModel
      .find({
        instructorId: instructorIdObj,
        tenantId: tenantIdObj,
      })
      .select('_id')
      .exec();

    const courseIds = courses.map((c) => c._id);

    // Calculate total revenue from completed transactions
    const transactions = await this.transactionModel
      .find({
        courseId: { $in: courseIds },
        tenantId: tenantIdObj,
        status: TransactionStatus.COMPLETED,
      })
      .exec();

    const totalRevenue = transactions.reduce((sum, t) => sum + t.amount, 0);

    // Platform commission (15%)
    const commissionRate = 0.15;
    const totalCommission = totalRevenue * commissionRate;
    const netRevenue = totalRevenue - totalCommission;

    // Get payouts
    const completedPayouts = await this.payoutModel
      .find({
        instructorId: instructorIdObj,
        tenantId: tenantIdObj,
        status: PayoutStatus.COMPLETED,
      })
      .exec();

    const pendingPayouts = await this.payoutModel
      .find({
        instructorId: instructorIdObj,
        tenantId: tenantIdObj,
        status: { $in: [PayoutStatus.PENDING, PayoutStatus.APPROVED, PayoutStatus.PROCESSING] },
      })
      .exec();

    const completedPayoutsAmount = completedPayouts.reduce((sum, p) => sum + p.amount, 0);
    const pendingPayoutsAmount = pendingPayouts.reduce((sum, p) => sum + p.amount, 0);

    const availableBalance = netRevenue - completedPayoutsAmount - pendingPayoutsAmount;

    // Count unique students
    const uniqueStudentIds = new Set(transactions.map((t) => t.userId.toString()));
    const totalStudents = uniqueStudentIds.size;

    return {
      totalRevenue,
      totalCommission,
      netRevenue,
      availableBalance,
      pendingPayouts: pendingPayoutsAmount,
      completedPayouts: completedPayoutsAmount,
      totalStudents,
      totalCourses: courses.length,
    };
  }

  /**
   * Get instructor transactions
   */
  async getInstructorTransactions(
    instructorId: string,
    tenantId: string,
  ): Promise<Transaction[]> {
    const tenantIdObj = new Types.ObjectId(tenantId);
    const instructorIdObj = new Types.ObjectId(instructorId);

    // Get all courses by this instructor
    const courses = await this.courseModel
      .find({
        instructorId: instructorIdObj,
        tenantId: tenantIdObj,
      })
      .select('_id')
      .exec();

    const courseIds = courses.map((c) => c._id);

    return this.transactionModel
      .find({
        courseId: { $in: courseIds },
        tenantId: tenantIdObj,
        status: TransactionStatus.COMPLETED,
      })
      .populate('courseId', 'title thumbnail')
      .populate('userId', 'fullName email')
      .sort({ createdAt: -1 })
      .exec();
  }

  /**
   * Create payout request
   */
  async createPayoutRequest(
    createPayoutDto: CreatePayoutDto,
    instructorId: string,
    tenantId: string,
  ): Promise<Payout> {
    // Check available balance
    const summary = await this.getInstructorRevenueSummary(instructorId, tenantId);

    if (createPayoutDto.amount > summary.availableBalance) {
      throw new BadRequestException('المبلغ المطلوب أكبر من الرصيد المتاح');
    }

    // Minimum payout amount
    const minimumPayout = 100; // 100 EGP
    if (createPayoutDto.amount < minimumPayout) {
      throw new BadRequestException(`الحد الأدنى للسحب هو ${minimumPayout} جنيه`);
    }

    const payout = new this.payoutModel({
      ...createPayoutDto,
      tenantId: new Types.ObjectId(tenantId),
      instructorId: new Types.ObjectId(instructorId),
      currency: 'EGP',
      status: PayoutStatus.PENDING,
    });

    const savedPayout = await payout.save();

    // Send payout request received email
    try {
      const instructor = await this.userModel.findById(instructorId).exec();
      if (instructor) {
        await this.emailsService.sendPayoutRequestReceived(instructor.email, {
          instructorName: instructor.fullName,
          amount: savedPayout.amount,
          requestDate: savedPayout.createdAt,
        });
      }
    } catch (error) {
      console.error('[PaymentsService] Failed to send payout request email:', error);
    }

    return savedPayout;
  }

  /**
   * Get instructor payouts
   */
  async getInstructorPayouts(instructorId: string, tenantId: string): Promise<Payout[]> {
    return this.payoutModel
      .find({
        instructorId: new Types.ObjectId(instructorId),
        tenantId: new Types.ObjectId(tenantId),
      })
      .populate('processedBy', 'fullName email')
      .sort({ createdAt: -1 })
      .exec();
  }

  /**
   * Get all pending payouts (admin)
   */
  async getPendingPayouts(tenantId: string): Promise<Payout[]> {
    return this.payoutModel
      .find({
        tenantId: new Types.ObjectId(tenantId),
        status: PayoutStatus.PENDING,
      })
      .populate('instructorId', 'fullName email')
      .sort({ createdAt: -1 })
      .exec();
  }

  /**
   * Get all payouts (admin)
   */
  async getAllPayouts(tenantId: string): Promise<Payout[]> {
    return this.payoutModel
      .find({
        tenantId: new Types.ObjectId(tenantId),
      })
      .populate('instructorId', 'fullName email')
      .populate('processedBy', 'fullName email')
      .sort({ createdAt: -1 })
      .exec();
  }

  /**
   * Update payout status (admin)
   */
  async updatePayoutStatus(
    payoutId: string,
    updatePayoutStatusDto: UpdatePayoutStatusDto,
    adminId: string,
    tenantId: string,
  ): Promise<Payout> {
    const payout = await this.payoutModel
      .findOne({
        _id: new Types.ObjectId(payoutId),
        tenantId: new Types.ObjectId(tenantId),
      })
      .populate('instructorId')
      .exec();

    if (!payout) {
      throw new NotFoundException('طلب السحب غير موجود');
    }

    const instructor = payout.instructorId as any;

    payout.status = updatePayoutStatusDto.status;
    payout.processedBy = new Types.ObjectId(adminId);
    payout.processedAt = new Date();

    if (updatePayoutStatusDto.status === PayoutStatus.REJECTED) {
      payout.rejectionReason = updatePayoutStatusDto.rejectionReason || null;
    }

    if (updatePayoutStatusDto.status === PayoutStatus.COMPLETED) {
      payout.completedAt = new Date();
      payout.transactionReference = updatePayoutStatusDto.transactionReference || null;
    }

    const savedPayout = await payout.save();

    // Send appropriate email based on status
    try {
      if (updatePayoutStatusDto.status === PayoutStatus.APPROVED) {
        await this.emailsService.sendPayoutApproved(instructor.email, {
          instructorName: instructor.fullName,
          amount: savedPayout.amount,
          approvalDate: savedPayout.processedAt || new Date(),
        });
      } else if (updatePayoutStatusDto.status === PayoutStatus.REJECTED) {
        await this.emailsService.sendPayoutRejected(instructor.email, {
          instructorName: instructor.fullName,
          amount: savedPayout.amount,
          reason: savedPayout.rejectionReason || 'لم يتم تحديد السبب',
          rejectionDate: savedPayout.processedAt || new Date(),
        });
      } else if (updatePayoutStatusDto.status === PayoutStatus.COMPLETED) {
        await this.emailsService.sendPayoutCompleted(instructor.email, {
          instructorName: instructor.fullName,
          amount: savedPayout.amount,
          transactionReference: savedPayout.transactionReference || 'N/A',
          completionDate: savedPayout.completedAt || new Date(),
        });
      }
    } catch (error) {
      console.error('[PaymentsService] Failed to send payout status email:', error);
    }

    return savedPayout;
  }

  /**
   * Cancel payout request (instructor)
   */
  async cancelPayoutRequest(
    payoutId: string,
    instructorId: string,
    tenantId: string,
  ): Promise<Payout> {
    const payout = await this.payoutModel
      .findOne({
        _id: new Types.ObjectId(payoutId),
        instructorId: new Types.ObjectId(instructorId),
        tenantId: new Types.ObjectId(tenantId),
      })
      .exec();

    if (!payout) {
      throw new NotFoundException('طلب السحب غير موجود');
    }

    if (payout.status !== PayoutStatus.PENDING) {
      throw new BadRequestException('لا يمكن إلغاء هذا الطلب');
    }

    payout.status = PayoutStatus.CANCELLED;
    return payout.save();
  }

  /**
   * Get instructor's total revenue (sum of all completed transactions)
   * Used to determine commission tier
   */
  private async getInstructorTotalRevenue(instructorId: string, tenantId: string): Promise<number> {
    // Get all courses by this instructor
    const courses = await this.courseModel
      .find({
        instructorId: new Types.ObjectId(instructorId),
        tenantId: new Types.ObjectId(tenantId),
      })
      .exec();

    const courseIds = courses.map((c) => c._id);

    // Calculate total revenue from completed transactions
    const transactions = await this.transactionModel
      .find({
        courseId: { $in: courseIds },
        tenantId: new Types.ObjectId(tenantId),
        status: TransactionStatus.COMPLETED,
      })
      .exec();

    return transactions.reduce((sum, t) => sum + t.amount, 0);
  }
}
