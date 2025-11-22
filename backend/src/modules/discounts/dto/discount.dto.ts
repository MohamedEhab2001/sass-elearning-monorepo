import { IsString, IsEnum, IsNumber, IsOptional, IsBoolean, IsArray, IsDateString, Min, Max } from 'class-validator';
import { DiscountType, DiscountApplicableTo } from '../schemas/discount.schema';

export class CreateDiscountDto {
  @IsString({ message: 'كود الخصم مطلوب' })
  code: string;

  @IsEnum(DiscountType, { message: 'نوع الخصم غير صحيح' })
  type: DiscountType;

  @IsNumber({}, { message: 'قيمة الخصم يجب أن تكون رقماً' })
  @Min(0, { message: 'قيمة الخصم يجب أن تكون صفر أو أكثر' })
  value: number;

  @IsEnum(DiscountApplicableTo, { message: 'مجال تطبيق الخصم غير صحيح' })
  applicableTo: DiscountApplicableTo;

  @IsOptional()
  @IsArray({ message: 'معرفات الدورات يجب أن تكون مصفوفة' })
  specificCourseIds?: string[];

  @IsOptional()
  @IsNumber({}, { message: 'الحد الأقصى للاستخدام يجب أن يكون رقماً' })
  @Min(1, { message: 'الحد الأقصى للاستخدام يجب أن يكون 1 على الأقل' })
  maxUses?: number;

  @IsDateString({}, { message: 'تاريخ البداية غير صحيح' })
  validFrom: Date;

  @IsDateString({}, { message: 'تاريخ الانتهاء غير صحيح' })
  validUntil: Date;
}

export class UpdateDiscountDto {
  @IsOptional()
  @IsNumber({}, { message: 'قيمة الخصم يجب أن تكون رقماً' })
  @Min(0, { message: 'قيمة الخصم يجب أن تكون صفر أو أكثر' })
  value?: number;

  @IsOptional()
  @IsNumber({}, { message: 'الحد الأقصى للاستخدام يجب أن يكون رقماً' })
  @Min(1, { message: 'الحد الأقصى للاستخدام يجب أن يكون 1 على الأقل' })
  maxUses?: number;

  @IsOptional()
  @IsDateString({}, { message: 'تاريخ البداية غير صحيح' })
  validFrom?: Date;

  @IsOptional()
  @IsDateString({}, { message: 'تاريخ الانتهاء غير صحيح' })
  validUntil?: Date;

  @IsOptional()
  @IsBoolean({ message: 'حالة التفعيل يجب أن تكون قيمة منطقية' })
  isActive?: boolean;
}

export class ValidateDiscountDto {
  @IsString({ message: 'كود الخصم مطلوب' })
  code: string;

  @IsEnum(['course', 'subscription'], { message: 'نوع التطبيق غير صحيح' })
  applicableTo: 'course' | 'subscription';

  @IsOptional()
  @IsString({ message: 'معرف الدورة يجب أن يكون نصاً' })
  courseId?: string;

  @IsNumber({}, { message: 'المبلغ يجب أن يكون رقماً' })
  @Min(0, { message: 'المبلغ يجب أن يكون صفر أو أكثر' })
  amount: number;
}
