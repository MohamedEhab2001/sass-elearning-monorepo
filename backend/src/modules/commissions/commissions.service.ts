import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CommissionTier, CommissionTierDocument } from './schemas/commission-tier.schema';
import { CreateCommissionTierDto, UpdateCommissionTierDto, ReorderCommissionTiersDto } from './dto/commission-tier.dto';
import { ICommissionCalculation, IInstructorRevenueSummary } from '../../../shared/types/commission.types';

@Injectable()
export class CommissionsService {
  constructor(
    @InjectModel(CommissionTier.name) private commissionTierModel: Model<CommissionTierDocument>,
  ) {}

  /**
   * Create a new commission tier
   */
  async create(createCommissionTierDto: CreateCommissionTierDto, tenantId: string): Promise<CommissionTierDocument> {
    // Validate that minRevenue < maxRevenue if maxRevenue is provided
    if (
      createCommissionTierDto.maxRevenue !== undefined &&
      createCommissionTierDto.maxRevenue !== null &&
      createCommissionTierDto.minRevenue >= createCommissionTierDto.maxRevenue
    ) {
      throw new ConflictException('الحد الأدنى للإيرادات يجب أن يكون أقل من الحد الأقصى');
    }

    // Check for overlapping revenue ranges
    await this.checkOverlappingRanges(
      tenantId,
      createCommissionTierDto.minRevenue,
      createCommissionTierDto.maxRevenue,
    );

    // Auto-assign order
    const lastTier = await this.commissionTierModel
      .findOne({ tenantId: new Types.ObjectId(tenantId) })
      .sort({ order: -1 })
      .exec();

    const order = lastTier ? lastTier.order + 1 : 0;

    const tier = new this.commissionTierModel({
      ...createCommissionTierDto,
      tenantId: new Types.ObjectId(tenantId),
      order,
    });

    return tier.save();
  }

  /**
   * Find all tiers for a tenant
   */
  async findAll(tenantId: string, activeOnly = false): Promise<CommissionTierDocument[]> {
    const query: any = { tenantId: new Types.ObjectId(tenantId) };

    if (activeOnly) {
      query.isActive = true;
    }

    return this.commissionTierModel.find(query).sort({ order: 1 }).exec();
  }

  /**
   * Find tier by ID
   */
  async findById(tierId: string): Promise<CommissionTierDocument> {
    const tier = await this.commissionTierModel.findById(tierId).exec();

    if (!tier) {
      throw new NotFoundException('المستوى غير موجود');
    }

    return tier;
  }

  /**
   * Update a tier
   */
  async update(tierId: string, updateCommissionTierDto: UpdateCommissionTierDto): Promise<CommissionTierDocument> {
    const tier = await this.findById(tierId);

    // Validate revenue ranges if updating them
    const minRevenue = updateCommissionTierDto.minRevenue ?? tier.minRevenue;
    const maxRevenue = updateCommissionTierDto.maxRevenue !== undefined ? updateCommissionTierDto.maxRevenue : tier.maxRevenue;

    if (maxRevenue !== null && maxRevenue !== undefined && minRevenue >= maxRevenue) {
      throw new ConflictException('الحد الأدنى للإيرادات يجب أن يكون أقل من الحد الأقصى');
    }

    // Check for overlapping ranges (excluding current tier)
    if (updateCommissionTierDto.minRevenue !== undefined || updateCommissionTierDto.maxRevenue !== undefined) {
      await this.checkOverlappingRanges(tier.tenantId.toString(), minRevenue, maxRevenue, tierId);
    }

    const updatedTier = await this.commissionTierModel
      .findByIdAndUpdate(tierId, { $set: updateCommissionTierDto }, { new: true })
      .exec();

    if (!updatedTier) {
      throw new NotFoundException('المستوى غير موجود');
    }

    return updatedTier;
  }

  /**
   * Delete a tier
   */
  async delete(tierId: string): Promise<void> {
    const result = await this.commissionTierModel.findByIdAndDelete(tierId).exec();

    if (!result) {
      throw new NotFoundException('المستوى غير موجود');
    }
  }

  /**
   * Reorder tiers
   */
  async reorder(tenantId: string, reorderDto: ReorderCommissionTiersDto): Promise<void> {
    const bulkOps = reorderDto.tierOrders.map((item) => ({
      updateOne: {
        filter: {
          _id: new Types.ObjectId(item.tierId),
          tenantId: new Types.ObjectId(tenantId),
        },
        update: { $set: { order: item.order } },
      },
    }));

    await this.commissionTierModel.bulkWrite(bulkOps);
  }

  /**
   * Get the appropriate commission tier for a given revenue amount
   */
  async getTierForRevenue(tenantId: string, revenue: number): Promise<CommissionTierDocument | null> {
    const tiers = await this.commissionTierModel
      .find({
        tenantId: new Types.ObjectId(tenantId),
        isActive: true,
        minRevenue: { $lte: revenue },
        $or: [{ maxRevenue: { $gte: revenue } }, { maxRevenue: null }],
      })
      .sort({ minRevenue: -1 })
      .limit(1)
      .exec();

    return tiers.length > 0 ? tiers[0] : null;
  }

  /**
   * Calculate commission for a transaction
   */
  async calculateCommission(
    tenantId: string,
    instructorRevenue: number,
    transactionAmount: number,
  ): Promise<ICommissionCalculation> {
    const tier = await this.getTierForRevenue(tenantId, instructorRevenue);

    if (!tier) {
      // No tier found - default to 0% commission (instructor gets 100%)
      return {
        grossAmount: transactionAmount,
        commissionRate: 0,
        commissionAmount: 0,
        netAmount: transactionAmount,
        tierId: '',
        tierName: 'No Commission',
      };
    }

    const commissionAmount = (transactionAmount * tier.commissionRate) / 100;
    const netAmount = transactionAmount - commissionAmount;

    return {
      grossAmount: transactionAmount,
      commissionRate: tier.commissionRate,
      commissionAmount: Math.round(commissionAmount * 100) / 100, // Round to 2 decimals
      netAmount: Math.round(netAmount * 100) / 100,
      tierId: tier._id.toString(),
      tierName: tier.nameAr,
    };
  }

  /**
   * Get instructor revenue summary with tier info
   */
  async getInstructorRevenueSummary(
    tenantId: string,
    instructorId: string,
    totalRevenue: number,
    totalCommission: number,
  ): Promise<IInstructorRevenueSummary> {
    const currentTier = await this.getTierForRevenue(tenantId, totalRevenue);

    // Get next tier
    const nextTier = currentTier
      ? await this.commissionTierModel
          .findOne({
            tenantId: new Types.ObjectId(tenantId),
            isActive: true,
            minRevenue: { $gt: currentTier.maxRevenue || totalRevenue },
          })
          .sort({ minRevenue: 1 })
          .exec()
      : await this.commissionTierModel
          .findOne({
            tenantId: new Types.ObjectId(tenantId),
            isActive: true,
          })
          .sort({ minRevenue: 1 })
          .exec();

    let progressToNextTier: number | undefined;
    if (currentTier && nextTier) {
      const rangeSize = (nextTier.minRevenue || 0) - (currentTier.minRevenue || 0);
      const progress = totalRevenue - (currentTier.minRevenue || 0);
      progressToNextTier = rangeSize > 0 ? Math.min((progress / rangeSize) * 100, 100) : 100;
    } else if (!currentTier && nextTier) {
      // No current tier, show progress to first tier
      progressToNextTier = nextTier.minRevenue > 0 ? Math.min((totalRevenue / nextTier.minRevenue) * 100, 100) : 0;
    }

    return {
      instructorId,
      tenantId,
      totalRevenue,
      totalCommission,
      netRevenue: totalRevenue - totalCommission,
      currentTier: currentTier ? currentTier.toObject() : null,
      nextTier: nextTier ? nextTier.toObject() : null,
      progressToNextTier,
    };
  }

  /**
   * Check for overlapping revenue ranges
   */
  private async checkOverlappingRanges(
    tenantId: string,
    minRevenue: number,
    maxRevenue: number | null | undefined,
    excludeTierId?: string,
  ): Promise<void> {
    const query: any = {
      tenantId: new Types.ObjectId(tenantId),
      isActive: true,
    };

    if (excludeTierId) {
      query._id = { $ne: new Types.ObjectId(excludeTierId) };
    }

    // Check if new range overlaps with existing ranges
    // Overlap occurs when:
    // 1. New minRevenue falls within an existing range
    // 2. New maxRevenue falls within an existing range
    // 3. New range completely contains an existing range

    const overlappingTiers = await this.commissionTierModel.find({
      ...query,
      $or: [
        // New minRevenue is within an existing range
        {
          minRevenue: { $lte: minRevenue },
          $or: [{ maxRevenue: { $gte: minRevenue } }, { maxRevenue: null }],
        },
        // New maxRevenue is within an existing range (if maxRevenue is provided)
        ...(maxRevenue !== null && maxRevenue !== undefined
          ? [
              {
                minRevenue: { $lte: maxRevenue },
                $or: [{ maxRevenue: { $gte: maxRevenue } }, { maxRevenue: null }],
              },
            ]
          : []),
        // Existing tier is completely within new range
        ...(maxRevenue !== null && maxRevenue !== undefined
          ? [
              {
                minRevenue: { $gte: minRevenue, $lte: maxRevenue },
              },
            ]
          : [
              {
                minRevenue: { $gte: minRevenue },
              },
            ]),
      ],
    });

    if (overlappingTiers.length > 0) {
      throw new ConflictException('نطاق الإيرادات يتداخل مع مستوى موجود');
    }
  }
}
