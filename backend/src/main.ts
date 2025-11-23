import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import helmet from 'helmet';
import { WinstonModule } from 'nest-winston';
import { transports, format } from 'winston';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  // Setup Winston logger
  const winstonLogger = WinstonModule.createLogger({
    transports: [
      new transports.Console({
        format: format.combine(
          format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
          format.errors({ stack: true }),
          format.splat(),
          format.colorize(),
          format.printf(({ timestamp, level, message, context, trace, correlationId }) => {
            const correlation = correlationId ? `[${correlationId}] ` : '';
            const ctx = context ? `[${context}] ` : '';
            return `${timestamp} ${correlation}${level} ${ctx}${message}${trace ? `\n${trace}` : ''}`;
          }),
        ),
      }),
      new transports.File({
        filename: 'logs/error.log',
        level: 'error',
        format: format.combine(
          format.timestamp(),
          format.json(),
        ),
      }),
      new transports.File({
        filename: 'logs/combined.log',
        format: format.combine(
          format.timestamp(),
          format.json(),
        ),
      }),
    ],
  });

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: winstonLogger,
  });

  // Security headers with Helmet
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
    crossOriginEmbedderPolicy: false,
  }));

  // Serve static files from uploads directory
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  // Global exception filter for consistent error responses
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global logging interceptor
  app.useGlobalInterceptors(new LoggingInterceptor());

  // Enable validation pipe globally
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Enable CORS with strict origin checking
  const allowedOrigins = [
    'http://localhost:3001', // frontend-platform (development)
    'http://localhost:3002', // frontend-academy (development)
    process.env.FRONTEND_PLATFORM_URL,
    process.env.FRONTEND_ACADEMY_URL,
  ].filter(Boolean);

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, Postman, etc.)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn(`CORS: Blocked request from origin: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Correlation-ID'],
    exposedHeaders: ['X-Correlation-ID'],
  });

  // Global prefix for all routes
  app.setGlobalPrefix('api');

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`🚀 Backend is running on: http://localhost:${port}`);
  console.log(`📚 API Documentation: http://localhost:${port}/api`);
  console.log(`🔒 Security: Helmet enabled, CORS configured`);
  console.log(`📊 Logging: Winston configured (logs/combined.log, logs/error.log)`);
}

bootstrap();
