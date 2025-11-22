import { IsString, IsNumber, IsBoolean, IsEnum, IsArray, IsOptional, MinLength, Min } from 'class-validator';
import { CourseStatus, CourseLevel } from '../schemas/course.schema';

export class CreateCourseDto {
  @IsString()
  @MinLength(3, { message: 'عنوان الدورة يجب أن يكون 3 أحرف على الأقل' })
  title: string;

  @IsString()
  @MinLength(10, { message: 'وصف الدورة يجب أن يكون 10 أحرف على الأقل' })
  description: string;

  @IsOptional()
  @IsString()
  thumbnail?: string;

  @IsEnum(CourseLevel, { message: 'مستوى الدورة غير صحيح' })
  level: CourseLevel;

  @IsNumber({}, { message: 'السعر يجب أن يكون رقماً' })
  @Min(0, { message: 'السعر يجب أن يكون صفر أو أكثر' })
  price: number;

  @IsBoolean()
  isFree: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  whatYouWillLearn?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  requirements?: string[];

  @IsOptional()
  @IsString()
  category?: string;
}

export class UpdateCourseDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  title?: string;

  @IsOptional()
  @IsString()
  @MinLength(10)
  description?: string;

  @IsOptional()
  @IsString()
  thumbnail?: string;

  @IsOptional()
  @IsEnum(CourseLevel)
  level?: CourseLevel;

  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @IsOptional()
  @IsBoolean()
  isFree?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  whatYouWillLearn?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  requirements?: string[];

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class PublishCourseDto {
  @IsEnum(CourseStatus)
  status: CourseStatus;
}
