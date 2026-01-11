/**
 * Custom error classes for better error handling
 */

export class ValidationError extends Error {
  constructor(message: string, public readonly errors?: unknown[]) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends Error {
  constructor(message: string = 'Authentication failed') {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class DatabaseError extends Error {
  constructor(message: string, public readonly originalError?: Error) {
    super(message);
    this.name = 'DatabaseError';
  }
}

export class NotFoundError extends Error {
  constructor(resource: string, id?: number | string) {
    super(id ? `${resource} with id ${id} not found` : `${resource} not found`);
    this.name = 'NotFoundError';
  }
}

/**
 * Sanitizes error messages before sending to renderer
 * Prevents information disclosure
 */
export function sanitizeError(error: unknown): { message: string; code?: string } {
  // In production, we should not expose internal error details
  if (error instanceof ValidationError) {
    return {
      message: 'Validation failed. Please check your input.',
      code: 'VALIDATION_ERROR',
    };
  }
  
  if (error instanceof AuthenticationError) {
    return {
      message: 'Authentication failed. Please check your credentials.',
      code: 'AUTH_ERROR',
    };
  }
  
  if (error instanceof NotFoundError) {
    return {
      message: error.message,
      code: 'NOT_FOUND',
    };
  }
  
  if (error instanceof DatabaseError) {
    // Don't expose database errors
    return {
      message: 'Database operation failed. Please try again.',
      code: 'DATABASE_ERROR',
    };
  }
  
  // Generic error - don't expose details
  if (error instanceof Error) {
    // In development, show more details
    if (process.env.NODE_ENV === 'development') {
      return {
        message: error.message,
        code: 'UNKNOWN_ERROR',
      };
    }
    
    return {
      message: 'An error occurred. Please try again.',
      code: 'UNKNOWN_ERROR',
    };
  }
  
  return {
    message: 'An unexpected error occurred.',
    code: 'UNKNOWN_ERROR',
  };
}
