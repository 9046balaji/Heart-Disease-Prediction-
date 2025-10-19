import { storage } from "../storage";
import { ClinicalEntry, Prediction } from "@shared/schema";

// Define meal plan types
export interface Meal {
  name: string;
  description: string;
  calories: number;
  ingredients: string[];
  preparationTime: number; // in minutes
  dietaryTags: string[]; // e.g., "low-sodium", "heart-healthy", "vegetarian"
}

export interface DailyMealPlan {
  day: number;
  meals: {
    breakfast: Meal;
    lunch: Meal;
    dinner: Meal;
    snacks: Meal[];
  };
  totalCalories: number;
  dietaryNotes: string[];
}

export interface PersonalizedMealPlan {
  id: string;
  userId: string;
  name: string;
  description: string;
  duration: number; // in days
  dailyPlans: DailyMealPlan[];
  dietaryPreferences: string[]; // e.g., "vegetarian", "low-carb"
  healthConditions: string[]; // e.g., "hypertension", "diabetes"
  createdAt: Date;
}

// Meal plan generator service
export class MealPlanService {
  // Generate a personalized 7-day meal plan based on user data
  public async generatePersonalizedMealPlan(
    userId: string,
    clinicalEntry: ClinicalEntry,
    prediction: Prediction,
    dietaryPreferences: string[] = [],
    healthConditions: string[] = []
  ): Promise<PersonalizedMealPlan> {
    // Determine dietary needs based on health conditions
    const dietaryTags = this.determineDietaryTags(healthConditions, prediction);
    
    // Generate 7-day meal plan
    const dailyPlans: DailyMealPlan[] = [];
    
    for (let day = 1; day <= 7; day++) {
      const meals = this.generateDailyMeals(dietaryTags, dietaryPreferences, day);
      const totalCalories = meals.breakfast.calories + meals.lunch.calories + meals.dinner.calories + 
                           meals.snacks.reduce((sum, snack) => sum + snack.calories, 0);
      
      dailyPlans.push({
        day,
        meals,
        totalCalories,
        dietaryNotes: this.generateDietaryNotes(dietaryTags, day)
      });
    }
    
    // Create personalized meal plan
    const mealPlan: PersonalizedMealPlan = {
      id: this.generateId(),
      userId,
      name: this.generateMealPlanName(prediction.label, healthConditions),
      description: this.generateMealPlanDescription(prediction.label, healthConditions),
      duration: 7,
      dailyPlans,
      dietaryPreferences,
      healthConditions,
      createdAt: new Date()
    };
    
    // Save to database
    await storage.createMealPlan({
      userId,
      name: mealPlan.name,
      description: mealPlan.description,
      calories: Math.round(mealPlan.dailyPlans.reduce((sum, day) => sum + day.totalCalories, 0) / 7),
      tags: dietaryTags,
      meals: mealPlan.dailyPlans.map(day => ({
        day: day.day,
        meals: {
          breakfast: {
            name: day.meals.breakfast.name,
            description: day.meals.breakfast.description,
            calories: day.meals.breakfast.calories,
            ingredients: day.meals.breakfast.ingredients,
            preparationTime: day.meals.breakfast.preparationTime,
            dietaryTags: day.meals.breakfast.dietaryTags
          },
          lunch: {
            name: day.meals.lunch.name,
            description: day.meals.lunch.description,
            calories: day.meals.lunch.calories,
            ingredients: day.meals.lunch.ingredients,
            preparationTime: day.meals.lunch.preparationTime,
            dietaryTags: day.meals.lunch.dietaryTags
          },
          dinner: {
            name: day.meals.dinner.name,
            description: day.meals.dinner.description,
            calories: day.meals.dinner.calories,
            ingredients: day.meals.dinner.ingredients,
            preparationTime: day.meals.dinner.preparationTime,
            dietaryTags: day.meals.dinner.dietaryTags
          },
          snacks: day.meals.snacks.map(snack => ({
            name: snack.name,
            description: snack.description,
            calories: snack.calories,
            ingredients: snack.ingredients,
            preparationTime: snack.preparationTime,
            dietaryTags: snack.dietaryTags
          }))
        },
        totalCalories: day.totalCalories,
        dietaryNotes: day.dietaryNotes
      })),
      createdAt: mealPlan.createdAt
    });
    
    return mealPlan;
  }
  
  // Determine dietary tags based on health conditions and risk level
  private determineDietaryTags(healthConditions: string[], prediction: Prediction): string[] {
    const tags: string[] = ["heart-healthy"];
    
    // Add tags based on health conditions
    if (healthConditions.includes("hypertension") || prediction.label === "high") {
      tags.push("low-sodium");
    }
    
    if (healthConditions.includes("diabetes")) {
      tags.push("low-glycemic");
    }
    
    if (healthConditions.includes("high-cholesterol")) {
      tags.push("low-cholesterol");
    }
    
    return tags;
  }
  
  // Generate daily meals based on dietary requirements
  private generateDailyMeals(dietaryTags: string[], dietaryPreferences: string[], day: number): DailyMealPlan['meals'] {
    // This is a simplified implementation - in a real app, this would be more sophisticated
    // and possibly use a database of recipes
    
    const isLowSodium = dietaryTags.includes("low-sodium");
    const isLowGlycemic = dietaryTags.includes("low-glycemic");
    const isLowCholesterol = dietaryTags.includes("low-cholesterol");
    const isVegetarian = dietaryPreferences.includes("vegetarian");
    
    // Generate breakfast
    const breakfast: Meal = this.generateBreakfast(isLowSodium, isVegetarian, day);
    
    // Generate lunch
    const lunch: Meal = this.generateLunch(isLowSodium, isLowGlycemic, isVegetarian, day);
    
    // Generate dinner
    const dinner: Meal = this.generateDinner(isLowSodium, isLowCholesterol, isVegetarian, day);
    
    // Generate snacks
    const snacks: Meal[] = this.generateSnacks(isLowSodium, isVegetarian, day);
    
    return { breakfast, lunch, dinner, snacks };
  }
  
  // Generate breakfast options
  private generateBreakfast(isLowSodium: boolean, isVegetarian: boolean, day: number): Meal {
    const breakfastOptions: Meal[] = [
      {
        name: "Oatmeal with Berries",
        description: "Steel-cut oats topped with fresh berries and a drizzle of honey",
        calories: 320,
        ingredients: ["steel-cut oats", "blueberries", "strawberries", "honey", "almond milk"],
        preparationTime: 15,
        dietaryTags: ["heart-healthy", "high-fiber"]
      },
      {
        name: "Greek Yogurt Parfait",
        description: "Low-fat Greek yogurt layered with granola and fresh fruit",
        calories: 280,
        ingredients: ["Greek yogurt", "granola", "banana", "berries"],
        preparationTime: 5,
        dietaryTags: ["high-protein", "calcium-rich"]
      },
      {
        name: "Avocado Toast",
        description: "Whole grain toast topped with mashed avocado and tomato",
        calories: 350,
        ingredients: ["whole grain bread", "avocado", "tomato", "lemon juice"],
        preparationTime: 10,
        dietaryTags: ["heart-healthy", "healthy-fats"]
      }
    ];
    
    // Apply dietary restrictions
    if (isLowSodium) {
      breakfastOptions.forEach(meal => {
        meal.dietaryTags.push("low-sodium");
      });
    }
    
    // Return appropriate option based on day
    return breakfastOptions[(day - 1) % breakfastOptions.length];
  }
  
  // Generate lunch options
  private generateLunch(isLowSodium: boolean, isLowGlycemic: boolean, isVegetarian: boolean, day: number): Meal {
    const lunchOptions: Meal[] = [
      {
        name: "Quinoa Salad",
        description: "Quinoa with mixed vegetables, chickpeas, and lemon-tahini dressing",
        calories: 420,
        ingredients: ["quinoa", "cucumber", "cherry tomatoes", "chickpeas", "tahini", "lemon"],
        preparationTime: 20,
        dietaryTags: ["heart-healthy", "high-fiber", "plant-based"]
      },
      {
        name: "Grilled Salmon Bowl",
        description: "Grilled salmon with brown rice and steamed vegetables",
        calories: 480,
        ingredients: ["salmon", "brown rice", "broccoli", "carrots", "olive oil"],
        preparationTime: 25,
        dietaryTags: ["omega-3", "high-protein"]
      },
      {
        name: "Lentil Soup",
        description: "Hearty lentil soup with vegetables and herbs",
        calories: 380,
        ingredients: ["lentils", "carrots", "celery", "onion", "tomatoes", "vegetable broth"],
        preparationTime: 30,
        dietaryTags: ["heart-healthy", "high-fiber", "plant-based"]
      }
    ];
    
    // Apply dietary restrictions
    if (isLowSodium) {
      lunchOptions.forEach(meal => {
        meal.dietaryTags.push("low-sodium");
        // Modify ingredients to be lower sodium
        meal.ingredients = meal.ingredients.map(ingredient => 
          ingredient.includes("broth") ? "low-sodium vegetable broth" : ingredient
        );
      });
    }
    
    if (isLowGlycemic) {
      lunchOptions.forEach(meal => {
        meal.dietaryTags.push("low-glycemic");
      });
    }
    
    // Vegetarian substitution
    if (isVegetarian) {
      lunchOptions[1] = {
        name: "Tofu Stir Fry",
        description: "Tofu with mixed vegetables and brown rice",
        calories: 450,
        ingredients: ["firm tofu", "brown rice", "broccoli", "bell peppers", "soy sauce", "ginger"],
        preparationTime: 20,
        dietaryTags: ["plant-based", "high-protein"]
      };
      
      if (isLowSodium) {
        lunchOptions[1].dietaryTags.push("low-sodium");
        lunchOptions[1].ingredients = lunchOptions[1].ingredients.map(ingredient => 
          ingredient.includes("soy") ? "low-sodium soy sauce" : ingredient
        );
      }
    }
    
    // Return appropriate option based on day
    return lunchOptions[(day - 1) % lunchOptions.length];
  }
  
  // Generate dinner options
  private generateDinner(isLowSodium: boolean, isLowCholesterol: boolean, isVegetarian: boolean, day: number): Meal {
    const dinnerOptions: Meal[] = [
      {
        name: "Baked Chicken with Vegetables",
        description: "Herb-roasted chicken breast with roasted vegetables",
        calories: 420,
        ingredients: ["chicken breast", "sweet potatoes", "broccoli", "olive oil", "herbs"],
        preparationTime: 35,
        dietaryTags: ["high-protein", "low-fat"]
      },
      {
        name: "Mediterranean Stuffed Peppers",
        description: "Bell peppers stuffed with quinoa, vegetables, and feta cheese",
        calories: 380,
        ingredients: ["bell peppers", "quinoa", "zucchini", "tomatoes", "feta cheese", "olives"],
        preparationTime: 40,
        dietaryTags: ["heart-healthy", "mediterranean"]
      },
      {
        name: "Fish Tacos",
        description: "Grilled fish in whole wheat tortillas with cabbage slaw",
        calories: 450,
        ingredients: ["white fish", "whole wheat tortillas", "cabbage", "lime", "cilantro"],
        preparationTime: 25,
        dietaryTags: ["omega-3", "high-protein"]
      }
    ];
    
    // Apply dietary restrictions
    if (isLowSodium) {
      dinnerOptions.forEach(meal => {
        meal.dietaryTags.push("low-sodium");
      });
    }
    
    if (isLowCholesterol) {
      dinnerOptions.forEach(meal => {
        meal.dietaryTags.push("low-cholesterol");
      });
    }
    
    // Vegetarian substitution
    if (isVegetarian) {
      dinnerOptions[0] = {
        name: "Stuffed Portobello Mushrooms",
        description: "Portobello mushrooms stuffed with quinoa and vegetables",
        calories: 350,
        ingredients: ["portobello mushrooms", "quinoa", "spinach", "tomatoes", "onion"],
        preparationTime: 30,
        dietaryTags: ["plant-based", "low-fat"]
      };
      
      dinnerOptions[2] = {
        name: "Black Bean Tacos",
        description: "Black bean tacos with cabbage slaw in whole wheat tortillas",
        calories: 420,
        ingredients: ["black beans", "whole wheat tortillas", "cabbage", "lime", "cilantro"],
        preparationTime: 20,
        dietaryTags: ["plant-based", "high-fiber"]
      };
    }
    
    // Return appropriate option based on day
    return dinnerOptions[(day - 1) % dinnerOptions.length];
  }
  
  // Generate snack options
  private generateSnacks(isLowSodium: boolean, isVegetarian: boolean, day: number): Meal[] {
    const snackOptions: Meal[] = [
      {
        name: "Mixed Nuts",
        description: "Small portion of unsalted mixed nuts",
        calories: 180,
        ingredients: ["almonds", "walnuts", "pecans"],
        preparationTime: 2,
        dietaryTags: ["healthy-fats", "high-protein"]
      },
      {
        name: "Apple Slices with Almond Butter",
        description: "Fresh apple slices with a tablespoon of almond butter",
        calories: 200,
        ingredients: ["apple", "almond butter"],
        preparationTime: 5,
        dietaryTags: ["heart-healthy", "high-fiber"]
      },
      {
        name: "Hummus with Vegetables",
        description: "Hummus with carrot and cucumber sticks",
        calories: 150,
        ingredients: ["hummus", "carrots", "cucumber"],
        preparationTime: 5,
        dietaryTags: ["plant-based", "high-fiber"]
      }
    ];
    
    // Apply dietary restrictions
    if (isLowSodium) {
      snackOptions.forEach(meal => {
        meal.dietaryTags.push("low-sodium");
        // Ensure nuts are unsalted
        if (meal.name === "Mixed Nuts") {
          meal.description = "Small portion of unsalted mixed nuts";
          meal.ingredients = ["unsalted almonds", "unsalted walnuts", "unsalted pecans"];
        }
      });
    }
    
    // Return 1-2 snacks based on day
    const numSnacks = (day % 2) + 1;
    const selectedSnacks: Meal[] = [];
    
    for (let i = 0; i < numSnacks; i++) {
      selectedSnacks.push(snackOptions[(day + i - 1) % snackOptions.length]);
    }
    
    return selectedSnacks;
  }
  
  // Generate dietary notes for the day
  private generateDietaryNotes(dietaryTags: string[], day: number): string[] {
    const notes: string[] = [];
    
    if (dietaryTags.includes("low-sodium")) {
      notes.push("Limit sodium intake to less than 2,300mg daily (about 1 teaspoon of salt)");
    }
    
    if (dietaryTags.includes("low-glycemic")) {
      notes.push("Choose complex carbohydrates over simple sugars");
    }
    
    if (dietaryTags.includes("low-cholesterol")) {
      notes.push("Limit saturated fats and choose lean protein sources");
    }
    
    // Add general heart-healthy tips
    const generalTips = [
      "Drink plenty of water throughout the day",
      "Include a variety of colorful fruits and vegetables",
      "Choose whole grains over refined grains",
      "Use herbs and spices instead of salt for flavoring",
      "Limit processed and packaged foods"
    ];
    
    notes.push(generalTips[(day - 1) % generalTips.length]);
    
    return notes;
  }
  
  // Generate meal plan name based on risk level and conditions
  private generateMealPlanName(riskLevel: string, healthConditions: string[]): string {
    const conditionNames = healthConditions.length > 0 
      ? healthConditions.join(" & ") 
      : "General Heart Health";
      
    const riskLabels: Record<string, string> = {
      high: "High-Risk",
      medium: "Moderate-Risk",
      low: "Heart-Healthy"
    };
    
    return `${riskLabels[riskLevel] || "Heart-Healthy"} ${conditionNames} Meal Plan`;
  }
  
  // Generate meal plan description
  private generateMealPlanDescription(riskLevel: string, healthConditions: string[]): string {
    const conditionDescription = healthConditions.length > 0 
      ? `for managing ${healthConditions.join(" and ")}`
      : "to support cardiovascular health";
      
    const riskDescriptions: Record<string, string> = {
      high: "This intensive meal plan is designed to help reduce high cardiovascular risk factors",
      medium: "This balanced meal plan supports moderate cardiovascular risk management",
      low: "This heart-healthy meal plan helps maintain good cardiovascular health"
    };
    
    return `${riskDescriptions[riskLevel] || "This heart-healthy meal plan"} ${conditionDescription}. It focuses on nutrient-dense foods that support heart health while being delicious and satisfying.`;
  }
  
  // Generate a unique ID
  private generateId(): string {
    return `mp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export a singleton instance of the meal plan service
export const mealPlanService = new MealPlanService();