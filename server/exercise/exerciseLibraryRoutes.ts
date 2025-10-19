import express from 'express';
import { storage } from '../storage';
import { authenticateUser } from '../auth/authMiddleware';
import { catchAsync } from '../utils/errors';

const router = express.Router();

// Get all exercises with filtering capabilities
router.get('/exercises', authenticateUser, catchAsync(async (req: any, res: any) => {
  try {
    // Get query parameters for filtering
    const { intensity, durationMin, durationMax, search } = req.query;
    
    // Get all exercises
    let exercises = await storage.getExercises();
    
    // Apply filters
    if (intensity) {
      exercises = exercises.filter(exercise => exercise.intensity === intensity);
    }
    
    if (durationMin) {
      const minDuration = parseInt(durationMin as string);
      exercises = exercises.filter(exercise => exercise.durationMin && exercise.durationMin >= minDuration);
    }
    
    if (durationMax) {
      const maxDuration = parseInt(durationMax as string);
      exercises = exercises.filter(exercise => exercise.durationMin && exercise.durationMin <= maxDuration);
    }
    
    if (search) {
      const searchTerm = (search as string).toLowerCase();
      exercises = exercises.filter(exercise => 
        exercise.title.toLowerCase().includes(searchTerm) ||
        (exercise.instructions && JSON.stringify(exercise.instructions).toLowerCase().includes(searchTerm))
      );
    }
    
    res.status(200).json({
      success: true,
      data: exercises,
      count: exercises.length
    });
  } catch (error: any) {
    console.error('Error retrieving exercises:', error);
    res.status(500).json({ 
      success: false,
      error: {
        message: "Failed to retrieve exercises",
        details: error.message,
        statusCode: 500
      }
    });
  }
}));

// Get a specific exercise by ID
router.get('/exercises/:id', authenticateUser, catchAsync(async (req: any, res: any) => {
  try {
    const { id } = req.params;
    
    // Get exercise by ID
    const exercise = await storage.getExerciseById(id);
    
    if (!exercise) {
      return res.status(404).json({ 
        success: false,
        error: {
          message: "Exercise not found",
          statusCode: 404
        }
      });
    }
    
    res.status(200).json({
      success: true,
      data: exercise
    });
  } catch (error: any) {
    console.error('Error retrieving exercise:', error);
    res.status(500).json({ 
      success: false,
      error: {
        message: "Failed to retrieve exercise",
        details: error.message,
        statusCode: 500
      }
    });
  }
}));

// Create a new exercise (admin only in real implementation)
router.post('/exercises', authenticateUser, catchAsync(async (req: any, res: any) => {
  try {
    const exerciseData = req.body;
    
    // Validate required fields
    if (!exerciseData.title) {
      return res.status(400).json({ 
        success: false,
        error: {
          message: "Exercise title is required",
          statusCode: 400
        }
      });
    }
    
    // Create the exercise
    const exercise = await storage.createExercise(exerciseData);
    
    res.status(201).json({
      success: true,
      message: "Exercise created successfully",
      data: exercise
    });
  } catch (error: any) {
    console.error('Error creating exercise:', error);
    res.status(500).json({ 
      success: false,
      error: {
        message: "Failed to create exercise",
        details: error.message,
        statusCode: 500
      }
    });
  }
}));

// Update an exercise (admin only in real implementation)
router.put('/exercises/:id', authenticateUser, catchAsync(async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Check if exercise exists
    const existingExercise = await storage.getExerciseById(id);
    if (!existingExercise) {
      return res.status(404).json({ 
        success: false,
        error: {
          message: "Exercise not found",
          statusCode: 404
        }
      });
    }
    
    // Update the exercise
    const exercise = await storage.updateExercise(id, updates);
    
    res.status(200).json({
      success: true,
      message: "Exercise updated successfully",
      data: exercise
    });
  } catch (error: any) {
    console.error('Error updating exercise:', error);
    res.status(500).json({ 
      success: false,
      error: {
        message: "Failed to update exercise",
        details: error.message,
        statusCode: 500
      }
    });
  }
}));

// Delete an exercise (admin only in real implementation)
router.delete('/exercises/:id', authenticateUser, catchAsync(async (req: any, res: any) => {
  try {
    const { id } = req.params;
    
    // Check if exercise exists
    const existingExercise = await storage.getExerciseById(id);
    if (!existingExercise) {
      return res.status(404).json({ 
        success: false,
        error: {
          message: "Exercise not found",
          statusCode: 404
        }
      });
    }
    
    // Delete the exercise
    const result = await storage.deleteExercise(id);
    
    if (!result) {
      return res.status(500).json({ 
        success: false,
        error: {
          message: "Failed to delete exercise",
          statusCode: 500
        }
      });
    }
    
    res.status(200).json({
      success: true,
      message: "Exercise deleted successfully"
    });
  } catch (error: any) {
    console.error('Error deleting exercise:', error);
    res.status(500).json({ 
      success: false,
      error: {
        message: "Failed to delete exercise",
        details: error.message,
        statusCode: 500
      }
    });
  }
}));

export default router;