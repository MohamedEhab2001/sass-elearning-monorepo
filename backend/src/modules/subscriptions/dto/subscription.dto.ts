import { IsEnum, IsOptional, IsString, IsBoolean } from 'class-validator';
import { SubscriptionPlan, SubscriptionStatus } from '../schemas/subscription.schema';

export class CreateSubscriptionDto {
  @IsEnum(SubscriptionPlan, { message: 'نوع الاشتراك غير صحيح' })
  plan: SubscriptionPlan;

  @IsOptional()
  @IsString({ message: 'كود الخصم يجب أن يكون نصاً' })
  discountCode?: string;
}

export class UpdateSubscriptionDto {
  @IsOptional()
  @IsBoolean({ message: 'التجديد التلقائي يجب أن يكون قيمة منطقية' })
  autoRenew?: boolean;

  @IsOptional()
  @IsEnum(SubscriptionStatus, { message: 'حالة الاشتراك غير صحيحة' })
  status?: SubscriptionStatus;
}
