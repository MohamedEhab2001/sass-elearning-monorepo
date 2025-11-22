import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard } from '@nestjs/throttler';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { TenantsModule } from './modules/tenants/tenants.module';
import { EmailsModule } from './modules/emails/emails.module';
import { CoursesModule } from './modules/courses/courses.module';
import { LessonsModule } from './modules/lessons/lessons.module';
import { UploadsModule } from './modules/uploads/uploads.module';
import { EnrollmentsModule } from './modules/enrollments/enrollments.module';
import { ProgressModule } from './modules/progress/progress.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module';
import { DiscountsModule } from './modules/discounts/discounts.module';
import { CustomFieldsModule } from './modules/custom-fields/custom-fields.module';
import { ExamsModule } from './modules/exams/exams.module';
import { CommissionsModule } from './modules/commissions/commissions.module';
import { DomainsModule } from './modules/domains/domains.module';
import { UiConfigModule } from './modules/ui-config/ui-config.module';
import { AdminModule } from './modules/admin/admin.module';
import { HealthModule } from './modules/health/health.module';

@Module({
  imports: [
    // Config module - loads .env
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // MongoDB connection
    MongooseModule.forRootAsync({
      useFactory: () => ({
        uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/academy-saas',
      }),
    }),

    // Rate limiting - 100 requests per 15 minutes per IP
    ThrottlerModule.forRoot([
      {
        ttl: 900000, // 15 minutes in milliseconds
        limit: 100,  // 100 requests
      },
    ]),

    // Feature modules
    AuthModule,
    UsersModule,
    TenantsModule,
    EmailsModule,
    CoursesModule,
    LessonsModule,
    UploadsModule,
    EnrollmentsModule,
    ProgressModule,
    PaymentsModule,
    SubscriptionsModule,
    DiscountsModule,
    CustomFieldsModule,
    ExamsModule,
    CommissionsModule,
    DomainsModule,
    UiConfigModule,
    AdminModule,
    HealthModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
