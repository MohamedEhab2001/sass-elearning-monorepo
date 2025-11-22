import { IsString, IsNotEmpty, IsNumber, IsOptional, IsEnum, IsObject, Min } from 'class-validator';
import { PayoutMethod, PayoutStatus } from '../schemas/payout.schema';

export class CreatePayoutDto {
  @IsNumber()
  @Min(1)
  amount: number;

  @IsEnum(PayoutMethod)
  method: PayoutMethod;

  @IsObject()
  paymentDetails: {
    accountName?: string;
    accountNumber?: string;
    bankName?: string;
    iban?: string;
    paypalEmail?: string;
    mobileNumber?: string;
  };

  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdatePayoutStatusDto {
  @IsEnum(PayoutStatus)
  status: PayoutStatus;

  @IsString()
  @IsOptional()
  rejectionReason?: string;

  @IsString()
  @IsOptional()
  transactionReference?: string;
}
