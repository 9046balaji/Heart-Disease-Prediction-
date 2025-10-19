import express from "express";
import { authenticateUser } from "../auth/authMiddleware";
import { 
  getUserProfile, 
  addHealthHistoryEntry, 
  updateHealthHistoryEntry, 
  removeHealthHistoryEntry,
  addFamilyMedicalHistoryEntry,
  updateFamilyMedicalHistoryEntry,
  removeFamilyMedicalHistoryEntry,
  addAdverseReactionEntry,
  updateAdverseReactionEntry,
  removeAdverseReactionEntry
} from "./userProfileService";
import { catchAsync } from "../utils/errors";

const router = express.Router();

// Get user profile with advanced data
router.get("/user/profile/advanced", authenticateUser, catchAsync(async (req: any, res: any) => {
  try {
    const userId = req.userId;
    const profile = await getUserProfile(userId);
    
    // Check if profile exists (should not happen now with the fix, but good to have)
    if (!profile) {
      return res.status(404).json({
        success: false,
        error: {
          message: "User profile not found",
          statusCode: 404
        }
      });
    }
    
    res.status(200).json({
      success: true,
      data: profile
    });
  } catch (error: any) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ 
      success: false,
      error: {
        message: "Failed to fetch user profile",
        details: error.message,
        statusCode: 500
      }
    });
  }
}));

// Add health history entry
router.post("/user/profile/health-history", authenticateUser, catchAsync(async (req: any, res: any) => {
  try {
    const userId = req.userId;
    const entry = req.body;
    
    // Validate required fields
    if (!entry.condition) {
      return res.status(400).json({
        success: false,
        error: {
          message: "Condition is required",
          statusCode: 400
        }
      });
    }
    
    // Generate ID if not provided
    if (!entry.id) {
      entry.id = generateUUID();
    }
    
    // Set creation date if not provided
    if (!entry.createdAt) {
      entry.createdAt = new Date();
    }
    
    await addHealthHistoryEntry(userId, entry);
    
    res.status(201).json({
      success: true,
      message: "Health history entry added successfully"
    });
  } catch (error: any) {
    console.error("Error adding health history entry:", error);
    res.status(500).json({ 
      success: false,
      error: {
        message: "Failed to add health history entry",
        details: error.message,
        statusCode: 500
      }
    });
  }
}));

// Update health history entry
router.put("/user/profile/health-history/:entryId", authenticateUser, catchAsync(async (req: any, res: any) => {
  try {
    const userId = req.userId;
    const entryId = req.params.entryId;
    const updates = req.body;
    
    await updateHealthHistoryEntry(userId, entryId, updates);
    
    res.status(200).json({
      success: true,
      message: "Health history entry updated successfully"
    });
  } catch (error: any) {
    console.error("Error updating health history entry:", error);
    if (error.message === "User profile not found" || error.message === "Health history entry not found") {
      return res.status(404).json({ 
        success: false,
        error: {
          message: error.message,
          statusCode: 404
        }
      });
    }
    
    res.status(500).json({ 
      success: false,
      error: {
        message: "Failed to update health history entry",
        details: error.message,
        statusCode: 500
      }
    });
  }
}));

// Remove health history entry
router.delete("/user/profile/health-history/:entryId", authenticateUser, catchAsync(async (req: any, res: any) => {
  try {
    const userId = req.userId;
    const entryId = req.params.entryId;
    
    await removeHealthHistoryEntry(userId, entryId);
    
    res.status(200).json({
      success: true,
      message: "Health history entry removed successfully"
    });
  } catch (error: any) {
    console.error("Error removing health history entry:", error);
    if (error.message === "User profile not found" || error.message === "Health history entry not found") {
      return res.status(404).json({ 
        success: false,
        error: {
          message: error.message,
          statusCode: 404
        }
      });
    }
    
    res.status(500).json({ 
      success: false,
      error: {
        message: "Failed to remove health history entry",
        details: error.message,
        statusCode: 500
      }
    });
  }
}));

// Add family medical history entry
router.post("/user/profile/family-history", authenticateUser, catchAsync(async (req: any, res: any) => {
  try {
    const userId = req.userId;
    const entry = req.body;
    
    // Validate required fields
    if (!entry.relationship || !entry.condition) {
      return res.status(400).json({
        success: false,
        error: {
          message: "Relationship and condition are required",
          statusCode: 400
        }
      });
    }
    
    // Generate ID if not provided
    if (!entry.id) {
      entry.id = generateUUID();
    }
    
    // Set creation date if not provided
    if (!entry.createdAt) {
      entry.createdAt = new Date();
    }
    
    await addFamilyMedicalHistoryEntry(userId, entry);
    
    res.status(201).json({
      success: true,
      message: "Family medical history entry added successfully"
    });
  } catch (error: any) {
    console.error("Error adding family medical history entry:", error);
    res.status(500).json({ 
      success: false,
      error: {
        message: "Failed to add family medical history entry",
        details: error.message,
        statusCode: 500
      }
    });
  }
}));

// Update family medical history entry
router.put("/user/profile/family-history/:entryId", authenticateUser, catchAsync(async (req: any, res: any) => {
  try {
    const userId = req.userId;
    const entryId = req.params.entryId;
    const updates = req.body;
    
    await updateFamilyMedicalHistoryEntry(userId, entryId, updates);
    
    res.status(200).json({
      success: true,
      message: "Family medical history entry updated successfully"
    });
  } catch (error: any) {
    console.error("Error updating family medical history entry:", error);
    if (error.message === "User profile not found" || error.message === "Family medical history entry not found") {
      return res.status(404).json({ 
        success: false,
        error: {
          message: error.message,
          statusCode: 404
        }
      });
    }
    
    res.status(500).json({ 
      success: false,
      error: {
        message: "Failed to update family medical history entry",
        details: error.message,
        statusCode: 500
      }
    });
  }
}));

// Remove family medical history entry
router.delete("/user/profile/family-history/:entryId", authenticateUser, catchAsync(async (req: any, res: any) => {
  try {
    const userId = req.userId;
    const entryId = req.params.entryId;
    
    await removeFamilyMedicalHistoryEntry(userId, entryId);
    
    res.status(200).json({
      success: true,
      message: "Family medical history entry removed successfully"
    });
  } catch (error: any) {
    console.error("Error removing family medical history entry:", error);
    if (error.message === "User profile not found" || error.message === "Family medical history entry not found") {
      return res.status(404).json({ 
        success: false,
        error: {
          message: error.message,
          statusCode: 404
        }
      });
    }
    
    res.status(500).json({ 
      success: false,
      error: {
        message: "Failed to remove family medical history entry",
        details: error.message,
        statusCode: 500
      }
    });
  }
}));

// Add adverse reaction entry
router.post("/user/profile/adverse-reactions", authenticateUser, catchAsync(async (req: any, res: any) => {
  try {
    const userId = req.userId;
    const entry = req.body;
    
    // Validate required fields
    if (!entry.substance || !entry.reactionType || !entry.severity || !entry.symptoms) {
      return res.status(400).json({
        success: false,
        error: {
          message: "Substance, reactionType, severity, and symptoms are required",
          statusCode: 400
        }
      });
    }
    
    // Generate ID if not provided
    if (!entry.id) {
      entry.id = generateUUID();
    }
    
    // Set creation date if not provided
    if (!entry.createdAt) {
      entry.createdAt = new Date();
    }
    
    await addAdverseReactionEntry(userId, entry);
    
    res.status(201).json({
      success: true,
      message: "Adverse reaction entry added successfully"
    });
  } catch (error: any) {
    console.error("Error adding adverse reaction entry:", error);
    res.status(500).json({ 
      success: false,
      error: {
        message: "Failed to add adverse reaction entry",
        details: error.message,
        statusCode: 500
      }
    });
  }
}));

// Update adverse reaction entry
router.put("/user/profile/adverse-reactions/:entryId", authenticateUser, catchAsync(async (req: any, res: any) => {
  try {
    const userId = req.userId;
    const entryId = req.params.entryId;
    const updates = req.body;
    
    await updateAdverseReactionEntry(userId, entryId, updates);
    
    res.status(200).json({
      success: true,
      message: "Adverse reaction entry updated successfully"
    });
  } catch (error: any) {
    console.error("Error updating adverse reaction entry:", error);
    if (error.message === "User profile not found" || error.message === "Adverse reaction entry not found") {
      return res.status(404).json({ 
        success: false,
        error: {
          message: error.message,
          statusCode: 404
        }
      });
    }
    
    res.status(500).json({ 
      success: false,
      error: {
        message: "Failed to update adverse reaction entry",
        details: error.message,
        statusCode: 500
      }
    });
  }
}));

// Remove adverse reaction entry
router.delete("/user/profile/adverse-reactions/:entryId", authenticateUser, catchAsync(async (req: any, res: any) => {
  try {
    const userId = req.userId;
    const entryId = req.params.entryId;
    
    await removeAdverseReactionEntry(userId, entryId);
    
    res.status(200).json({
      success: true,
      message: "Adverse reaction entry removed successfully"
    });
  } catch (error: any) {
    console.error("Error removing adverse reaction entry:", error);
    if (error.message === "User profile not found" || error.message === "Adverse reaction entry not found") {
      return res.status(404).json({ 
        success: false,
        error: {
          message: error.message,
          statusCode: 404
        }
      });
    }
    
    res.status(500).json({ 
      success: false,
      error: {
        message: "Failed to remove adverse reaction entry",
        details: error.message,
        statusCode: 500
      }
    });
  }
}));

// Function to generate UUID
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export default router;