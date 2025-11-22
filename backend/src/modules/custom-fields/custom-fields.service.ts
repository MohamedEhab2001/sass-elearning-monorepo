import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CustomField, CustomFieldDocument, CustomFieldType } from './schemas/custom-field.schema';
import { CreateCustomFieldDto, UpdateCustomFieldDto, ReorderCustomFieldsDto } from './dto/custom-field.dto';

@Injectable()
export class CustomFieldsService {
  constructor(
    @InjectModel(CustomField.name) private customFieldModel: Model<CustomFieldDocument>,
  ) {}

  /**
   * Create a new custom field
   */
  async create(createCustomFieldDto: CreateCustomFieldDto, tenantId: string): Promise<CustomField> {
    // Check for duplicate field name
    const existingField = await this.customFieldModel
      .findOne({
        tenantId: new Types.ObjectId(tenantId),
        fieldName: createCustomFieldDto.fieldName,
      })
      .exec();

    if (existingField) {
      throw new ConflictException('اسم الحقل موجود بالفعل');
    }

    // Validate options for SELECT type
    if (createCustomFieldDto.fieldType === CustomFieldType.SELECT) {
      if (!createCustomFieldDto.options || createCustomFieldDto.options.length === 0) {
        throw new BadRequestException('حقول الاختيار تتطلب خيارات واحدة على الأقل');
      }
    }

    // Get the highest order number and add 1
    const highestOrderField = await this.customFieldModel
      .findOne({ tenantId: new Types.ObjectId(tenantId) })
      .sort({ order: -1 })
      .exec();

    const order = highestOrderField ? highestOrderField.order + 1 : 0;

    const customField = new this.customFieldModel({
      ...createCustomFieldDto,
      tenantId: new Types.ObjectId(tenantId),
      order,
    });

    return customField.save();
  }

  /**
   * Get all custom fields for a tenant
   */
  async findAll(tenantId: string, activeOnly: boolean = false): Promise<CustomField[]> {
    const query: any = { tenantId: new Types.ObjectId(tenantId) };

    if (activeOnly) {
      query.isActive = true;
    }

    return this.customFieldModel
      .find(query)
      .sort({ order: 1 })
      .exec();
  }

  /**
   * Get a custom field by ID
   */
  async findById(fieldId: string, tenantId: string): Promise<CustomField> {
    const field = await this.customFieldModel
      .findOne({
        _id: new Types.ObjectId(fieldId),
        tenantId: new Types.ObjectId(tenantId),
      })
      .exec();

    if (!field) {
      throw new NotFoundException('الحقل المخصص غير موجود');
    }

    return field;
  }

  /**
   * Update a custom field
   */
  async update(
    fieldId: string,
    updateCustomFieldDto: UpdateCustomFieldDto,
    tenantId: string,
  ): Promise<CustomField> {
    const field = await this.findById(fieldId, tenantId);

    // Validate options for SELECT type
    if (updateCustomFieldDto.options !== undefined && field.fieldType === CustomFieldType.SELECT) {
      if (!updateCustomFieldDto.options || updateCustomFieldDto.options.length === 0) {
        throw new BadRequestException('حقول الاختيار تتطلب خيارات واحدة على الأقل');
      }
    }

    Object.assign(field, updateCustomFieldDto);
    return field.save();
  }

  /**
   * Delete a custom field
   */
  async delete(fieldId: string, tenantId: string): Promise<void> {
    const result = await this.customFieldModel
      .findOneAndDelete({
        _id: new Types.ObjectId(fieldId),
        tenantId: new Types.ObjectId(tenantId),
      })
      .exec();

    if (!result) {
      throw new NotFoundException('الحقل المخصص غير موجود');
    }
  }

  /**
   * Reorder custom fields
   */
  async reorder(reorderDto: ReorderCustomFieldsDto, tenantId: string): Promise<CustomField[]> {
    const { fieldIds } = reorderDto;

    // Validate that all field IDs belong to this tenant
    const fields = await this.customFieldModel
      .find({
        _id: { $in: fieldIds.map((id) => new Types.ObjectId(id)) },
        tenantId: new Types.ObjectId(tenantId),
      })
      .exec();

    if (fields.length !== fieldIds.length) {
      throw new BadRequestException('بعض معرفات الحقول غير صحيحة');
    }

    // Update order for each field
    const updatePromises = fieldIds.map((fieldId, index) =>
      this.customFieldModel
        .updateOne(
          { _id: new Types.ObjectId(fieldId) },
          { $set: { order: index } },
        )
        .exec(),
    );

    await Promise.all(updatePromises);

    // Return updated fields
    return this.findAll(tenantId);
  }

  /**
   * Validate custom field values
   */
  async validateCustomFieldValues(
    customFieldValues: Record<string, any>,
    tenantId: string,
  ): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = [];

    // Get all active required fields
    const requiredFields = await this.customFieldModel
      .find({
        tenantId: new Types.ObjectId(tenantId),
        isActive: true,
        required: true,
      })
      .exec();

    // Check required fields
    for (const field of requiredFields) {
      const value = customFieldValues[field.fieldName];

      if (value === undefined || value === null || value === '') {
        errors.push(`${field.fieldLabel} مطلوب`);
        continue;
      }

      // Type-specific validation
      switch (field.fieldType) {
        case CustomFieldType.EMAIL:
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) {
            errors.push(`${field.fieldLabel} يجب أن يكون بريد إلكتروني صحيح`);
          }
          break;

        case CustomFieldType.PHONE:
          const phoneRegex = /^[0-9+\-\s()]+$/;
          if (!phoneRegex.test(value)) {
            errors.push(`${field.fieldLabel} يجب أن يكون رقم هاتف صحيح`);
          }
          break;

        case CustomFieldType.NUMBER:
          if (isNaN(Number(value))) {
            errors.push(`${field.fieldLabel} يجب أن يكون رقماً`);
          }
          break;

        case CustomFieldType.SELECT:
          if (!field.options.includes(value)) {
            errors.push(`${field.fieldLabel} يحتوي على قيمة غير صحيحة`);
          }
          break;

        case CustomFieldType.DATE:
          const date = new Date(value);
          if (isNaN(date.getTime())) {
            errors.push(`${field.fieldLabel} يجب أن يكون تاريخاً صحيحاً`);
          }
          break;
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Get active fields for signup form
   */
  async getActiveFieldsForSignup(tenantId: string): Promise<CustomField[]> {
    return this.findAll(tenantId, true);
  }
}
