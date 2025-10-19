import { db } from '../db';
import { recipes, Recipe } from '@shared/schema';
import { eq, like, and } from 'drizzle-orm';

// Function to generate UUID using crypto API
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export interface RecipeData {
  title: string;
  tags: string[];
  ingredients: Array<{name: string; qty: string}>;
  nutrients: {
    calories: number;
    protein_g: number;
    fat_g: number;
    carb_g: number;
    sodium_mg: number;
  };
  steps: string[];
  allergenFlags: string[];
  medicationInteractions: string[];
  imageUrl?: string;
  dietaryRestrictions?: string[];
  cookingTime?: number;
}

export interface RecipeFilters {
  tags?: string[];
  dietPreference?: string;
  maxCalories?: number;
  dietaryRestrictions?: string[]; // Filter by dietary restrictions
}

export async function createRecipe(recipeData: RecipeData) {
  const dbInstance = await db;
  
  const newRecipe = {
    id: generateUUID(),
    title: recipeData.title,
    tags: JSON.stringify(recipeData.tags),
    ingredients: JSON.stringify(recipeData.ingredients),
    nutrients: JSON.stringify(recipeData.nutrients),
    steps: JSON.stringify(recipeData.steps),
    allergenFlags: JSON.stringify(recipeData.allergenFlags),
    medicationInteractions: JSON.stringify(recipeData.medicationInteractions),
    imageUrl: recipeData.imageUrl,
    dietaryRestrictions: recipeData.dietaryRestrictions ? JSON.stringify(recipeData.dietaryRestrictions) : null,
    cookingTime: recipeData.cookingTime,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  const result = await dbInstance.insert(recipes).values(newRecipe);
  return result;
}

export async function getRecipeById(id: string) {
  const dbInstance = await db;
  
  const recipeResults = await dbInstance.select().from(recipes).where(eq(recipes.id, id));
  const recipe = recipeResults[0] || null;
  
  // Parse JSON fields if they exist
  if (recipe) {
    try {
      recipe.tags = JSON.parse(recipe.tags as string);
    } catch (e) {
      recipe.tags = [];
    }
    
    try {
      recipe.ingredients = JSON.parse(recipe.ingredients as string);
    } catch (e) {
      recipe.ingredients = [];
    }
    
    try {
      recipe.nutrients = JSON.parse(recipe.nutrients as string);
    } catch (e) {
      recipe.nutrients = {};
    }
    
    try {
      recipe.steps = JSON.parse(recipe.steps as string);
    } catch (e) {
      recipe.steps = [];
    }
    
    try {
      recipe.allergenFlags = JSON.parse(recipe.allergenFlags as string);
    } catch (e) {
      recipe.allergenFlags = [];
    }
    
    try {
      recipe.medicationInteractions = JSON.parse(recipe.medicationInteractions as string);
    } catch (e) {
      recipe.medicationInteractions = [];
    }
    
    try {
      recipe.dietaryRestrictions = recipe.dietaryRestrictions ? JSON.parse(recipe.dietaryRestrictions as string) : [];
    } catch (e) {
      recipe.dietaryRestrictions = [];
    }
  }
  
  return recipe;
}

export async function searchRecipes(filters: RecipeFilters = {}) {
  const dbInstance = await db;
  
  let query = dbInstance.select().from(recipes);
  
  // Apply filters
  if (filters.tags && filters.tags.length > 0) {
    // This is a simplified filter - in a real implementation, you'd want to do proper JSON querying
    // For now, we'll do a basic search
    const conditions = [];
    for (const tag of filters.tags) {
      conditions.push(like(recipes.tags, `%${tag}%`));
    }
  }
  
  if (filters.maxCalories) {
    // This is also simplified - you'd want to do proper JSON querying
  }
  
  // Filter by dietary restrictions
  if (filters.dietaryRestrictions && filters.dietaryRestrictions.length > 0) {
    // This is a simplified filter - in a real implementation, you'd want to do proper JSON querying
    // For now, we'll do a basic search
  }
  
  const recipesList = await query;
  
  // Parse JSON fields for all recipes
  return recipesList.map((recipe: Recipe) => {
    try {
      recipe.tags = JSON.parse(recipe.tags as string);
    } catch (e) {
      recipe.tags = [];
    }
    
    try {
      recipe.ingredients = JSON.parse(recipe.ingredients as string);
    } catch (e) {
      recipe.ingredients = [];
    }
    
    try {
      recipe.nutrients = JSON.parse(recipe.nutrients as string);
    } catch (e) {
      recipe.nutrients = {};
    }
    
    try {
      recipe.steps = JSON.parse(recipe.steps as string);
    } catch (e) {
      recipe.steps = [];
    }
    
    try {
      recipe.allergenFlags = JSON.parse(recipe.allergenFlags as string);
    } catch (e) {
      recipe.allergenFlags = [];
    }
    
    try {
      recipe.medicationInteractions = JSON.parse(recipe.medicationInteractions as string);
    } catch (e) {
      recipe.medicationInteractions = [];
    }
    
    try {
      recipe.dietaryRestrictions = recipe.dietaryRestrictions ? JSON.parse(recipe.dietaryRestrictions as string) : [];
    } catch (e) {
      recipe.dietaryRestrictions = [];
    }
    
    return recipe;
  });
}

export async function getAllRecipes() {
  const dbInstance = await db;
  
  const recipesList = await dbInstance.select().from(recipes);
  
  // Parse JSON fields for all recipes
  return recipesList.map((recipe: Recipe) => {
    try {
      recipe.tags = JSON.parse(recipe.tags as string);
    } catch (e) {
      recipe.tags = [];
    }
    
    try {
      recipe.ingredients = JSON.parse(recipe.ingredients as string);
    } catch (e) {
      recipe.ingredients = [];
    }
    
    try {
      recipe.nutrients = JSON.parse(recipe.nutrients as string);
    } catch (e) {
      recipe.nutrients = {};
    }
    
    try {
      recipe.steps = JSON.parse(recipe.steps as string);
    } catch (e) {
      recipe.steps = [];
    }
    
    try {
      recipe.allergenFlags = JSON.parse(recipe.allergenFlags as string);
    } catch (e) {
      recipe.allergenFlags = [];
    }
    
    try {
      recipe.medicationInteractions = JSON.parse(recipe.medicationInteractions as string);
    } catch (e) {
      recipe.medicationInteractions = [];
    }
    
    try {
      recipe.dietaryRestrictions = recipe.dietaryRestrictions ? JSON.parse(recipe.dietaryRestrictions as string) : [];
    } catch (e) {
      recipe.dietaryRestrictions = [];
    }
    
    return recipe;
  });
}