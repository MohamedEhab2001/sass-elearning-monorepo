import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { PaymobService } from './paymob.service';
import { Transaction, TransactionSchema } from './schemas/transaction.schema';
import { Payout, PayoutSchema } from './schemas/payout.schema';
import { Course, CourseSchema } from '../courses/schemas/course.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { Tenant, TenantSchema } from '../tenants/schemas/tenant.schema';
import { EnrollmentsModule } from '../enrollments/enrollments.module';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';
import { DiscountsModule } from '../discounts/discounts.module';
import { EmailsModule } from '../emails/emails.module';
import { CommissionsModule } from '../commissions/commissions.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Transaction.name, schema: TransactionSchema },
      { name: Payout.name, schema: PayoutSchema },
      { name: Course.name, schema: CourseSchema },
      { name: User.name, schema: UserSchema },
      { name: Tenant.name, schema: TenantSchema },
    ]),
    EnrollmentsModule,
    SubscriptionsModule,
    DiscountsModule,
    EmailsModule,
    CommissionsModule,
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService, PaymobService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
