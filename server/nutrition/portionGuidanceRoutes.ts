import express from 'express';
import { authenticateUser } from '../auth/authMiddleware';
import { catchAsync } from '../utils/errors';
import { portionGuidanceService } from './portionGuidanceService';

const router = express.Router();

// Get portion guidelines for a specific food type
router.get('/portion/guidelines/:foodType', authenticateUser, catchAsync(async (req: any, res: any) => {
  try {
    const { foodType } = req.params;
    
    const guidelines = await portionGuidanceService.getPortionGuidelines(foodType);
    
    if (!guidelines) {
      return res.status(404).json({ 
        success: false,
        error: {
          message: `No portion guidelines found for food type: ${foodType}`,
          statusCode: 404
        }
      });
    }
    
    res.status(200).json({
      success: true,
      data: guidelines
    });
  } catch (error: any) {
    console.error('Error retrieving portion guidelines:', error);
    res.status(500).json({ 
      success: false,
      error: {
        message: "Failed to retrieve portion guidelines",
        details: error.message,
        statusCode: 500
      }
    });
  }
}));

// Calculate calories based on portion selection and quantity
router.post('/portion/calculate', authenticateUser, catchAsync(async (req: any, res: any) => {
  try {
    const { foodType, portionSize, quantity } = req.body;
    
    // Validate required fields
    if (!foodType) {
      return res.status(400).json({ 
        success: false,
        error: {
          message: "Food type is required",
          statusCode: 400
        }
      });
    }
    
    if (!portionSize) {
      return res.status(400).json({ 
        success: false,
        error: {
          message: "Portion size is required",
          statusCode: 400
        }
      });
    }
    
    if (!quantity) {
      return res.status(400).json({ 
        success: false,
        error: {
          message: "Quantity is required",
          statusCode: 400
        }
      });
    }
    
    const calculation = await portionGuidanceService.calculatePortionCalories(foodType, portionSize, quantity);
    
    res.status(200).json({
      success: true,
      data: calculation
    });
  } catch (error: any) {
    console.error('Error calculating portion calories:', error);
    if (error.message.includes('No portion guidelines found')) {
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
        message: "Failed to calculate portion calories",
        details: error.message,
        statusCode: 500
      }
    });
  }
}));

// Get all portion guidelines
router.get('/portion/guidelines', authenticateUser, catchAsync(async (req: any, res: any) => {
  try {
    const guidelines = await portionGuidanceService.getAllPortionGuidelines();
    
    res.status(200).json({
      success: true,
      data: guidelines,
      count: guidelines.length
    });
  } catch (error: any) {
    console.error('Error retrieving portion guidelines:', error);
    res.status(500).json({ 
      success: false,
      error: {
        message: "Failed to retrieve portion guidelines",
        details: error.message,
        statusCode: 500
      }
    });
  }
}));

// Add a new portion guideline (admin only)
router.post('/portion/guidelines', authenticateUser, catchAsync(async (req: any, res: any) => {
  try {
    const { foodCategory, foodType, smallPortion, mediumPortion, largePortion, caloriesPerUnit } = req.body;
    
    // Validate required fields
    if (!foodCategory || !foodType || !smallPortion || !mediumPortion || !largePortion) {
      return res.status(400).json({ 
        success: false,
        error: {
          message: "Food category, food type, and all portion descriptions are required",
          statusCode: 400
        }
      });
    }
    
    const guidelineData = {
      foodCategory,
      foodType,
      smallPortion,
      mediumPortion,
      largePortion,
      caloriesPerUnit
    };
    
    const guideline = await portionGuidanceService.addPortionGuideline(guidelineData);
    
    res.status(201).json({
      success: true,
      message: "Portion guideline added successfully",
      data: guideline
    });
  } catch (error: any) {
    console.error('Error adding portion guideline:', error);
    res.status(500).json({ 
      success: false,
      error: {
        message: "Failed to add portion guideline",
        details: error.message,
        statusCode: 500
      }
    });
  }
}));

export default router;