import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { Tenant, TenantSchema } from '../tenants/schemas/tenant.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { Course, CourseSchema } from '../courses/schemas/course.schema';
import { Transaction, TransactionSchema } from '../payments/schemas/transaction.schema';
import { Payout, PayoutSchema } from '../payments/schemas/payout.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Tenant.name, schema: TenantSchema },
      { name: User.name, schema: UserSchema },
      { name: Course.name, schema: CourseSchema },
      { name: Transaction.name, schema: TransactionSchema },
      { name: Payout.name, schema: PayoutSchema },
    ]),
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
