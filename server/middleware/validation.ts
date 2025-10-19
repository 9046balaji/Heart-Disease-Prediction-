import { Request, Response, NextFunction } from "express";
import { ValidationError } from "../utils/errors";

// Validation rules
interface ValidationRule {
  required?: boolean;
  type?: "string" | "number" | "boolean" | "array" | "object";
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  enum?: any[];
  custom?: (value: any) => boolean;
}

// Validation schema
interface ValidationSchema {
  [key: string]: ValidationRule;
}

// Validate request body against schema
export const validateBody = (schema: ValidationSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const errors: string[] = [];
    const body = req.body;

    for (const [field, rules] of Object.entries(schema)) {
      const value = body[field];
      
      // Check required fields
      if (rules.required && (value === undefined || value === null)) {
        errors.push(`${field} is required`);
        continue;
      }
      
      // Skip validation for optional fields that are not provided
      if (value === undefined || value === null) {
        continue;
      }
      
      // Type validation
      if (rules.type) {
        if (rules.type === "number" && typeof value !== "number" && isNaN(Number(value))) {
          errors.push(`${field} must be a number`);
          continue;
        }
        if (rules.type === "string" && typeof value !== "string") {
          errors.push(`${field} must be a string`);
          continue;
        }
        if (rules.type === "boolean" && typeof value !== "boolean" && value !== "true" && value !== "false") {
          errors.push(`${field} must be a boolean`);
          continue;
        }
      }
      
      // String validations
      if (typeof value === "string") {
        if (rules.minLength && value.length < rules.minLength) {
          errors.push(`${field} must be at least ${rules.minLength} characters long`);
        }
        if (rules.maxLength && value.length > rules.maxLength) {
          errors.push(`${field} must be no more than ${rules.maxLength} characters long`);
        }
        if (rules.pattern && !rules.pattern.test(value)) {
          errors.push(`${field} format is invalid`);
        }
      }
      
      // Number validations
      const numValue = typeof value === "number" ? value : Number(value);
      if (!isNaN(numValue)) {
        if (rules.min !== undefined && numValue < rules.min) {
          errors.push(`${field} must be at least ${rules.min}`);
        }
        if (rules.max !== undefined && numValue > rules.max) {
          errors.push(`${field} must be no more than ${rules.max}`);
        }
      }
      
      // Enum validation
      if (rules.enum && !rules.enum.includes(value)) {
        errors.push(`${field} must be one of: ${rules.enum.join(", ")}`);
      }
      
      // Custom validation
      if (rules.custom && !rules.custom(value)) {
        errors.push(`${field} is invalid`);
      }
    }
    
    // If there are validation errors, throw a ValidationError
    if (errors.length > 0) {
      throw new ValidationError("Validation failed", { errors });
    }
    
    next();
  };
};

// Validation schemas for different endpoints
export const validationSchemas = {
  // User registration schema
  userRegistration: {
    username: {
      required: true,
      type: "string" as const,
      minLength: 3,
      maxLength: 30
    },
    password: {
      required: true,
      type: "string" as const,
      minLength: 6,
      maxLength: 100
    }
  },
  
  // User login schema
  userLogin: {
    username: {
      required: true,
      type: "string" as const,
      minLength: 3,
      maxLength: 30
    },
    password: {
      required: true,
      type: "string" as const,
      minLength: 6,
      maxLength: 100
    },
    mfaCode: {
      required: false,
      type: "string" as const,
      minLength: 6,
      maxLength: 6
    },
    mfaMethod: {
      required: false,
      type: "string" as const,
      enum: ["email", "authenticator", "sms"]
    }
  },
  
  // Clinical data schema
  clinicalData: {
    age: {
      required: true,
      type: "number" as const,
      min: 0,
      max: 120
    },
    sex: {
      required: true,
      type: "number" as const,
      enum: [0, 1]
    },
    cp: {
      required: true,
      type: "number" as const,
      min: 0,
      max: 3
    },
    trestbps: {
      required: true,
      type: "number" as const,
      min: 0,
      max: 300
    },
    chol: {
      required: true,
      type: "number" as const,
      min: 0,
      max: 600
    },
    fbs: {
      required: true,
      type: "number" as const,
      enum: [0, 1]
    },
    restecg: {
      required: true,
      type: "number" as const,
      min: 0,
      max: 2
    },
    thalach: {
      required: true,
      type: "number" as const,
      min: 0,
      max: 300
    },
    exang: {
      required: true,
      type: "number" as const,
      enum: [0, 1]
    },
    oldpeak: {
      required: true,
      type: "number" as const,
      min: 0,
      max: 10
    },
    slope: {
      required: true,
      type: "number" as const,
      min: 0,
      max: 2
    },
    ca: {
      required: true,
      type: "number" as const,
      min: 0,
      max: 3
    },
    thal: {
      required: true,
      type: "number" as const,
      min: 0,
      max: 2
    },
    height: {
      required: false,
      type: "number" as const,
      min: 100,
      max: 250
    },
    weight: {
      required: false,
      type: "number" as const,
      min: 30,
      max: 300
    },
    smokingStatus: {
      required: false,
      type: "string" as const,
      enum: ["never", "former", "current"]
    }
  }
};