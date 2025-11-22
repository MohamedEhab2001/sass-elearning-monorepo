import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Discount, DiscountDocument, DiscountType, DiscountApplicableTo } from './schemas/discount.schema';
import { CreateDiscountDto, UpdateDiscountDto, ValidateDiscountDto } from './dto/discount.dto';

@Injectable()
export class DiscountsService {
  constructor(
    @InjectModel(Discount.name) private discountModel: Model<DiscountDocument>,
  ) {}

  /**
   * Create a new discount code
   */
  async create(createDiscountDto: CreateDiscountDto, tenantId: string): Promise<Discount> {
    // Check if code already exists for this tenant
    const existing = await this.discountModel
      .findOne({
        tenantId: new Types.ObjectId(tenantId),
        code: createDiscountDto.code.toUpperCase(),
      })
      .exec();

    if (existing) {
      throw new ConflictException('كود الخصم موجود بالفعل');
    }

    // Validate percentage discount value
    if (createDiscountDto.type === DiscountType.PERCENTAGE && createDiscountDto.value > 100) {
      throw new BadRequestException('نسبة الخصم يجب أن تكون بين 0 و 100');
    }

    // Validate dates
    if (new Date(createDiscountDto.validFrom) >= new Date(createDiscountDto.validUntil)) {
      throw new BadRequestException('تاريخ الانتهاء يجب أن يكون بعد تاريخ البداية');
    }

    const discount = new this.discountModel({
      ...createDiscountDto,
      tenantId: new Types.ObjectId(tenantId),
      code: createDiscountDto.code.toUpperCase(),
      currentUses: 0,
      isActive: true,
      specificCourseIds: createDiscountDto.specificCourseIds?.map(id => new Types.ObjectId(id)) || [],
    });

    return discount.save();
  }

  /**
   * Get all discounts for a tenant
   */
  async findAll(tenantId: string): Promise<Discount[]> {
    return this.discountModel
      .find({ tenantId: new Types.ObjectId(tenantId) })
      .sort({ createdAt: -1 })
      .exec();
  }

  /**
   * Get discount by ID
   */
  async findById(discountId: string, tenantId: string): Promise<Discount> {
    const discount = await this.discountModel
      .findOne({
        _id: new Types.ObjectId(discountId),
        tenantId: new Types.ObjectId(tenantId),
      })
      .exec();

    if (!discount) {
      throw new NotFoundException('كود الخصم غير موجود');
    }

    return discount;
  }

  /**
   * Update discount
   */
  async update(
    discountId: string,
    updateDiscountDto: UpdateDiscountDto,
    tenantId: string,
  ): Promise<Discount> {
    const discount = await this.findById(discountId, tenantId);

    if (updateDiscountDto.value !== undefined) {
      if (discount.type === DiscountType.PERCENTAGE && updateDiscountDto.value > 100) {
        throw new BadRequestException('نسبة الخصم يجب أن تكون بين 0 و 100');
      }
      discount.value = updateDiscountDto.value;
    }

    if (updateDiscountDto.maxUses !== undefined) {
      discount.maxUses = updateDiscountDto.maxUses;
    }

    if (updateDiscountDto.validFrom !== undefined) {
      discount.validFrom = new Date(updateDiscountDto.validFrom);
    }

    if (updateDiscountDto.validUntil !== undefined) {
      discount.validUntil = new Date(updateDiscountDto.validUntil);
    }

    if (updateDiscountDto.isActive !== undefined) {
      discount.isActive = updateDiscountDto.isActive;
    }

    // Validate dates
    if (discount.validFrom >= discount.validUntil) {
      throw new BadRequestException('تاريخ الانتهاء يجب أن يكون بعد تاريخ البداية');
    }

    return discount.save();
  }

  /**
   * Delete discount
   */
  async delete(discountId: string, tenantId: string): Promise<void> {
    const result = await this.discountModel
      .deleteOne({
        _id: new Types.ObjectId(discountId),
        tenantId: new Types.ObjectId(tenantId),
      })
      .exec();

    if (result.deletedCount === 0) {
      throw new NotFoundException('كود الخصم غير موجود');
    }
  }

  /**
   * Validate and apply discount
   */
  async validate(validateDiscountDto: ValidateDiscountDto, tenantId: string): Promise<any> {
    const discount = await this.discountModel
      .findOne({
        tenantId: new Types.ObjectId(tenantId),
        code: validateDiscountDto.code.toUpperCase(),
        isActive: true,
      })
      .exec();

    // Check if discount exists
    if (!discount) {
      return {
        isValid: false,
        message: 'كود الخصم غير صحيح',
        originalAmount: validateDiscountDto.amount,
        discountedAmount: validateDiscountDto.amount,
        discountAmount: 0,
      };
    }

    // Check date validity
    const now = new Date();
    if (now < discount.validFrom || now > discount.validUntil) {
      return {
        isValid: false,
        message: 'كود الخصم غير صالح في هذا الوقت',
        originalAmount: validateDiscountDto.amount,
        discountedAmount: validateDiscountDto.amount,
        discountAmount: 0,
      };
    }

    // Check usage limit
    if (discount.maxUses !== null && discount.currentUses >= discount.maxUses) {
      return {
        isValid: false,
        message: 'تم استخدام كود الخصم بالحد الأقصى',
        originalAmount: validateDiscountDto.amount,
        discountedAmount: validateDiscountDto.amount,
        discountAmount: 0,
      };
    }

    // Check applicability
    const appType = validateDiscountDto.applicableTo;
    if (discount.applicableTo === DiscountApplicableTo.COURSES && appType !== 'course') {
      return {
        isValid: false,
        message: 'كود الخصم صالح للدورات فقط',
        originalAmount: validateDiscountDto.amount,
        discountedAmount: validateDiscountDto.amount,
        discountAmount: 0,
      };
    }

    if (discount.applicableTo === DiscountApplicableTo.SUBSCRIPTIONS && appType !== 'subscription') {
      return {
        isValid: false,
        message: 'كود الخصم صالح للاشتراكات فقط',
        originalAmount: validateDiscountDto.amount,
        discountedAmount: validateDiscountDto.amount,
        discountAmount: 0,
      };
    }

    // Check specific course applicability
    if (
      discount.applicableTo === DiscountApplicableTo.COURSES &&
      discount.specificCourseIds.length > 0 &&
      validateDiscountDto.courseId
    ) {
      const courseIdObj = new Types.ObjectId(validateDiscountDto.courseId);
      const isApplicable = discount.specificCourseIds.some(id => id.equals(courseIdObj));

      if (!isApplicable) {
        return {
          isValid: false,
          message: 'كود الخصم غير صالح لهذه الدورة',
          originalAmount: validateDiscountDto.amount,
          discountedAmount: validateDiscountDto.amount,
          discountAmount: 0,
        };
      }
    }

    // Calculate discount
    let discountAmount = 0;
    if (discount.type === DiscountType.PERCENTAGE) {
      discountAmount = (validateDiscountDto.amount * discount.value) / 100;
    } else {
      discountAmount = Math.min(discount.value, validateDiscountDto.amount);
    }

    const discountedAmount = Math.max(0, validateDiscountDto.amount - discountAmount);

    return {
      isValid: true,
      discount,
      originalAmount: validateDiscountDto.amount,
      discountedAmount,
      discountAmount,
      message: 'تم تطبيق كود الخصم بنجاح',
    };
  }

  /**
   * Increment usage count
   */
  async incrementUsage(discountId: string): Promise<void> {
    await this.discountModel
      .updateOne(
        { _id: new Types.ObjectId(discountId) },
        { $inc: { currentUses: 1 } },
      )
      .exec();
  }
}
