import { useState } from "react";
import { 
  Utensils, 
  Clock, 
  Flame, 
  Apple, 
  Beef, 
  Wheat, 
  Milk, 
  AlertTriangle, 
  Plus, 
  Calendar,
  ChefHat,
  Timer,
  Leaf,
  WheatOff
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface NutrientInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sodium: number;
}

interface Ingredient {
  name: string;
  quantity: string;
  allergen?: boolean;
}

interface RecipeStep {
  step: number;
  description: string;
}

interface Warning {
  type: "allergen" | "medication" | "condition";
  severity: "low" | "medium" | "high";
  message: string;
}

interface RecipeViewerProps {
  recipe: {
    id: string;
    title: string;
    description: string;
    prepTime: number;
    cookTime: number;
    servings: number;
    difficulty: "easy" | "medium" | "hard";
    nutrients: NutrientInfo;
    ingredients: Ingredient[];
    steps: RecipeStep[];
    tags: string[];
    warnings: Warning[];
    imageUrl?: string;
    dietaryRestrictions?: string[];
    cookingTime?: number;
  };
  onAddToPlan: (recipeId: string, mealType: string) => void;
  onLogFood: (recipeId: string) => void;
}

export default function RecipeViewer({ recipe, onAddToPlan, onLogFood }: RecipeViewerProps) {
  const [selectedMealType, setSelectedMealType] = useState<string>("lunch");

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy": return "bg-green-100 text-green-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "hard": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getWarningColor = (severity: string) => {
    switch (severity) {
      case "low": return "bg-blue-50 text-blue-800 border-blue-200";
      case "medium": return "bg-yellow-50 text-yellow-800 border-yellow-200";
      case "high": return "bg-red-50 text-red-800 border-red-200";
      default: return "bg-gray-50 text-gray-800 border-gray-200";
    }
  };

  const handleAddToPlan = () => {
    onAddToPlan(recipe.id, selectedMealType);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <ChefHat className="h-8 w-8" />
              {recipe.title}
            </h1>
            <p className="text-muted-foreground mt-2">{recipe.description}</p>
          </div>
          <Badge className={getDifficultyColor(recipe.difficulty)}>
            {recipe.difficulty.charAt(0).toUpperCase() + recipe.difficulty.slice(1)}
          </Badge>
        </div>
        
        {/* Tags and Dietary Restrictions */}
        <div className="flex flex-wrap gap-2 mt-4">
          {recipe.tags.map((tag, index) => (
            <Badge key={index} variant="secondary">{tag}</Badge>
          ))}
          
          {recipe.dietaryRestrictions && recipe.dietaryRestrictions.map((restriction, index) => (
            <Badge key={`restriction-${index}`} variant="outline" className="flex items-center gap-1">
              {restriction === "gluten-free" && <WheatOff className="h-3 w-3" />}
              {restriction === "vegetarian" && <Leaf className="h-3 w-3" />}
              {restriction}
            </Badge>
          ))}
        </div>
      </div>

      {/* Warnings */}
      {recipe.warnings.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Important Safety Information</AlertTitle>
          <AlertDescription>
            <div className="space-y-2 mt-2">
              {recipe.warnings.map((warning, index) => (
                <div 
                  key={index} 
                  className={`p-3 rounded-lg border ${getWarningColor(warning.severity)}`}
                >
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-medium capitalize">{warning.type}</span>: {warning.message}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Image and Nutritional Info */}
        <div className="lg:col-span-1 space-y-6">
          {/* Recipe Image */}
          <Card>
            <CardContent className="p-6">
              {recipe.imageUrl ? (
                <img 
                  src={recipe.imageUrl} 
                  alt={recipe.title} 
                  className="aspect-video object-cover rounded-lg w-full"
                />
              ) : (
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                  <Utensils className="h-12 w-12 text-muted-foreground" />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Nutritional Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Apple className="h-5 w-5" />
                Nutritional Information
              </CardTitle>
              <CardDescription>Per serving</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Flame className="h-4 w-4 text-primary" />
                    <span>Calories</span>
                  </div>
                  <span className="font-bold">{recipe.nutrients.calories}</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Beef className="h-4 w-4 text-primary" />
                    <span>Protein</span>
                  </div>
                  <span className="font-bold">{recipe.nutrients.protein}g</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Wheat className="h-4 w-4 text-primary" />
                    <span>Carbs</span>
                  </div>
                  <span className="font-bold">{recipe.nutrients.carbs}g</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Milk className="h-4 w-4 text-primary" />
                    <span>Fat</span>
                  </div>
                  <span className="font-bold">{recipe.nutrients.fat}g</span>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Fiber</span>
                  <span className="font-medium">{recipe.nutrients.fiber}g</span>
                </div>
                <div className="flex justify-between">
                  <span>Sodium</span>
                  <span className="font-medium">{recipe.nutrients.sodium}mg</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recipe Details */}
          <Card>
            <CardHeader>
              <CardTitle>Recipe Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Prep Time</span>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{recipe.prepTime} mins</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Cook Time</span>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{recipe.cookTime} mins</span>
                </div>
              </div>
              
              {recipe.cookingTime && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Total Time</span>
                  <div className="flex items-center gap-1">
                    <Timer className="h-4 w-4" />
                    <span>{recipe.cookingTime} mins</span>
                  </div>
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Servings</span>
                <span className="font-medium">{recipe.servings}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Ingredients and Instructions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Ingredients */}
          <Card>
            <CardHeader>
              <CardTitle>Ingredients</CardTitle>
              <CardDescription>Serves {recipe.servings}</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {recipe.ingredients.map((ingredient, index) => (
                  <li 
                    key={index} 
                    className={`flex items-start gap-2 p-2 rounded-lg ${
                      ingredient.allergen ? "bg-red-50 border border-red-200" : ""
                    }`}
                  >
                    <div className={`h-2 w-2 rounded-full mt-2 flex-shrink-0 ${
                      ingredient.allergen ? "bg-red-500" : "bg-primary"
                    }`} />
                    <div>
                      <span className={ingredient.allergen ? "font-medium text-red-700" : ""}>
                        {ingredient.name}
                      </span>
                      <span className="text-muted-foreground"> - {ingredient.quantity}</span>
                      {ingredient.allergen && (
                        <Badge variant="destructive" className="ml-2">Allergen</Badge>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card>
            <CardHeader>
              <CardTitle>Instructions</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-4">
                {recipe.steps.map((step) => (
                  <li key={step.step} className="flex gap-3">
                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                      {step.step}
                    </div>
                    <p className="pt-1">{step.description}</p>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => onLogFood(recipe.id)}>
              <Utensils className="h-4 w-4 mr-2" />
              Log as Food
            </Button>
            
            <div className="flex gap-2">
              <select 
                value={selectedMealType}
                onChange={(e) => setSelectedMealType(e.target.value)}
                className="border rounded-md px-3 py-2 text-sm"
              >
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="dinner">Dinner</option>
                <option value="snack">Snack</option>
              </select>
              <Button onClick={handleAddToPlan}>
                <Plus className="h-4 w-4 mr-2" />
                Add to Plan
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}