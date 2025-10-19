import express from 'express';
import { storage } from '../storage';
import { authenticateUser } from '../auth/authMiddleware';
import { catchAsync } from '../utils/errors';

const router = express.Router();

// Log a completed workout
router.post('/exercise/log', authenticateUser, catchAsync(async (req: any, res: any) => {
  try {
    const { userId } = req;
    const { exerciseId, exercisePlanId, durationMin, caloriesBurned, intensity, notes } = req.body;
    
    // Validate required fields
    if (!exerciseId && !exercisePlanId) {
      return res.status(400).json({ 
        success: false,
        error: {
          message: "Either exerciseId or exercisePlanId is required",
          statusCode: 400
        }
      });
    }
    
    // Create workout log entry
    const workoutLogData = {
      userId,
      exerciseId: exerciseId || null,
      exercisePlanId: exercisePlanId || null,
      durationMin: durationMin ? parseInt(durationMin as string) : null,
      caloriesBurned: caloriesBurned ? parseInt(caloriesBurned as string) : null,
      intensity: intensity || null,
      notes: notes || null,
      completedAt: new Date(),
      createdAt: new Date()
    };
    
    const workoutLog = await storage.createWorkoutLog(workoutLogData);
    
    res.status(201).json({
      success: true,
      message: "Workout logged successfully",
      data: workoutLog
    });
  } catch (error: any) {
    console.error('Error logging workout:', error);
    res.status(500).json({ 
      success: false,
      error: {
        message: "Failed to log workout",
        details: error.message,
        statusCode: 500
      }
    });
  }
}));

// Get workout history for a user
router.get('/exercise/history', authenticateUser, catchAsync(async (req: any, res: any) => {
  try {
    const { userId } = req;
    const { limit, offset } = req.query;
    
    // Get workout logs for the user
    let workoutLogs = await storage.getWorkoutLogsByUserId(userId);
    
    // Apply pagination if specified
    const limitNum = limit ? parseInt(limit as string) : workoutLogs.length;
    const offsetNum = offset ? parseInt(offset as string) : 0;
    
    workoutLogs = workoutLogs.slice(offsetNum, offsetNum + limitNum);
    
    res.status(200).json({
      success: true,
      data: workoutLogs,
      count: workoutLogs.length,
      total: await storage.getWorkoutLogsByUserId(userId).then(logs => logs.length)
    });
  } catch (error: any) {
    console.error('Error retrieving workout history:', error);
    res.status(500).json({ 
      success: false,
      error: {
        message: "Failed to retrieve workout history",
        details: error.message,
        statusCode: 500
      }
    });
  }
}));

// Get a specific workout log by ID
router.get('/exercise/log/:id', authenticateUser, catchAsync(async (req: any, res: any) => {
  try {
    const { id } = req.params;
    
    // Get workout log by ID
    const workoutLog = await storage.getWorkoutLogById(id);
    
    if (!workoutLog) {
      return res.status(404).json({ 
        success: false,
        error: {
          message: "Workout log not found",
          statusCode: 404
        }
      });
    }
    
    // Check if the workout log belongs to the user
    if (workoutLog.userId !== req.userId) {
      return res.status(403).json({ 
        success: false,
        error: {
          message: "You don't have permission to access this workout log",
          statusCode: 403
        }
      });
    }
    
    res.status(200).json({
      success: true,
      data: workoutLog
    });
  } catch (error: any) {
    console.error('Error retrieving workout log:', error);
    res.status(500).json({ 
      success: false,
      error: {
        message: "Failed to retrieve workout log",
        details: error.message,
        statusCode: 500
      }
    });
  }
}));

// Update a workout log
router.put('/exercise/log/:id', authenticateUser, catchAsync(async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const { userId } = req;
    const updates = req.body;
    
    // Check if workout log exists
    const existingWorkoutLog = await storage.getWorkoutLogById(id);
    if (!existingWorkoutLog) {
      return res.status(404).json({ 
        success: false,
        error: {
          message: "Workout log not found",
          statusCode: 404
        }
      });
    }
    
    // Check if the workout log belongs to the user
    if (existingWorkoutLog.userId !== userId) {
      return res.status(403).json({ 
        success: false,
        error: {
          message: "You don't have permission to update this workout log",
          statusCode: 403
        }
      });
    }
    
    // Update the workout log
    const workoutLog = await storage.updateWorkoutLog(id, updates);
    
    res.status(200).json({
      success: true,
      message: "Workout log updated successfully",
      data: workoutLog
    });
  } catch (error: any) {
    console.error('Error updating workout log:', error);
    res.status(500).json({ 
      success: false,
      error: {
        message: "Failed to update workout log",
        details: error.message,
        statusCode: 500
      }
    });
  }
}));

// Delete a workout log
router.delete('/exercise/log/:id', authenticateUser, catchAsync(async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const { userId } = req;
    
    // Check if workout log exists
    const existingWorkoutLog = await storage.getWorkoutLogById(id);
    if (!existingWorkoutLog) {
      return res.status(404).json({ 
        success: false,
        error: {
          message: "Workout log not found",
          statusCode: 404
        }
      });
    }
    
    // Check if the workout log belongs to the user
    if (existingWorkoutLog.userId !== userId) {
      return res.status(403).json({ 
        success: false,
        error: {
          message: "You don't have permission to delete this workout log",
          statusCode: 403
        }
      });
    }
    
    // Delete the workout log
    const result = await storage.deleteWorkoutLog(id);
    
    if (!result) {
      return res.status(500).json({ 
        success: false,
        error: {
          message: "Failed to delete workout log",
          statusCode: 500
        }
      });
    }
    
    res.status(200).json({
      success: true,
      message: "Workout log deleted successfully"
    });
  } catch (error: any) {
    console.error('Error deleting workout log:', error);
    res.status(500).json({ 
      success: false,
      error: {
        message: "Failed to delete workout log",
        details: error.message,
        statusCode: 500
      }
    });
  }
}));

export default router;