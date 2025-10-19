import { db } from '../db';
import { mealPlans, userProfiles, recipes, Recipe } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { getUserProfile } from '../profiles/userProfileService';
import { searchRecipes } from './recipeService';

// Function to generate UUID using crypto API
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Calculate BMI from height (cm) and weight (kg)
export function calculateBMI(heightCm: number, weightKg: number): number {
  const heightM = heightCm / 100;
  return weightKg / (heightM * heightM);
}

// Get BMI category
export function getBMICategory(bmi: number): string {
  if (bmi < 18.5) return 'underweight';
  if (bmi < 25) return 'normal';
  if (bmi < 30) return 'overweight';
  return 'obese';
}

// Determine dietary pattern based on medical conditions
export function getDietaryPattern(medicalConditions: string[]): string {
  if (medicalConditions.includes('hypertension')) {
    return 'dash'; // DASH diet for hypertension
  }
  if (medicalConditions.includes('diabetes')) {
    return 'diabetic'; // Low GI diet for diabetes
  }
  if (medicalConditions.includes('high cholesterol')) {
    return 'mediterranean'; // Mediterranean diet for cholesterol
  }
  return 'balanced'; // Default balanced diet
}

// Calculate max calories per meal type
export function calculateMealCalories(calorieTarget: number, mealType: string): number {
  const ratios: Record<string, number> = {
    breakfast: 0.25,
    lunch: 0.35,
    dinner: 0.30,
    snack: 0.10
  };
  
  return Math.round(calorieTarget * (ratios[mealType] || 0.25));
}

// Check for medication interactions
export function checkMedicationInteractions(medications: string[], recipeInteractions: string[]): string[] {
  const warnings: string[] = [];
  
  // Example interaction rules (in a real app, this would be a more comprehensive database)
  const interactionRules: Record<string, string[]> = {
    'warfarin': ['vitamin_k_rich_foods'],
    'atorvastatin': ['grapefruit']
  };
  
  for (const medication of medications) {
    if (interactionRules[medication]) {
      for (const interaction of interactionRules[medication]) {
        if (recipeInteractions.includes(interaction)) {
          warnings.push(`Potential interaction between ${medication} and ${interaction}`);
        }
      }
    }
  }
  
  return warnings;
}

// Generate a meal plan for one day
export async function generateDailyMealPlan(userId: string, date: string) {
  // Get user profile
  const profile = await getUserProfile(userId);
  if (!profile) {
    throw new Error('User profile not found');
  }
  
  // Parse JSON fields
  let allergies: string[] = [];
  let medicalConditions: string[] = [];
  let medications: string[] = [];
  
  try {
    allergies = profile.allergies ? JSON.parse(profile.allergies as string) : [];
  } catch (e) {
    allergies = [];
  }
  
  try {
    medicalConditions = profile.medicalConditions ? JSON.parse(profile.medicalConditions as string) : [];
  } catch (e) {
    medicalConditions = [];
  }
  
  try {
    medications = profile.medications ? JSON.parse(profile.medications as string) : [];
  } catch (e) {
    medications = [];
  }
  
  // Calculate BMI and determine dietary pattern
  if (!profile.heightCm || !profile.weightKg) {
    throw new Error('Height and weight are required for meal planning');
  }
  
  const bmi = calculateBMI(profile.heightCm, profile.weightKg);
  const bmiCategory = getBMICategory(bmi);
  const dietaryPattern = getDietaryPattern(medicalConditions);
  
  // Get calorie target
  const calorieTarget = profile.calorieTarget || 2000; // Default to 2000 if not set
  
  // Search for recipes based on user preferences
  const recipes = await searchRecipes({
    dietPreference: profile.dietPreference || undefined
  });
  
  // Filter out recipes with allergens
  const filteredRecipes = recipes.filter((recipe: Recipe) => {
    try {
      const recipeAllergens = JSON.parse(recipe.allergenFlags as string);
      return !allergies.some((allergy: string) => recipeAllergens.includes(allergy));
    } catch (e) {
      // If there's an error parsing allergens, include the recipe
      return true;
    }
  });
  
  // Generate meals for the day
  const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];
  const meals: any[] = [];
  const usedIngredients: string[] = [];
  
  for (const mealType of mealTypes) {
    const maxCalories = calculateMealCalories(calorieTarget, mealType);
    
    // Filter recipes by meal type and calorie limit
    const suitableRecipes = filteredRecipes.filter((recipe: Recipe) => {
      try {
        const nutrients = JSON.parse(recipe.nutrients as string);
        return nutrients.calories <= maxCalories;
      } catch (e) {
        // If there's an error parsing nutrients, exclude the recipe
        return false;
      }
    });
    
    // Select a recipe (in a real implementation, this would be more sophisticated)
    if (suitableRecipes.length > 0) {
      const selectedRecipe = suitableRecipes[0];
      let recipeInteractions: string[] = [];
      
      try {
        recipeInteractions = JSON.parse(selectedRecipe.medicationInteractions as string);
      } catch (e) {
        recipeInteractions = [];
      }
      
      const warnings = checkMedicationInteractions(medications, recipeInteractions);
      
      meals.push({
        meal_type: mealType,
        recipe_id: selectedRecipe.id,
        recipe_title: selectedRecipe.title,
        calories: JSON.parse(selectedRecipe.nutrients as string).calories,
        warnings: warnings
      });
    }
  }
  
  // Calculate total calories
  const totalCalories = meals.reduce((sum, meal) => sum + meal.calories, 0);
  
  return {
    user_id: userId,
    date: date,
    meals: meals,
    total_calories: totalCalories,
    bmi: bmi,
    bmi_category: bmiCategory,
    dietary_pattern: dietaryPattern,
    warnings: meals.flatMap(meal => meal.warnings)
  };
}

// Generate a weekly meal plan
export async function generateWeeklyMealPlan(userId: string, startDate: string) {
  const days: any[] = [];
  let totalCalories = 0;
  let allWarnings: string[] = [];
  
  // Generate plans for 7 days
  for (let i = 0; i < 7; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    const dateString = date.toISOString().split('T')[0];
    
    const dailyPlan = await generateDailyMealPlan(userId, dateString);
    days.push({
      day: i + 1,
      date: dateString,
      meals: dailyPlan.meals,
      total_calories: dailyPlan.total_calories
    });
    
    totalCalories += dailyPlan.total_calories;
    allWarnings = [...allWarnings, ...dailyPlan.warnings];
  }
  
  return {
    plan_id: generateUUID(),
    user_id: userId,
    start_date: startDate,
    days: days,
    total_calories: totalCalories,
    warnings: allWarnings
  };
}

// Save meal plan to database
export async function saveMealPlan(mealPlanData: any) {
  const dbInstance = await db;
  
  const newMealPlan = {
    id: mealPlanData.plan_id || generateUUID(),
    userId: mealPlanData.user_id,
    name: 'Weekly Meal Plan',
    description: 'Generated meal plan',
    calories: mealPlanData.total_calories,
    tags: JSON.stringify(['generated']),
    meals: JSON.stringify(mealPlanData.days),
    createdAt: new Date()
  };
  
  const result = await dbInstance.insert(mealPlans).values(newMealPlan);
  return result;
}

// Get meal plan by ID
export async function getMealPlanById(id: string) {
  const dbInstance = await db;
  
  const plan = await dbInstance.select().from(mealPlans).where(eq(mealPlans.id, id));
  return plan[0] || null;
}