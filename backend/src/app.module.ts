import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { TenantsModule } from './modules/tenants/tenants.module';
import { EmailsModule } from './modules/emails/emails.module';
import { CoursesModule } from './modules/courses/courses.module';
import { LessonsModule } from './modules/lessons/lessons.module';
import { UploadsModule } from './modules/uploads/uploads.module';

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

    // Feature modules
    AuthModule,
    UsersModule,
    TenantsModule,
    EmailsModule,
    CoursesModule,
    LessonsModule,
    UploadsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
