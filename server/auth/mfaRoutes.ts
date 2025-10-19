import express from "express";
import { authenticateUser } from "./authMiddleware";
import { mfaService } from "./mfaService";
import { catchAsync } from "../utils/errors";

const router = express.Router();

// Setup MFA for a user
router.post("/mfa/setup", authenticateUser, catchAsync(async (req: any, res: any) => {
  try {
    const userId = req.userId;
    const { method, phoneNumber } = req.body;
    
    // Validate method
    if (!method || !['email', 'authenticator', 'sms'].includes(method)) {
      return res.status(400).json({
        success: false,
        error: {
          message: "Invalid MFA method. Must be 'email', 'authenticator', or 'sms'",
          statusCode: 400
        }
      });
    }
    
    // For SMS method, phone number is required
    if (method === 'sms' && !phoneNumber) {
      return res.status(400).json({
        success: false,
        error: {
          message: "Phone number is required for SMS MFA",
          statusCode: 400
        }
      });
    }
    
    // Setup MFA
    const setupResult = await mfaService.setupMfa(userId, method, { phoneNumber });
    
    // If setting up authenticator, return QR code
    if (method === 'authenticator' && setupResult.secret) {
      const secretObj = mfaService.generateAuthenticatorSecret();
      // Use the secret that was saved to the database
      secretObj.base32 = setupResult.secret;
      secretObj.otpauth_url = `otpauth://totp/HeartGuard:${userId}?secret=${setupResult.secret}&issuer=HeartGuard`;
      const qrCode = await mfaService.generateQrCode(secretObj.otpauth_url);
      
      return res.status(200).json({
        success: true,
        data: {
          qrCode,
          secret: setupResult.secret
        }
      });
    }
    
    res.status(200).json({
      success: true,
      message: "MFA setup successful"
    });
  } catch (error: any) {
    console.error("Error setting up MFA:", error);
    res.status(500).json({ 
      success: false,
      error: {
        message: "Failed to setup MFA",
        details: error.message,
        statusCode: 500
      }
    });
  }
}));

// Generate MFA challenge
router.post("/mfa/challenge", authenticateUser, catchAsync(async (req: any, res: any) => {
  try {
    const userId = req.userId;
    const { method } = req.body;
    
    // Validate method
    if (!method || !['email', 'authenticator', 'sms'].includes(method)) {
      return res.status(400).json({
        success: false,
        error: {
          message: "Invalid MFA method. Must be 'email', 'authenticator', or 'sms'",
          statusCode: 400
        }
      });
    }
    
    // Generate challenge
    const challenge = await mfaService.generateChallenge(userId, method);
    
    res.status(200).json({
      success: true,
      data: {
        challengeId: challenge.id,
        method: challenge.method,
        message: method === 'authenticator' 
          ? 'Enter the code from your authenticator app' 
          : `Code sent to your ${method}`
      }
    });
  } catch (error: any) {
    console.error("Error generating MFA challenge:", error);
    res.status(500).json({ 
      success: false,
      error: {
        message: "Failed to generate MFA challenge",
        details: error.message,
        statusCode: 500
      }
    });
  }
}));

// Verify MFA challenge
router.post("/mfa/verify", authenticateUser, catchAsync(async (req: any, res: any) => {
  try {
    const userId = req.userId;
    const { method, code, challengeId } = req.body;
    
    // Validate input
    if (!method || !code) {
      return res.status(400).json({
        success: false,
        error: {
          message: "Method and code are required",
          statusCode: 400
        }
      });
    }
    
    // Verify challenge
    const isValid = await mfaService.verifyChallenge(userId, method, code, challengeId);
    
    if (!isValid) {
      return res.status(400).json({
        success: false,
        error: {
          message: "Invalid MFA code",
          statusCode: 400
        }
      });
    }
    
    res.status(200).json({
      success: true,
      message: "MFA verification successful"
    });
  } catch (error: any) {
    console.error("Error verifying MFA challenge:", error);
    res.status(500).json({ 
      success: false,
      error: {
        message: "Failed to verify MFA challenge",
        details: error.message,
        statusCode: 500
      }
    });
  }
}));

// Disable MFA for a user
router.delete("/mfa", authenticateUser, catchAsync(async (req: any, res: any) => {
  try {
    const userId = req.userId;
    
    await mfaService.disableMfa(userId);
    
    res.status(200).json({
      success: true,
      message: "MFA disabled successfully"
    });
  } catch (error: any) {
    console.error("Error disabling MFA:", error);
    res.status(500).json({ 
      success: false,
      error: {
        message: "Failed to disable MFA",
        details: error.message,
        statusCode: 500
      }
    });
  }
}));

export default router;