import express from 'express';
import { storage } from '../storage';
import { authenticateUser } from '../auth/authMiddleware';
import { catchAsync } from '../utils/errors';
import { safetyCheckService } from './safetyCheckService';

const router = express.Router();

// Perform a pre-exercise safety check
router.post('/exercise/safety-check', authenticateUser, catchAsync(async (req: any, res: any) => {
  try {
    const { userId } = req;
    const { exercisePlanId, exerciseId, answers } = req.body;
    
    // Validate required fields
    if (!answers) {
      return res.status(400).json({ 
        success: false,
        error: {
          message: "Safety check answers are required",
          statusCode: 400
        }
      });
    }
    
    // Validate required safety questions
    const requiredFields = ['feelingWell', 'chestPain', 'dizziness', 'jointPain', 'medicationTaken'];
    for (const field of requiredFields) {
      if (answers[field] === undefined) {
        return res.status(400).json({ 
          success: false,
          error: {
            message: `Missing required safety check answer: ${field}`,
            statusCode: 400
          }
        });
      }
    }
    
    // Perform safety assessment using the service
    const safetyAssessment = await safetyCheckService.performSafetyAssessment(answers);
    
    // Create safety check entry
    const safetyCheckData = {
      userId,
      exercisePlanId: exercisePlanId || null,
      exerciseId: exerciseId || null,
      feelingWell: answers.feelingWell,
      chestPain: answers.chestPain,
      dizziness: answers.dizziness,
      jointPain: answers.jointPain,
      medicationTaken: answers.medicationTaken,
      notes: answers.notes || null,
      riskLevel: safetyAssessment.riskLevel,
      recommendations: JSON.stringify(safetyAssessment.recommendations),
      approved: safetyAssessment.approved,
      completedAt: new Date(),
      createdAt: new Date()
    };
    
    const safetyCheck = await safetyCheckService.createSafetyCheck(safetyCheckData);
    
    res.status(201).json({
      success: true,
      message: "Safety check completed successfully",
      data: {
        ...safetyCheck,
        recommendations: safetyAssessment.recommendations
      },
      assessment: safetyAssessment
    });
  } catch (error: any) {
    console.error('Error performing safety check:', error);
    res.status(500).json({ 
      success: false,
      error: {
        message: "Failed to perform safety check",
        details: error.message,
        statusCode: 500
      }
    });
  }
}));

// Get safety requirements for an exercise plan
router.get('/exercise/safety-requirements/:planId', authenticateUser, catchAsync(async (req: any, res: any) => {
  try {
    const { planId } = req.params;
    const { userId } = req;
    
    // Get safety requirements using the service
    const { safetyFlags, safetyQuestions } = await safetyCheckService.getSafetyRequirementsForPlan(planId, userId);
    
    res.status(200).json({
      success: true,
      data: {
        planId,
        safetyFlags,
        safetyQuestions
      }
    });
  } catch (error: any) {
    console.error('Error retrieving safety requirements:', error);
    if (error.message && error.message.includes('Exercise plan not found')) {
      return res.status(404).json({ 
        success: false,
        error: {
          message: "Exercise plan not found",
          statusCode: 404
        }
      });
    }
    
    res.status(500).json({ 
      success: false,
      error: {
        message: "Failed to retrieve safety requirements",
        details: error.message,
        statusCode: 500
      }
    });
  }
}));

// Get safety check history for a user
router.get('/exercise/safety-history', authenticateUser, catchAsync(async (req: any, res: any) => {
  try {
    const { userId } = req;
    const { limit, offset } = req.query;
    
    // Get safety checks for the user using the service
    let safetyChecks = await safetyCheckService.getSafetyChecksByUserId(userId);
    
    // Apply pagination if specified
    const limitNum = limit ? parseInt(limit as string) : safetyChecks.length;
    const offsetNum = offset ? parseInt(offset as string) : 0;
    
    safetyChecks = safetyChecks.slice(offsetNum, offsetNum + limitNum);
    
    // Parse recommendations JSON
    safetyChecks = safetyChecks.map(check => ({
      ...check,
      recommendations: check.recommendations ? 
        (typeof check.recommendations === 'string' ? JSON.parse(check.recommendations) : check.recommendations) : 
        []
    }));
    
    const total = await safetyCheckService.getSafetyChecksByUserId(userId).then(checks => checks.length);
    
    res.status(200).json({
      success: true,
      data: safetyChecks,
      count: safetyChecks.length,
      total: total
    });
  } catch (error: any) {
    console.error('Error retrieving safety check history:', error);
    res.status(500).json({ 
      success: false,
      error: {
        message: "Failed to retrieve safety check history",
        details: error.message,
        statusCode: 500
      }
    });
  }
}));

export default router;