import { useState } from "react";
import { ArrowLeft, Utensils, Calendar, Target, Plus, ShoppingCart, Apple, Beef, Milk, Wheat, Candy, ChefHat } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import DietHomeScreen from "@/components/DietHomeScreen";
import MealPlanBuilder from "@/components/MealPlanBuilder";
import RecipeViewer from "@/components/RecipeViewer";
import GroceryListScreen from "@/components/GroceryListScreen";
import BottomNav from "@/components/BottomNav";

export default function Nutrition() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "plan" | "recipes" | "grocery">("dashboard");
  
  // Mock data for the nutrition components
  const mockDailyNutrition = {
    calories: 1840,
    protein: 95,
    carbs: 220,
    fat: 65,
    targetCalories: 2200,
    targetProtein: 110,
    targetCarbs: 275,
    targetFat: 73
  };
  
  const mockMeals = [
    { name: "Overnight Oats", calories: 320, time: "8:00 AM", icon: <Apple className="h-5 w-5" /> },
    { name: "Grilled Chicken Salad", calories: 450, time: "12:30 PM", icon: <Beef className="h-5 w-5" /> },
    { name: "Salmon with Quinoa", calories: 580, time: "6:00 PM", icon: <Milk className="h-5 w-5" /> },
    { name: "Greek Yogurt with Berries", calories: 180, time: "9:00 PM", icon: <Wheat className="h-5 w-5" /> }
  ];
  
  const mockRecipe = {
    id: "recipe-1",
    title: "Mediterranean Quinoa Bowl",
    description: "A heart-healthy bowl packed with protein and fiber",
    prepTime: 15,
    cookTime: 20,
    servings: 2,
    difficulty: "medium" as const,
    nutrients: {
      calories: 420,
      protein: 22,
      carbs: 55,
      fat: 12,
      fiber: 8,
      sodium: 320
    },
    ingredients: [
      { name: "Quinoa", quantity: "1 cup, cooked" },
      { name: "Cherry tomatoes", quantity: "1 cup, halved" },
      { name: "Cucumber", quantity: "1/2 cup, diced" },
      { name: "Red onion", quantity: "1/4 cup, finely chopped" },
      { name: "Feta cheese", quantity: "1/4 cup, crumbled" },
      { name: "Kalamata olives", quantity: "1/4 cup" },
      { name: "Olive oil", quantity: "2 tbsp" },
      { name: "Lemon juice", quantity: "1 tbsp" }
    ],
    steps: [
      { step: 1, description: "Cook quinoa according to package instructions and let cool." },
      { step: 2, description: "In a large bowl, combine cooked quinoa, tomatoes, cucumber, and red onion." },
      { step: 3, description: "Add feta cheese and olives to the bowl." },
      { step: 4, description: "In a small bowl, whisk together olive oil and lemon juice." },
      { step: 5, description: "Pour dressing over the quinoa mixture and toss to combine." },
      { step: 6, description: "Serve immediately or refrigerate for later." }
    ],
    tags: ["heart-healthy", "high-protein", "mediterranean", "vegetarian"],
    warnings: [
      { type: "allergen" as const, severity: "medium" as const, message: "Contains dairy (feta cheese)" }
    ]
  };
  
  const mockGroceryList = {
    "Produce": [
      { id: "1", name: "Cherry tomatoes", quantity: "1 lb", category: "Produce", purchased: false },
      { id: "2", name: "Cucumber", quantity: "2 medium", category: "Produce", purchased: false },
      { id: "3", name: "Red onion", quantity: "1 medium", category: "Produce", purchased: true }
    ],
    "Grains & Bread": [
      { id: "4", name: "Quinoa", quantity: "1 lb", category: "Grains & Bread", purchased: false }
    ],
    "Dairy": [
      { id: "5", name: "Feta cheese", quantity: "8 oz", category: "Dairy", purchased: false }
    ],
    "Canned & Jarred Goods": [
      { id: "6", name: "Kalamata olives", quantity: "1 jar", category: "Canned & Jarred Goods", purchased: true }
    ],
    "Condiments & Spices": [
      { id: "7", name: "Olive oil", quantity: "1 bottle", category: "Condiments & Spices", purchased: false },
      { id: "8", name: "Lemon juice", quantity: "1 bottle", category: "Condiments & Spices", purchased: false }
    ]
  };

  const handleGenerateMealPlan = () => {
    setActiveTab("plan");
  };

  const handleViewGroceryList = () => {
    setActiveTab("grocery");
  };

  const handleLogFood = () => {
    console.log("Logging food");
  };

  const handleAddToPlan = (recipeId: string, mealType: string) => {
    console.log("Adding recipe to plan:", recipeId, mealType);
  };

  const handleToggleItem = (itemId: string) => {
    console.log("Toggling grocery item:", itemId);
  };

  const handleExport = () => {
    console.log("Exporting grocery list");
  };

  const handlePrint = () => {
    console.log("Printing grocery list");
  };

  const handleShare = () => {
    console.log("Sharing grocery list");
  };
  
  const handleGeneratePlan = (preferences: any) => {
    console.log("Generating meal plan with preferences:", preferences);
  };
  
  const handleReset = () => {
    console.log("Resetting meal plan builder");
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="border-b bg-card/50 backdrop-blur sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/health">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </Link>
          <h1 className="font-bold text-xl font-[family-name:var(--font-sans)]">Nutrition & Diet</h1>
          <div className="w-10"></div> {/* Spacer for alignment */}
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="max-w-7xl mx-auto px-4 py-4 border-b">
        <div className="flex space-x-1 bg-muted rounded-lg p-1">
          <Button
            variant={activeTab === "dashboard" ? "default" : "ghost"}
            className="flex-1"
            onClick={() => setActiveTab("dashboard")}
          >
            <Utensils className="h-4 w-4 mr-2" />
            Dashboard
          </Button>
          <Button
            variant={activeTab === "plan" ? "default" : "ghost"}
            className="flex-1"
            onClick={() => setActiveTab("plan")}
          >
            <Target className="h-4 w-4 mr-2" />
            Meal Plan
          </Button>
          <Button
            variant={activeTab === "recipes" ? "default" : "ghost"}
            className="flex-1"
            onClick={() => setActiveTab("recipes")}
          >
            <ChefHat className="h-4 w-4 mr-2" />
            Recipes
          </Button>
          <Button
            variant={activeTab === "grocery" ? "default" : "ghost"}
            className="flex-1"
            onClick={() => setActiveTab("grocery")}
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Grocery
          </Button>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === "dashboard" && (
          <DietHomeScreen
            dailyNutrition={mockDailyNutrition}
            meals={mockMeals}
            lastUpdated="Today, 2:30 PM"
            onGenerateMealPlan={handleGenerateMealPlan}
            onViewGroceryList={handleViewGroceryList}
            onLogFood={handleLogFood}
          />
        )}
        
        {activeTab === "plan" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">My Meal Plan</h2>
              <p className="text-muted-foreground">Your personalized nutrition program</p>
            </div>
            <MealPlanBuilder 
              onGeneratePlan={handleGeneratePlan}
              onReset={handleReset}
            />
          </div>
        )}
        
        {activeTab === "recipes" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">Recipe Viewer</h2>
              <p className="text-muted-foreground">Detailed recipe information and nutrition facts</p>
            </div>
            <RecipeViewer
              recipe={mockRecipe}
              onAddToPlan={handleAddToPlan}
              onLogFood={handleLogFood}
            />
          </div>
        )}
        
        {activeTab === "grocery" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">Grocery List</h2>
              <p className="text-muted-foreground">Shopping list for your meal plan</p>
            </div>
            <GroceryListScreen
              groceryList={mockGroceryList}
              mealPlanName="Mediterranean Diet Plan"
              onToggleItem={handleToggleItem}
              onExport={handleExport}
              onPrint={handlePrint}
              onShare={handleShare}
            />
          </div>
        )}
      </main>
      
      <BottomNav />
    </div>
  );
}