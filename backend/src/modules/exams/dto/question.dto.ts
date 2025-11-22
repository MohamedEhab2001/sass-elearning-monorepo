import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  Min,
  IsArray,
  IsEnum,
  IsMongoId,
  ValidateIf,
} from 'class-validator';
import { QuestionType } from '../../../../shared/types/exam.types';

export class CreateQuestionDto {
  @IsMongoId({ message: 'معرف الامتحان غير صحيح' })
  @IsNotEmpty({ message: 'معرف الامتحان مطلوب' })
  examId: string;

  @IsEnum(QuestionType, { message: 'نوع السؤال غير صحيح' })
  @IsNotEmpty({ message: 'نوع السؤال مطلوب' })
  questionType: QuestionType;

  @IsString({ message: 'نص السؤال مطلوب' })
  @IsNotEmpty({ message: 'نص السؤال مطلوب' })
  questionText: string;

  @IsNumber({}, { message: 'النقاط يجب أن تكون رقماً' })
  @Min(0, { message: 'النقاط يجب أن تكون 0 على الأقل' })
  points: number;

  @IsOptional()
  @IsNumber({}, { message: 'الترتيب يجب أن يكون رقماً' })
  order?: number;

  // For MCQ
  @ValidateIf((o) => o.questionType === QuestionType.MCQ)
  @IsArray({ message: 'الخيارات يجب أن تكون مصفوفة' })
  @IsNotEmpty({ message: 'الخيارات مطلوبة للأسئلة متعددة الخيارات' })
  options?: string[];

  @ValidateIf((o) => o.questionType === QuestionType.MCQ)
  @IsNumber({}, { message: 'الإجابة الصحيحة يجب أن تكون رقماً' })
  @IsNotEmpty({ message: 'الإجابة الصحيحة مطلوبة للأسئلة متعددة الخيارات' })
  correctAnswer?: number;

  // For Essay
  @ValidateIf((o) => o.questionType === QuestionType.ESSAY)
  @IsOptional()
  @IsString({ message: 'معايير التقييم يجب أن تكون نصاً' })
  rubric?: string;
}

export class UpdateQuestionDto {
  @IsOptional()
  @IsString({ message: 'نص السؤال يجب أن يكون نصاً' })
  @IsNotEmpty({ message: 'نص السؤال لا يمكن أن يكون فارغاً' })
  questionText?: string;

  @IsOptional()
  @IsNumber({}, { message: 'النقاط يجب أن تكون رقماً' })
  @Min(0, { message: 'النقاط يجب أن تكون 0 على الأقل' })
  points?: number;

  @IsOptional()
  @IsNumber({}, { message: 'الترتيب يجب أن يكون رقماً' })
  order?: number;

  @IsOptional()
  @IsArray({ message: 'الخيارات يجب أن تكون مصفوفة' })
  options?: string[];

  @IsOptional()
  @IsNumber({}, { message: 'الإجابة الصحيحة يجب أن تكون رقماً' })
  correctAnswer?: number;

  @IsOptional()
  @IsString({ message: 'معايير التقييم يجب أن تكون نصاً' })
  rubric?: string;
}
