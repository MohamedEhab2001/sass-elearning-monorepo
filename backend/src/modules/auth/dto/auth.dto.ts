import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional } from 'class-validator';

export class SignupDto {
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

  @IsString({ message: 'اسم الأكاديمية مطلوب' })
  @IsNotEmpty({ message: 'اسم الأكاديمية مطلوب' })
  academyName: string;

  @IsString({ message: 'رابط الأكاديمية مطلوب' })
  @IsNotEmpty({ message: 'رابط الأكاديمية مطلوب' })
  academySlug: string;
}

export class LoginDto {
  @IsEmail({}, { message: 'البريد الإلكتروني غير صحيح' })
  @IsNotEmpty({ message: 'البريد الإلكتروني مطلوب' })
  email: string;

  @IsString({ message: 'كلمة المرور مطلوبة' })
  @IsNotEmpty({ message: 'كلمة المرور مطلوبة' })
  password: string;
}

export class ForgotPasswordDto {
  @IsEmail({}, { message: 'البريد الإلكتروني غير صحيح' })
  @IsNotEmpty({ message: 'البريد الإلكتروني مطلوب' })
  email: string;
}

export class ResetPasswordDto {
  @IsString({ message: 'رمز إعادة التعيين مطلوب' })
  @IsNotEmpty({ message: 'رمز إعادة التعيين مطلوب' })
  token: string;

  @IsString({ message: 'كلمة المرور يجب أن تكون نصاً' })
  @MinLength(8, { message: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' })
  @IsNotEmpty({ message: 'كلمة المرور مطلوبة' })
  newPassword: string;
}

export class VerifyEmailDto {
  @IsString({ message: 'رمز التحقق مطلوب' })
  @IsNotEmpty({ message: 'رمز التحقق مطلوب' })
  token: string;
}
