import { IsMongoId, IsOptional, IsBoolean, IsNumber, Min, Max } from 'class-validator';

export class UpdateProgressDto {
  @IsMongoId({ message: 'معرف الدرس غير صحيح' })
  lessonId: string;

  @IsOptional()
  @IsBoolean()
  completed?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  videoPosition?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  timeSpent?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  progressPercentage?: number;

  @IsOptional()
  metadata?: Record<string, any>;
}

export class ProgressQueryDto {
  @IsOptional()
  @IsMongoId()
  courseId?: string;

  @IsOptional()
  @IsMongoId()
  lessonId?: string;

  @IsOptional()
  @IsBoolean()
  completed?: boolean;
}
