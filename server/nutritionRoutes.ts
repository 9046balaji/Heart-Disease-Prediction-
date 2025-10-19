import express from 'express';
import { createUserProfile, getUserProfile, updateUserProfile } from './profiles/userProfileService';
import { createRecipe, getRecipeById, searchRecipes } from './nutrition/recipeService';
import { generateWeeklyMealPlan, saveMealPlan, getMealPlanById } from './nutrition/mealPlanningService';
import { foodLogService } from './nutrition/foodLogService';

const router = express.Router();

// User Profile Routes
router.post('/user/profile', async (req, res) => {
  try {
    const profile = await createUserProfile(req.body);
    res.status(201).json({ message: 'Profile created successfully', profile });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create profile', details: (error as Error).message });
  }
});

router.get('/user/profile/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const profile = await getUserProfile(userId);
    
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    
    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve profile', details: (error as Error).message });
  }
});

router.put('/user/profile/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const profile = await updateUserProfile(userId, req.body);
    res.json({ message: 'Profile updated successfully', profile });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile', details: (error as Error).message });
  }
});

// Recipe Routes
router.post('/recipes', async (req, res) => {
  try {
    const recipe = await createRecipe(req.body);
    res.status(201).json({ message: 'Recipe created successfully', recipe });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create recipe', details: (error as Error).message });
  }
});

router.get('/recipes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const recipe = await getRecipeById(id);
    
    if (!recipe) {
      return res.status(404).json({ error: 'Recipe not found' });
    }
    
    res.json(recipe);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve recipe', details: (error as Error).message });
  }
});

router.get('/recipes', async (req, res) => {
  try {
    const filters: any = {};
    
    if (req.query.tags) {
      filters.tags = Array.isArray(req.query.tags) ? req.query.tags : [req.query.tags];
    }
    
    if (req.query.diet) {
      filters.dietPreference = req.query.diet;
    }
    
    if (req.query.max_cal) {
      filters.maxCalories = parseInt(req.query.max_cal as string);
    }
    
    if (req.query.dietary_restrictions) {
      filters.dietaryRestrictions = Array.isArray(req.query.dietary_restrictions) 
        ? req.query.dietary_restrictions 
        : [req.query.dietary_restrictions];
    }
    
    const recipes = await searchRecipes(filters);
    res.json(recipes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to search recipes', details: (error as Error).message });
  }
});

// Meal Planning Routes
router.post('/mealplan/generate', async (req, res) => {
  try {
    const { userId, startDate } = req.body;
    
    if (!userId || !startDate) {
      return res.status(400).json({ error: 'userId and startDate are required' });
    }
    
    const mealPlan = await generateWeeklyMealPlan(userId, startDate);
    res.json(mealPlan);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate meal plan', details: (error as Error).message });
  }
});

router.post('/mealplan/save', async (req, res) => {
  try {
    const result = await saveMealPlan(req.body);
    res.status(201).json({ message: 'Meal plan saved successfully', result });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save meal plan', details: (error as Error).message });
  }
});

router.get('/mealplan/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const mealPlan = await getMealPlanById(id);
    
    if (!mealPlan) {
      return res.status(404).json({ error: 'Meal plan not found' });
    }
    
    res.json(mealPlan);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve meal plan', details: (error as Error).message });
  }
});

// Food Logging Routes
router.post('/food/log', async (req, res) => {
  try {
    const { userId, recipeId, mealType, foodName, calories, protein, carbs, fat, sodium, description } = req.body;
    
    // Validate required fields
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }
    
    if (!mealType) {
      return res.status(400).json({ error: 'mealType is required' });
    }
    
    // Validate mealType
    const validMealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];
    if (!validMealTypes.includes(mealType)) {
      return res.status(400).json({ error: 'mealType must be one of: breakfast, lunch, dinner, snack' });
    }
    
    // Either recipeId or foodName must be provided
    if (!recipeId && !foodName) {
      return res.status(400).json({ error: 'Either recipeId or foodName must be provided' });
    }
    
    const foodLogEntry = {
      userId,
      recipeId,
      mealType,
      foodName,
      calories,
      protein,
      carbs,
      fat,
      sodium,
      description
    };
    
    const result = await foodLogService.logMeal(foodLogEntry);
    res.status(201).json(result);
  } catch (error) {
    console.error('Error in /food/log endpoint:', error);
    res.status(500).json({ error: 'Failed to log meal', details: (error as Error).message });
  }
});

router.get('/food/logs/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }
    
    const result = await foodLogService.getFoodLogs(userId);
    res.json(result);
  } catch (error) {
    console.error('Error in /food/logs/:userId endpoint:', error);
    res.status(500).json({ error: 'Failed to retrieve food logs', details: (error as Error).message });
  }
});

router.get('/food/log/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ error: 'id is required' });
    }
    
    const result = await foodLogService.getFoodLog(id);
    res.json(result);
  } catch (error) {
    console.error('Error in /food/log/:id endpoint:', error);
    res.status(500).json({ error: 'Failed to retrieve food log', details: (error as Error).message });
  }
});

router.put('/food/log/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    if (!id) {
      return res.status(400).json({ error: 'id is required' });
    }
    
    const result = await foodLogService.updateFoodLog(id, updates);
    res.json(result);
  } catch (error) {
    console.error('Error in /food/log/:id endpoint:', error);
    res.status(500).json({ error: 'Failed to update food log', details: (error as Error).message });
  }
});

router.delete('/food/log/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ error: 'id is required' });
    }
    
    const result = await foodLogService.deleteFoodLog(id);
    res.json(result);
  } catch (error) {
    console.error('Error in /food/log/:id endpoint:', error);
    res.status(500).json({ error: 'Failed to delete food log', details: (error as Error).message });
  }
});

export default router;