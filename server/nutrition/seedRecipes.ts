import { createRecipe } from './recipeService.ts';

// Sample recipes data
const sampleRecipes = [
  {
    title: "Oat Porridge with Berries",
    tags: ["low-salt", "high-fiber", "heart-healthy"],
    ingredients: [
      {name: "oats", qty: "50g"},
      {name: "milk", qty: "200ml"},
      {name: "blueberries", qty: "50g"},
      {name: "chia seeds", qty: "1 tbsp"}
    ],
    nutrients: {
      calories: 320,
      protein_g: 12,
      fat_g: 8,
      carb_g: 52,
      sodium_mg: 80
    },
    steps: [
      "Bring milk to a boil in a small saucepan",
      "Add oats and simmer for 5 minutes, stirring occasionally",
      "Pour into a bowl and top with blueberries and chia seeds"
    ],
    allergenFlags: ["gluten", "dairy"],
    medicationInteractions: []
  },
  {
    title: "Lentil Dal with Brown Rice",
    tags: ["low-salt", "high-protein", "vegetarian"],
    ingredients: [
      {name: "red lentils", qty: "100g"},
      {name: "brown rice", qty: "75g"},
      {name: "onion", qty: "1 medium"},
      {name: "tomato", qty: "1 medium"},
      {name: "spinach", qty: "50g"}
    ],
    nutrients: {
      calories: 620,
      protein_g: 28,
      fat_g: 12,
      carb_g: 95,
      sodium_mg: 220
    },
    steps: [
      "Rinse lentils and cook in water for 20 minutes",
      "Cook brown rice according to package instructions",
      "Sauté onion and tomato, add to cooked lentils",
      "Add spinach in the last few minutes of cooking",
      "Serve lentils with rice"
    ],
    allergenFlags: [],
    medicationInteractions: []
  },
  {
    title: "Grilled Tofu with Vegetables",
    tags: ["low-salt", "high-protein", "vegetarian"],
    ingredients: [
      {name: "firm tofu", qty: "150g"},
      {name: "bell peppers", qty: "100g"},
      {name: "zucchini", qty: "100g"},
      {name: "broccoli", qty: "100g"},
      {name: "olive oil", qty: "1 tsp"}
    ],
    nutrients: {
      calories: 380,
      protein_g: 32,
      fat_g: 18,
      carb_g: 25,
      sodium_mg: 180
    },
    steps: [
      "Press tofu to remove excess water and cut into cubes",
      "Marinate tofu in soy sauce and spices for 30 minutes",
      "Chop vegetables into bite-sized pieces",
      "Grill tofu and vegetables until tender",
      "Serve hot with a sprinkle of sesame seeds"
    ],
    allergenFlags: ["soy"],
    medicationInteractions: []
  },
  {
    title: "Salmon with Quinoa and Steamed Vegetables",
    tags: ["low-salt", "high-protein", "mediterranean"],
    ingredients: [
      {name: "salmon fillet", qty: "120g"},
      {name: "quinoa", qty: "75g"},
      {name: "asparagus", qty: "100g"},
      {name: "cherry tomatoes", qty: "50g"},
      {name: "lemon", qty: "1 wedge"}
    ],
    nutrients: {
      calories: 420,
      protein_g: 35,
      fat_g: 18,
      carb_g: 30,
      sodium_mg: 150
    },
    steps: [
      "Cook quinoa according to package instructions",
      "Season salmon with herbs and grill for 4-5 minutes per side",
      "Steam asparagus until tender",
      "Halve cherry tomatoes",
      "Serve salmon over quinoa with vegetables and a lemon wedge"
    ],
    allergenFlags: ["fish"],
    medicationInteractions: ["grapefruit?false"]
  },
  {
    title: "Greek Yogurt with Nuts and Honey",
    tags: ["low-salt", "high-protein", "mediterranean"],
    ingredients: [
      {name: "greek yogurt", qty: "150g"},
      {name: "almonds", qty: "20g"},
      {name: "honey", qty: "1 tsp"},
      {name: "cinnamon", qty: "pinch"}
    ],
    nutrients: {
      calories: 220,
      protein_g: 18,
      fat_g: 12,
      carb_g: 15,
      sodium_mg: 60
    },
    steps: [
      "Place Greek yogurt in a bowl",
      "Chop almonds and sprinkle over yogurt",
      "Drizzle with honey",
      "Add a pinch of cinnamon",
      "Serve immediately"
    ],
    allergenFlags: ["dairy", "nuts"],
    medicationInteractions: []
  }
];

async function seedRecipes() {
  console.log("Seeding recipes...");
  
  // Initialize database connection
  const { db } = await import('./db.js');
  await db;
  
  for (const recipe of sampleRecipes) {
    try {
      await createRecipe(recipe);
      console.log(`Created recipe: ${recipe.title}`);
    } catch (error) {
      console.error(`Error creating recipe ${recipe.title}:`, error);
    }
  }
  
  console.log("Recipe seeding completed!");
}

// Run the seed function
seedRecipes().catch(console.error);