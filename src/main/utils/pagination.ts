/**
 * Pagination utilities for database queries
 */

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/**
 * Calculates offset from page and pageSize
 */
export function getOffset(page: number, pageSize: number): number {
  return (page - 1) * pageSize;
}

/**
 * Validates pagination parameters
 */
export function validatePagination(page: number, pageSize: number): void {
  if (page < 1) {
    throw new Error('Page must be greater than 0');
  }
  if (pageSize < 1 || pageSize > 100) {
    throw new Error('Page size must be between 1 and 100');
  }
}

/**
 * Creates paginated result
 */
export function createPaginatedResult<T>(
  data: T[],
  page: number,
  pageSize: number,
  total: number
): PaginatedResult<T> {
  const totalPages = Math.ceil(total / pageSize);
  
  return {
    data,
    pagination: {
      page,
      pageSize,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
}
