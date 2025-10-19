// Authentication utilities for secure token handling

interface TokenData {
  userId: string;
  exp: number;
  iat: number;
}

/**
 * Check if a JWT token is expired
 * @param token JWT token string
 * @returns boolean indicating if token is expired
 */
export const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp < currentTime;
  } catch (error) {
    // If we can't parse the token, consider it expired
    return true;
  }
};

/**
 * Get user ID from JWT token
 * @param token JWT token string
 * @returns User ID or null if invalid
 */
export const getUserIdFromToken = (token: string): string | null => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.userId || null;
  } catch (error) {
    return null;
  }
};

/**
 * Refresh authentication token
 * @returns New token or null if refresh failed
 */
export const refreshToken = async (): Promise<string | null> => {
  try {
    const refreshToken = localStorage.getItem('refreshToken');
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      if (response.status === 401) {
        // Refresh token is invalid, clear all tokens
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        return null;
      }
      throw new Error(`Token refresh failed: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.token) {
      throw new Error('Invalid response from token refresh');
    }
    
    // Store the new token
    localStorage.setItem('token', data.token);
    
    // If a new refresh token is provided, store it too
    if (data.refreshToken) {
      localStorage.setItem('refreshToken', data.refreshToken);
    }
    
    return data.token;
  } catch (error) {
    console.error('Token refresh failed:', error);
    // Clear tokens if refresh fails
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    return null;
  }
};

/**
 * Make an authenticated fetch request with automatic token refresh
 * @param url Request URL
 * @param options Fetch options
 * @param timeout Request timeout in milliseconds (default: 15000)
 * @returns Fetch response
 */
export const authenticatedFetch = async (url: string, options: RequestInit = {}, timeout: number = 15000): Promise<Response> => {
  let token = localStorage.getItem('token');
  
  // Check if token exists and is not expired
  if (!token || isTokenExpired(token)) {
    // Try to refresh the token
    const newToken = await refreshToken();
    
    if (newToken) {
      token = newToken;
    } else {
      // If refresh failed, redirect to login
      window.location.href = '/login';
      throw new Error('Authentication required');
    }
  }
  
  // Set default headers
  const defaultHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...options.headers
  };
  
  // Apply timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  // Merge options with defaults
  const fetchOptions = {
    ...options,
    headers: defaultHeaders,
    signal: controller.signal
  };
  
  try {
    const response = await fetch(url, fetchOptions);
    clearTimeout(timeoutId);
    return response;
  } catch (error: any) {
    clearTimeout(timeoutId);
    // Handle network errors
    if (error.name === 'AbortError') {
      throw new Error('Request timeout');
    }
    throw error;
  }
};

/**
 * Sanitize user input to prevent XSS attacks
 * @param input User input string
 * @returns Sanitized string
 */
export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/</g, "&lt;").replace(/>/g, "&gt;");
};

/**
 * Validate email format
 * @param email Email string to validate
 * @returns boolean indicating if email is valid
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 * @param password Password string to validate
 * @returns Object with isValid boolean and message
 */
export const validatePassword = (password: string): { isValid: boolean; message: string } => {
  if (password.length < 8) {
    return { isValid: false, message: 'Password must be at least 8 characters long' };
  }
  
  if (!/[A-Z]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one uppercase letter' };
  }
  
  if (!/[a-z]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one lowercase letter' };
  }
  
  if (!/[0-9]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one number' };
  }
  
  if (!/[^A-Za-z0-9]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one special character' };
  }
  
  return { isValid: true, message: 'Password is valid' };
};

export default {
  isTokenExpired,
  getUserIdFromToken,
  refreshToken,
  authenticatedFetch,
  sanitizeInput,
  validateEmail,
  validatePassword
};