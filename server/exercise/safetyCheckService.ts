// Safety Check service for the HeartGuard application
// This service handles pre-exercise safety assessments and risk evaluation

import { storage } from '../storage';
import { SafetyCheck, InsertSafetyCheck } from '@shared/schema';

export interface SafetyCheckAnswers {
  feelingWell: boolean;
  chestPain: boolean;
  dizziness: boolean;
  jointPain: boolean;
  medicationTaken: boolean;
  notes?: string;
}

export interface SafetyAssessment {
  riskLevel: 'low' | 'moderate' | 'high';
  recommendations: string[];
  approved: boolean;
}

export class SafetyCheckService {
  // Perform a safety assessment based on user answers
  public async performSafetyAssessment(answers: SafetyCheckAnswers): Promise<SafetyAssessment> {
    const recommendations: string[] = [];
    let riskLevel: 'low' | 'moderate' | 'high' = 'low';
    let approved = true;
    
    // Validate required fields
    if (answers.feelingWell === undefined || answers.chestPain === undefined || 
        answers.dizziness === undefined || answers.jointPain === undefined || 
        answers.medicationTaken === undefined) {
      throw new Error('All required safety check answers must be provided');
    }
    
    // Check for immediate stop conditions (high risk)
    if (answers.chestPain) {
      riskLevel = 'high';
      approved = false;
      recommendations.push("STOP EXERCISE IMMEDIATELY: Chest pain is a serious warning sign. Seek medical attention right away.");
    }
    
    if (answers.dizziness) {
      riskLevel = 'high';
      approved = false;
      recommendations.push("STOP EXERCISE IMMEDIATELY: Dizziness can lead to falls or other injuries. Rest and seek medical attention if symptoms persist.");
    }
    
    // Check for moderate risk conditions
    if (answers.feelingWell === false && riskLevel !== 'high') {
      riskLevel = 'moderate';
      recommendations.push("You're not feeling well today. Consider postponing exercise until you feel better.");
    }
    
    if (answers.jointPain && riskLevel !== 'high') {
      riskLevel = 'moderate';
      recommendations.push("Joint or muscle pain may affect your exercise. Consider modifying the intensity or type of exercise.");
    }
    
    if (answers.medicationTaken === false && riskLevel !== 'high') {
      riskLevel = 'moderate';
      recommendations.push("Missed medication may affect your exercise response. Consider consulting with your healthcare provider.");
    }
    
    // If no issues, provide positive feedback
    if (riskLevel === 'low' && recommendations.length === 0) {
      recommendations.push("You're cleared for exercise! Remember to stay hydrated and listen to your body.");
    }
    
    return { riskLevel, recommendations, approved };
  }

  // Create a safety check entry in the database
  public async createSafetyCheck(safetyCheckData: InsertSafetyCheck): Promise<SafetyCheck> {
    try {
      // Validate required fields
      if (!safetyCheckData.userId) {
        throw new Error('User ID is required');
      }
      
      if (!safetyCheckData.feelingWell && safetyCheckData.feelingWell !== false) {
        throw new Error('feelingWell field is required');
      }
      
      if (!safetyCheckData.chestPain && safetyCheckData.chestPain !== false) {
        throw new Error('chestPain field is required');
      }
      
      if (!safetyCheckData.dizziness && safetyCheckData.dizziness !== false) {
        throw new Error('dizziness field is required');
      }
      
      if (!safetyCheckData.jointPain && safetyCheckData.jointPain !== false) {
        throw new Error('jointPain field is required');
      }
      
      if (!safetyCheckData.medicationTaken && safetyCheckData.medicationTaken !== false) {
        throw new Error('medicationTaken field is required');
      }
      
      if (!safetyCheckData.riskLevel) {
        throw new Error('riskLevel field is required');
      }
      
      if (safetyCheckData.approved === undefined) {
        throw new Error('approved field is required');
      }
      
      // Set default values for optional fields
      const safetyCheckWithDefaults: InsertSafetyCheck = {
        ...safetyCheckData,
        completedAt: safetyCheckData.completedAt || new Date(),
        createdAt: safetyCheckData.createdAt || new Date()
      };
      
      return await storage.createSafetyCheck(safetyCheckWithDefaults);
    } catch (error) {
      console.error('Error creating safety check:', error);
      throw new Error(`Failed to create safety check: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get safety checks for a user
  public async getSafetyChecksByUserId(userId: string): Promise<SafetyCheck[]> {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }
      
      return await storage.getSafetyChecksByUserId(userId);
    } catch (error) {
      console.error('Error retrieving safety checks:', error);
      throw new Error(`Failed to retrieve safety checks: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get a specific safety check by ID
  public async getSafetyCheckById(id: string): Promise<SafetyCheck | undefined> {
    try {
      if (!id) {
        throw new Error('Safety check ID is required');
      }
      
      return await storage.getSafetyCheckById(id);
    } catch (error) {
      console.error('Error retrieving safety check:', error);
      throw new Error(`Failed to retrieve safety check: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Update a safety check
  public async updateSafetyCheck(id: string, updates: Partial<InsertSafetyCheck>): Promise<SafetyCheck | undefined> {
    try {
      if (!id) {
        throw new Error('Safety check ID is required');
      }
      
      return await storage.updateSafetyCheck(id, updates);
    } catch (error) {
      console.error('Error updating safety check:', error);
      throw new Error(`Failed to update safety check: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Delete a safety check
  public async deleteSafetyCheck(id: string): Promise<boolean> {
    try {
      if (!id) {
        throw new Error('Safety check ID is required');
      }
      
      return await storage.deleteSafetyCheck(id);
    } catch (error) {
      console.error('Error deleting safety check:', error);
      throw new Error(`Failed to delete safety check: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get safety requirements for an exercise plan
  public async getSafetyRequirementsForPlan(planId: string, userId: string): Promise<{ safetyFlags: any[]; safetyQuestions: any[] }> {
    try {
      if (!planId) {
        throw new Error('Exercise plan ID is required');
      }
      
      if (!userId) {
        throw new Error('User ID is required');
      }
      
      // Get exercise plan
      const exercisePlan = await storage.getExercisePlanById(planId, userId);
      if (!exercisePlan) {
        throw new Error('Exercise plan not found');
      }
      
      // Get safety flags from the exercise plan
      let safetyFlags = [];
      if (exercisePlan.safetyFlags) {
        try {
          safetyFlags = typeof exercisePlan.safetyFlags === 'string' 
            ? JSON.parse(exercisePlan.safetyFlags) 
            : exercisePlan.safetyFlags;
        } catch (e) {
          safetyFlags = [];
        }
      }
      
      // Define standard safety questions
      const safetyQuestions = [
        {
          id: 'feelingWell',
          question: 'Are you feeling well today?',
          type: 'boolean',
          required: true
        },
        {
          id: 'chestPain',
          question: 'Do you have chest pain or discomfort?',
          type: 'boolean',
          required: true
        },
        {
          id: 'dizziness',
          question: 'Do you feel dizzy or lightheaded?',
          type: 'boolean',
          required: true
        },
        {
          id: 'jointPain',
          question: 'Do you have any joint or muscle pain that might affect your exercise?',
          type: 'boolean',
          required: true
        },
        {
          id: 'medicationTaken',
          question: 'Have you taken your medication as prescribed today?',
          type: 'boolean',
          required: true
        },
        {
          id: 'notes',
          question: 'Any additional notes or concerns?',
          type: 'text',
          required: false
        }
      ];
      
      return { safetyFlags, safetyQuestions };
    } catch (error) {
      console.error('Error retrieving safety requirements:', error);
      throw new Error(`Failed to retrieve safety requirements: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// Export a singleton instance of the safety check service
export const safetyCheckService = new SafetyCheckService();