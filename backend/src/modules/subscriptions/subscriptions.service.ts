import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Subscription, SubscriptionDocument, SubscriptionStatus, SubscriptionPlan } from './schemas/subscription.schema';
import { Tenant, TenantDocument } from '../tenants/schemas/tenant.schema';
import { CreateSubscriptionDto, UpdateSubscriptionDto } from './dto/subscription.dto';

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectModel(Subscription.name) private subscriptionModel: Model<SubscriptionDocument>,
    @InjectModel(Tenant.name) private tenantModel: Model<TenantDocument>,
  ) {}

  /**
   * Create a new subscription (after payment)
   */
  async create(
    createSubscriptionDto: CreateSubscriptionDto,
    studentId: string,
    tenantId: string,
    paymentId?: string,
  ): Promise<Subscription> {
    // Get tenant to get subscription pricing
    const tenant = await this.tenantModel.findById(new Types.ObjectId(tenantId)).exec();

    if (!tenant) {
      throw new NotFoundException('المنصة غير موجودة');
    }

    if (!tenant.subscriptionEnabled) {
      throw new BadRequestException('الاشتراكات غير مفعلة لهذه المنصة');
    }

    // Get price based on plan
    const price = createSubscriptionDto.plan === SubscriptionPlan.MONTHLY
      ? tenant.monthlyPrice
      : tenant.annualPrice;

    if (!price) {
      throw new BadRequestException('سعر الاشتراك غير محدد');
    }

    // Calculate start and end dates
    const startDate = new Date();
    const endDate = new Date();

    if (createSubscriptionDto.plan === SubscriptionPlan.MONTHLY) {
      endDate.setMonth(endDate.getMonth() + 1);
    } else {
      endDate.setFullYear(endDate.getFullYear() + 1);
    }

    const subscription = new this.subscriptionModel({
      tenantId: new Types.ObjectId(tenantId),
      studentId: new Types.ObjectId(studentId),
      plan: createSubscriptionDto.plan,
      price,
      currency: 'EGP',
      status: paymentId ? SubscriptionStatus.ACTIVE : SubscriptionStatus.PENDING,
      startDate,
      endDate,
      autoRenew: true,
      paymentId,
    });

    return subscription.save();
  }

  /**
   * Get student's active subscription
   */
  async getActiveSubscription(studentId: string, tenantId: string): Promise<Subscription | null> {
    return this.subscriptionModel
      .findOne({
        studentId: new Types.ObjectId(studentId),
        tenantId: new Types.ObjectId(tenantId),
        status: SubscriptionStatus.ACTIVE,
        endDate: { $gt: new Date() },
      })
      .exec();
  }

  /**
   * Get all subscriptions for a student
   */
  async getStudentSubscriptions(studentId: string, tenantId: string): Promise<Subscription[]> {
    return this.subscriptionModel
      .find({
        studentId: new Types.ObjectId(studentId),
        tenantId: new Types.ObjectId(tenantId),
      })
      .sort({ createdAt: -1 })
      .exec();
  }

  /**
   * Get all subscriptions for a tenant (instructor/admin view)
   */
  async getTenantSubscriptions(tenantId: string): Promise<Subscription[]> {
    return this.subscriptionModel
      .find({
        tenantId: new Types.ObjectId(tenantId),
      })
      .populate('studentId', 'fullName email')
      .sort({ createdAt: -1 })
      .exec();
  }

  /**
   * Get subscription by ID
   */
  async getById(subscriptionId: string, studentId: string, tenantId: string): Promise<Subscription> {
    const subscription = await this.subscriptionModel
      .findOne({
        _id: new Types.ObjectId(subscriptionId),
        studentId: new Types.ObjectId(studentId),
        tenantId: new Types.ObjectId(tenantId),
      })
      .exec();

    if (!subscription) {
      throw new NotFoundException('الاشتراك غير موجود');
    }

    return subscription;
  }

  /**
   * Update subscription
   */
  async update(
    subscriptionId: string,
    updateSubscriptionDto: UpdateSubscriptionDto,
    studentId: string,
    tenantId: string,
  ): Promise<Subscription> {
    const subscription = await this.getById(subscriptionId, studentId, tenantId);

    if (updateSubscriptionDto.autoRenew !== undefined) {
      subscription.autoRenew = updateSubscriptionDto.autoRenew;
    }

    if (updateSubscriptionDto.status !== undefined) {
      subscription.status = updateSubscriptionDto.status;

      if (updateSubscriptionDto.status === SubscriptionStatus.CANCELLED) {
        subscription.cancelledAt = new Date();
      }
    }

    return subscription.save();
  }

  /**
   * Cancel subscription
   */
  async cancel(subscriptionId: string, studentId: string, tenantId: string): Promise<Subscription> {
    const subscription = await this.getById(subscriptionId, studentId, tenantId);

    if (subscription.status !== SubscriptionStatus.ACTIVE) {
      throw new BadRequestException('لا يمكن إلغاء هذا الاشتراك');
    }

    subscription.status = SubscriptionStatus.CANCELLED;
    subscription.autoRenew = false;
    subscription.cancelledAt = new Date();

    return subscription.save();
  }

  /**
   * Reactivate cancelled subscription (if not expired)
   */
  async reactivate(subscriptionId: string, studentId: string, tenantId: string): Promise<Subscription> {
    const subscription = await this.getById(subscriptionId, studentId, tenantId);

    if (subscription.status !== SubscriptionStatus.CANCELLED) {
      throw new BadRequestException('يمكن إعادة تفعيل الاشتراكات الملغاة فقط');
    }

    if (new Date() > subscription.endDate) {
      throw new BadRequestException('انتهت صلاحية الاشتراك، يرجى الاشتراك مجدداً');
    }

    subscription.status = SubscriptionStatus.ACTIVE;
    subscription.autoRenew = true;
    subscription.cancelledAt = null;

    return subscription.save();
  }

  /**
   * Activate subscription after payment
   */
  async activateAfterPayment(subscriptionId: string, paymentId: string): Promise<Subscription> {
    const subscription = await this.subscriptionModel
      .findById(new Types.ObjectId(subscriptionId))
      .exec();

    if (!subscription) {
      throw new NotFoundException('الاشتراك غير موجود');
    }

    subscription.status = SubscriptionStatus.ACTIVE;
    subscription.paymentId = paymentId;

    return subscription.save();
  }

  /**
   * Check if student has active subscription
   */
  async hasActiveSubscription(studentId: string, tenantId: string): Promise<boolean> {
    const subscription = await this.getActiveSubscription(studentId, tenantId);
    return !!subscription;
  }

  /**
   * Expire subscriptions (cron job)
   */
  async expireSubscriptions(): Promise<void> {
    await this.subscriptionModel
      .updateMany(
        {
          status: SubscriptionStatus.ACTIVE,
          endDate: { $lte: new Date() },
        },
        {
          $set: { status: SubscriptionStatus.EXPIRED },
        },
      )
      .exec();
  }
}
