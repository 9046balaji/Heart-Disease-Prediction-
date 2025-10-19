import express from 'express';
import { getMealPlanById } from './mealPlanningService';
import { db } from './db';
import { mealPlans } from '@shared/schema';
import { eq } from 'drizzle-orm';

const router = express.Router();

// Get grocery list by meal plan ID
router.get('/grocery/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get the meal plan
    const mealPlan = await getMealPlanById(id);
    
    if (!mealPlan) {
      return res.status(404).json({ error: 'Meal plan not found' });
    }
    
    // Parse the meals data
    let days;
    try {
      days = JSON.parse(mealPlan.meals as string);
    } catch (e) {
      return res.status(500).json({ error: 'Failed to generate grocery list', details: 'Invalid meal plan data' });
    }
    
    // Aggregate ingredients from all meals
    const ingredientMap: Record<string, { name: string; quantity: string; section: string }> = {};
    
    for (const day of days) {
      if (day.meals) {
        // Handle different meal plan structures
        const meals = Array.isArray(day.meals) ? day.meals : 
                     day.meals.breakfast ? [day.meals.breakfast, day.meals.lunch, day.meals.dinner, ...(day.meals.snacks || [])] :
                     [];
        
        for (const meal of meals) {
          if (meal.ingredients) {
            // If meal has ingredients array directly
            for (const ingredient of meal.ingredients) {
              const key = ingredient.name.toLowerCase();
              if (ingredientMap[key]) {
                // Combine quantities if possible
                ingredientMap[key].quantity = combineQuantities(
                  ingredientMap[key].quantity,
                  ingredient.qty || ingredient.quantity || '1'
                );
              } else {
                ingredientMap[key] = {
                  name: ingredient.name,
                  quantity: ingredient.qty || ingredient.quantity || '1',
                  section: categorizeIngredient(ingredient.name)
                };
              }
            }
          }
        }
      }
    }
    
    // Convert to array and group by section
    const sections: Record<string, any[]> = {};
    Object.values(ingredientMap).forEach(ingredient => {
      if (!sections[ingredient.section]) {
        sections[ingredient.section] = [];
      }
      sections[ingredient.section].push(ingredient);
    });
    
    // Sort sections alphabetically
    const sortedSections: Record<string, any[]> = {};
    Object.keys(sections).sort().forEach(section => {
      sortedSections[section] = sections[section];
    });
    
    res.json({
      id: mealPlan.id,
      name: mealPlan.name,
      groceryList: sortedSections
    });
  } catch (error) {
    console.error('CRITICAL ERROR in /api/grocery/:id:', error);
    res.status(500).json({ error: 'Failed to generate grocery list', details: (error as Error).message });
  }
});

// Helper function to combine quantities when possible
function combineQuantities(q1: string, q2: string): string {
  // Simple implementation - in a real app, you'd want to parse units properly
  const num1 = parseFloat(q1);
  const num2 = parseFloat(q2);
  
  if (!isNaN(num1) && !isNaN(num2)) {
    // If both are numbers, add them
    return (num1 + num2).toString();
  }
  
  // Otherwise, just return the first quantity with a note
  return `${q1} + ${q2}`;
}

// Helper function to categorize ingredients into store sections
function categorizeIngredient(ingredientName: string): string {
  const name = ingredientName.toLowerCase();
  
  // Produce
  if (name.includes('apple') || name.includes('banana') || name.includes('orange') || 
      name.includes('berry') || name.includes('grape') || name.includes('melon') ||
      name.includes('lettuce') || name.includes('spinach') || name.includes('kale') ||
      name.includes('broccoli') || name.includes('carrot') || name.includes('onion') ||
      name.includes('tomato') || name.includes('pepper') || name.includes('garlic') ||
      name.includes('ginger') || name.includes('potato') || name.includes('squash')) {
    return 'Produce';
  }
  
  // Dairy
  if (name.includes('milk') || name.includes('cheese') || name.includes('yogurt') ||
      name.includes('butter') || name.includes('cream') || name.includes('egg')) {
    return 'Dairy';
  }
  
  // Meat & Seafood
  if (name.includes('chicken') || name.includes('beef') || name.includes('pork') ||
      name.includes('fish') || name.includes('salmon') || name.includes('shrimp') ||
      name.includes('turkey') || name.includes('lamb')) {
    return 'Meat & Seafood';
  }
  
  // Bakery
  if (name.includes('bread') || name.includes('roll') || name.includes('bagel') ||
      name.includes('muffin') || name.includes('cake') || name.includes('cookie') ||
      name.includes('flour') || name.includes('sugar') || name.includes('yeast')) {
    return 'Bakery';
  }
  
  // Frozen
  if (name.includes('frozen') || name.includes('ice cream') || name.includes('frozen')) {
    return 'Frozen';
  }
  
  // Canned & Jarred
  if (name.includes('can') || name.includes('jar') || name.includes('soup') ||
      name.includes('sauce') || name.includes('pickle') || name.includes('olive')) {
    return 'Canned & Jarred Goods';
  }
  
  // Dry Goods
  if (name.includes('rice') || name.includes('pasta') || name.includes('bean') ||
      name.includes('lentil') || name.includes('quinoa') || name.includes('oat') ||
      name.includes('cereal') || name.includes('nut') || name.includes('seed')) {
    return 'Dry Goods';
  }
  
  // Condiments & Spices
  if (name.includes('salt') || name.includes('pepper') || name.includes('spice') ||
      name.includes('herb') || name.includes('vinegar') || name.includes('oil') ||
      name.includes('sauce') || name.includes('mustard') || name.includes('ketchup')) {
    return 'Condiments & Spices';
  }
  
  // Beverages
  if (name.includes('coffee') || name.includes('tea') || name.includes('juice') ||
      name.includes('soda') || name.includes('water')) {
    return 'Beverages';
  }
  
  // Health & Beauty
  if (name.includes('vitamin') || name.includes('supplement')) {
    return 'Health & Beauty';
  }
  
  // Other
  return 'Other';
}

export default router;