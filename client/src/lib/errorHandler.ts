import { toast } from "@/hooks/use-toast";

// Type for API error responses
interface ApiError {
  success?: boolean;
  message?: string;
  error?: {
    message?: string;
    statusCode?: number;
    details?: any;
  };
}

// Enhanced error handler for API calls
export const handleApiError = (error: any, defaultMessage: string = "An unexpected error occurred"): string => {
  console.error("API Error:", error);
  
  let message = defaultMessage;
  let statusCode: number | undefined;
  
  // Handle different types of errors
  if (error instanceof Error) {
    message = error.message;
    statusCode = (error as any).status;
  } else if (typeof error === "string") {
    message = error;
  } else if (error && typeof error === "object") {
    // Handle our custom API error format
    if (error.error?.message) {
      message = error.error.message;
      statusCode = error.error.statusCode;
    } else if (error.message) {
      message = error.message;
    }
  }
  
  // Show user-friendly toast notifications for common errors
  let toastMessage = message;
  if (statusCode === 400) {
    toastMessage = message || "Invalid request. Please check your input.";
  } else if (statusCode === 401) {
    toastMessage = "Your session has expired. Please log in again.";
  } else if (statusCode === 403) {
    toastMessage = "You don't have permission to perform this action.";
  } else if (statusCode === 404) {
    toastMessage = "The requested resource was not found.";
  } else if (statusCode === 409) {
    toastMessage = message || "A conflict occurred. This item may already exist.";
  } else if (statusCode === 500) {
    toastMessage = "A server error occurred. Please try again later.";
  }
  
  // Show toast notification
  toast({
    title: "Error",
    description: toastMessage,
    variant: "destructive",
  });
  
  return message;
};

// Success handler for API calls
export const handleApiSuccess = (message: string) => {
  toast({
    title: "Success",
    description: message,
  });
};

// Type guard to check if an object is an API error
export const isApiError = (obj: any): obj is ApiError => {
  return obj && (typeof obj === "object") && (
    obj.success === false || 
    typeof obj.message === "string" || 
    (obj.error && typeof obj.error === "object")
  );
};