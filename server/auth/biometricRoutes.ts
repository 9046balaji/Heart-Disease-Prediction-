import express from "express";
import { authenticateUser } from "./authMiddleware";
import { biometricService } from "./biometricService";
import { catchAsync } from "../utils/errors";

const router = express.Router();

// Setup biometric authentication for a user
router.post("/biometric/setup", authenticateUser, catchAsync(async (req: any, res: any) => {
  try {
    const userId = req.userId;
    const { template, type } = req.body;
    
    // Validate input
    if (!template || !type || !['fingerprint', 'face', 'voice'].includes(type)) {
      return res.status(400).json({
        success: false,
        error: {
          message: "Template and valid type (fingerprint, face, voice) are required",
          statusCode: 400
        }
      });
    }
    
    // Store biometric template
    const biometricTemplate = await biometricService.registerBiometricTemplate(userId, template, type);
    
    res.status(200).json({
      success: true,
      data: {
        biometricTemplate
      }
    });
  } catch (error: any) {
    console.error("Error setting up biometric authentication:", error);
    res.status(500).json({ 
      success: false,
      error: {
        message: "Failed to setup biometric authentication",
        details: error.message,
        statusCode: 500
      }
    });
  }
}));

// Verify biometric authentication
router.post("/biometric/verify", catchAsync(async (req: any, res: any) => {
  try {
    const { template, type, userId } = req.body;
    
    // Validate input
    if (!template || !type || !userId || !['fingerprint', 'face', 'voice'].includes(type)) {
      return res.status(400).json({
        success: false,
        error: {
          message: "Template, type, and userId are required",
          statusCode: 400
        }
      });
    }
    
    // Verify biometric template
    const isValid = await biometricService.verifyBiometricTemplate(userId, template, type);
    
    if (!isValid) {
      return res.status(401).json({
        success: false,
        error: {
          message: "Biometric verification failed",
          statusCode: 401
        }
      });
    }
    
    res.status(200).json({
      success: true,
      message: "Biometric verification successful"
    });
  } catch (error: any) {
    console.error("Error verifying biometric authentication:", error);
    res.status(500).json({ 
      success: false,
      error: {
        message: "Failed to verify biometric authentication",
        details: error.message,
        statusCode: 500
      }
    });
  }
}));

// Get user's biometric templates
router.get("/biometric/templates", authenticateUser, catchAsync(async (req: any, res: any) => {
  try {
    const userId = req.userId;
    
    const templates = await biometricService.getUserBiometricTemplates(userId);
    
    res.status(200).json({
      success: true,
      data: {
        templates
      }
    });
  } catch (error: any) {
    console.error("Error fetching biometric templates:", error);
    res.status(500).json({ 
      success: false,
      error: {
        message: "Failed to fetch biometric templates",
        details: error.message,
        statusCode: 500
      }
    });
  }
}));

// Delete a biometric template
router.delete("/biometric/templates/:templateId", authenticateUser, catchAsync(async (req: any, res: any) => {
  try {
    const userId = req.userId;
    const templateId = req.params.templateId;
    
    await biometricService.deleteBiometricTemplate(userId, templateId);
    
    res.status(200).json({
      success: true,
      message: "Biometric template deleted successfully"
    });
  } catch (error: any) {
    console.error("Error deleting biometric template:", error);
    res.status(500).json({ 
      success: false,
      error: {
        message: "Failed to delete biometric template",
        details: error.message,
        statusCode: 500
      }
    });
  }
}));

export default router;