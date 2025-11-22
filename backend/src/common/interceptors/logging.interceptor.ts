import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { v4 as uuidv4 } from 'uuid';
import { Request, Response } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    const { method, url, ip } = request;

    // Generate or retrieve correlation ID
    const correlationId = (request.headers['x-correlation-id'] as string) || uuidv4();

    // Add correlation ID to request and response headers
    request.headers['x-correlation-id'] = correlationId;
    response.setHeader('X-Correlation-ID', correlationId);

    const now = Date.now();
    const userAgent = request.get('user-agent') || '';

    this.logger.log(
      `[${correlationId}] ${method} ${url} - ${ip} - ${userAgent}`,
    );

    return next.handle().pipe(
      tap({
        next: () => {
          const delay = Date.now() - now;
          const { statusCode } = response;
          this.logger.log(
            `[${correlationId}] ${method} ${url} ${statusCode} - ${delay}ms`,
          );
        },
        error: (error) => {
          const delay = Date.now() - now;
          const statusCode = error.status || 500;
          this.logger.error(
            `[${correlationId}] ${method} ${url} ${statusCode} - ${delay}ms - ${error.message}`,
            error.stack,
          );
        },
      }),
    );
  }
}
