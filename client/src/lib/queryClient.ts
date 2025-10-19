import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";

// Enhanced error handling for API responses
async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    let errorMessage = `${res.status}: ${res.statusText}`;
    
    // Try to parse JSON error response
    try {
      const json = JSON.parse(text);
      if (json.error?.message) {
        errorMessage = json.error.message;
      } else if (json.message) {
        errorMessage = json.message;
      }
    } catch (e) {
      // If parsing fails, use the text as is
      errorMessage = text || res.statusText;
    }
    
    // Create a more detailed error object
    const error = new Error(errorMessage);
    (error as any).status = res.status;
    (error as any).statusText = res.statusText;
    (error as any).responseText = text;
    
    throw error;
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey.join("/") as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

// Enhanced error handler for React Query
const queryErrorHandler = (error: any) => {
  console.error("Query error:", error);
  
  // Default error message
  let message = "An unexpected error occurred";
  
  // Handle different types of errors
  if (error instanceof Error) {
    message = error.message;
  } else if (typeof error === "string") {
    message = error;
  } else if (error && typeof error === "object") {
    if (error.message) {
      message = error.message;
    } else if (error.error?.message) {
      message = error.error.message;
    }
  }
  
  // Show user-friendly toast notifications for common errors
  if (error.status === 401) {
    message = "Your session has expired. Please log in again.";
  } else if (error.status === 403) {
    message = "You don't have permission to perform this action.";
  } else if (error.status === 404) {
    message = "The requested resource was not found.";
  } else if (error.status === 500) {
    message = "A server error occurred. Please try again later.";
  }
  
  // Show toast notification
  toast({
    title: "Error",
    description: message,
    variant: "destructive",
  });
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: 1, // Retry once on failure
    },
    mutations: {
      retry: 0, // Don't retry mutations by default
    },
  },
});