import { storage } from "../storage";
import { HealthGoal, InsertHealthGoal, GoalAchievement, InsertGoalAchievement } from "@shared/schema";

export interface GoalServiceInterface {
  // Health goals
  createGoal(userId: string, goalData: Omit<InsertHealthGoal, "userId" | "createdAt" | "updatedAt" | "currentValue">): Promise<HealthGoal>;
  getGoals(userId: string): Promise<HealthGoal[]>;
  getGoalById(userId: string, goalId: string): Promise<HealthGoal | undefined>;
  updateGoal(userId: string, goalId: string, goalData: Partial<Omit<InsertHealthGoal, "userId" | "createdAt" | "updatedAt">>): Promise<HealthGoal | undefined>;
  deleteGoal(userId: string, goalId: string): Promise<boolean>;
  updateGoalProgress(userId: string, goalId: string, increment: number): Promise<HealthGoal | undefined>;
  
  // Goal achievements
  createAchievement(achievementData: Omit<InsertGoalAchievement, "awardedDate">): Promise<GoalAchievement>;
  getAchievements(userId: string): Promise<GoalAchievement[]>;
  getAchievementById(userId: string, achievementId: string): Promise<GoalAchievement | undefined>;
  
  // Advanced features
  createSmallTargetGoal(userId: string, goalData: Omit<InsertHealthGoal, "userId" | "createdAt" | "updatedAt" | "currentValue">): Promise<HealthGoal>;
  getBadges(userId: string): Promise<GoalAchievement[]>;
  awardBadge(userId: string, badgeData: Omit<InsertGoalAchievement, "awardedDate">): Promise<GoalAchievement>;
}

export class GoalService implements GoalServiceInterface {
  async createGoal(userId: string, goalData: Omit<InsertHealthGoal, "userId" | "createdAt" | "updatedAt">): Promise<HealthGoal> {
    const now = new Date();
    const goal: InsertHealthGoal = {
      userId,
      ...goalData,
      currentValue: 0,
      isCompleted: false,
      completionDate: null,
      createdAt: now,
      updatedAt: now
    };
    
    return await storage.createHealthGoal(goal);
  }
  
  async createSmallTargetGoal(userId: string, goalData: Omit<InsertHealthGoal, "userId" | "createdAt" | "updatedAt">): Promise<HealthGoal> {
    // Small target goals are typically achievable in a short time frame
    // We'll set a default target that's smaller than regular goals
    const smallGoalData = {
      ...goalData,
      title: `[Small Target] ${goalData.title}`,
      description: goalData.description || `Small achievable target for ${goalData.title}`,
      targetValue: goalData.targetValue || 1,
      unit: goalData.unit || "times"
    };
    
    const now = new Date();
    const goal: InsertHealthGoal = {
      userId,
      ...smallGoalData,
      currentValue: 0,
      isCompleted: false,
      completionDate: null,
      createdAt: now,
      updatedAt: now
    };
    
    return await storage.createHealthGoal(goal);
  }
  
  async getGoals(userId: string): Promise<HealthGoal[]> {
    return await storage.getHealthGoals(userId);
  }
  
  async getGoalById(userId: string, goalId: string): Promise<HealthGoal | undefined> {
    return await storage.getHealthGoal(goalId, userId);
  }
  
  async updateGoal(userId: string, goalId: string, goalData: Partial<Omit<InsertHealthGoal, "userId" | "createdAt" | "updatedAt">>): Promise<HealthGoal | undefined> {
    const updateData: any = { ...goalData, updatedAt: new Date() };
    return await storage.updateHealthGoal(goalId, userId, updateData);
  }
  
  async deleteGoal(userId: string, goalId: string): Promise<boolean> {
    return await storage.deleteHealthGoal(goalId, userId);
  }
  
  async updateGoalProgress(userId: string, goalId: string, increment: number): Promise<HealthGoal | undefined> {
    const goal = await this.getGoalById(userId, goalId);
    if (!goal) {
      return undefined;
    }
    
    const newCurrentValue = goal.currentValue + increment;
    const isCompleted = newCurrentValue >= goal.targetValue;
    
    const updateData: Partial<InsertHealthGoal> = {
      currentValue: newCurrentValue,
      isCompleted,
      updatedAt: new Date()
    };
    
    if (isCompleted && !goal.isCompleted) {
      updateData.completionDate = new Date();
      
      // Create achievement for completing the goal
      await this.createAchievement({
        userId,
        goalId,
        title: `Goal Achieved: ${goal.title}`,
        description: `You completed your goal "${goal.title}"!`,
        badgeIcon: "🏆"
      });
    }
    
    return await storage.updateHealthGoal(goalId, userId, updateData);
  }
  
  // Goal achievements
  async createAchievement(achievementData: Omit<InsertGoalAchievement, "awardedDate">): Promise<GoalAchievement> {
    const now = new Date();
    const achievement: InsertGoalAchievement = {
      ...achievementData,
      goalId: achievementData.goalId ?? null,
      awardedDate: now
    };
    
    return await storage.createGoalAchievement(achievement);
  }
  
  async getAchievements(userId: string): Promise<GoalAchievement[]> {
    return await storage.getGoalAchievements(userId);
  }
  
  async getAchievementById(userId: string, achievementId: string): Promise<GoalAchievement | undefined> {
    return await storage.getGoalAchievement(achievementId, userId);
  }
  
  async getBadges(userId: string): Promise<GoalAchievement[]> {
    // For now, badges are the same as achievements
    // In a more advanced system, we might have separate badge tracking
    return await this.getAchievements(userId);
  }
  
  async awardBadge(userId: string, badgeData: Omit<InsertGoalAchievement, "awardedDate">): Promise<GoalAchievement> {
    // Award a badge as an achievement
    return await this.createAchievement({
      ...badgeData,
      userId
    });
  }
}

export const goalService = new GoalService();