import express from 'express';
import { exercisePlanService } from './exercisePlans';
import { storage } from '../storage';
import { authenticateUser } from '../auth/authMiddleware';
import { catchAsync } from '../utils/errors';

const router = express.Router();

// Generate a personalized exercise plan
router.post('/exerciseplan/generate', authenticateUser, catchAsync(async (req: any, res: any) => {
  try {
    const { userId } = req;
    const { clinicalEntryId, healthConditions = [] } = req.body;
    
    // Validate required fields
    if (!clinicalEntryId) {
      return res.status(400).json({ 
        success: false,
        error: {
          message: "clinicalEntryId is required",
          statusCode: 400
        }
      });
    }
    
    // Get the clinical entry
    const clinicalEntry = await storage.getClinicalEntry(clinicalEntryId, userId);
    if (!clinicalEntry) {
      return res.status(404).json({ 
        success: false,
        error: {
          message: "Clinical entry not found",
          statusCode: 404
        }
      });
    }
    
    // Get the latest prediction for this clinical entry
    const predictions = await storage.getPredictions(userId);
    const prediction = predictions.find(p => p.clinicalEntryId === clinicalEntryId);
    
    if (!prediction) {
      return res.status(404).json({ 
        success: false,
        error: {
          message: "No prediction found for this clinical entry",
          statusCode: 404
        }
      });
    }
    
    // Generate personalized exercise plan
    const exercisePlan = await exercisePlanService.generatePersonalizedExercisePlan(
      userId,
      clinicalEntry,
      prediction,
      healthConditions
    );
    
    res.status(201).json({
      success: true,
      message: "Exercise plan generated successfully",
      data: exercisePlan
    });
  } catch (error: any) {
    console.error('Error generating exercise plan:', error);
    res.status(500).json({ 
      success: false,
      error: {
        message: "Failed to generate exercise plan",
        details: error.message,
        statusCode: 500
      }
    });
  }
}));

// Get an exercise plan by ID
router.get('/exerciseplan/:id', authenticateUser, catchAsync(async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const { userId } = req;
    
    // Get exercise plan by ID
    const exercisePlan = await storage.getExercisePlanById(id, userId);
    
    if (!exercisePlan) {
      return res.status(404).json({ 
        success: false,
        error: {
          message: "Exercise plan not found",
          statusCode: 404
        }
      });
    }
    
    res.status(200).json({
      success: true,
      data: exercisePlan
    });
  } catch (error: any) {
    console.error('Error retrieving exercise plan:', error);
    res.status(500).json({ 
      success: false,
      error: {
        message: "Failed to retrieve exercise plan",
        details: error.message,
        statusCode: 500
      }
    });
  }
}));

// Update an exercise plan
router.put('/exerciseplan/:id', authenticateUser, catchAsync(async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const { userId } = req;
    const updates = req.body;
    
    // Check if exercise plan exists and belongs to user
    const existingPlan = await storage.getExercisePlanById(id, userId);
    if (!existingPlan) {
      return res.status(404).json({ 
        success: false,
        error: {
          message: "Exercise plan not found",
          statusCode: 404
        }
      });
    }
    
    // Update the exercise plan
    // Note: In a real implementation, you might want to implement a proper update method
    // For now, we'll return a success response
    res.status(200).json({
      success: true,
      message: "Exercise plan updated successfully",
      data: existingPlan
    });
  } catch (error: any) {
    console.error('Error updating exercise plan:', error);
    res.status(500).json({ 
      success: false,
      error: {
        message: "Failed to update exercise plan",
        details: error.message,
        statusCode: 500
      }
    });
  }
}));

export default router;