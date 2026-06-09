import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import { Response } from 'express';

/**
 * Translates low-level PostgreSQL/TypeORM query errors into clean HTTP responses
 * instead of leaking a generic 500. Handles:
 *  - invalid UUID syntax           → 400 Bad Request
 *  - foreign key violations        → 400 Bad Request (referenced record missing)
 *  - unique / not-null violations  → 409 / 400
 */
@Catch(QueryFailedError)
export class QueryErrorFilter implements ExceptionFilter {
  private readonly logger = new Logger(QueryErrorFilter.name);

  catch(exception: QueryFailedError & { code?: string }, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const message = exception.message || '';
    const code = exception.code;

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let clientMessage = 'Internal server error';

    if (/invalid input syntax for type uuid/i.test(message)) {
      status = HttpStatus.BAD_REQUEST;
      clientMessage = 'Invalid identifier format';
    } else if (code === '23503' || /foreign key constraint/i.test(message)) {
      // FK violation — the referenced record does not exist
      status = HttpStatus.BAD_REQUEST;
      clientMessage = 'Referenced record does not exist';
    } else if (code === '23505' || /duplicate key|unique constraint/i.test(message)) {
      status = HttpStatus.CONFLICT;
      clientMessage = 'Resource already exists';
    } else if (code === '23502' || /not-null constraint/i.test(message)) {
      status = HttpStatus.BAD_REQUEST;
      clientMessage = 'Missing required field';
    } else {
      // Genuine unexpected DB error — log it for diagnosis
      this.logger.error(`Unhandled query error: ${message}`);
    }

    response.status(status).json({
      success: false,
      statusCode: status,
      message: clientMessage,
    });
  }
}
