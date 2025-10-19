import { storage } from "../storage";
import { WeeklyChallenge, InsertWeeklyChallenge, UserChallengeParticipation, InsertUserChallengeParticipation } from "@shared/schema";

export interface ChallengeServiceInterface {
  // Weekly challenges
  createChallenge(challengeData: Omit<InsertWeeklyChallenge, "createdAt">): Promise<WeeklyChallenge>;
  getChallenges(): Promise<WeeklyChallenge[]>;
  getActiveChallenges(): Promise<WeeklyChallenge[]>;
  getChallengeById(challengeId: string): Promise<WeeklyChallenge | undefined>;
  
  // User challenge participations
  joinChallenge(userId: string, challengeId: string): Promise<UserChallengeParticipation>;
  getUserParticipations(userId: string): Promise<UserChallengeParticipation[]>;
  getUserParticipation(userId: string, challengeId: string): Promise<UserChallengeParticipation | undefined>;
  updateParticipationProgress(userId: string, challengeId: string, progress: number): Promise<UserChallengeParticipation | undefined>;
  completeChallenge(userId: string, challengeId: string): Promise<UserChallengeParticipation | undefined>;
}

export class ChallengeService implements ChallengeServiceInterface {
  async createChallenge(challengeData: Omit<InsertWeeklyChallenge, "createdAt">): Promise<WeeklyChallenge> {
    const now = new Date();
    const challenge: InsertWeeklyChallenge = {
      ...challengeData,
      createdAt: now
    };
    
    return await storage.createWeeklyChallenge(challenge);
  }
  
  async getChallenges(): Promise<WeeklyChallenge[]> {
    return await storage.getWeeklyChallenges();
  }
  
  async getActiveChallenges(): Promise<WeeklyChallenge[]> {
    return await storage.getActiveWeeklyChallenges();
  }
  
  async getChallengeById(challengeId: string): Promise<WeeklyChallenge | undefined> {
    return await storage.getWeeklyChallenge(challengeId);
  }
  
  async joinChallenge(userId: string, challengeId: string): Promise<UserChallengeParticipation> {
    // Check if challenge exists
    const challenge = await this.getChallengeById(challengeId);
    if (!challenge) {
      throw new Error("Challenge not found");
    }
    
    // Check if user is already participating
    const existingParticipation = await this.getUserParticipation(userId, challengeId);
    if (existingParticipation) {
      throw new Error("User is already participating in this challenge");
    }
    
    const now = new Date();
    const participation: InsertUserChallengeParticipation = {
      userId,
      challengeId,
      startDate: now,
      completionDate: null,
      isCompleted: false,
      progress: 0,
      earnedPoints: 0,
      createdAt: now
    };
    
    return await storage.createUserChallengeParticipation(participation);
  }
  
  async getUserParticipations(userId: string): Promise<UserChallengeParticipation[]> {
    return await storage.getUserChallengeParticipations(userId);
  }
  
  async getUserParticipation(userId: string, challengeId: string): Promise<UserChallengeParticipation | undefined> {
    return await storage.getUserChallengeParticipation(userId, challengeId);
  }
  
  async updateParticipationProgress(userId: string, challengeId: string, progress: number): Promise<UserChallengeParticipation | undefined> {
    const participation = await this.getUserParticipation(userId, challengeId);
    if (!participation) {
      throw new Error("User is not participating in this challenge");
    }
    
    // Ensure progress is between 0 and 100
    const clampedProgress = Math.min(100, Math.max(0, progress));
    
    const updateData: Partial<InsertUserChallengeParticipation> = {
      progress: clampedProgress
    };
    
    return await storage.updateUserChallengeParticipation(participation.id, userId, updateData);
  }
  
  async completeChallenge(userId: string, challengeId: string): Promise<UserChallengeParticipation | undefined> {
    const participation = await this.getUserParticipation(userId, challengeId);
    if (!participation) {
      throw new Error("User is not participating in this challenge");
    }
    
    // Get the challenge to determine points
    const challenge = await this.getChallengeById(challengeId);
    if (!challenge) {
      throw new Error("Challenge not found");
    }
    
    const updateData: Partial<InsertUserChallengeParticipation> = {
      progress: 100,
      isCompleted: true,
      completionDate: new Date(),
      earnedPoints: challenge.points
    };
    
    return await storage.updateUserChallengeParticipation(participation.id, userId, updateData);
  }
}

// Initialize with some default challenges if they don't exist
async function initializeDefaultChallenges() {
  const challengeService = new ChallengeService();
  const challenges = await challengeService.getChallenges();
  
  if (challenges.length === 0) {
    // Create default challenges
    await challengeService.createChallenge({
      title: "10,000 Steps Daily",
      description: "Walk at least 10,000 steps every day for a week",
      category: "exercise",
      difficulty: "beginner",
      points: 50,
      durationDays: 7,
      startDate: new Date(),
      endDate: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000),
      isActive: true
    });
    
    await challengeService.createChallenge({
      title: "Heart-Healthy Eating",
      description: "Follow a heart-healthy diet for 5 days straight",
      category: "diet",
      difficulty: "intermediate",
      points: 75,
      durationDays: 5,
      startDate: new Date(),
      endDate: new Date(new Date().getTime() + 5 * 24 * 60 * 60 * 1000),
      isActive: true
    });
    
    await challengeService.createChallenge({
      title: "Stress Management",
      description: "Practice stress management techniques daily for a week",
      category: "stress",
      difficulty: "beginner",
      points: 40,
      durationDays: 7,
      startDate: new Date(),
      endDate: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000),
      isActive: true
    });
  }
}

// Initialize default challenges
initializeDefaultChallenges().catch(console.error);

export const challengeService = new ChallengeService();