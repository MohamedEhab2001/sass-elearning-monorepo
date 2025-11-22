import { IsMongoId, IsOptional, IsNumber, Min } from 'class-validator';

export class CreateEnrollmentDto {
  @IsMongoId({ message: 'معرف الدورة غير صحيح' })
  courseId: string;

  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'المبلغ المدفوع يجب أن يكون صفر أو أكثر' })
  pricePaid?: number;

  @IsOptional()
  paymentId?: string;
}

export class EnrollmentQueryDto {
  @IsOptional()
  @IsMongoId()
  courseId?: string;

  @IsOptional()
  status?: string;
}
