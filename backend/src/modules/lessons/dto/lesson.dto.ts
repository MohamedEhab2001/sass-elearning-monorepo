import { IsString, IsNumber, IsBoolean, IsEnum, IsOptional, IsMongoId, MinLength, Min } from 'class-validator';
import { LessonType } from '../schemas/lesson.schema';

export class CreateLessonDto {
  @IsString()
  @MinLength(3, { message: 'عنوان الدرس يجب أن يكون 3 أحرف على الأقل' })
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsMongoId({ message: 'معرف الدورة غير صحيح' })
  courseId: string;

  @IsEnum(LessonType, { message: 'نوع الدرس غير صحيح' })
  type: LessonType;

  @IsOptional()
  @IsString()
  videoUrl?: string;

  @IsOptional()
  @IsString()
  pdfUrl?: string;

  @IsOptional()
  @IsString()
  textContent?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  duration?: number;

  @IsNumber()
  @Min(0, { message: 'ترتيب الدرس يجب أن يكون صفر أو أكثر' })
  order: number;

  @IsOptional()
  @IsBoolean()
  isFree?: boolean;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}

export class UpdateLessonDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(LessonType)
  type?: LessonType;

  @IsOptional()
  @IsString()
  videoUrl?: string;

  @IsOptional()
  @IsString()
  pdfUrl?: string;

  @IsOptional()
  @IsString()
  textContent?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  duration?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  order?: number;

  @IsOptional()
  @IsBoolean()
  isFree?: boolean;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}

export class ReorderLessonsDto {
  @IsMongoId({ message: 'معرف الدورة غير صحيح' })
  courseId: string;

  @IsArray()
  @IsMongoId({ each: true, message: 'معرفات الدروس غير صحيحة' })
  lessonIds: string[];
}
