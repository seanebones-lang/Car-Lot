/**
 * Simple in-memory rate limiter
 * For production, consider using a more robust solution (Redis, etc.)
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Checks if a request should be rate limited
 * @param key Unique identifier for the rate limit (e.g., IP address, user ID)
 * @param maxRequests Maximum number of requests allowed
 * @param windowMs Time window in milliseconds
 * @returns true if request should be allowed, false if rate limited
 */
export function checkRateLimit(key: string, maxRequests: number = 10, windowMs: number = 60000): boolean {
  const now = Date.now();
  const entry = rateLimitStore.get(key);
  
  if (!entry || now > entry.resetTime) {
    // Create new entry or reset expired entry
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + windowMs,
    });
    return true;
  }
  
  if (entry.count >= maxRequests) {
    return false; // Rate limited
  }
  
  // Increment count
  entry.count++;
  return true;
}

/**
 * Clears rate limit for a key (useful for testing or manual reset)
 */
export function clearRateLimit(key: string): void {
  rateLimitStore.delete(key);
}

/**
 * Clears all expired rate limit entries (cleanup)
 * Should be called periodically
 */
export function cleanupExpiredEntries(): void {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}

// Cleanup expired entries every 5 minutes
setInterval(cleanupExpiredEntries, 5 * 60 * 1000);
