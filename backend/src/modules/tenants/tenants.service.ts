import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Tenant, TenantDocument } from './schemas/tenant.schema';
import { CreateTenantDto, UpdateTenantDto } from './dto/tenant.dto';

@Injectable()
export class TenantsService {
  constructor(@InjectModel(Tenant.name) private tenantModel: Model<TenantDocument>) {}

  async create(createTenantDto: CreateTenantDto): Promise<TenantDocument> {
    const existingTenant = await this.tenantModel.findOne({ slug: createTenantDto.slug });
    if (existingTenant) {
      throw new ConflictException('اسم الأكاديمية محجوز بالفعل');
    }

    const tenant = new this.tenantModel(createTenantDto);
    return tenant.save();
  }

  async findAll(filter: any = {}): Promise<TenantDocument[]> {
    return this.tenantModel.find(filter).populate('ownerId', 'firstName lastName email').exec();
  }

  async findById(id: string | Types.ObjectId): Promise<TenantDocument> {
    const tenant = await this.tenantModel
      .findById(id)
      .populate('ownerId', 'firstName lastName email')
      .exec();

    if (!tenant) {
      throw new NotFoundException('الأكاديمية غير موجودة');
    }

    return tenant;
  }

  async findBySlug(slug: string): Promise<TenantDocument | null> {
    return this.tenantModel
      .findOne({ slug: slug.toLowerCase() })
      .populate('ownerId', 'firstName lastName email')
      .exec();
  }

  async findByOwnerId(ownerId: string | Types.ObjectId): Promise<TenantDocument | null> {
    return this.tenantModel.findOne({ ownerId }).exec();
  }

  async update(id: string | Types.ObjectId, updateTenantDto: UpdateTenantDto): Promise<TenantDocument> {
    const tenant = await this.tenantModel
      .findByIdAndUpdate(id, updateTenantDto, { new: true })
      .exec();

    if (!tenant) {
      throw new NotFoundException('الأكاديمية غير موجودة');
    }

    return tenant;
  }

  async delete(id: string | Types.ObjectId): Promise<void> {
    const result = await this.tenantModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('الأكاديمية غير موجودة');
    }
  }

  async updateRevenue(
    id: string | Types.ObjectId,
    amount: number,
    commission: number,
  ): Promise<void> {
    await this.tenantModel
      .findByIdAndUpdate(id, {
        $inc: {
          totalRevenue: amount,
          availableBalance: amount - commission,
          totalCommission: commission,
        },
      })
      .exec();
  }

  async deductBalance(id: string | Types.ObjectId, amount: number): Promise<void> {
    await this.tenantModel
      .findByIdAndUpdate(id, {
        $inc: { availableBalance: -amount },
      })
      .exec();
  }
}
