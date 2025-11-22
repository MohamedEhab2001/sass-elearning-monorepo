import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

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
}
