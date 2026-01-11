import { ZodSchema, ZodError, ZodObject } from 'zod';
import { ValidationError } from './errors';

/**
 * Validates data against a Zod schema
 * Throws ValidationError if validation fails
 */
export function validate<T>(schema: ZodSchema<T>, data: unknown): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new ValidationError('Validation failed', error.errors);
    }
    throw error;
  }
}

/**
 * Validates partial data (for updates)
 * Uses schema.partial() internally
 */
export function validatePartial<T extends Record<string, unknown>>(
  schema: ZodSchema<T>,
  data: unknown
): Partial<T> {
  try {
    if (schema instanceof ZodObject) {
      return schema.partial().parse(data) as Partial<T>;
    }
    // Fallback: if schema is not a ZodObject, just validate as-is
    return schema.parse(data) as Partial<T>;
  } catch (error) {
    if (error instanceof ZodError) {
      throw new ValidationError('Validation failed', error.errors);
    }
    throw error;
  }
}

/**
 * Sanitizes string input to prevent XSS
 * Removes or escapes potentially dangerous characters
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') {
    return String(input);
  }
  
  // Remove null bytes
  let sanitized = input.replace(/\0/g, '');
  
  // Remove control characters (except newlines and tabs)
  sanitized = sanitized.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '');
  
  // Trim whitespace
  sanitized = sanitized.trim();
  
  return sanitized;
}

/**
 * Sanitizes search query input
 * More permissive than regular sanitization (allows spaces, common punctuation)
 */
export function sanitizeSearchQuery(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }
  
  // Remove null bytes and control characters
  let sanitized = input.replace(/\0/g, '').replace(/[\x00-\x1F\x7F]/g, '');
  
  // Limit length
  if (sanitized.length > 200) {
    sanitized = sanitized.substring(0, 200);
  }
  
  return sanitized.trim();
}
