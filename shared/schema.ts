import { mysqlTable, text, varchar, int, datetime, json, boolean, mysqlEnum } from "drizzle-orm/mysql-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = mysqlTable("users", {
  id: varchar("id", { length: 36 }).primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  // MFA fields
  mfaMethod: varchar("mfa_method", { length: 20 }), // 'email', 'authenticator', 'sms'
  mfaSecret: text("mfa_secret"), // For authenticator app
  phoneNumber: text("phone_number"), // For SMS
  mfaCode: text("mfa_code"), // Temporary code for email/SMS
  mfaExpiresAt: datetime("mfa_expires_at"), // Expiration time for MFA code
  email: text("email"), // For email MFA
  // Biometric authentication fields
  biometricTemplate: text("biometric_template"), // Hashed biometric template
  biometricType: varchar("biometric_type", { length: 20 }), // 'fingerprint', 'face', 'voice'
  createdAt: datetime("created_at").notNull(),
  updatedAt: datetime("updated_at").notNull(),
});

export const userProfiles = mysqlTable("user_profiles", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: varchar("user_id", { length: 36 }).notNull(),
  dob: datetime("dob"),
  sex: mysqlEnum("sex", ["male", "female", "other"]),
  heightCm: int("height_cm"),
  weightKg: int("weight_kg"),
  dietPreference: mysqlEnum("diet_preference", ["vegetarian", "non-veg", "vegan", "pescatarian"]),
  allergies: json("allergies"), // JSON array of allergies
  medicalConditions: json("medical_conditions"), // JSON array of medical conditions
  medications: json("medications"), // JSON array of medications
  mobilityLimitations: mysqlEnum("mobility_limitations", ["none", "knee_pain", "balance_issues"]),
  calorieTarget: int("calorie_target"),
  // Add new fields for advanced profile management
  healthHistory: json("health_history"), // JSON array of health history entries
  familyMedicalHistory: json("family_medical_history"), // JSON array of family medical history entries
  adverseReactions: json("adverse_reactions"), // JSON array of adverse reaction entries
  // Add privacy controls
  privacySettings: json("privacy_settings"), // JSON object for privacy settings
  consentHistory: json("consent_history"), // JSON array of consent records
  dataSharingPreferences: json("data_sharing_preferences"), // JSON object for data sharing preferences
  createdAt: datetime("created_at").notNull(),
  updatedAt: datetime("updated_at").notNull(),
});

export const recipes = mysqlTable("recipes", {
  id: varchar("id", { length: 36 }).primaryKey(),
  title: text("title").notNull(),
  tags: json("tags").notNull(), // JSON array of tags
  ingredients: json("ingredients").notNull(), // JSON array of ingredients with quantities
  nutrients: json("nutrients").notNull(), // JSON object with nutritional information
  steps: json("steps").notNull(), // JSON array of preparation steps
  allergenFlags: json("allergen_flags").notNull(), // JSON array of allergen flags
  medicationInteractions: json("medication_interactions").notNull(), // JSON array of medication interactions
  imageUrl: text("image_url"), // URL to recipe image
  dietaryRestrictions: json("dietary_restrictions"), // JSON array of dietary restrictions (e.g., gluten-free, dairy-free)
  cookingTime: int("cooking_time"), // Total cooking time in minutes
  createdAt: datetime("created_at").notNull(),
  updatedAt: datetime("updated_at").notNull(),
});

export const clinicalEntries = mysqlTable("clinical_entries", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: varchar("user_id", { length: 36 }).notNull(),
  timestamp: datetime("timestamp").notNull(),
  age: int("age").notNull(),
  sex: int("sex").notNull(), // 0 = female, 1 = male
  cp: int("cp").notNull(), // chest pain type (0-3)
  trestbps: int("trestbps").notNull(), // resting blood pressure
  chol: int("chol").notNull(), // serum cholesterol
  fbs: int("fbs").notNull(), // fasting blood sugar > 120 mg/dl (0 = false, 1 = true)
  restecg: int("restecg").notNull(), // resting electrocardiographic results (0-2)
  thalach: int("thalach").notNull(), // maximum heart rate achieved
  exang: int("exang").notNull(), // exercise induced angina (0 = no, 1 = yes)
  oldpeak: int("oldpeak").notNull(), // ST depression induced by exercise relative to rest
  slope: int("slope").notNull(), // the slope of the peak exercise ST segment (0-2)
  ca: int("ca").notNull(), // number of major vessels (0-3) colored by fluoroscopy
  thal: int("thal").notNull(), // thalassemia (0 = normal, 1 = fixed defect, 2 = reversable defect)
  height: int("height"), // height in cm
  weight: int("weight"), // weight in kg
  smokingStatus: mysqlEnum("smoking_status", ["never", "former", "current"]),
});

export const predictions = mysqlTable("predictions", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: varchar("user_id", { length: 36 }).notNull(),
  clinicalEntryId: varchar("clinical_entry_id", { length: 36 }).notNull(),
  timestamp: datetime("timestamp").notNull(),
  score: int("score").notNull(), // Risk score between 0 and 100
  label: mysqlEnum("label", ["low", "medium", "high"]).notNull(),
  modelVersion: varchar("model_version", { length: 20 }).notNull(),
  shapTopFeatures: json("shap_top_features").notNull(), // JSON array of SHAP explanations
});

export const medications = mysqlTable("medications", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: varchar("user_id", { length: 36 }).notNull(),
  name: text("name").notNull(),
  dosage: text("dosage").notNull(),
  frequency: text("frequency").notNull(),
  time: text("time").notNull(), // Time of day to take medication (HH:MM format)
  startDate: datetime("start_date").notNull(),
  endDate: datetime("end_date"),
  taken: boolean("taken").notNull().default(false),
  takenHistory: json("taken_history").notNull(), // JSON array of taken history
});

export const mealPlans = mysqlTable("meal_plans", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: varchar("user_id", { length: 36 }).notNull(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  calories: int("calories").notNull(),
  tags: json("tags").notNull(), // JSON array of tags
  meals: json("meals").notNull(), // JSON array of meals
  startDate: datetime("start_date"),
  days: json("days"), // JSON array of daily meal plans
  metadata: json("metadata"), // JSON object for additional metadata
  createdAt: datetime("created_at").notNull(),
});

export const exercises = mysqlTable("exercises", {
  id: varchar("id", { length: 36 }).primaryKey(),
  title: text("title").notNull(),
  durationMin: int("duration_min"),
  intensity: mysqlEnum("intensity", ["low", "moderate", "high"]),
  instructions: json("instructions"), // JSON array of step-by-step instructions
  gifUrl: text("gif_url"),
  lottieUrl: text("lottie_url"),
  safetyConsiderations: json("safety_considerations"), // JSON array of safety considerations
  accessibilityOptions: json("accessibility_options"), // JSON array of accessibility options
  createdAt: datetime("created_at").notNull(),
  updatedAt: datetime("updated_at").notNull(),
});

export const exercisePlans = mysqlTable("exercise_plans", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: varchar("user_id", { length: 36 }).notNull(),
  level: mysqlEnum("level", ["beginner", "intermediate", "advanced"]).notNull(),
  duration: int("duration").notNull(), // in minutes
  durationWeeks: int("duration_weeks"), // in weeks
  weeklyGoal: text("weekly_goal").notNull(),
  days: json("days"), // JSON array of daily exercise plans
  exercises: json("exercises").notNull(), // JSON array of exercises
  safetyFlags: json("safety_flags"), // JSON array of safety flags
  metadata: json("metadata"), // JSON object for additional metadata
  createdAt: datetime("created_at").notNull(),
});

// Tele-consult bookings table
export const teleConsultBookings = mysqlTable("tele_consult_bookings", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: varchar("user_id", { length: 36 }).notNull(),
  doctorName: text("doctor_name").notNull(),
  doctorSpecialty: text("doctor_specialty").notNull(),
  appointmentDate: datetime("appointment_date").notNull(),
  appointmentTime: text("appointment_time").notNull(), // Time in HH:MM format
  status: mysqlEnum("status", ["scheduled", "completed", "cancelled"]).notNull().default("scheduled"),
  notes: text("notes"),
  createdAt: datetime("created_at").notNull(),
  updatedAt: datetime("updated_at").notNull(),
});

// Peer support forums tables
export const forumCategories = mysqlTable("forum_categories", {
  id: varchar("id", { length: 36 }).primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  icon: text("icon"),
  postCount: int("post_count").notNull().default(0),
  createdAt: datetime("created_at").notNull(),
});

export const forumPosts = mysqlTable("forum_posts", {
  id: varchar("id", { length: 36 }).primaryKey(),
  categoryId: varchar("category_id", { length: 36 }).notNull(),
  userId: varchar("user_id", { length: 36 }).notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  replyCount: int("reply_count").notNull().default(0),
  viewCount: int("view_count").notNull().default(0),
  isPinned: boolean("is_pinned").notNull().default(false),
  isLocked: boolean("is_locked").notNull().default(false),
  createdAt: datetime("created_at").notNull(),
  updatedAt: datetime("updated_at").notNull(),
});

export const forumReplies = mysqlTable("forum_replies", {
  id: varchar("id", { length: 36 }).primaryKey(),
  postId: varchar("post_id", { length: 36 }).notNull(),
  userId: varchar("user_id", { length: 36 }).notNull(),
  content: text("content").notNull(),
  isAcceptedAnswer: boolean("is_accepted_answer").notNull().default(false),
  createdAt: datetime("created_at").notNull(),
  updatedAt: datetime("updated_at").notNull(),
});

// Goal tracking tables
export const healthGoals = mysqlTable("health_goals", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: varchar("user_id", { length: 36 }).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  category: mysqlEnum("category", ["diet", "exercise", "medication", "sleep", "stress", "other"]).notNull(),
  targetValue: int("target_value").notNull(),
  currentValue: int("current_value").notNull().default(0),
  unit: text("unit").notNull(),
  deadline: datetime("deadline"),
  isCompleted: boolean("is_completed").notNull().default(false),
  completionDate: datetime("completion_date"),
  createdAt: datetime("created_at").notNull(),
  updatedAt: datetime("updated_at").notNull(),
});

// Goal achievements table
export const goalAchievements = mysqlTable("goal_achievements", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: varchar("user_id", { length: 36 }).notNull(),
  goalId: varchar("goal_id", { length: 36 }).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  badgeIcon: text("badge_icon"),
  awardedDate: datetime("awarded_date").notNull(),
});

// Biometric templates table
export const biometricTemplates = mysqlTable("biometric_templates", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: varchar("user_id", { length: 36 }).notNull(),
  template: text("template").notNull(), // Hashed biometric template
  type: mysqlEnum("type", ["fingerprint", "face", "voice"]).notNull(),
  createdAt: datetime("created_at").notNull(),
  updatedAt: datetime("updated_at").notNull(),
});

// Weekly challenges tables
export const weeklyChallenges = mysqlTable("weekly_challenges", {
  id: varchar("id", { length: 36 }).primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: mysqlEnum("category", ["diet", "exercise", "medication", "sleep", "stress", "other"]).notNull(),
  difficulty: mysqlEnum("difficulty", ["beginner", "intermediate", "advanced"]).notNull(),
  points: int("points").notNull(),
  durationDays: int("duration_days").notNull(), // How many days the challenge lasts
  startDate: datetime("start_date").notNull(),
  endDate: datetime("end_date").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: datetime("created_at").notNull(),
});

export const userChallengeParticipations = mysqlTable("user_challenge_participations", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: varchar("user_id", { length: 36 }).notNull(),
  challengeId: varchar("challenge_id", { length: 36 }).notNull(),
  startDate: datetime("start_date").notNull(),
  completionDate: datetime("completion_date"),
  isCompleted: boolean("is_completed").notNull().default(false),
  progress: int("progress").notNull().default(0), // Percentage of completion
  earnedPoints: int("earned_points").notNull().default(0),
  createdAt: datetime("created_at").notNull(),
});

// Lab results table for tracking BP, cholesterol, HbA1c
export const labResults = mysqlTable("lab_results", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: varchar("user_id", { length: 36 }).notNull(),
  type: mysqlEnum("type", ["bloodPressure", "cholesterol", "hba1c"]).notNull(),
  // Blood pressure fields
  systolic: int("systolic"),
  diastolic: int("diastolic"),
  // Cholesterol fields
  totalCholesterol: int("total_cholesterol"),
  ldl: int("ldl"),
  hdl: int("hdl"),
  triglycerides: int("triglycerides"),
  // HbA1c field
  hba1c: int("hba1c"),
  date: datetime("date").notNull(),
  notes: text("notes"),
  createdAt: datetime("created_at").notNull(),
});

// Symptoms table for tracking user-reported symptoms
export const symptoms = mysqlTable("symptoms", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: varchar("user_id", { length: 36 }).notNull(),
  type: text("type").notNull(), // Type of symptom (e.g., chest_pain, shortness_of_breath)
  severity: int("severity"), // Severity on a scale (e.g., 1-10)
  duration: text("duration"), // How long the symptom lasted
  notes: text("notes"), // Additional notes about the symptom
  timestamp: datetime("timestamp").notNull(),
  createdAt: datetime("created_at").notNull(),
});

// Food log table for tracking consumed meals
export const foodLogs = mysqlTable("food_logs", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: varchar("user_id", { length: 36 }).notNull(),
  recipeId: varchar("recipe_id", { length: 36 }),
  mealType: mysqlEnum("meal_type", ["breakfast", "lunch", "dinner", "snack"]).notNull(),
  foodName: text("food_name"),
  calories: int("calories"),
  protein: int("protein"), // in grams
  carbs: int("carbs"), // in grams
  fat: int("fat"), // in grams
  sodium: int("sodium"), // in mg
  description: text("description"), // for free-text entries
  portionSize: mysqlEnum("portion_size", ["small", "medium", "large"]), // for portion guidance
  loggedAt: datetime("logged_at").notNull(),
  createdAt: datetime("created_at").notNull(),
});

// Portion guidance table for storing portion recommendations
export const portionGuidelines = mysqlTable("portion_guidelines", {
  id: varchar("id", { length: 36 }).primaryKey(),
  foodCategory: varchar("food_category", { length: 50 }).notNull(),
  foodType: varchar("food_type", { length: 100 }).notNull(),
  smallPortion: text("small_portion").notNull(), // Description of small portion
  mediumPortion: text("medium_portion").notNull(), // Description of medium portion
  largePortion: text("large_portion").notNull(), // Description of large portion
  caloriesPerUnit: int("calories_per_unit"), // Calories per standard unit
  createdAt: datetime("created_at").notNull(),
});

// Workout log table for tracking completed exercises
export const workoutLogs = mysqlTable("workout_logs", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: varchar("user_id", { length: 36 }).notNull(),
  exerciseId: varchar("exercise_id", { length: 36 }),
  exercisePlanId: varchar("exercise_plan_id", { length: 36 }),
  durationMin: int("duration_min"),
  caloriesBurned: int("calories_burned"),
  intensity: mysqlEnum("intensity", ["low", "moderate", "high"]),
  notes: text("notes"),
  completedAt: datetime("completed_at").notNull(),
  createdAt: datetime("created_at").notNull(),
});

// Safety check table for pre-exercise verification
export const safetyChecks = mysqlTable("safety_checks", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: varchar("user_id", { length: 36 }).notNull(),
  exercisePlanId: varchar("exercise_plan_id", { length: 36 }),
  exerciseId: varchar("exercise_id", { length: 36 }),
  // Safety questions and responses
  feelingWell: boolean("feeling_well").notNull(), // Are you feeling well today?
  chestPain: boolean("chest_pain").notNull(), // Do you have chest pain?
  dizziness: boolean("dizziness").notNull(), // Do you feel dizzy or lightheaded?
  jointPain: boolean("joint_pain").notNull(), // Do you have joint or muscle pain?
  medicationTaken: boolean("medication_taken").notNull(), // Have you taken your medication as prescribed?
  notes: text("notes"), // Additional notes or concerns
  // Risk assessment
  riskLevel: mysqlEnum("risk_level", ["low", "moderate", "high"]), // Calculated risk level
  recommendations: json("recommendations"), // JSON array of safety recommendations
  approved: boolean("approved").notNull().default(false), // Whether the safety check was approved
  approvedBy: varchar("approved_by", { length: 36 }), // Clinician ID if approved by clinician
  approvedAt: datetime("approved_at"), // When it was approved
  completedAt: datetime("completed_at").notNull(), // When the safety check was completed
  createdAt: datetime("created_at").notNull(),
});

// Privacy consent records table
export const privacyConsents = mysqlTable("privacy_consents", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: varchar("user_id", { length: 36 }).notNull(),
  consentType: varchar("consent_type", { length: 50 }).notNull(), // e.g., 'research', 'analytics', 'marketing'
  granted: boolean("granted").notNull(),
  timestamp: datetime("timestamp").notNull(),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
});

// Data export requests table
export const dataExportRequests = mysqlTable("data_export_requests", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: varchar("user_id", { length: 36 }).notNull(),
  requestId: varchar("request_id", { length: 36 }).notNull(),
  status: mysqlEnum("status", ["pending", "processing", "completed", "failed"]).notNull().default("pending"),
  fileType: mysqlEnum("file_type", ["json", "csv", "pdf"]).notNull(),
  requestedAt: datetime("requested_at").notNull(),
  completedAt: datetime("completed_at"),
  filePath: text("file_path"),
});

// Data deletion requests table
export const dataDeletionRequests = mysqlTable("data_deletion_requests", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: varchar("user_id", { length: 36 }).notNull(),
  requestId: varchar("request_id", { length: 36 }).notNull(),
  status: mysqlEnum("status", ["pending", "processing", "completed", "failed"]).notNull().default("pending"),
  requestedAt: datetime("requested_at").notNull(),
  completedAt: datetime("completed_at"),
  reason: text("reason"),
});

// Create insert schemas that exclude the id field since it's auto-generated
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertClinicalEntrySchema = createInsertSchema(clinicalEntries).omit({
  id: true,
});
export const insertPredictionSchema = createInsertSchema(predictions).omit({
  id: true,
});
export const insertMedicationSchema = createInsertSchema(medications).omit({
  id: true,
});
export const insertMealPlanSchema = createInsertSchema(mealPlans).omit({
  id: true,
});
export const insertExerciseSchema = createInsertSchema(exercises).omit({
  id: true,
});

export const insertExercisePlanSchema = createInsertSchema(exercisePlans).omit({
  id: true,
});
export const insertTeleConsultBookingSchema = createInsertSchema(teleConsultBookings).omit({
  id: true,
});

export const insertForumCategorySchema = createInsertSchema(forumCategories).omit({
  id: true,
});

export const insertForumPostSchema = createInsertSchema(forumPosts).omit({
  id: true,
});

export const insertForumReplySchema = createInsertSchema(forumReplies).omit({
  id: true,
});

export const insertHealthGoalSchema = createInsertSchema(healthGoals).omit({
  id: true,
});

export const insertGoalAchievementSchema = createInsertSchema(goalAchievements).omit({
  id: true,
});

export const insertWeeklyChallengeSchema = createInsertSchema(weeklyChallenges).omit({
  id: true,
});

export const insertUserChallengeParticipationSchema = createInsertSchema(userChallengeParticipations).omit({
  id: true,
});

export const insertLabResultSchema = createInsertSchema(labResults).omit({
  id: true,
});

export const insertFoodLogSchema = createInsertSchema(foodLogs).omit({
  id: true,
});

export const insertWorkoutLogSchema = createInsertSchema(workoutLogs).omit({
  id: true,
});

export const insertSafetyCheckSchema = createInsertSchema(safetyChecks).omit({
  id: true,
});

export const insertUserProfileSchema = createInsertSchema(userProfiles).omit({
  id: true,
});

export const insertRecipeSchema = createInsertSchema(recipes).omit({
  id: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertClinicalEntry = z.infer<typeof insertClinicalEntrySchema>;
export type InsertPrediction = z.infer<typeof insertPredictionSchema>;
export type InsertMedication = z.infer<typeof insertMedicationSchema>;
export type InsertMealPlan = z.infer<typeof insertMealPlanSchema>;
export type InsertExercise = z.infer<typeof insertExerciseSchema>;
export type InsertExercisePlan = z.infer<typeof insertExercisePlanSchema>;
export type InsertTeleConsultBooking = z.infer<typeof insertTeleConsultBookingSchema>;

export type InsertForumCategory = z.infer<typeof insertForumCategorySchema>;
export type InsertForumPost = z.infer<typeof insertForumPostSchema>;
export type InsertForumReply = z.infer<typeof insertForumReplySchema>;

export type InsertHealthGoal = z.infer<typeof insertHealthGoalSchema>;
export type InsertGoalAchievement = z.infer<typeof insertGoalAchievementSchema>;

export type InsertWeeklyChallenge = z.infer<typeof insertWeeklyChallengeSchema>;
export type InsertUserChallengeParticipation = z.infer<typeof insertUserChallengeParticipationSchema>;
export type InsertLabResult = z.infer<typeof insertLabResultSchema>;
export type InsertFoodLog = z.infer<typeof insertFoodLogSchema>;
export type InsertWorkoutLog = z.infer<typeof insertWorkoutLogSchema>;
export type InsertSafetyCheck = z.infer<typeof insertSafetyCheckSchema>;

export type InsertUserProfile = z.infer<typeof insertUserProfileSchema>;
export type InsertRecipe = z.infer<typeof insertRecipeSchema>;

export type User = typeof users.$inferSelect;
export type ClinicalEntry = typeof clinicalEntries.$inferSelect;
export type Prediction = typeof predictions.$inferSelect;
export type Medication = typeof medications.$inferSelect;
export type MealPlan = typeof mealPlans.$inferSelect;
export type Exercise = typeof exercises.$inferSelect;
export type ExercisePlan = typeof exercisePlans.$inferSelect;
export type TeleConsultBooking = typeof teleConsultBookings.$inferSelect;

export type ForumCategory = typeof forumCategories.$inferSelect;
export type ForumPost = typeof forumPosts.$inferSelect;
export type ForumReply = typeof forumReplies.$inferSelect;

export type HealthGoal = typeof healthGoals.$inferSelect;
export type GoalAchievement = typeof goalAchievements.$inferSelect;

export type WeeklyChallenge = typeof weeklyChallenges.$inferSelect;
export type UserChallengeParticipation = typeof userChallengeParticipations.$inferSelect;
export type LabResult = typeof labResults.$inferSelect;
export type FoodLog = typeof foodLogs.$inferSelect;
export type WorkoutLog = typeof workoutLogs.$inferSelect;
export type SafetyCheck = typeof safetyChecks.$inferSelect;
export type Symptom = typeof symptoms.$inferSelect;

export type UserProfile = typeof userProfiles.$inferSelect;
export type Recipe = typeof recipes.$inferSelect;

export type PortionGuideline = typeof portionGuidelines.$inferSelect;
export type InsertPortionGuideline = typeof portionGuidelines.$inferInsert;
export type InsertSymptom = typeof symptoms.$inferInsert;
