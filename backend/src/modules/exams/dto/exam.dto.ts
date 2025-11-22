import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  Min,
  Max,
  IsBoolean,
  IsArray,
  IsEnum,
  ValidateNested,
  IsMongoId,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ExamStatus, VisibilityRule } from '../../../../shared/types/exam.types';

export class CreateExamDto {
  @IsOptional()
  @IsMongoId({ message: 'معرف الدورة غير صحيح' })
  courseId?: string;

  @IsString({ message: 'عنوان الامتحان مطلوب' })
  @IsNotEmpty({ message: 'عنوان الامتحان مطلوب' })
  title: string;

  @IsString({ message: 'وصف الامتحان مطلوب' })
  @IsNotEmpty({ message: 'وصف الامتحان مطلوب' })
  description: string;

  @IsOptional()
  @IsString({ message: 'التعليمات يجب أن تكون نصاً' })
  instructions?: string;

  @IsOptional()
  @IsNumber({}, { message: 'المدة يجب أن تكون رقماً' })
  @Min(1, { message: 'المدة يجب أن تكون دقيقة واحدة على الأقل' })
  duration?: number;

  @IsNumber({}, { message: 'درجة النجاح مطلوبة' })
  @Min(0, { message: 'درجة النجاح يجب أن تكون 0 على الأقل' })
  @Max(100, { message: 'درجة النجاح يجب أن تكون 100 على الأكثر' })
  passingScore: number;

  @IsOptional()
  @IsArray({ message: 'قواعد الظهور يجب أن تكون مصفوفة' })
  visibilityRules?: VisibilityRule[];

  @IsOptional()
  @IsBoolean({ message: 'عرض النتائج فوراً يجب أن يكون قيمة منطقية' })
  showResultsImmediately?: boolean;

  @IsOptional()
  @IsBoolean({ message: 'السماح بإعادة المحاولة يجب أن يكون قيمة منطقية' })
  allowRetake?: boolean;

  @IsOptional()
  @IsNumber({}, { message: 'الحد الأقصى للمحاولات يجب أن يكون رقماً' })
  @Min(1, { message: 'الحد الأقصى للمحاولات يجب أن يكون 1 على الأقل' })
  maxAttempts?: number;

  @IsOptional()
  @IsBoolean({ message: 'عشوائية الأسئلة يجب أن تكون قيمة منطقية' })
  randomizeQuestions?: boolean;

  @IsOptional()
  @IsBoolean({ message: 'عشوائية الخيارات يجب أن تكون قيمة منطقية' })
  randomizeOptions?: boolean;
}

export class UpdateExamDto {
  @IsOptional()
  @IsMongoId({ message: 'معرف الدورة غير صحيح' })
  courseId?: string;

  @IsOptional()
  @IsString({ message: 'عنوان الامتحان يجب أن يكون نصاً' })
  @IsNotEmpty({ message: 'عنوان الامتحان لا يمكن أن يكون فارغاً' })
  title?: string;

  @IsOptional()
  @IsString({ message: 'وصف الامتحان يجب أن يكون نصاً' })
  @IsNotEmpty({ message: 'وصف الامتحان لا يمكن أن يكون فارغاً' })
  description?: string;

  @IsOptional()
  @IsString({ message: 'التعليمات يجب أن تكون نصاً' })
  instructions?: string;

  @IsOptional()
  @IsNumber({}, { message: 'المدة يجب أن تكون رقماً' })
  @Min(1, { message: 'المدة يجب أن تكون دقيقة واحدة على الأقل' })
  duration?: number;

  @IsOptional()
  @IsNumber({}, { message: 'درجة النجاح يجب أن تكون رقماً' })
  @Min(0, { message: 'درجة النجاح يجب أن تكون 0 على الأقل' })
  @Max(100, { message: 'درجة النجاح يجب أن تكون 100 على الأكثر' })
  passingScore?: number;

  @IsOptional()
  @IsEnum(ExamStatus, { message: 'حالة الامتحان غير صحيحة' })
  status?: ExamStatus;

  @IsOptional()
  @IsArray({ message: 'قواعد الظهور يجب أن تكون مصفوفة' })
  visibilityRules?: VisibilityRule[];

  @IsOptional()
  @IsBoolean({ message: 'عرض النتائج فوراً يجب أن يكون قيمة منطقية' })
  showResultsImmediately?: boolean;

  @IsOptional()
  @IsBoolean({ message: 'السماح بإعادة المحاولة يجب أن يكون قيمة منطقية' })
  allowRetake?: boolean;

  @IsOptional()
  @IsNumber({}, { message: 'الحد الأقصى للمحاولات يجب أن يكون رقماً' })
  @Min(1, { message: 'الحد الأقصى للمحاولات يجب أن يكون 1 على الأقل' })
  maxAttempts?: number;

  @IsOptional()
  @IsBoolean({ message: 'عشوائية الأسئلة يجب أن تكون قيمة منطقية' })
  randomizeQuestions?: boolean;

  @IsOptional()
  @IsBoolean({ message: 'عشوائية الخيارات يجب أن تكون قيمة منطقية' })
  randomizeOptions?: boolean;
}
