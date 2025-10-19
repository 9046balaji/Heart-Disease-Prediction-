import { storage } from "../storage";
import { InsertFoodLog } from "@shared/schema";
import { getRecipeById } from "./recipeService";

export interface FoodLogEntry {
  userId: string;
  recipeId?: string;
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
  foodName?: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  sodium?: number;
  description?: string;
}

export class FoodLogService {
  /**
   * Log a meal for a user
   * @param foodLogEntry - The food log entry to create
   * @returns The created food log entry
   */
  public async logMeal(foodLogEntry: FoodLogEntry): Promise<any> {
    try {
      // Validate required fields
      if (!foodLogEntry.userId) {
        throw new Error("User ID is required");
      }

      if (!foodLogEntry.mealType) {
        throw new Error("Meal type is required");
      }

      // If recipeId is provided, fetch recipe details
      let foodLogData: InsertFoodLog = {
        userId: foodLogEntry.userId,
        mealType: foodLogEntry.mealType,
        loggedAt: new Date(),
        createdAt: new Date()
      };

      if (foodLogEntry.recipeId) {
        const recipe = await getRecipeById(foodLogEntry.recipeId);
        if (recipe) {
          foodLogData.recipeId = foodLogEntry.recipeId;
          foodLogData.foodName = recipe.title;
          
          // Extract nutritional information from recipe
          if (recipe.nutrients) {
            const nutrients = typeof recipe.nutrients === 'string' 
              ? JSON.parse(recipe.nutrients) 
              : recipe.nutrients;
            
            foodLogData.calories = nutrients.calories || 0;
            foodLogData.protein = nutrients.protein_g || 0;
            foodLogData.carbs = nutrients.carb_g || 0;
            foodLogData.fat = nutrients.fat_g || 0;
            foodLogData.sodium = nutrients.sodium_mg || 0;
          }
        } else {
          throw new Error("Recipe not found");
        }
      } else if (foodLogEntry.foodName) {
        // For free-text entries
        foodLogData.foodName = foodLogEntry.foodName;
        foodLogData.description = foodLogEntry.description;
        foodLogData.calories = foodLogEntry.calories || 0;
        foodLogData.protein = foodLogEntry.protein || 0;
        foodLogData.carbs = foodLogEntry.carbs || 0;
        foodLogData.fat = foodLogEntry.fat || 0;
        foodLogData.sodium = foodLogEntry.sodium || 0;
      } else {
        throw new Error("Either recipeId or foodName must be provided");
      }

      // Create the food log entry
      const foodLog = await storage.createFoodLog(foodLogData);
      
      return {
        success: true,
        data: foodLog,
        message: "Meal logged successfully"
      };
    } catch (error: any) {
      console.error("Error logging meal:", error);
      throw new Error(`Failed to log meal: ${error.message}`);
    }
  }

  /**
   * Get food logs for a user
   * @param userId - The user ID
   * @returns Array of food logs
   */
  public async getFoodLogs(userId: string): Promise<any> {
    try {
      if (!userId) {
        throw new Error("User ID is required");
      }

      const foodLogs = await storage.getFoodLogsByUserId(userId);
      
      return {
        success: true,
        data: foodLogs,
        message: "Food logs retrieved successfully"
      };
    } catch (error: any) {
      console.error("Error retrieving food logs:", error);
      throw new Error(`Failed to retrieve food logs: ${error.message}`);
    }
  }

  /**
   * Get a specific food log entry
   * @param id - The food log ID
   * @returns The food log entry
   */
  public async getFoodLog(id: string): Promise<any> {
    try {
      if (!id) {
        throw new Error("Food log ID is required");
      }

      const foodLog = await storage.getFoodLogById(id);
      
      if (!foodLog) {
        throw new Error("Food log not found");
      }
      
      return {
        success: true,
        data: foodLog,
        message: "Food log retrieved successfully"
      };
    } catch (error: any) {
      console.error("Error retrieving food log:", error);
      throw new Error(`Failed to retrieve food log: ${error.message}`);
    }
  }

  /**
   * Update a food log entry
   * @param id - The food log ID
   * @param updates - The updates to apply
   * @returns The updated food log entry
   */
  public async updateFoodLog(id: string, updates: Partial<InsertFoodLog>): Promise<any> {
    try {
      if (!id) {
        throw new Error("Food log ID is required");
      }

      const foodLog = await storage.updateFoodLog(id, updates);
      
      if (!foodLog) {
        throw new Error("Food log not found");
      }
      
      return {
        success: true,
        data: foodLog,
        message: "Food log updated successfully"
      };
    } catch (error: any) {
      console.error("Error updating food log:", error);
      throw new Error(`Failed to update food log: ${error.message}`);
    }
  }

  /**
   * Delete a food log entry
   * @param id - The food log ID
   * @returns Success status
   */
  public async deleteFoodLog(id: string): Promise<any> {
    try {
      if (!id) {
        throw new Error("Food log ID is required");
      }

      const result = await storage.deleteFoodLog(id);
      
      if (!result) {
        throw new Error("Failed to delete food log");
      }
      
      return {
        success: true,
        message: "Food log deleted successfully"
      };
    } catch (error: any) {
      console.error("Error deleting food log:", error);
      throw new Error(`Failed to delete food log: ${error.message}`);
    }
  }
}

// Export a singleton instance of the food log service
export const foodLogService = new FoodLogService();