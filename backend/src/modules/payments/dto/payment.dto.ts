import { IsMongoId, IsNumber, IsString, IsOptional, Min } from 'class-validator';

export class CreatePaymentDto {
  @IsMongoId({ message: 'معرف الدورة غير صحيح' })
  courseId: string;

  @IsNumber()
  @Min(0, { message: 'المبلغ يجب أن يكون صفر أو أكثر' })
  amount: number;

  @IsOptional()
  @IsString()
  currency?: string;
}

export class PaymobCallbackDto {
  @IsOptional()
  obj?: any;

  @IsOptional()
  type?: string;
}
