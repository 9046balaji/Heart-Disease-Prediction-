import { useState } from "react";
import { Utensils, Plus, Search, Apple, Scale } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { offlineService } from "@/lib/offlineService";

interface FoodLoggerProps {
  userId: string;
  onFoodLogged: () => void;
}

export default function FoodLogger({ userId, onFoodLogged }: FoodLoggerProps) {
  const [mealType, setMealType] = useState<"breakfast" | "lunch" | "dinner" | "snack">("breakfast");
  const [foodName, setFoodName] = useState("");
  const [calories, setCalories] = useState<number | "">("");
  const [protein, setProtein] = useState<number | "">("");
  const [carbs, setCarbs] = useState<number | "">("");
  const [fat, setFat] = useState<number | "">("");
  const [sodium, setSodium] = useState<number | "">("");
  const [description, setDescription] = useState("");
  const [recipeId, setRecipeId] = useState("");
  const [portionSize, setPortionSize] = useState<"small" | "medium" | "large" | "">("");
  const [isLogging, setIsLogging] = useState(false);
  const [isPortionDialogOpen, setIsPortionDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleLogFood = async () => {
    if (!userId) {
      toast({
        title: "Error",
        description: "User ID is required",
        variant: "destructive",
      });
      return;
    }

    if (!mealType) {
      toast({
        title: "Error",
        description: "Please select a meal type",
        variant: "destructive",
      });
      return;
    }

    if (!foodName && !recipeId) {
      toast({
        title: "Error",
        description: "Please enter a food name or select a recipe",
        variant: "destructive",
      });
      return;
    }

    setIsLogging(true);

    try {
      // In a real implementation, this would call the API
      const token = localStorage.getItem('token');
      
      const foodLogData = {
        userId,
        mealType,
        foodName: foodName || undefined,
        calories: calories || undefined,
        protein: protein || undefined,
        carbs: carbs || undefined,
        fat: fat || undefined,
        sodium: sodium || undefined,
        description: description || undefined,
        recipeId: recipeId || undefined,
        portionSize: portionSize || undefined,
      };

      // Check if online
      if (navigator.onLine && token) {
        const response = await fetch('/api/food-logs', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(foodLogData)
        });

        if (!response.ok) {
          throw new Error('Failed to log food');
        }

        toast({
          title: "Success",
          description: "Food logged successfully!",
        });
      } else {
        // Store data offline
        offlineService.storeOfflineData('/food-logs', 'POST', foodLogData);
        
        toast({
          title: "Saved Offline",
          description: "Food logged and will be synced when online.",
        });
      }

      // Reset form
      setFoodName("");
      setCalories("");
      setProtein("");
      setCarbs("");
      setFat("");
      setSodium("");
      setDescription("");
      setRecipeId("");
      setPortionSize("");

      // Notify parent component
      onFoodLogged();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to log food. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLogging(false);
    }
  };

  const handleSearchRecipes = () => {
    // In a real implementation, this would open a recipe search modal
    alert("Recipe search functionality would be implemented here");
  };

  const handlePortionGuidance = () => {
    setIsPortionDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Utensils className="h-5 w-5" />
            Log Food
          </CardTitle>
          <CardDescription>Track what you eat throughout the day</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Meal Type */}
          <div className="space-y-2">
            <Label htmlFor="meal-type">Meal Type</Label>
            <Select value={mealType} onValueChange={(value: any) => setMealType(value)}>
              <SelectTrigger id="meal-type">
                <SelectValue placeholder="Select meal type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="breakfast">Breakfast</SelectItem>
                <SelectItem value="lunch">Lunch</SelectItem>
                <SelectItem value="dinner">Dinner</SelectItem>
                <SelectItem value="snack">Snack</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Recipe Search */}
          <div className="space-y-2">
            <Label>Recipe (Optional)</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Search for a recipe..."
                value={recipeId}
                onChange={(e) => setRecipeId(e.target.value)}
                disabled
              />
              <Button variant="outline" onClick={handleSearchRecipes} disabled>
                <Search className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Search for recipes to automatically fill nutritional information
            </p>
          </div>

          {/* Food Name */}
          <div className="space-y-2">
            <Label htmlFor="food-name">Food Name</Label>
            <Input
              id="food-name"
              placeholder="e.g., Grilled Chicken Salad"
              value={foodName}
              onChange={(e) => setFoodName(e.target.value)}
            />
          </div>

          {/* Portion Size */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="portion-size">Portion Size</Label>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-auto p-0 text-primary"
                onClick={handlePortionGuidance}
              >
                <Scale className="h-4 w-4 mr-1" />
                Portion Guidance
              </Button>
            </div>
            <Select value={portionSize} onValueChange={(value: any) => setPortionSize(value)}>
              <SelectTrigger id="portion-size">
                <SelectValue placeholder="Select portion size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">Small</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="large">Large</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Nutritional Information */}
          <div>
            <h3 className="font-medium mb-3">Nutritional Information (Optional)</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="calories">Calories</Label>
                <Input
                  id="calories"
                  type="number"
                  placeholder="0"
                  value={calories}
                  onChange={(e) => setCalories(e.target.value ? parseInt(e.target.value) : "")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="protein">Protein (g)</Label>
                <Input
                  id="protein"
                  type="number"
                  placeholder="0"
                  value={protein}
                  onChange={(e) => setProtein(e.target.value ? parseInt(e.target.value) : "")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="carbs">Carbs (g)</Label>
                <Input
                  id="carbs"
                  type="number"
                  placeholder="0"
                  value={carbs}
                  onChange={(e) => setCarbs(e.target.value ? parseInt(e.target.value) : "")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fat">Fat (g)</Label>
                <Input
                  id="fat"
                  type="number"
                  placeholder="0"
                  value={fat}
                  onChange={(e) => setFat(e.target.value ? parseInt(e.target.value) : "")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sodium">Sodium (mg)</Label>
                <Input
                  id="sodium"
                  type="number"
                  placeholder="0"
                  value={sodium}
                  onChange={(e) => setSodium(e.target.value ? parseInt(e.target.value) : "")}
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Add any additional details about your meal..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          {/* Action Button */}
          <Button 
            onClick={handleLogFood} 
            disabled={isLogging}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            {isLogging ? "Logging..." : "Log Food"}
          </Button>
        </CardContent>
      </Card>

      {/* Quick Log Suggestions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Apple className="h-5 w-5" />
            Quick Log Suggestions
          </CardTitle>
          <CardDescription>Common foods you can quickly log</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {["Apple", "Banana", "Greek Yogurt", "Almonds", "Oatmeal", "Salad", "Grilled Chicken", "Brown Rice"].map((food) => (
              <Badge 
                key={food} 
                variant="secondary" 
                className="cursor-pointer hover:bg-secondary/80"
                onClick={() => setFoodName(food)}
              >
                {food}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Portion Guidance Dialog */}
      <Dialog open={isPortionDialogOpen} onOpenChange={setIsPortionDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Portion Guidance</DialogTitle>
            <DialogDescription>
              Select a food type to view recommended portion sizes. This feature is available in the full implementation.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <p className="text-sm text-muted-foreground">
              The portion guidance system would be integrated here, allowing users to select foods and view visual portion recommendations.
            </p>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsPortionDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}