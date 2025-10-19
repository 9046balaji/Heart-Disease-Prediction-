import { mealPlanService } from "../nutrition/mealPlans";
import { exercisePlanService } from "../exercise/exercisePlans";
import { authenticateUser } from "../auth/authMiddleware";
import { ClinicalEntry, Prediction } from "@shared/schema";

// Lifestyle routes
export function setupLifestyleRoutes(app: any) {
  // Generate personalized meal plan
  app.post("/api/meal-plans/personalized", authenticateUser, async (req: any, res: any) => {
    try {
      const userId = req.userId;
      const { clinicalEntry, prediction, dietaryPreferences, healthConditions } = req.body;
      
      // Validate required fields
      if (!clinicalEntry || !prediction) {
        return res.status(400).json({ message: "Clinical entry and prediction data are required" });
      }
      
      const mealPlan = await mealPlanService.generatePersonalizedMealPlan(
        userId, 
        clinicalEntry, 
        prediction,
        dietaryPreferences || [],
        healthConditions || []
      );
      
      res.status(201).json(mealPlan);
    } catch (error: any) {
      console.error("Error generating meal plan:", error);
      res.status(400).json({ message: error.message || "Error generating meal plan" });
    }
  });

  // Generate personalized exercise plan
  app.post("/api/exercise-plans/personalized", authenticateUser, async (req: any, res: any) => {
    try {
      const userId = req.userId;
      const { clinicalEntry, prediction, healthConditions } = req.body;
      
      // Validate required fields
      if (!clinicalEntry || !prediction) {
        return res.status(400).json({ message: "Clinical entry and prediction data are required" });
      }
      
      const exercisePlan = await exercisePlanService.generatePersonalizedExercisePlan(
        userId, 
        clinicalEntry, 
        prediction,
        healthConditions || []
      );
      
      res.status(201).json(exercisePlan);
    } catch (error: any) {
      console.error("Error generating exercise plan:", error);
      res.status(400).json({ message: error.message || "Error generating exercise plan" });
    }
  });
}