import { authService } from "./authService";

// Authentication middleware for regular users
export const authenticateUser = async (req: any, res: any, next: () => void) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Access token required" });
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix

    // Authenticate user
    const user = await authService.authenticateUser(token);
    if (!user) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    // Attach user to request
    req.userId = user.id;
    req.user = user;

    next();
  } catch (error) {
    console.error("Authentication error:", error);
    return res.status(500).json({ message: "Authentication failed" });
  }
};

// Authentication middleware for clinicians
export const authenticateClinician = async (req: any, res: any, next: () => void) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Access token required" });
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix

    // Authenticate user
    const user = await authService.authenticateUser(token);
    if (!user) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    // In a real implementation, we would check if the user is a clinician
    // For now, we'll just attach the user to the request
    req.clinicianId = user.id;
    req.clinician = user;

    next();
  } catch (error) {
    console.error("Authentication error:", error);
    return res.status(500).json({ message: "Authentication failed" });
  }
};

// Optional authentication middleware (for routes that can be accessed by both authenticated and unauthenticated users)
export const optionalAuthenticateUser = async (req: any, res: any, next: () => void) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7); // Remove "Bearer " prefix

      // Authenticate user
      const user = await authService.authenticateUser(token);
      if (user) {
        // Attach user to request if token is valid
        req.userId = user.id;
        req.user = user;
      }
    }

    next();
  } catch (error) {
    console.error("Authentication error:", error);
    // Continue without authentication if there's an error
    next();
  }
};