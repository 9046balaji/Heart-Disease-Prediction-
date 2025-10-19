import { Request, Response, NextFunction } from "express";

// Base custom error class
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly details?: any;

  constructor(message: string, statusCode: number, details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.details = details;

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

// Specific error types
export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 400, details);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = "Authentication failed") {
    super(message, 401);
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = "Access denied") {
    super(message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = "Resource not found") {
    super(message, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409);
  }
}

export class InternalServerError extends AppError {
  constructor(message: string = "Internal server error") {
    super(message, 500);
  }
}

// Error handling middleware
export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  // Log error with context
  console.error("Error occurred:", {
    message: err.message,
    stack: err.stack,
    statusCode: err.statusCode,
    isOperational: err.isOperational,
    details: err.details
  });

  // Default error response
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";
  let details = err.details;

  // Handle non-operational errors (programming errors)
  if (!err.isOperational) {
    // Don't leak error details in production
    if (process.env.NODE_ENV === "production") {
      message = "Something went wrong. Please try again later.";
      details = undefined;
    }
    statusCode = 500;
  }

  // Send error response
  res.status(statusCode).json({
    success: false,
    error: {
      message,
      statusCode,
      ...(details && { details }),
      ...(process.env.NODE_ENV === "development" && { stack: err.stack })
    }
  });
};

// Async error wrapper
export const catchAsync = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};