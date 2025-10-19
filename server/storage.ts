import { randomUUID } from "crypto";
import { type User, type InsertUser, type ClinicalEntry, type InsertClinicalEntry, type Prediction, type InsertPrediction, type Medication, type InsertMedication, type MealPlan, type InsertMealPlan, type Exercise, type InsertExercise, type ExercisePlan, type InsertExercisePlan, type WorkoutLog, type InsertWorkoutLog, type SafetyCheck, type InsertSafetyCheck, type TeleConsultBooking, type InsertTeleConsultBooking, type ForumCategory, type InsertForumCategory, type ForumPost, type InsertForumPost, type ForumReply, type InsertForumReply, type HealthGoal, type InsertHealthGoal, type GoalAchievement, type InsertGoalAchievement, type WeeklyChallenge, type InsertWeeklyChallenge, type UserChallengeParticipation, type InsertUserChallengeParticipation, type LabResult, type InsertLabResult, type FoodLog, type InsertFoodLog, type PortionGuideline, type InsertPortionGuideline, type Symptom, type InsertSymptom } from "@shared/schema";
import { db } from "./db";
import * as schema from "@shared/schema";
import { eq, and, desc, asc } from "drizzle-orm";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Clinical entries
  createClinicalEntry(entry: InsertClinicalEntry): Promise<ClinicalEntry>;
  getClinicalEntries(userId: string): Promise<ClinicalEntry[]>;
  getClinicalEntry(id: string, userId: string): Promise<ClinicalEntry | undefined>;
  
  // Predictions
  createPrediction(prediction: InsertPrediction): Promise<Prediction>;
  getPredictions(userId: string): Promise<Prediction[]>;
  getPrediction(id: string, userId: string): Promise<Prediction | undefined>;
  
  // Medications
  createMedication(medication: InsertMedication): Promise<Medication>;
  getMedications(userId: string): Promise<Medication[]>;
  getMedication(id: string, userId: string): Promise<Medication | undefined>;
  updateMedication(id: string, userId: string, medication: Partial<InsertMedication>): Promise<Medication | undefined>;
  deleteMedication(id: string, userId: string): Promise<boolean>;
  markMedicationTaken(id: string, userId: string, taken: boolean): Promise<Medication | undefined>;
  
  // Meal plans
  createMealPlan(mealPlan: InsertMealPlan): Promise<MealPlan>;
  getMealPlans(userId: string): Promise<MealPlan[]>;
  
  // Exercises
  createExercise(exercise: InsertExercise): Promise<Exercise>;
  getExercises(): Promise<Exercise[]>;
  getExerciseById(id: string): Promise<Exercise | undefined>;
  updateExercise(id: string, exercise: Partial<InsertExercise>): Promise<Exercise | undefined>;
  deleteExercise(id: string): Promise<boolean>;
  
  // Exercise plans
  createExercisePlan(exercisePlan: InsertExercisePlan): Promise<ExercisePlan>;
  getExercisePlans(userId: string): Promise<ExercisePlan[]>;
  getExercisePlanById(id: string, userId: string): Promise<ExercisePlan | undefined>;
  
  // Workout logs
  createWorkoutLog(workoutLog: InsertWorkoutLog): Promise<WorkoutLog>;
  getWorkoutLogsByUserId(userId: string): Promise<WorkoutLog[]>;
  getWorkoutLogById(id: string): Promise<WorkoutLog | undefined>;
  updateWorkoutLog(id: string, updates: Partial<InsertWorkoutLog>): Promise<WorkoutLog | undefined>;
  deleteWorkoutLog(id: string): Promise<boolean>;
  
  // Safety checks
  createSafetyCheck(safetyCheck: InsertSafetyCheck): Promise<SafetyCheck>;
  getSafetyChecksByUserId(userId: string): Promise<SafetyCheck[]>;
  getSafetyCheckById(id: string): Promise<SafetyCheck | undefined>;
  updateSafetyCheck(id: string, updates: Partial<InsertSafetyCheck>): Promise<SafetyCheck | undefined>;
  deleteSafetyCheck(id: string): Promise<boolean>;
  
  // Tele-consult bookings
  createTeleConsultBooking(booking: InsertTeleConsultBooking): Promise<TeleConsultBooking>;
  getTeleConsultBookings(userId: string): Promise<TeleConsultBooking[]>;
  getTeleConsultBooking(id: string, userId: string): Promise<TeleConsultBooking | undefined>;
  updateTeleConsultBooking(id: string, userId: string, booking: Partial<InsertTeleConsultBooking>): Promise<TeleConsultBooking | undefined>;
  deleteTeleConsultBooking(id: string, userId: string): Promise<boolean>;
  
  // Forum categories
  createForumCategory(category: InsertForumCategory): Promise<ForumCategory>;
  getForumCategories(): Promise<ForumCategory[]>;
  getForumCategory(id: string): Promise<ForumCategory | undefined>;
  
  // Forum posts
  createForumPost(post: InsertForumPost): Promise<ForumPost>;
  getForumPosts(categoryId?: string): Promise<ForumPost[]>;
  getForumPost(id: string): Promise<ForumPost | undefined>;
  updateForumPost(id: string, post: Partial<InsertForumPost>): Promise<ForumPost | undefined>;
  deleteForumPost(id: string): Promise<boolean>;
  incrementPostViewCount(id: string): Promise<void>;
  incrementPostReplyCount(id: string): Promise<void>;
  
  // Forum replies
  createForumReply(reply: InsertForumReply): Promise<ForumReply>;
  getForumReplies(postId: string): Promise<ForumReply[]>;
  getForumReply(id: string): Promise<ForumReply | undefined>;
  updateForumReply(id: string, reply: Partial<InsertForumReply>): Promise<ForumReply | undefined>;
  deleteForumReply(id: string): Promise<boolean>;
  markReplyAsAccepted(id: string, accepted: boolean): Promise<ForumReply | undefined>;
  
  // Health goals
  createHealthGoal(goal: InsertHealthGoal): Promise<HealthGoal>;
  getHealthGoals(userId: string): Promise<HealthGoal[]>;
  getHealthGoal(id: string, userId: string): Promise<HealthGoal | undefined>;
  updateHealthGoal(id: string, userId: string, goal: Partial<InsertHealthGoal>): Promise<HealthGoal | undefined>;
  deleteHealthGoal(id: string, userId: string): Promise<boolean>;
  
  // Goal achievements
  createGoalAchievement(achievement: InsertGoalAchievement): Promise<GoalAchievement>;
  getGoalAchievements(userId: string): Promise<GoalAchievement[]>;
  getGoalAchievement(id: string, userId: string): Promise<GoalAchievement | undefined>;
  
  // Weekly challenges
  createWeeklyChallenge(challenge: InsertWeeklyChallenge): Promise<WeeklyChallenge>;
  getWeeklyChallenges(): Promise<WeeklyChallenge[]>;
  getActiveWeeklyChallenges(): Promise<WeeklyChallenge[]>;
  getWeeklyChallenge(id: string): Promise<WeeklyChallenge | undefined>;
  
  // User challenge participations
  createUserChallengeParticipation(participation: InsertUserChallengeParticipation): Promise<UserChallengeParticipation>;
  getUserChallengeParticipations(userId: string): Promise<UserChallengeParticipation[]>;
  getUserChallengeParticipation(userId: string, challengeId: string): Promise<UserChallengeParticipation | undefined>;
  updateUserChallengeParticipation(id: string, userId: string, participation: Partial<InsertUserChallengeParticipation>): Promise<UserChallengeParticipation | undefined>;
  
  // Lab results
  createLabResult(labResult: InsertLabResult): Promise<LabResult>;
  getLabResultsByUserId(userId: string): Promise<LabResult[]>;
  getLabResultById(id: string): Promise<LabResult | undefined>;
  updateLabResult(id: string, updates: Partial<InsertLabResult>): Promise<LabResult | undefined>;
  deleteLabResult(id: string): Promise<boolean>;
  
  // Symptoms
  createSymptom(symptom: InsertSymptom): Promise<Symptom>;
  getSymptomsByUserId(userId: string): Promise<Symptom[]>;
  getSymptomById(id: string): Promise<Symptom | undefined>;
  updateSymptom(id: string, updates: Partial<InsertSymptom>): Promise<Symptom | undefined>;
  deleteSymptom(id: string): Promise<boolean>;
  
  // Food logs
  createFoodLog(foodLog: InsertFoodLog): Promise<FoodLog>;
  getFoodLogsByUserId(userId: string): Promise<FoodLog[]>;
  getFoodLogById(id: string): Promise<FoodLog | undefined>;
  updateFoodLog(id: string, updates: Partial<InsertFoodLog>): Promise<FoodLog | undefined>;
  deleteFoodLog(id: string): Promise<boolean>;
  
  // Portion guidelines
  createPortionGuideline(portionGuideline: InsertPortionGuideline): Promise<PortionGuideline>;
  getAllPortionGuidelines(): Promise<PortionGuideline[]>;
  getPortionGuidelineById(id: string): Promise<PortionGuideline | undefined>;
  getPortionGuidelineByFoodType(foodType: string): Promise<PortionGuideline | undefined>;
  updatePortionGuideline(id: string, updates: Partial<InsertPortionGuideline>): Promise<PortionGuideline | undefined>;
  deletePortionGuideline(id: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const database = await db;
    const users = await database.select().from(schema.users).where(eq(schema.users.id, id));
    return users[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const database = await db;
    const users = await database.select().from(schema.users).where(eq(schema.users.username, username));
    return users[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const database = await db;
    const id = randomUUID();
    const now = new Date();
    const userWithId = { ...insertUser, id, createdAt: now, updatedAt: now };
    
    const result = await database.insert(schema.users).values(userWithId).execute();
    
    // Return the created user by selecting it back
    const users = await database.select().from(schema.users).where(eq(schema.users.id, id));
    return users[0];
  }
  
  // Clinical entries
  async createClinicalEntry(insertEntry: InsertClinicalEntry): Promise<ClinicalEntry> {
    const database = await db;
    const id = randomUUID();
    const entryWithId = { ...insertEntry, id };
    
    await database.insert(schema.clinicalEntries).values(entryWithId).execute();
    
    return entryWithId as ClinicalEntry;
  }
  
  async getClinicalEntries(userId: string): Promise<ClinicalEntry[]> {
    const database = await db;
    return await database.select().from(schema.clinicalEntries).where(eq(schema.clinicalEntries.userId, userId)).orderBy(schema.clinicalEntries.timestamp);
  }
  
  async getClinicalEntry(id: string, userId: string): Promise<ClinicalEntry | undefined> {
    const database = await db;
    const entries = await database.select().from(schema.clinicalEntries).where(
      and(
        eq(schema.clinicalEntries.id, id),
        eq(schema.clinicalEntries.userId, userId)
      )
    );
    return entries[0];
  }
  
  // Predictions
  async createPrediction(insertPrediction: InsertPrediction): Promise<Prediction> {
    const database = await db;
    const id = randomUUID();
    const predictionWithId = { ...insertPrediction, id };
    
    await database.insert(schema.predictions).values(predictionWithId).execute();
    
    return predictionWithId as Prediction;
  }
  
  async getPredictions(userId: string): Promise<Prediction[]> {
    const database = await db;
    return await database.select().from(schema.predictions).where(eq(schema.predictions.userId, userId)).orderBy(schema.predictions.timestamp);
  }
  
  async getPrediction(id: string, userId: string): Promise<Prediction | undefined> {
    const database = await db;
    const predictions = await database.select().from(schema.predictions).where(
      and(
        eq(schema.predictions.id, id),
        eq(schema.predictions.userId, userId)
      )
    );
    return predictions[0];
  }
  
  // Medications
  async createMedication(insertMedication: InsertMedication): Promise<Medication> {
    const database = await db;
    const id = randomUUID();
    const medicationWithId = { ...insertMedication, id };
    
    await database.insert(schema.medications).values(medicationWithId).execute();
    
    return medicationWithId as Medication;
  }
  
  async getMedications(userId: string): Promise<Medication[]> {
    const database = await db;
    return await database.select().from(schema.medications).where(eq(schema.medications.userId, userId));
  }
  
  async getMedication(id: string, userId: string): Promise<Medication | undefined> {
    const database = await db;
    const medications = await database.select().from(schema.medications).where(
      and(
        eq(schema.medications.id, id),
        eq(schema.medications.userId, userId)
      )
    );
    return medications[0];
  }
  
  async updateMedication(id: string, userId: string, medication: Partial<InsertMedication>): Promise<Medication | undefined> {
    const database = await db;
    const medications = await database.update(schema.medications)
      .set(medication)
      .where(
        and(
          eq(schema.medications.id, id),
          eq(schema.medications.userId, userId)
        )
      )
      .execute();
    
    return await this.getMedication(id, userId);
  }
  
  async deleteMedication(id: string, userId: string): Promise<boolean> {
    const database = await db;
    try {
      await database.delete(schema.medications)
        .where(
          and(
            eq(schema.medications.id, id),
            eq(schema.medications.userId, userId)
          )
        )
        .execute();
      return true;
    } catch (error) {
      console.error("Error deleting medication:", error);
      return false;
    }
  }
  
  async markMedicationTaken(id: string, userId: string, taken: boolean): Promise<Medication | undefined> {
    return await this.updateMedication(id, userId, { taken });
  }
  
  // Meal plans
  async createMealPlan(insertMealPlan: InsertMealPlan): Promise<MealPlan> {
    const database = await db;
    const id = randomUUID();
    const mealPlanWithId = { ...insertMealPlan, id };
    
    await database.insert(schema.mealPlans).values(mealPlanWithId).execute();
    
    return mealPlanWithId as MealPlan;
  }
  
  async getMealPlans(userId: string): Promise<MealPlan[]> {
    const database = await db;
    return await database.select().from(schema.mealPlans).where(eq(schema.mealPlans.userId, userId));
  }
  
  // Exercises
  async createExercise(insertExercise: InsertExercise): Promise<Exercise> {
    const database = await db;
    const id = randomUUID();
    const exerciseWithId = { ...insertExercise, id };
    
    await database.insert(schema.exercises).values(exerciseWithId).execute();
    
    return exerciseWithId as Exercise;
  }
  
  async getExercises(): Promise<Exercise[]> {
    const database = await db;
    return await database.select().from(schema.exercises).orderBy(schema.exercises.title);
  }
  
  async getExerciseById(id: string): Promise<Exercise | undefined> {
    const database = await db;
    const exercises = await database.select().from(schema.exercises).where(eq(schema.exercises.id, id));
    return exercises[0];
  }
  
  async updateExercise(id: string, exercise: Partial<InsertExercise>): Promise<Exercise | undefined> {
    const database = await db;
    await database.update(schema.exercises).set(exercise).where(eq(schema.exercises.id, id)).execute();
    return await this.getExerciseById(id);
  }
  
  async deleteExercise(id: string): Promise<boolean> {
    const database = await db;
    try {
      await database.delete(schema.exercises).where(eq(schema.exercises.id, id)).execute();
      return true;
    } catch (error) {
      console.error("Error deleting exercise:", error);
      return false;
    }
  }
  
  // Exercise plans
  async createExercisePlan(insertExercisePlan: InsertExercisePlan): Promise<ExercisePlan> {
    const database = await db;
    const id = randomUUID();
    const exercisePlanWithId = { ...insertExercisePlan, id };
    
    await database.insert(schema.exercisePlans).values(exercisePlanWithId).execute();
    
    return exercisePlanWithId as ExercisePlan;
  }
  
  async getExercisePlans(userId: string): Promise<ExercisePlan[]> {
    const database = await db;
    return await database.select().from(schema.exercisePlans).where(eq(schema.exercisePlans.userId, userId));
  }
  
  async getExercisePlanById(id: string, userId: string): Promise<ExercisePlan | undefined> {
    const database = await db;
    const exercisePlans = await database.select().from(schema.exercisePlans).where(
      and(
        eq(schema.exercisePlans.id, id),
        eq(schema.exercisePlans.userId, userId)
      )
    );
    return exercisePlans[0];
  }
  
  // Workout logs
  async createWorkoutLog(insertWorkoutLog: InsertWorkoutLog): Promise<WorkoutLog> {
    const database = await db;
    const id = randomUUID();
    const workoutLogWithId = { ...insertWorkoutLog, id };
    
    await database.insert(schema.workoutLogs).values(workoutLogWithId).execute();
    
    return workoutLogWithId as WorkoutLog;
  }
  
  async getWorkoutLogsByUserId(userId: string): Promise<WorkoutLog[]> {
    const database = await db;
    return await database.select().from(schema.workoutLogs).where(eq(schema.workoutLogs.userId, userId)).orderBy(desc(schema.workoutLogs.completedAt));
  }
  
  async getWorkoutLogById(id: string): Promise<WorkoutLog | undefined> {
    const database = await db;
    const workoutLogs = await database.select().from(schema.workoutLogs).where(eq(schema.workoutLogs.id, id));
    return workoutLogs[0];
  }
  
  async updateWorkoutLog(id: string, updates: Partial<InsertWorkoutLog>): Promise<WorkoutLog | undefined> {
    const database = await db;
    await database.update(schema.workoutLogs).set(updates).where(eq(schema.workoutLogs.id, id)).execute();
    return await this.getWorkoutLogById(id);
  }
  
  async deleteWorkoutLog(id: string): Promise<boolean> {
    const database = await db;
    try {
      await database.delete(schema.workoutLogs).where(eq(schema.workoutLogs.id, id)).execute();
      return true;
    } catch (error) {
      console.error("Error deleting workout log:", error);
      return false;
    }
  }
  
  // Safety checks
  async createSafetyCheck(insertSafetyCheck: InsertSafetyCheck): Promise<SafetyCheck> {
    const database = await db;
    const id = randomUUID();
    const safetyCheckWithId = { ...insertSafetyCheck, id };
    
    await database.insert(schema.safetyChecks).values(safetyCheckWithId).execute();
    
    return safetyCheckWithId as SafetyCheck;
  }
  
  async getSafetyChecksByUserId(userId: string): Promise<SafetyCheck[]> {
    const database = await db;
    return await database.select().from(schema.safetyChecks).where(eq(schema.safetyChecks.userId, userId)).orderBy(desc(schema.safetyChecks.completedAt));
  }
  
  async getSafetyCheckById(id: string): Promise<SafetyCheck | undefined> {
    const database = await db;
    const safetyChecks = await database.select().from(schema.safetyChecks).where(eq(schema.safetyChecks.id, id));
    return safetyChecks[0];
  }
  
  async updateSafetyCheck(id: string, updates: Partial<InsertSafetyCheck>): Promise<SafetyCheck | undefined> {
    const database = await db;
    await database.update(schema.safetyChecks).set(updates).where(eq(schema.safetyChecks.id, id)).execute();
    return await this.getSafetyCheckById(id);
  }
  
  async deleteSafetyCheck(id: string): Promise<boolean> {
    const database = await db;
    try {
      await database.delete(schema.safetyChecks).where(eq(schema.safetyChecks.id, id)).execute();
      return true;
    } catch (error) {
      console.error("Error deleting safety check:", error);
      return false;
    }
  }
  
  // Tele-consult bookings
  async createTeleConsultBooking(insertBooking: InsertTeleConsultBooking): Promise<TeleConsultBooking> {
    const database = await db;
    const id = randomUUID();
    const bookingWithId = { ...insertBooking, id };
    
    await database.insert(schema.teleConsultBookings).values(bookingWithId).execute();
    
    return bookingWithId as TeleConsultBooking;
  }
  
  async getTeleConsultBookings(userId: string): Promise<TeleConsultBooking[]> {
    const database = await db;
    return await database.select().from(schema.teleConsultBookings).where(eq(schema.teleConsultBookings.userId, userId));
  }
  
  async getTeleConsultBooking(id: string, userId: string): Promise<TeleConsultBooking | undefined> {
    const database = await db;
    const bookings = await database.select().from(schema.teleConsultBookings).where(
      and(
        eq(schema.teleConsultBookings.id, id),
        eq(schema.teleConsultBookings.userId, userId)
      )
    );
    return bookings[0];
  }
  
  async updateTeleConsultBooking(id: string, userId: string, booking: Partial<InsertTeleConsultBooking>): Promise<TeleConsultBooking | undefined> {
    const database = await db;
    await database.update(schema.teleConsultBookings)
      .set(booking)
      .where(
        and(
          eq(schema.teleConsultBookings.id, id),
          eq(schema.teleConsultBookings.userId, userId)
        )
      )
      .execute();
    
    return await this.getTeleConsultBooking(id, userId);
  }
  
  async deleteTeleConsultBooking(id: string, userId: string): Promise<boolean> {
    const database = await db;
    try {
      await database.delete(schema.teleConsultBookings)
        .where(
          and(
            eq(schema.teleConsultBookings.id, id),
            eq(schema.teleConsultBookings.userId, userId)
          )
        )
        .execute();
      return true;
    } catch (error) {
      console.error("Error deleting tele-consult booking:", error);
      return false;
    }
  }
  
  // Forum categories
  async createForumCategory(insertCategory: InsertForumCategory): Promise<ForumCategory> {
    const database = await db;
    const id = randomUUID();
    const categoryWithId = { ...insertCategory, id };
    
    await database.insert(schema.forumCategories).values(categoryWithId).execute();
    
    return categoryWithId as ForumCategory;
  }
  
  async getForumCategories(): Promise<ForumCategory[]> {
    const database = await db;
    return await database.select().from(schema.forumCategories);
  }
  
  async getForumCategory(id: string): Promise<ForumCategory | undefined> {
    const database = await db;
    const categories = await database.select().from(schema.forumCategories).where(eq(schema.forumCategories.id, id));
    return categories[0];
  }
  
  // Forum posts
  async createForumPost(insertPost: InsertForumPost): Promise<ForumPost> {
    const database = await db;
    const id = randomUUID();
    const postWithId = { ...insertPost, id };
    
    await database.insert(schema.forumPosts).values(postWithId).execute();
    
    return postWithId as ForumPost;
  }
  
  async getForumPosts(categoryId?: string): Promise<ForumPost[]> {
    const database = await db;
    if (categoryId) {
      return await database.select().from(schema.forumPosts).where(eq(schema.forumPosts.categoryId, categoryId));
    }
    return await database.select().from(schema.forumPosts);
  }
  
  async getForumPost(id: string): Promise<ForumPost | undefined> {
    const database = await db;
    const posts = await database.select().from(schema.forumPosts).where(eq(schema.forumPosts.id, id));
    return posts[0];
  }
  
  async updateForumPost(id: string, post: Partial<InsertForumPost>): Promise<ForumPost | undefined> {
    const database = await db;
    await database.update(schema.forumPosts).set(post).where(eq(schema.forumPosts.id, id)).execute();
    return await this.getForumPost(id);
  }
  
  async deleteForumPost(id: string): Promise<boolean> {
    const database = await db;
    try {
      await database.delete(schema.forumPosts).where(eq(schema.forumPosts.id, id)).execute();
      return true;
    } catch (error) {
      console.error("Error deleting forum post:", error);
      return false;
    }
  }
  
  async incrementPostViewCount(id: string): Promise<void> {
    const database = await db;
    await database.update(schema.forumPosts)
      .set({
        viewCount: sql`view_count + 1`
      })
      .where(eq(schema.forumPosts.id, id))
      .execute();
  }
  
  async incrementPostReplyCount(id: string): Promise<void> {
    const database = await db;
    await database.update(schema.forumPosts)
      .set({
        replyCount: sql`reply_count + 1`
      })
      .where(eq(schema.forumPosts.id, id))
      .execute();
  }
  
  // Forum replies
  async createForumReply(insertReply: InsertForumReply): Promise<ForumReply> {
    const database = await db;
    const id = randomUUID();
    const replyWithId = { ...insertReply, id };
    
    await database.insert(schema.forumReplies).values(replyWithId).execute();
    
    // Increment reply count on the parent post
    await this.incrementPostReplyCount(insertReply.postId);
    
    return replyWithId as ForumReply;
  }
  
  async getForumReplies(postId: string): Promise<ForumReply[]> {
    const database = await db;
    return await database.select().from(schema.forumReplies).where(eq(schema.forumReplies.postId, postId));
  }
  
  async getForumReply(id: string): Promise<ForumReply | undefined> {
    const database = await db;
    const replies = await database.select().from(schema.forumReplies).where(eq(schema.forumReplies.id, id));
    return replies[0];
  }
  
  async updateForumReply(id: string, reply: Partial<InsertForumReply>): Promise<ForumReply | undefined> {
    const database = await db;
    await database.update(schema.forumReplies).set(reply).where(eq(schema.forumReplies.id, id)).execute();
    return await this.getForumReply(id);
  }
  
  async deleteForumReply(id: string): Promise<boolean> {
    const database = await db;
    try {
      await database.delete(schema.forumReplies).where(eq(schema.forumReplies.id, id)).execute();
      return true;
    } catch (error) {
      console.error("Error deleting forum reply:", error);
      return false;
    }
  }
  
  async markReplyAsAccepted(id: string, accepted: boolean): Promise<ForumReply | undefined> {
    return await this.updateForumReply(id, { isAcceptedAnswer: accepted });
  }
  
  // Health goals
  async createHealthGoal(insertGoal: InsertHealthGoal): Promise<HealthGoal> {
    const database = await db;
    const id = randomUUID();
    const goalWithId = { ...insertGoal, id };
    
    await database.insert(schema.healthGoals).values(goalWithId).execute();
    
    return goalWithId as HealthGoal;
  }
  
  async getHealthGoals(userId: string): Promise<HealthGoal[]> {
    const database = await db;
    return await database.select().from(schema.healthGoals).where(eq(schema.healthGoals.userId, userId));
  }
  
  async getHealthGoal(id: string, userId: string): Promise<HealthGoal | undefined> {
    const database = await db;
    const goals = await database.select().from(schema.healthGoals).where(
      and(
        eq(schema.healthGoals.id, id),
        eq(schema.healthGoals.userId, userId)
      )
    );
    return goals[0];
  }
  
  async updateHealthGoal(id: string, userId: string, goal: Partial<InsertHealthGoal>): Promise<HealthGoal | undefined> {
    const database = await db;
    await database.update(schema.healthGoals)
      .set(goal)
      .where(
        and(
          eq(schema.healthGoals.id, id),
          eq(schema.healthGoals.userId, userId)
        )
      )
      .execute();
    
    return await this.getHealthGoal(id, userId);
  }
  
  async deleteHealthGoal(id: string, userId: string): Promise<boolean> {
    const database = await db;
    try {
      await database.delete(schema.healthGoals)
        .where(
          and(
            eq(schema.healthGoals.id, id),
            eq(schema.healthGoals.userId, userId)
          )
        )
        .execute();
      return true;
    } catch (error) {
      console.error("Error deleting health goal:", error);
      return false;
    }
  }
  
  // Goal achievements
  async createGoalAchievement(insertAchievement: InsertGoalAchievement): Promise<GoalAchievement> {
    const database = await db;
    const id = randomUUID();
    const achievementWithId = { ...insertAchievement, id };
    
    await database.insert(schema.goalAchievements).values(achievementWithId).execute();
    
    return achievementWithId as GoalAchievement;
  }
  
  async getGoalAchievements(userId: string): Promise<GoalAchievement[]> {
    const database = await db;
    return await database.select().from(schema.goalAchievements).where(eq(schema.goalAchievements.userId, userId));
  }
  
  async getGoalAchievement(id: string, userId: string): Promise<GoalAchievement | undefined> {
    const database = await db;
    const achievements = await database.select().from(schema.goalAchievements).where(
      and(
        eq(schema.goalAchievements.id, id),
        eq(schema.goalAchievements.userId, userId)
      )
    );
    return achievements[0];
  }
  
  // Weekly challenges
  async createWeeklyChallenge(insertChallenge: InsertWeeklyChallenge): Promise<WeeklyChallenge> {
    const database = await db;
    const id = randomUUID();
    const challengeWithId = { ...insertChallenge, id };
    
    await database.insert(schema.weeklyChallenges).values(challengeWithId).execute();
    
    return challengeWithId as WeeklyChallenge;
  }
  
  async getWeeklyChallenges(): Promise<WeeklyChallenge[]> {
    const database = await db;
    return await database.select().from(schema.weeklyChallenges);
  }
  
  async getActiveWeeklyChallenges(): Promise<WeeklyChallenge[]> {
    const database = await db;
    return await database.select().from(schema.weeklyChallenges).where(eq(schema.weeklyChallenges.isActive, true));
  }
  
  async getWeeklyChallenge(id: string): Promise<WeeklyChallenge | undefined> {
    const database = await db;
    const challenges = await database.select().from(schema.weeklyChallenges).where(eq(schema.weeklyChallenges.id, id));
    return challenges[0];
  }
  
  // User challenge participations
  async createUserChallengeParticipation(insertParticipation: InsertUserChallengeParticipation): Promise<UserChallengeParticipation> {
    const database = await db;
    const id = randomUUID();
    const participationWithId = { ...insertParticipation, id };
    
    await database.insert(schema.userChallengeParticipations).values(participationWithId).execute();
    
    return participationWithId as UserChallengeParticipation;
  }
  
  async getUserChallengeParticipations(userId: string): Promise<UserChallengeParticipation[]> {
    const database = await db;
    return await database.select().from(schema.userChallengeParticipations).where(eq(schema.userChallengeParticipations.userId, userId));
  }
  
  async getUserChallengeParticipation(userId: string, challengeId: string): Promise<UserChallengeParticipation | undefined> {
    const database = await db;
    const participations = await database.select().from(schema.userChallengeParticipations).where(
      and(
        eq(schema.userChallengeParticipations.userId, userId),
        eq(schema.userChallengeParticipations.challengeId, challengeId)
      )
    );
    return participations[0];
  }
  
  async updateUserChallengeParticipation(id: string, userId: string, participation: Partial<InsertUserChallengeParticipation>): Promise<UserChallengeParticipation | undefined> {
    const database = await db;
    await database.update(schema.userChallengeParticipations)
      .set(participation)
      .where(
        and(
          eq(schema.userChallengeParticipations.id, id),
          eq(schema.userChallengeParticipations.userId, userId)
        )
      )
      .execute();
    
    return await this.getUserChallengeParticipation(userId, participation.challengeId || '');
  }
  
  // Lab results
  async createLabResult(insertLabResult: InsertLabResult): Promise<LabResult> {
    const database = await db;
    const id = randomUUID();
    const labResultWithId = { ...insertLabResult, id };
    
    await database.insert(schema.labResults).values(labResultWithId).execute();
    
    return labResultWithId as LabResult;
  }
  
  async getLabResultsByUserId(userId: string): Promise<LabResult[]> {
    const database = await db;
    return await database.select().from(schema.labResults).where(eq(schema.labResults.userId, userId));
  }
  
  async getLabResultById(id: string): Promise<LabResult | undefined> {
    const database = await db;
    const labResults = await database.select().from(schema.labResults).where(eq(schema.labResults.id, id));
    return labResults[0];
  }
  
  async updateLabResult(id: string, updates: Partial<InsertLabResult>): Promise<LabResult | undefined> {
    const database = await db;
    await database.update(schema.labResults).set(updates).where(eq(schema.labResults.id, id)).execute();
    return await this.getLabResultById(id);
  }
  
  async deleteLabResult(id: string): Promise<boolean> {
    const database = await db;
    try {
      await database.delete(schema.labResults).where(eq(schema.labResults.id, id)).execute();
      return true;
    } catch (error) {
      console.error("Error deleting lab result:", error);
      return false;
    }
  }
  
  // Symptoms
  async createSymptom(insertSymptom: Omit<InsertSymptom, 'id'>): Promise<Symptom> {
    const database = await db;
    const id = randomUUID();
    const symptomWithId = { ...insertSymptom, id } as InsertSymptom;
    
    await database.insert(schema.symptoms).values(symptomWithId).execute();
    
    return symptomWithId as Symptom;
  }
  
  async getSymptomsByUserId(userId: string): Promise<Symptom[]> {
    const database = await db;
    return await database.select().from(schema.symptoms).where(eq(schema.symptoms.userId, userId)).orderBy(desc(schema.symptoms.timestamp));
  }
  
  async getSymptomById(id: string): Promise<Symptom | undefined> {
    const database = await db;
    const symptoms = await database.select().from(schema.symptoms).where(eq(schema.symptoms.id, id));
    return symptoms[0];
  }
  
  async updateSymptom(id: string, updates: Partial<InsertSymptom>): Promise<Symptom | undefined> {
    const database = await db;
    await database.update(schema.symptoms).set(updates).where(eq(schema.symptoms.id, id)).execute();
    return await this.getSymptomById(id);
  }
  
  async deleteSymptom(id: string): Promise<boolean> {
    const database = await db;
    try {
      await database.delete(schema.symptoms).where(eq(schema.symptoms.id, id)).execute();
      return true;
    } catch (error) {
      console.error("Error deleting symptom:", error);
      return false;
    }
  }
  
  // Food logs
  async createFoodLog(insertFoodLog: InsertFoodLog): Promise<FoodLog> {
    const database = await db;
    const id = randomUUID();
    const foodLogWithId = { ...insertFoodLog, id };
    
    await database.insert(schema.foodLogs).values(foodLogWithId).execute();
    
    return foodLogWithId as FoodLog;
  }
  
  async getFoodLogsByUserId(userId: string): Promise<FoodLog[]> {
    const database = await db;
    return await database.select().from(schema.foodLogs).where(eq(schema.foodLogs.userId, userId)).orderBy(desc(schema.foodLogs.loggedAt));
  }
  
  async getFoodLogById(id: string): Promise<FoodLog | undefined> {
    const database = await db;
    const foodLogs = await database.select().from(schema.foodLogs).where(eq(schema.foodLogs.id, id));
    return foodLogs[0];
  }
  
  async updateFoodLog(id: string, updates: Partial<InsertFoodLog>): Promise<FoodLog | undefined> {
    const database = await db;
    await database.update(schema.foodLogs).set(updates).where(eq(schema.foodLogs.id, id)).execute();
    return await this.getFoodLogById(id);
  }
  
  async deleteFoodLog(id: string): Promise<boolean> {
    const database = await db;
    try {
      await database.delete(schema.foodLogs).where(eq(schema.foodLogs.id, id)).execute();
      return true;
    } catch (error) {
      console.error("Error deleting food log:", error);
      return false;
    }
  }
  
  // Portion guidelines
  async createPortionGuideline(insertPortionGuideline: InsertPortionGuideline): Promise<PortionGuideline> {
    const database = await db;
    const id = randomUUID();
    const portionGuidelineWithId = { ...insertPortionGuideline, id };
    
    await database.insert(schema.portionGuidelines).values(portionGuidelineWithId).execute();
    
    return portionGuidelineWithId as PortionGuideline;
  }
  
  async getAllPortionGuidelines(): Promise<PortionGuideline[]> {
    const database = await db;
    return await database.select().from(schema.portionGuidelines).orderBy(schema.portionGuidelines.foodType);
  }
  
  async getPortionGuidelineById(id: string): Promise<PortionGuideline | undefined> {
    const database = await db;
    const portionGuidelines = await database.select().from(schema.portionGuidelines).where(eq(schema.portionGuidelines.id, id));
    return portionGuidelines[0];
  }
  
  async getPortionGuidelineByFoodType(foodType: string): Promise<PortionGuideline | undefined> {
    const database = await db;
    const portionGuidelines = await database.select().from(schema.portionGuidelines).where(eq(schema.portionGuidelines.foodType, foodType));
    return portionGuidelines[0];
  }
  
  async updatePortionGuideline(id: string, updates: Partial<InsertPortionGuideline>): Promise<PortionGuideline | undefined> {
    const database = await db;
    await database.update(schema.portionGuidelines).set(updates).where(eq(schema.portionGuidelines.id, id)).execute();
    return await this.getPortionGuidelineById(id);
  }
  
  async deletePortionGuideline(id: string): Promise<boolean> {
    const database = await db;
    try {
      await database.delete(schema.portionGuidelines).where(eq(schema.portionGuidelines.id, id)).execute();
      return true;
    } catch (error) {
      console.error("Error deleting portion guideline:", error);
      return false;
    }
  }
}

// Export a singleton instance of the database storage
export const storage = new DatabaseStorage();

import { sql } from "drizzle-orm";