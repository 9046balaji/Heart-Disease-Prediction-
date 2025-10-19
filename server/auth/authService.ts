import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { storage } from "../storage";
import { mfaService } from "./mfaService";

// JWT secret - in production, use environment variables
const JWT_SECRET = process.env.JWT_SECRET || "heartguard_secret_key";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "heartguard_refresh_secret_key";

// Token expiration times
const ACCESS_TOKEN_EXPIRES_IN = "15m";
const REFRESH_TOKEN_EXPIRES_IN = "7d";

export interface JwtPayload {
  userId: string;
  username: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface UserRegistrationData {
  username: string;
  password: string;
  email?: string; // For MFA
  phoneNumber?: string; // For MFA
}

export interface UserLoginData {
  username: string;
  password: string;
  mfaCode?: string; // For MFA verification
  mfaMethod?: 'email' | 'authenticator' | 'sms'; // For MFA verification
}

export class AuthService {
  // Hash a password
  public async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
  }

  // Compare password with hash
  public async comparePasswords(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }

  // Generate JWT tokens
  public generateTokens(payload: JwtPayload): AuthTokens {
    const accessToken = jwt.sign(payload, JWT_SECRET, { 
      expiresIn: ACCESS_TOKEN_EXPIRES_IN 
    });
    
    const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, { 
      expiresIn: REFRESH_TOKEN_EXPIRES_IN 
    });
    
    return { accessToken, refreshToken };
  }

  // Verify access token
  public verifyAccessToken(token: string): JwtPayload | null {
    try {
      return jwt.verify(token, JWT_SECRET) as JwtPayload;
    } catch (error) {
      return null;
    }
  }

  // Verify refresh token
  public verifyRefreshToken(token: string): JwtPayload | null {
    try {
      return jwt.verify(token, JWT_REFRESH_SECRET) as JwtPayload;
    } catch (error) {
      return null;
    }
  }

  // Refresh tokens
  public refreshTokens(refreshToken: string): AuthTokens | null {
    const payload = this.verifyRefreshToken(refreshToken);
    if (!payload) {
      return null;
    }
    
    return this.generateTokens(payload);
  }

  // Register a new user
  public async registerUser(userData: UserRegistrationData): Promise<{ user: any; tokens: AuthTokens } | null> {
    try {
      // Check if user already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return null;
      }

      // Hash the password
      const hashedPassword = await this.hashPassword(userData.password);

      // Create new user
      const user = await storage.createUser({
        username: userData.username,
        password: hashedPassword
      });

      // Generate tokens
      const tokens = this.generateTokens({
        userId: user.id,
        username: user.username
      });

      return { user, tokens };
    } catch (error) {
      console.error("Error registering user:", error);
      return null;
    }
  }

  // Login user
  public async loginUser(userData: UserLoginData): Promise<{ user: any; tokens: AuthTokens | null; requiresMfa?: boolean; mfaMethod?: string; error?: string } | null> {
    try {
      // Find user by username
      const user = await storage.getUserByUsername(userData.username);
      if (!user) {
        return null;
      }

      // Check password
      const isPasswordValid = await this.comparePasswords(userData.password, user.password);
      if (!isPasswordValid) {
        return null;
      }

      // Check if user has MFA enabled
      if (user.mfaMethod) {
        // If MFA code is not provided, indicate that MFA is required
        if (!userData.mfaCode) {
          return {
            user,
            tokens: null,
            requiresMfa: true,
            mfaMethod: user.mfaMethod
          };
        }
        
        // Verify MFA code
        try {
          const isMfaValid = await mfaService.verifyChallenge(user.id, user.mfaMethod as any, userData.mfaCode);
          if (!isMfaValid) {
            return {
              user,
              tokens: null,
              error: "Invalid MFA code"
            };
          }
        } catch (mfaError: any) {
          return {
            user,
            tokens: null,
            error: mfaError.message || "MFA verification failed"
          };
        }
      }

      // Generate tokens
      const tokens = this.generateTokens({
        userId: user.id,
        username: user.username
      });

      return { user, tokens };
    } catch (error) {
      console.error("Error logging in user:", error);
      return null;
    }
  }

  // Authenticate user with token
  public async authenticateUser(token: string): Promise<any | null> {
    try {
      // Verify token
      const payload = this.verifyAccessToken(token);
      if (!payload) {
        return null;
      }

      // Get user from database
      const user = await storage.getUser(payload.userId);
      return user;
    } catch (error) {
      console.error("Error authenticating user:", error);
      return null;
    }
  }
}

// Export a singleton instance of the auth service
export const authService = new AuthService();