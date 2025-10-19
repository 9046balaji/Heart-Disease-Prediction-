import { goalService } from "./goalService";
import { authenticateUser } from "../auth/authMiddleware";

export function setupGoalRoutes(app: any) {
  // Create a new health goal
  app.post("/api/goals", authenticateUser, async (req: any, res: any) => {
    try {
      const userId = req.userId;
      const goalData = req.body;
      
      // Validate required fields
      if (!goalData.title || !goalData.category || !goalData.targetValue || !goalData.unit) {
        return res.status(400).json({ message: "Title, category, target value, and unit are required" });
      }
      
      const goal = await goalService.createGoal(userId, goalData);
      res.status(201).json(goal);
    } catch (error: any) {
      console.error("Error creating health goal:", error);
      res.status(400).json({ message: error.message || "Error creating health goal" });
    }
  });
  
  // Get all health goals for a user
  app.get("/api/goals", authenticateUser, async (req: any, res: any) => {
    try {
      const userId = req.userId;
      const goals = await goalService.getGoals(userId);
      res.status(200).json(goals);
    } catch (error) {
      console.error("Error fetching health goals:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Get a specific health goal
  app.get("/api/goals/:goalId", authenticateUser, async (req: any, res: any) => {
    try {
      const userId = req.userId;
      const { goalId } = req.params;
      
      const goal = await goalService.getGoalById(userId, goalId);
      if (!goal) {
        return res.status(404).json({ message: "Goal not found" });
      }
      
      res.status(200).json(goal);
    } catch (error) {
      console.error("Error fetching health goal:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Update a health goal
  app.put("/api/goals/:goalId", authenticateUser, async (req: any, res: any) => {
    try {
      const userId = req.userId;
      const { goalId } = req.params;
      const goalData = req.body;
      
      // Check if goal exists
      const existingGoal = await goalService.getGoalById(userId, goalId);
      if (!existingGoal) {
        return res.status(404).json({ message: "Goal not found" });
      }
      
      const updatedGoal = await goalService.updateGoal(userId, goalId, goalData);
      res.status(200).json(updatedGoal);
    } catch (error: any) {
      console.error("Error updating health goal:", error);
      res.status(400).json({ message: error.message || "Error updating health goal" });
    }
  });
  
  // Delete a health goal
  app.delete("/api/goals/:goalId", authenticateUser, async (req: any, res: any) => {
    try {
      const userId = req.userId;
      const { goalId } = req.params;
      
      // Check if goal exists
      const existingGoal = await goalService.getGoalById(userId, goalId);
      if (!existingGoal) {
        return res.status(404).json({ message: "Goal not found" });
      }
      
      const result = await goalService.deleteGoal(userId, goalId);
      if (!result) {
        return res.status(404).json({ message: "Goal not found" });
      }
      
      res.status(200).json({ message: "Goal deleted successfully" });
    } catch (error) {
      console.error("Error deleting health goal:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Update goal progress
  app.post("/api/goals/:goalId/progress", authenticateUser, async (req: any, res: any) => {
    try {
      const userId = req.userId;
      const { goalId } = req.params;
      const { increment } = req.body;
      
      // Validate increment value
      if (increment === undefined || typeof increment !== 'number') {
        return res.status(400).json({ message: "Increment value is required and must be a number" });
      }
      
      // Check if goal exists
      const existingGoal = await goalService.getGoalById(userId, goalId);
      if (!existingGoal) {
        return res.status(404).json({ message: "Goal not found" });
      }
      
      const updatedGoal = await goalService.updateGoalProgress(userId, goalId, increment);
      res.status(200).json(updatedGoal);
    } catch (error: any) {
      console.error("Error updating goal progress:", error);
      res.status(400).json({ message: error.message || "Error updating goal progress" });
    }
  });
  
  // Get all goal achievements for a user
  app.get("/api/achievements", authenticateUser, async (req: any, res: any) => {
    try {
      const userId = req.userId;
      const achievements = await goalService.getAchievements(userId);
      res.status(200).json(achievements);
    } catch (error) {
      console.error("Error fetching goal achievements:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Create a small target goal
  app.post("/api/goals/small-target", authenticateUser, async (req: any, res: any) => {
    try {
      const userId = req.userId;
      const goalData = req.body;
      
      // Validate required fields
      if (!goalData.title) {
        return res.status(400).json({ message: "Title is required" });
      }
      
      const goal = await goalService.createSmallTargetGoal(userId, goalData);
      res.status(201).json(goal);
    } catch (error: any) {
      console.error("Error creating small target goal:", error);
      res.status(400).json({ message: error.message || "Error creating small target goal" });
    }
  });
  
  // Get all badges for a user
  app.get("/api/badges", authenticateUser, async (req: any, res: any) => {
    try {
      const userId = req.userId;
      const badges = await goalService.getBadges(userId);
      res.status(200).json(badges);
    } catch (error) {
      console.error("Error fetching badges:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Award a badge to a user
  app.post("/api/badges/award", authenticateUser, async (req: any, res: any) => {
    try {
      const userId = req.userId;
      const badgeData = req.body;
      
      // Validate required fields
      if (!badgeData.title || !badgeData.description) {
        return res.status(400).json({ message: "Title and description are required" });
      }
      
      const badge = await goalService.awardBadge(userId, {
        ...badgeData,
        userId
      });
      res.status(201).json(badge);
    } catch (error: any) {
      console.error("Error awarding badge:", error);
      res.status(400).json({ message: error.message || "Error awarding badge" });
    }
  });
}