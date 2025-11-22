import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EnrollmentsController } from './enrollments.controller';
import { EnrollmentsService } from './enrollments.service';
import { Enrollment, EnrollmentSchema } from './schemas/enrollment.schema';
import { Course, CourseSchema } from '../courses/schemas/course.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { EmailsModule } from '../emails/emails.module';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Enrollment.name, schema: EnrollmentSchema },
      { name: Course.name, schema: CourseSchema },
      { name: User.name, schema: UserSchema },
    ]),
    EmailsModule,
    SubscriptionsModule,
  ],
  controllers: [EnrollmentsController],
  providers: [EnrollmentsService],
  exports: [EnrollmentsService],
})
export class EnrollmentsModule {}
