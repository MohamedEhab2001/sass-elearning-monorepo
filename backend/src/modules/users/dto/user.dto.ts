import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail({}, { message: 'البريد الإلكتروني غير صحيح' })
  @IsNotEmpty({ message: 'البريد الإلكتروني مطلوب' })
  email: string;

  @IsString({ message: 'كلمة المرور يجب أن تكون نصاً' })
  @MinLength(8, { message: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' })
  @IsNotEmpty({ message: 'كلمة المرور مطلوبة' })
  password: string;

  @IsString({ message: 'الاسم الأول مطلوب' })
  @IsNotEmpty({ message: 'الاسم الأول مطلوب' })
  firstName: string;

  @IsString({ message: 'اسم العائلة مطلوب' })
  @IsNotEmpty({ message: 'اسم العائلة مطلوب' })
  lastName: string;

  @IsString({ message: 'الدور مطلوب' })
  @IsNotEmpty({ message: 'الدور مطلوب' })
  role: string;

  @IsOptional()
  @IsString()
  tenantId?: string;
}

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  @MinLength(8)
  password?: string;
}
