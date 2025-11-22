import { IsNotEmpty, IsOptional, IsString, IsBoolean, IsNumber, Min } from 'class-validator';

export class CreateTenantDto {
  @IsString({ message: 'اسم الأكاديمية مطلوب' })
  @IsNotEmpty({ message: 'اسم الأكاديمية مطلوب' })
  name: string;

  @IsString({ message: 'رابط الأكاديمية مطلوب' })
  @IsNotEmpty({ message: 'رابط الأكاديمية مطلوب' })
  slug: string;

  @IsString({ message: 'معرف المالك مطلوب' })
  @IsNotEmpty({ message: 'معرف المالك مطلوب' })
  ownerId: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateTenantDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  logo?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  colors?: {
    primary?: string;
    secondary?: string;
  };

  @IsOptional()
  @IsBoolean({ message: 'حالة تفعيل الاشتراكات يجب أن تكون true أو false' })
  subscriptionEnabled?: boolean;

  @IsOptional()
  @IsNumber({}, { message: 'سعر الاشتراك الشهري يجب أن يكون رقماً' })
  @Min(0, { message: 'سعر الاشتراك الشهري يجب أن يكون صفر أو أكثر' })
  monthlyPrice?: number;

  @IsOptional()
  @IsNumber({}, { message: 'سعر الاشتراك السنوي يجب أن يكون رقماً' })
  @Min(0, { message: 'سعر الاشتراك السنوي يجب أن يكون صفر أو أكثر' })
  annualPrice?: number;
}
