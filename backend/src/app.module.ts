import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { TenantsModule } from './modules/tenants/tenants.module';
import { EmailsModule } from './modules/emails/emails.module';

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
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
