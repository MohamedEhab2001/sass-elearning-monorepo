import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const correlationId = request.headers['x-correlation-id'] as string;

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'حدث خطأ داخلي في الخادم';
    let error = 'Internal Server Error';
    let details: any = undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        const response = exceptionResponse as any;
        message = response.message || message;
        error = response.error || error;
        details = response.details;
      }
    } else if (exception instanceof Error) {
      // Don't expose internal error details in production
      if (process.env.NODE_ENV === 'development') {
        message = exception.message;
        details = exception.stack;
      }
    }

    // Log the error with correlation ID
    this.logger.error(
      `${request.method} ${request.url} - Status: ${status} - ${exception instanceof Error ? exception.message : 'Unknown error'}`,
      exception instanceof Error ? exception.stack : undefined,
      correlationId,
    );

    // Prepare error response
    const errorResponse: any = {
      success: false,
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message: Array.isArray(message) ? message : [message],
      error,
    };

    // Add correlation ID if present
    if (correlationId) {
      errorResponse.correlationId = correlationId;
    }

    // Add details in development mode only
    if (process.env.NODE_ENV === 'development' && details) {
      errorResponse.details = details;
    }

    response.status(status).json(errorResponse);
  }
}
