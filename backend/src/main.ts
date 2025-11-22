import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Serve static files from uploads directory
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  // Enable validation pipe globally
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Enable CORS for frontend applications
  app.enableCors({
    origin: [
      'http://localhost:3001', // frontend-platform
      'http://localhost:3002', // frontend-academy
      process.env.FRONTEND_PLATFORM_URL || '',
      process.env.FRONTEND_ACADEMY_URL || '',
    ].filter(Boolean),
    credentials: true,
  });

  // Global prefix for all routes
  app.setGlobalPrefix('api');

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`🚀 Backend is running on: http://localhost:${port}`);
  console.log(`📚 API Documentation: http://localhost:${port}/api`);
}

bootstrap();
