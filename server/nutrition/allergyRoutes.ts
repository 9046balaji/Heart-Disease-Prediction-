import { Router } from 'express';
import { authenticateUser } from '../auth/authMiddleware';
import { catchAsync } from '../utils/errors';
import { allergyService } from './allergyService';

const router = Router();

// Add a new allergy
router.post('/allergy', authenticateUser, catchAsync(async (req: any, res: any) => {
  const { name, severity, reaction } = req.body;
  
  // Validate required fields
  if (!name) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Allergen name is required',
        statusCode: 400
      }
    });
  }
  
  if (!severity) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Severity level is required',
        statusCode: 400
      }
    });
  }
  
  // Validate severity
  const validSeverities = ['mild', 'moderate', 'severe'];
  if (!validSeverities.includes(severity)) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Invalid severity level. Must be \'mild\', \'moderate\', or \'severe\'',
        statusCode: 400
      }
    });
  }
  
  try {
    const allergy = await allergyService.addAllergy(req.userId, { name, severity, reaction });
    res.status(201).json({ success: true, data: allergy });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to add allergy',
        statusCode: 500
      }
    });
  }
}));

// Get user's allergies
router.get('/allergy', authenticateUser, catchAsync(async (req: any, res: any) => {
  try {
    const allergies = await allergyService.getAllergies(req.userId);
    res.json({ 
      success: true, 
      data: allergies,
      count: allergies.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to retrieve allergies',
        statusCode: 500
      }
    });
  }
}));

// Get specific allergy by ID
router.get('/allergy/:allergyId', authenticateUser, catchAsync(async (req: any, res: any) => {
  const { allergyId } = req.params;
  
  try {
    const allergy = await allergyService.getAllergy(allergyId, req.userId);
    
    if (!allergy) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Allergy not found',
          statusCode: 404
        }
      });
    }
    
    res.json({ success: true, data: allergy });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to retrieve allergy',
        statusCode: 500
      }
    });
  }
}));

// Update an allergy
router.put('/allergy/:allergyId', authenticateUser, catchAsync(async (req: any, res: any) => {
  const { allergyId } = req.params;
  const { name, severity, reaction } = req.body;
  
  // Validate at least one field is provided
  if (!name && !severity && !reaction) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'At least one field (name, severity, or reaction) must be provided for update',
        statusCode: 400
      }
    });
  }
  
  // Validate severity if provided
  if (severity) {
    const validSeverities = ['mild', 'moderate', 'severe'];
    if (!validSeverities.includes(severity)) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid severity level. Must be \'mild\', \'moderate\', or \'severe\'',
          statusCode: 400
        }
      });
    }
  }
  
  try {
    const allergy = await allergyService.updateAllergy(allergyId, req.userId, { name, severity, reaction });
    
    if (!allergy) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Allergy not found',
          statusCode: 404
        }
      });
    }
    
    res.json({ success: true, data: allergy });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to update allergy',
        statusCode: 500
      }
    });
  }
}));

// Delete an allergy
router.delete('/allergy/:allergyId', authenticateUser, catchAsync(async (req: any, res: any) => {
  const { allergyId } = req.params;
  
  try {
    const result = await allergyService.deleteAllergy(allergyId, req.userId);
    
    if (!result) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Allergy not found',
          statusCode: 404
        }
      });
    }
    
    res.json({ 
      success: true, 
      message: 'Allergy deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to delete allergy',
        statusCode: 500
      }
    });
  }
}));

// Check recipe for allergens
router.post('/allergy/check-recipe', authenticateUser, catchAsync(async (req: any, res: any) => {
  const { recipe } = req.body;
  
  if (!recipe) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Recipe data is required',
        statusCode: 400
      }
    });
  }
  
  if (!recipe.id || !recipe.title || !recipe.ingredients) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Recipe must include id, title, and ingredients',
        statusCode: 400
      }
    });
  }
  
  try {
    const result = await allergyService.checkRecipeForAllergens(req.userId, recipe);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to check recipe for allergens',
        statusCode: 500
      }
    });
  }
}));

// Get allergen information
router.get('/allergy/info/:allergenName', authenticateUser, catchAsync(async (req: any, res: any) => {
  const { allergenName } = req.params;
  
  try {
    const allergenInfo = await allergyService.getAllergenInfo(allergenName);
    
    if (!allergenInfo) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Allergen information not found',
          statusCode: 404
        }
      });
    }
    
    res.json({ success: true, data: allergenInfo });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to retrieve allergen information',
        statusCode: 500
      }
    });
  }
}));

export default router;