// Rate limiting utility to prevent abuse of API endpoints

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  prefix?: string;
}

interface RateLimitInfo {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private limits: Map<string, RateLimitInfo> = new Map();
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = {
      maxRequests: config.maxRequests,
      windowMs: config.windowMs,
      prefix: config.prefix || 'rate_limit_'
    };
  }

  /**
   * Check if a request is allowed based on rate limiting rules
   * @param key Unique identifier for the rate limit (e.g., IP address, user ID)
   * @returns Object with allowed boolean and retryAfter time if blocked
   */
  public isAllowed(key: string): { allowed: boolean; retryAfter?: number } {
    const fullKey = `${this.config.prefix}${key}`;
    const now = Date.now();
    
    // Clean up expired entries periodically
    if (Math.random() < 0.1) { // 10% chance to clean up
      this.cleanupExpired();
    }
    
    const limitInfo = this.limits.get(fullKey);
    
    // If no record exists or the window has expired, reset the counter
    if (!limitInfo || limitInfo.resetTime <= now) {
      this.limits.set(fullKey, {
        count: 1,
        resetTime: now + this.config.windowMs
      });
      return { allowed: true };
    }
    
    // Increment the counter
    limitInfo.count += 1;
    
    // Check if we've exceeded the limit
    if (limitInfo.count > this.config.maxRequests) {
      const retryAfter = Math.ceil((limitInfo.resetTime - now) / 1000);
      return { allowed: false, retryAfter };
    }
    
    // Update the record
    this.limits.set(fullKey, limitInfo);
    return { allowed: true };
  }

  /**
   * Get the current rate limit status for a key
   * @param key Unique identifier for the rate limit
   * @returns Rate limit status or null if no record exists
   */
  public getStatus(key: string): { count: number; remaining: number; resetTime: number } | null {
    const fullKey = `${this.config.prefix}${key}`;
    const limitInfo = this.limits.get(fullKey);
    
    if (!limitInfo) {
      return null;
    }
    
    const now = Date.now();
    if (limitInfo.resetTime <= now) {
      return null;
    }
    
    return {
      count: limitInfo.count,
      remaining: Math.max(0, this.config.maxRequests - limitInfo.count),
      resetTime: limitInfo.resetTime
    };
  }

  /**
   * Reset the rate limit for a specific key
   * @param key Unique identifier for the rate limit
   */
  public reset(key: string): void {
    const fullKey = `${this.config.prefix}${key}`;
    this.limits.delete(fullKey);
  }

  /**
   * Reset all rate limits
   */
  public resetAll(): void {
    this.limits.clear();
  }

  /**
   * Clean up expired rate limit entries
   */
  private cleanupExpired(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];
    
    // Collect keys to delete first
    this.limits.forEach((limitInfo, key) => {
      if (limitInfo.resetTime <= now) {
        keysToDelete.push(key);
      }
    });
    
    // Delete the collected keys
    keysToDelete.forEach(key => {
      this.limits.delete(key);
    });
  }
}

// Create rate limiters for different types of requests
export const apiRateLimiter = new RateLimiter({
  maxRequests: 100, // 100 requests
  windowMs: 60000,  // per minute
  prefix: 'api_'
});

export const authRateLimiter = new RateLimiter({
  maxRequests: 10,  // 10 requests
  windowMs: 60000,  // per minute
  prefix: 'auth_'
});

export const exportRateLimiter = new RateLimiter({
  maxRequests: 5,   // 5 requests
  windowMs: 300000, // per 5 minutes (more restrictive for exports)
  prefix: 'export_'
});

export default RateLimiter;