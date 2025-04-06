import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  BadRequestException,
} from '@nestjs/common';
import { Response } from 'express';

// Define an interface for your error format
interface FormattedError {
  field: string;
  error: string;
}

@Catch(BadRequestException)
export class ValidationExceptionFilter implements ExceptionFilter {
  catch(exception: BadRequestException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();

    const validationErrors = exception.getResponse() as any;

    // Check if this is likely a validation error
    if (validationErrors && validationErrors.message) {
      // Initialize with the proper type
      const formattedErrors: FormattedError[] = [];

      // Handle different formats of validation errors
      const errorMessages = Array.isArray(validationErrors.message)
        ? validationErrors.message
        : [validationErrors.message];

      errorMessages.forEach((error: any) => {
        // Handle class-validator direct errors
        if (
          error &&
          typeof error === 'object' &&
          error.property &&
          error.constraints
        ) {
          // Handle regular class-validator errors
          Object.keys(error.constraints).forEach((key) => {
            formattedErrors.push({
              field: error.property,
              error: error.constraints[key],
            });
          });
        }
        // Handle pipe-transformed errors
        else if (
          error &&
          typeof error === 'object' &&
          error.target &&
          error.constraints
        ) {
          Object.keys(error.constraints).forEach((key) => {
            formattedErrors.push({
              field: error.property || 'unknown',
              error: error.constraints[key],
            });
          });
        }
        // Handle string error messages
        else if (typeof error === 'string') {
          formattedErrors.push({
            field: 'general',
            error: error,
          });
        }
        // If it's some other format, try to extract what we can
        else if (error && typeof error === 'object') {
          const field =
            error.property || error.field || error.path || 'unknown';
          const errorMsg =
            error.message || error.error || JSON.stringify(error);

          formattedErrors.push({
            field,
            error: errorMsg,
          });
        }
      });

      // Only return formatted errors if we found any
      if (formattedErrors.length > 0) {
        return response.status(status).json({
          message: formattedErrors,
        });
      }
    }

    // If not a validation error or couldn't format it, return the original error
    return response.status(status).json(exception.getResponse());
  }
}
