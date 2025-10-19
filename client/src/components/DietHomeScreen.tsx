import { Utensils, Calendar, Target, Plus, ShoppingCart, Apple, Beef, Milk, Wheat, Candy } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface Meal {
  name: string;
  calories: number;
  time: string;
  icon: React.ReactNode;
}

interface DailyNutrition {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  targetCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFat: number;
}

interface DietHomeScreenProps {
  dailyNutrition: DailyNutrition;
  meals: Meal[];
  lastUpdated: string;
  onGenerateMealPlan: () => void;
  onViewGroceryList: () => void;
  onLogFood: () => void;
}

export default function DietHomeScreen({ 
  dailyNutrition, 
  meals, 
  lastUpdated, 
  onGenerateMealPlan, 
  onViewGroceryList,
  onLogFood
}: DietHomeScreenProps) {
  // Calculate progress percentages
  const calorieProgress = Math.min(100, (dailyNutrition.calories / dailyNutrition.targetCalories) * 100);
  const proteinProgress = Math.min(100, (dailyNutrition.protein / dailyNutrition.targetProtein) * 100);
  const carbsProgress = Math.min(100, (dailyNutrition.carbs / dailyNutrition.targetCarbs) * 100);
  const fatProgress = Math.min(100, (dailyNutrition.fat / dailyNutrition.targetFat) * 100);

  // Get progress color based on percentage
  const getProgressColor = (percentage: number) => {
    if (percentage < 50) return "bg-blue-500";
    if (percentage < 90) return "bg-green-500";
    if (percentage < 100) return "bg-yellow-500";
    return "bg-red-500";
  };

  // Get nutrient icon based on type
  const getNutrientIcon = (type: string) => {
    switch (type) {
      case 'calories': return <Apple className="h-4 w-4" />;
      case 'protein': return <Beef className="h-4 w-4" />;
      case 'carbs': return <Wheat className="h-4 w-4" />;
      case 'fat': return <Milk className="h-4 w-4" />;
      default: return <Apple className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Utensils className="h-8 w-8" />
            Nutrition Dashboard
          </h1>
          <p className="text-muted-foreground">Track your daily nutrition and meal plans</p>
        </div>
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>{lastUpdated}</span>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Button onClick={onGenerateMealPlan} className="h-16 flex flex-col items-center justify-center gap-1">
          <Plus className="h-5 w-5" />
          <span>Generate Meal Plan</span>
        </Button>
        <Button onClick={onViewGroceryList} variant="outline" className="h-16 flex flex-col items-center justify-center gap-1">
          <ShoppingCart className="h-5 w-5" />
          <span>View Grocery List</span>
        </Button>
        <Button onClick={onLogFood} variant="outline" className="h-16 flex flex-col items-center justify-center gap-1">
          <Utensils className="h-5 w-5" />
          <span>Log Food</span>
        </Button>
      </div>

      {/* Today's Nutrition Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Today's Nutrition Goals
          </CardTitle>
          <CardDescription>Track your daily nutrition intake</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Calories */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getNutrientIcon('calories')}
                <span className="font-medium">Calories</span>
              </div>
              <span className="text-sm font-mono">
                {dailyNutrition.calories} / {dailyNutrition.targetCalories} kcal
              </span>
            </div>
            <Progress value={calorieProgress} className={getProgressColor(calorieProgress)} />
          </div>

          {/* Protein */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getNutrientIcon('protein')}
                <span className="font-medium">Protein</span>
              </div>
              <span className="text-sm font-mono">
                {dailyNutrition.protein} / {dailyNutrition.targetProtein}g
              </span>
            </div>
            <Progress value={proteinProgress} className={getProgressColor(proteinProgress)} />
          </div>

          {/* Carbs */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getNutrientIcon('carbs')}
                <span className="font-medium">Carbs</span>
              </div>
              <span className="text-sm font-mono">
                {dailyNutrition.carbs} / {dailyNutrition.targetCarbs}g
              </span>
            </div>
            <Progress value={carbsProgress} className={getProgressColor(carbsProgress)} />
          </div>

          {/* Fat */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getNutrientIcon('fat')}
                <span className="font-medium">Fat</span>
              </div>
              <span className="text-sm font-mono">
                {dailyNutrition.fat} / {dailyNutrition.targetFat}g
              </span>
            </div>
            <Progress value={fatProgress} className={getProgressColor(fatProgress)} />
          </div>
        </CardContent>
      </Card>

      {/* Today's Meals */}
      <Card>
        <CardHeader>
          <CardTitle>Today's Meals</CardTitle>
          <CardDescription>Your planned and logged meals</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {meals.map((meal, index) => (
              <div key={index} className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    {meal.icon}
                  </div>
                  <div>
                    <div className="font-medium">{meal.name}</div>
                    <div className="text-sm text-muted-foreground">{meal.time}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">{meal.calories} kcal</div>
                  <Badge variant="secondary">{meal.calories > 500 ? "High" : "Light"}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Nutrition Tips */}
      <Card>
        <CardHeader>
          <CardTitle>Nutrition Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-green-50 border border-green-200">
              <Candy className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-green-800">Stay Hydrated</h4>
                <p className="text-sm text-green-700">Drink at least 8 glasses of water daily to support digestion and metabolism.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 border border-blue-200">
              <Apple className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-800">Eat the Rainbow</h4>
                <p className="text-sm text-blue-700">Include a variety of colorful fruits and vegetables to get diverse nutrients.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}