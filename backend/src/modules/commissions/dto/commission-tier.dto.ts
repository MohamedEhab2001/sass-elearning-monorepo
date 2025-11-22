import {
  IsString,
  IsNotEmpty,
  IsNumber,
  Min,
  Max,
  IsOptional,
  IsBoolean,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCommissionTierDto {
  @IsString({ message: 'اسم المستوى مطلوب' })
  @IsNotEmpty({ message: 'اسم المستوى مطلوب' })
  name: string;

  @IsString({ message: 'الاسم بالعربية مطلوب' })
  @IsNotEmpty({ message: 'الاسم بالعربية مطلوب' })
  nameAr: string;

  @IsNumber({}, { message: 'الحد الأدنى للإيرادات يجب أن يكون رقماً' })
  @Min(0, { message: 'الحد الأدنى للإيرادات يجب أن يكون 0 أو أكثر' })
  minRevenue: number;

  @IsOptional()
  @IsNumber({}, { message: 'الحد الأقصى للإيرادات يجب أن يكون رقماً' })
  @Min(0, { message: 'الحد الأقصى للإيرادات يجب أن يكون 0 أو أكثر' })
  maxRevenue?: number;

  @IsNumber({}, { message: 'نسبة العمولة مطلوبة' })
  @Min(0, { message: 'نسبة العمولة يجب أن تكون 0 على الأقل' })
  @Max(100, { message: 'نسبة العمولة يجب أن تكون 100 على الأكثر' })
  commissionRate: number;
}

export class UpdateCommissionTierDto {
  @IsOptional()
  @IsString({ message: 'اسم المستوى يجب أن يكون نصاً' })
  @IsNotEmpty({ message: 'اسم المستوى لا يمكن أن يكون فارغاً' })
  name?: string;

  @IsOptional()
  @IsString({ message: 'الاسم بالعربية يجب أن يكون نصاً' })
  @IsNotEmpty({ message: 'الاسم بالعربية لا يمكن أن يكون فارغاً' })
  nameAr?: string;

  @IsOptional()
  @IsNumber({}, { message: 'الحد الأدنى للإيرادات يجب أن يكون رقماً' })
  @Min(0, { message: 'الحد الأدنى للإيرادات يجب أن يكون 0 أو أكثر' })
  minRevenue?: number;

  @IsOptional()
  @IsNumber({}, { message: 'الحد الأقصى للإيرادات يجب أن يكون رقماً' })
  @Min(0, { message: 'الحد الأقصى للإيرادات يجب أن يكون 0 أو أكثر' })
  maxRevenue?: number;

  @IsOptional()
  @IsNumber({}, { message: 'نسبة العمولة يجب أن تكون رقماً' })
  @Min(0, { message: 'نسبة العمولة يجب أن تكون 0 على الأقل' })
  @Max(100, { message: 'نسبة العمولة يجب أن تكون 100 على الأكثر' })
  commissionRate?: number;

  @IsOptional()
  @IsBoolean({ message: 'حالة التفعيل يجب أن تكون قيمة منطقية' })
  isActive?: boolean;
}

export class TierOrderDto {
  @IsString({ message: 'معرف المستوى مطلوب' })
  @IsNotEmpty({ message: 'معرف المستوى مطلوب' })
  tierId: string;

  @IsNumber({}, { message: 'الترتيب يجب أن يكون رقماً' })
  @Min(0, { message: 'الترتيب يجب أن يكون 0 أو أكثر' })
  order: number;
}

export class ReorderCommissionTiersDto {
  @IsArray({ message: 'ترتيب المستويات يجب أن يكون مصفوفة' })
  @ValidateNested({ each: true })
  @Type(() => TierOrderDto)
  tierOrders: TierOrderDto[];
}
