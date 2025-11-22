import { IsString, IsEnum, IsBoolean, IsOptional, IsArray, IsNumber, Min } from 'class-validator';
import { CustomFieldType } from '../schemas/custom-field.schema';

export class CreateCustomFieldDto {
  @IsString({ message: 'اسم الحقل الداخلي مطلوب' })
  fieldName: string;

  @IsString({ message: 'تسمية الحقل مطلوبة' })
  fieldLabel: string;

  @IsEnum(CustomFieldType, { message: 'نوع الحقل غير صحيح' })
  fieldType: CustomFieldType;

  @IsOptional()
  @IsArray({ message: 'الخيارات يجب أن تكون مصفوفة' })
  @IsString({ each: true, message: 'كل خيار يجب أن يكون نصاً' })
  options?: string[];

  @IsBoolean({ message: 'حالة الإلزامية يجب أن تكون true أو false' })
  required: boolean;

  @IsOptional()
  @IsString({ message: 'النص التوضيحي يجب أن يكون نصاً' })
  placeholder?: string;
}

export class UpdateCustomFieldDto {
  @IsOptional()
  @IsString({ message: 'تسمية الحقل يجب أن تكون نصاً' })
  fieldLabel?: string;

  @IsOptional()
  @IsArray({ message: 'الخيارات يجب أن تكون مصفوفة' })
  @IsString({ each: true, message: 'كل خيار يجب أن يكون نصاً' })
  options?: string[];

  @IsOptional()
  @IsBoolean({ message: 'حالة الإلزامية يجب أن تكون true أو false' })
  required?: boolean;

  @IsOptional()
  @IsString({ message: 'النص التوضيحي يجب أن يكون نصاً' })
  placeholder?: string;

  @IsOptional()
  @IsBoolean({ message: 'حالة التفعيل يجب أن تكون true أو false' })
  isActive?: boolean;

  @IsOptional()
  @IsNumber({}, { message: 'ترتيب الحقل يجب أن يكون رقماً' })
  @Min(0, { message: 'ترتيب الحقل يجب أن يكون صفر أو أكثر' })
  order?: number;
}

export class ReorderCustomFieldsDto {
  @IsArray({ message: 'معرفات الحقول يجب أن تكون مصفوفة' })
  @IsString({ each: true, message: 'كل معرف حقل يجب أن يكون نصاً' })
  fieldIds: string[];
}

export class ValidateCustomFieldsDto {
  customFieldValues: Record<string, any>;
}
