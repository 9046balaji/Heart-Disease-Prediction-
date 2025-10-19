import { useState } from "react";
import { Utensils, Plus, Settings, RotateCcw } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";

interface DietaryPreference {
  id: string;
  name: string;
  selected: boolean;
}

interface Allergy {
  id: string;
  name: string;
  selected: boolean;
}

interface MedicalCondition {
  id: string;
  name: string;
  selected: boolean;
}

interface MealPlanBuilderProps {
  onGeneratePlan: (preferences: any) => void;
  onReset: () => void;
}

export default function MealPlanBuilder({ onGeneratePlan, onReset }: MealPlanBuilderProps) {
  const [dietaryPreferences, setDietaryPreferences] = useState<DietaryPreference[]>([
    { id: "vegetarian", name: "Vegetarian", selected: false },
    { id: "vegan", name: "Vegan", selected: false },
    { id: "pescatarian", name: "Pescatarian", selected: false },
    { id: "low-carb", name: "Low Carb", selected: false },
    { id: "keto", name: "Keto", selected: false },
    { id: "mediterranean", name: "Mediterranean", selected: false },
  ]);

  const [allergies, setAllergies] = useState<Allergy[]>([
    { id: "dairy", name: "Dairy", selected: false },
    { id: "gluten", name: "Gluten", selected: false },
    { id: "nuts", name: "Nuts", selected: false },
    { id: "shellfish", name: "Shellfish", selected: false },
    { id: "soy", name: "Soy", selected: false },
    { id: "eggs", name: "Eggs", selected: false },
  ]);

  const [medicalConditions, setMedicalConditions] = useState<MedicalCondition[]>([
    { id: "hypertension", name: "High Blood Pressure", selected: false },
    { id: "diabetes", name: "Diabetes", selected: false },
    { id: "high-cholesterol", name: "High Cholesterol", selected: false },
    { id: "heart-disease", name: "Heart Disease", selected: false },
    { id: "kidney-disease", name: "Kidney Disease", selected: false },
  ]);

  const [calorieTarget, setCalorieTarget] = useState<number>(2000);
  const [dietType, setDietType] = useState<string>("balanced");
  const [cuisinePreference, setCuisinePreference] = useState<string>("any");

  const toggleDietaryPreference = (id: string) => {
    setDietaryPreferences(prev => 
      prev.map(pref => 
        pref.id === id ? { ...pref, selected: !pref.selected } : pref
      )
    );
  };

  const toggleAllergy = (id: string) => {
    setAllergies(prev => 
      prev.map(allergy => 
        allergy.id === id ? { ...allergy, selected: !allergy.selected } : allergy
      )
    );
  };

  const toggleMedicalCondition = (id: string) => {
    setMedicalConditions(prev => 
      prev.map(condition => 
        condition.id === id ? { ...condition, selected: !condition.selected } : condition
      )
    );
  };

  const handleGeneratePlan = () => {
    const preferences = {
      dietaryPreferences: dietaryPreferences.filter(p => p.selected).map(p => p.id),
      allergies: allergies.filter(a => a.selected).map(a => a.id),
      medicalConditions: medicalConditions.filter(c => c.selected).map(c => c.id),
      calorieTarget,
      dietType,
      cuisinePreference,
    };
    
    onGeneratePlan(preferences);
  };

  const handleReset = () => {
    setDietaryPreferences(prev => 
      prev.map(pref => ({ ...pref, selected: false }))
    );
    setAllergies(prev => 
      prev.map(allergy => ({ ...allergy, selected: false }))
    );
    setMedicalConditions(prev => 
      prev.map(condition => ({ ...condition, selected: false }))
    );
    setCalorieTarget(2000);
    setDietType("balanced");
    setCuisinePreference("any");
    onReset();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Utensils className="h-8 w-8" />
            Meal Plan Builder
          </h1>
          <p className="text-muted-foreground">Customize your personalized meal plan</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Preferences */}
        <div className="lg:col-span-2 space-y-6">
          {/* Dietary Preferences */}
          <Card>
            <CardHeader>
              <CardTitle>Dietary Preferences</CardTitle>
              <CardDescription>Select your dietary preferences and restrictions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {dietaryPreferences.map((pref) => (
                  <div 
                    key={pref.id} 
                    className={`flex items-center space-x-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                      pref.selected 
                        ? "border-primary bg-primary/10" 
                        : "border-border hover:bg-accent"
                    }`}
                    onClick={() => toggleDietaryPreference(pref.id)}
                  >
                    <Checkbox 
                      id={pref.id} 
                      checked={pref.selected} 
                      className="cursor-pointer"
                    />
                    <Label htmlFor={pref.id} className="cursor-pointer">
                      {pref.name}
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Allergies */}
          <Card>
            <CardHeader>
              <CardTitle>Allergies & Intolerances</CardTitle>
              <CardDescription>Specify any food allergies or intolerances</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {allergies.map((allergy) => (
                  <div 
                    key={allergy.id} 
                    className={`flex items-center space-x-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                      allergy.selected 
                        ? "border-primary bg-primary/10" 
                        : "border-border hover:bg-accent"
                    }`}
                    onClick={() => toggleAllergy(allergy.id)}
                  >
                    <Checkbox 
                      id={allergy.id} 
                      checked={allergy.selected} 
                      className="cursor-pointer"
                    />
                    <Label htmlFor={allergy.id} className="cursor-pointer">
                      {allergy.name}
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Medical Conditions */}
          <Card>
            <CardHeader>
              <CardTitle>Medical Conditions</CardTitle>
              <CardDescription>Specify any medical conditions that affect your diet</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {medicalConditions.map((condition) => (
                  <div 
                    key={condition.id} 
                    className={`flex items-center space-x-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                      condition.selected 
                        ? "border-primary bg-primary/10" 
                        : "border-border hover:bg-accent"
                    }`}
                    onClick={() => toggleMedicalCondition(condition.id)}
                  >
                    <Checkbox 
                      id={condition.id} 
                      checked={condition.selected} 
                      className="cursor-pointer"
                    />
                    <Label htmlFor={condition.id} className="cursor-pointer">
                      {condition.name}
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Settings */}
        <div className="space-y-6">
          {/* Calorie Target */}
          <Card>
            <CardHeader>
              <CardTitle>Calorie Target</CardTitle>
              <CardDescription>Set your daily calorie goal</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Daily Calories</span>
                  <span className="text-sm font-bold">{calorieTarget} kcal</span>
                </div>
                <Slider
                  value={[calorieTarget]}
                  onValueChange={(value) => setCalorieTarget(value[0])}
                  min={1200}
                  max={3500}
                  step={50}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>1200</span>
                  <span>3500</span>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                <Button 
                  variant={calorieTarget === 1800 ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setCalorieTarget(1800)}
                >
                  1800
                </Button>
                <Button 
                  variant={calorieTarget === 2000 ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setCalorieTarget(2000)}
                >
                  2000
                </Button>
                <Button 
                  variant={calorieTarget === 2200 ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setCalorieTarget(2200)}
                >
                  2200
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Diet Type */}
          <Card>
            <CardHeader>
              <CardTitle>Diet Type</CardTitle>
              <CardDescription>Choose your preferred diet approach</CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup value={dietType} onValueChange={setDietType}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="balanced" id="balanced" />
                  <Label htmlFor="balanced">Balanced</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="weight-loss" id="weight-loss" />
                  <Label htmlFor="weight-loss">Weight Loss</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="weight-gain" id="weight-gain" />
                  <Label htmlFor="weight-gain">Weight Gain</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="maintenance" id="maintenance" />
                  <Label htmlFor="maintenance">Maintenance</Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Cuisine Preference */}
          <Card>
            <CardHeader>
              <CardTitle>Cuisine Preference</CardTitle>
              <CardDescription>Choose your preferred cuisine style</CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={cuisinePreference} onValueChange={setCuisinePreference}>
                <SelectTrigger>
                  <SelectValue placeholder="Select cuisine" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any Cuisine</SelectItem>
                  <SelectItem value="mediterranean">Mediterranean</SelectItem>
                  <SelectItem value="asian">Asian</SelectItem>
                  <SelectItem value="mexican">Mexican</SelectItem>
                  <SelectItem value="italian">Italian</SelectItem>
                  <SelectItem value="indian">Indian</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Generate Button */}
          <Button className="w-full" size="lg" onClick={handleGeneratePlan}>
            <Settings className="h-5 w-5 mr-2" />
            Generate Meal Plan
          </Button>
        </div>
      </div>

      {/* Selected Preferences Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Summary</CardTitle>
          <CardDescription>Your current meal plan preferences</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {dietaryPreferences.filter(p => p.selected).map(pref => (
              <Badge key={pref.id} variant="secondary">{pref.name}</Badge>
            ))}
            {allergies.filter(a => a.selected).map(allergy => (
              <Badge key={allergy.id} variant="destructive">{allergy.name}</Badge>
            ))}
            {medicalConditions.filter(c => c.selected).map(condition => (
              <Badge key={condition.id} variant="outline">{condition.name}</Badge>
            ))}
            <Badge variant="default">{calorieTarget} kcal/day</Badge>
            <Badge variant="default">{dietType}</Badge>
            <Badge variant="default">{cuisinePreference}</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}