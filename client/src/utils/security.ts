// Comprehensive security utilities for the HeartGuard application

import { sanitizeInput as baseSanitizeInput } from './auth';
import RateLimiter, { apiRateLimiter, authRateLimiter, exportRateLimiter } from './rateLimiter';

/**
 * Sanitize user input to prevent XSS attacks
 * @param input User input string
 * @returns Sanitized string
 */
export const sanitizeInput = (input: string): string => {
  return baseSanitizeInput(input);
};

/**
 * Validate and sanitize user input for different data types
 */
export const validateAndSanitize = {
  /**
   * Validate and sanitize text input
   * @param input Text input to validate
   * @param maxLength Maximum allowed length
   * @returns Sanitized text or throws error
   */
  text(input: string, maxLength: number = 1000): string {
    if (typeof input !== 'string') {
      throw new Error('Input must be a string');
    }
    
    if (input.length > maxLength) {
      throw new Error(`Input exceeds maximum length of ${maxLength} characters`);
    }
    
    return sanitizeInput(input);
  },
  
  /**
   * Validate and sanitize numeric input
   * @param input Numeric input to validate
   * @param min Minimum allowed value
   * @param max Maximum allowed value
   * @returns Validated number or throws error
   */
  number(input: any, min: number = 0, max: number = Number.MAX_SAFE_INTEGER): number {
    const num = Number(input);
    
    if (isNaN(num)) {
      throw new Error('Input must be a valid number');
    }
    
    if (num < min || num > max) {
      throw new Error(`Number must be between ${min} and ${max}`);
    }
    
    return num;
  },
  
  /**
   * Validate and sanitize date input
   * @param input Date input to validate
   * @returns Validated date string or throws error
   */
  date(input: string): string {
    if (typeof input !== 'string') {
      throw new Error('Date input must be a string');
    }
    
    const date = new Date(input);
    
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date format');
    }
    
    // Ensure the date is not in the future
    const now = new Date();
    if (date > now) {
      throw new Error('Date cannot be in the future');
    }
    
    return date.toISOString();
  },
  
  /**
   * Validate and sanitize enum input
   * @param input Input to validate
   * @param allowedValues Array of allowed values
   * @returns Validated value or throws error
   */
  enum<T>(input: string, allowedValues: T[]): T {
    if (typeof input !== 'string') {
      throw new Error('Input must be a string');
    }
    
    const sanitizedInput = sanitizeInput(input) as T;
    
    if (!allowedValues.includes(sanitizedInput)) {
      throw new Error(`Invalid value. Allowed values: ${allowedValues.join(', ')}`);
    }
    
    return sanitizedInput;
  }
};

/**
 * Check rate limit for API requests
 * @param key Unique identifier for the rate limit (e.g., user ID, IP address)
 * @param type Type of request ('api', 'auth', 'export')
 * @returns Object with allowed boolean and retryAfter time if blocked
 */
export const checkRateLimit = (key: string, type: 'api' | 'auth' | 'export' = 'api'): { 
  allowed: boolean; 
  retryAfter?: number;
  remaining?: number;
} => {
  let limiter: RateLimiter;
  
  switch (type) {
    case 'auth':
      limiter = authRateLimiter;
      break;
    case 'export':
      limiter = exportRateLimiter;
      break;
    default:
      limiter = apiRateLimiter;
  }
  
  const result = limiter.isAllowed(key);
  
  // Get remaining requests info
  const status = limiter.getStatus(key);
  
  return {
    ...result,
    remaining: status?.remaining
  };
};

/**
 * Generate a secure random string
 * @param length Length of the string to generate
 * @returns Secure random string
 */
export const generateSecureRandomString = (length: number = 32): string => {
  const array = new Uint8Array(length);
  if (typeof window !== 'undefined' && window.crypto) {
    window.crypto.getRandomValues(array);
  } else {
    // Fallback for Node.js environment
    for (let i = 0; i < length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
  }
  
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

/**
 * Hash a string using a simple hash function (for client-side use only)
 * Note: This is not cryptographically secure and should only be used for non-sensitive data
 * @param str String to hash
 * @returns Hashed string
 */
export const simpleHash = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash.toString(36);
};

/**
 * Validate CSRF token
 * @param token CSRF token to validate
 * @returns boolean indicating if token is valid
 */
export const validateCSRFToken = (token: string): boolean => {
  // In a real implementation, this would validate against a stored token
  // For now, we'll just check if it exists and has reasonable length
  return typeof token === 'string' && token.length > 10;
};

/**
 * Create a CSRF token
 * @returns CSRF token
 */
export const createCSRFToken = (): string => {
  return generateSecureRandomString(32);
};

/**
 * Security headers configuration
 */
export const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:;",
  'Referrer-Policy': 'strict-origin-when-cross-origin'
};

export default {
  sanitizeInput,
  validateAndSanitize,
  checkRateLimit,
  generateSecureRandomString,
  simpleHash,
  validateCSRFToken,
  createCSRFToken,
  securityHeaders
};