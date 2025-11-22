import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  Min,
  IsArray,
  IsMongoId,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class AnswerDto {
  @IsMongoId({ message: 'معرف السؤال غير صحيح' })
  @IsNotEmpty({ message: 'معرف السؤال مطلوب' })
  questionId: string;

  @IsOptional()
  @IsNumber({}, { message: 'الخيار المختار يجب أن يكون رقماً' })
  selectedOption?: number;

  @IsOptional()
  @IsString({ message: 'النص يجب أن يكون نصاً' })
  essayText?: string;
}

export class SubmitExamDto {
  @IsMongoId({ message: 'معرف الامتحان غير صحيح' })
  @IsNotEmpty({ message: 'معرف الامتحان مطلوب' })
  examId: string;

  @IsArray({ message: 'الإجابات يجب أن تكون مصفوفة' })
  @ValidateNested({ each: true })
  @Type(() => AnswerDto)
  answers: AnswerDto[];

  @IsOptional()
  @IsNumber({}, { message: 'الوقت المستغرق يجب أن يكون رقماً' })
  @Min(0, { message: 'الوقت المستغرق يجب أن يكون 0 على الأقل' })
  timeSpent?: number;
}

export class GradeEssayDto {
  @IsMongoId({ message: 'معرف السؤال غير صحيح' })
  @IsNotEmpty({ message: 'معرف السؤال مطلوب' })
  questionId: string;

  @IsNumber({}, { message: 'النقاط يجب أن تكون رقماً' })
  @Min(0, { message: 'النقاط يجب أن تكون 0 على الأقل' })
  points: number;

  @IsOptional()
  @IsString({ message: 'الملاحظات يجب أن تكون نصاً' })
  feedback?: string;
}

export class StartExamDto {
  @IsMongoId({ message: 'معرف الامتحان غير صحيح' })
  @IsNotEmpty({ message: 'معرف الامتحان مطلوب' })
  examId: string;
}
