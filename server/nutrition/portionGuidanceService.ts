// Portion Guidance service for the HeartGuard application
// This service handles portion recommendations and calculations

import { randomUUID } from "crypto";
import { storage } from './storage';
import { PortionGuideline, InsertPortionGuideline } from '@shared/schema';

export interface PortionInfo {
  small: {
    description: string;
    calories: number;
  };
  medium: {
    description: string;
    calories: number;
  };
  large: {
    description: string;
    calories: number;
  };
}

export interface PortionCalculation {
  foodType: string;
  selectedPortion: "small" | "medium" | "large";
  quantity: number;
  totalCalories: number;
  portionDescription: string;
}

export class PortionGuidanceService {
  // Get portion guidelines for a specific food type
  public async getPortionGuidelines(foodType: string): Promise<PortionInfo | null> {
    try {
      if (!foodType) {
        throw new Error('Food type is required');
      }
      
      // Get portion guideline from storage
      const guideline = await storage.getPortionGuidelineByFoodType(foodType);
      
      if (!guideline) {
        return null;
      }
      
      return {
        small: {
          description: guideline.smallPortion,
          calories: guideline.caloriesPerUnit ? Math.round(guideline.caloriesPerUnit * 0.5) : 0
        },
        medium: {
          description: guideline.mediumPortion,
          calories: guideline.caloriesPerUnit ? guideline.caloriesPerUnit : 0
        },
        large: {
          description: guideline.largePortion,
          calories: guideline.caloriesPerUnit ? Math.round(guideline.caloriesPerUnit * 1.5) : 0
        }
      };
    } catch (error) {
      console.error('Error retrieving portion guidelines:', error);
      throw new Error(`Failed to retrieve portion guidelines: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Calculate calories based on portion selection and quantity
  public async calculatePortionCalories(
    foodType: string, 
    portionSize: "small" | "medium" | "large", 
    quantity: number
  ): Promise<PortionCalculation> {
    try {
      if (!foodType) {
        throw new Error('Food type is required');
      }
      
      if (!portionSize) {
        throw new Error('Portion size is required');
      }
      
      if (quantity <= 0) {
        throw new Error('Quantity must be greater than zero');
      }
      
      // Get portion guideline
      const guidelines = await this.getPortionGuidelines(foodType);
      
      if (!guidelines) {
        throw new Error(`No portion guidelines found for food type: ${foodType}`);
      }
      
      // Get calories for selected portion size
      let caloriesPerUnit = 0;
      let portionDescription = "";
      
      switch (portionSize) {
        case "small":
          caloriesPerUnit = guidelines.small.calories;
          portionDescription = guidelines.small.description;
          break;
        case "medium":
          caloriesPerUnit = guidelines.medium.calories;
          portionDescription = guidelines.medium.description;
          break;
        case "large":
          caloriesPerUnit = guidelines.large.calories;
          portionDescription = guidelines.large.description;
          break;
      }
      
      const totalCalories = Math.round(caloriesPerUnit * quantity);
      
      return {
        foodType,
        selectedPortion: portionSize,
        quantity,
        totalCalories,
        portionDescription
      };
    } catch (error) {
      console.error('Error calculating portion calories:', error);
      throw new Error(`Failed to calculate portion calories: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get all portion guidelines
  public async getAllPortionGuidelines(): Promise<PortionGuideline[]> {
    try {
      return await storage.getAllPortionGuidelines();
    } catch (error) {
      console.error('Error retrieving all portion guidelines:', error);
      throw new Error(`Failed to retrieve portion guidelines: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Add a new portion guideline
  public async addPortionGuideline(guidelineData: Omit<InsertPortionGuideline, "id" | "createdAt">): Promise<PortionGuideline> {
    try {
      // Validate required fields
      if (!guidelineData.foodCategory) {
        throw new Error('Food category is required');
      }
      
      if (!guidelineData.foodType) {
        throw new Error('Food type is required');
      }
      
      if (!guidelineData.smallPortion) {
        throw new Error('Small portion description is required');
      }
      
      if (!guidelineData.mediumPortion) {
        throw new Error('Medium portion description is required');
      }
      
      if (!guidelineData.largePortion) {
        throw new Error('Large portion description is required');
      }
      
      const guideline: InsertPortionGuideline = {
        id: randomUUID(),
        ...guidelineData,
        createdAt: new Date()
      };
      
      return await storage.createPortionGuideline(guideline);
    } catch (error) {
      console.error('Error adding portion guideline:', error);
      throw new Error(`Failed to add portion guideline: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Update a portion guideline
  public async updatePortionGuideline(
    id: string, 
    updates: Partial<Omit<InsertPortionGuideline, "id" | "createdAt">>
  ): Promise<PortionGuideline | undefined> {
    try {
      if (!id) {
        throw new Error('Portion guideline ID is required');
      }
      
      return await storage.updatePortionGuideline(id, updates);
    } catch (error) {
      console.error('Error updating portion guideline:', error);
      throw new Error(`Failed to update portion guideline: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Delete a portion guideline
  public async deletePortionGuideline(id: string): Promise<boolean> {
    try {
      if (!id) {
        throw new Error('Portion guideline ID is required');
      }
      
      return await storage.deletePortionGuideline(id);
    } catch (error) {
      console.error('Error deleting portion guideline:', error);
      throw new Error(`Failed to delete portion guideline: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get portion guideline by ID
  public async getPortionGuidelineById(id: string): Promise<PortionGuideline | undefined> {
    try {
      if (!id) {
        throw new Error('Portion guideline ID is required');
      }
      
      return await storage.getPortionGuidelineById(id);
    } catch (error) {
      console.error('Error retrieving portion guideline:', error);
      throw new Error(`Failed to retrieve portion guideline: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// Export a singleton instance of the portion guidance service
export const portionGuidanceService = new PortionGuidanceService();