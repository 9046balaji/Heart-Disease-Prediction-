import express from "express";
import { authenticateUser } from "../auth/authMiddleware";
import { symptomService } from "./symptomService";
import { catchAsync } from "../utils/errors";

const router = express.Router();

// Add a new symptom entry
router.post("/symptoms", authenticateUser, catchAsync(async (req: any, res: any) => {
  try {
    const userId = req.userId;
    const symptomData = req.body;
    
    // Validate required fields
    if (!symptomData.type) {
      return res.status(400).json({ 
        success: false,
        error: {
          message: "Symptom type is required",
          statusCode: 400
        }
      });
    }
    
    // Create symptom entry
    const result = await symptomService.addSymptom(userId, {
      type: symptomData.type,
      severity: symptomData.severity,
      duration: symptomData.duration,
      notes: symptomData.notes,
      timestamp: symptomData.timestamp ? new Date(symptomData.timestamp) : undefined
    });
    
    res.status(201).json({
      success: true,
      data: result
    });
  } catch (error: any) {
    console.error("Error adding symptom entry:", error);
    res.status(500).json({ 
      success: false,
      error: {
        message: "Failed to add symptom entry",
        details: error.message,
        statusCode: 500
      }
    });
  }
}));

// Get all symptom entries for the user
router.get("/symptoms", authenticateUser, catchAsync(async (req: any, res: any) => {
  try {
    const userId = req.userId;
    const symptoms = await symptomService.getSymptoms(userId);
    
    res.status(200).json({
      success: true,
      data: symptoms
    });
  } catch (error) {
    console.error("Error fetching symptom entries:", error);
    res.status(500).json({ 
      success: false,
      error: {
        message: "Failed to fetch symptom entries",
        statusCode: 500
      }
    });
  }
}));

// Get symptom entries by type
router.get("/symptoms/:type", authenticateUser, catchAsync(async (req: any, res: any) => {
  try {
    const userId = req.userId;
    const { type } = req.params;
    
    const symptoms = await symptomService.getSymptomsByType(userId, type);
    
    res.status(200).json({
      success: true,
      data: symptoms
    });
  } catch (error) {
    console.error("Error fetching symptom entries by type:", error);
    res.status(500).json({ 
      success: false,
      error: {
        message: "Failed to fetch symptom entries by type",
        statusCode: 500
      }
    });
  }
}));

// Update a symptom entry
router.put("/symptoms/:id", authenticateUser, catchAsync(async (req: any, res: any) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const updates = req.body;
    
    // Remove id from updates if present
    const { id: _, ...updateData } = updates;
    
    const result = await symptomService.updateSymptom(userId, id, updateData);
    
    if (!result) {
      return res.status(404).json({
        success: false,
        error: {
          message: "Symptom entry not found",
          statusCode: 404
        }
      });
    }
    
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error: any) {
    console.error("Error updating symptom entry:", error);
    res.status(500).json({ 
      success: false,
      error: {
        message: "Failed to update symptom entry",
        details: error.message,
        statusCode: 500
      }
    });
  }
}));

// Delete a symptom entry
router.delete("/symptoms/:id", authenticateUser, catchAsync(async (req: any, res: any) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    
    const deleted = await symptomService.deleteSymptom(userId, id);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: {
          message: "Symptom entry not found",
          statusCode: 404
        }
      });
    }
    
    res.status(200).json({
      success: true,
      message: "Symptom entry deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting symptom entry:", error);
    res.status(500).json({ 
      success: false,
      error: {
        message: "Failed to delete symptom entry",
        statusCode: 500
      }
    });
  }
}));

export default router;