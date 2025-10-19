import { useState } from "react";
import { 
  Dumbbell, 
  Settings, 
  RotateCcw, 
  User, 
  Heart, 
  Activity,
  AlertTriangle,
  Info,
  Target
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

interface Comorbidity {
  id: string;
  name: string;
  selected: boolean;
}

interface PhysicalLimitation {
  id: string;
  name: string;
  selected: boolean;
}

interface ExercisePlanBuilderProps {
  userProfile: {
    age: number;
    sex: string;
    heightCm: number;
    weightKg: number;
    medicalConditions: string[];
    mobilityLimitations: string;
  };
  onGeneratePlan: (preferences: any) => void;
  onReset: () => void;
}

export default function ExercisePlanBuilder({ userProfile, onGeneratePlan, onReset }: ExercisePlanBuilderProps) {
  const [fitnessLevel, setFitnessLevel] = useState<string>("beginner");
  const [goal, setGoal] = useState<string>("general");
  const [durationWeeks, setDurationWeeks] = useState<number>(4);
  const [daysPerWeek, setDaysPerWeek] = useState<number>(3);
  
  const [comorbidities, setComorbidities] = useState<Comorbidity[]>([
    { id: "hypertension", name: "High Blood Pressure", selected: userProfile.medicalConditions.includes("hypertension") },
    { id: "diabetes", name: "Diabetes", selected: userProfile.medicalConditions.includes("diabetes") },
    { id: "high-cholesterol", name: "High Cholesterol", selected: userProfile.medicalConditions.includes("high-cholesterol") },
    { id: "arthritis", name: "Arthritis", selected: false },
    { id: "asthma", name: "Asthma", selected: false },
    { id: "osteoporosis", name: "Osteoporosis", selected: false },
  ]);

  const [physicalLimitations, setPhysicalLimitations] = useState<PhysicalLimitation[]>([
    { id: "knee", name: "Knee Pain", selected: userProfile.mobilityLimitations === "knee_pain" },
    { id: "back", name: "Back Pain", selected: false },
    { id: "balance", name: "Balance Issues", selected: userProfile.mobilityLimitations === "balance_issues" },
    { id: "shoulder", name: "Shoulder Issues", selected: false },
    { id: "neck", name: "Neck Pain", selected: false },
    { id: "general", name: "General Fatigue", selected: false },
  ]);

  const [additionalNotes, setAdditionalNotes] = useState<string>("");

  const toggleComorbidity = (id: string) => {
    setComorbidities(prev => 
      prev.map(condition => 
        condition.id === id ? { ...condition, selected: !condition.selected } : condition
      )
    );
  };

  const togglePhysicalLimitation = (id: string) => {
    setPhysicalLimitations(prev => 
      prev.map(limitation => 
        limitation.id === id ? { ...limitation, selected: !limitation.selected } : limitation
      )
    );
  };

  const handleGeneratePlan = () => {
    const preferences = {
      fitnessLevel,
      goal,
      durationWeeks,
      daysPerWeek,
      comorbidities: comorbidities.filter(c => c.selected).map(c => c.id),
      physicalLimitations: physicalLimitations.filter(p => p.selected).map(p => p.id),
      additionalNotes,
      userProfile
    };
    
    onGeneratePlan(preferences);
  };

  const handleReset = () => {
    setFitnessLevel("beginner");
    setGoal("general");
    setDurationWeeks(4);
    setDaysPerWeek(3);
    setComorbidities(prev => 
      prev.map(condition => ({ 
        ...condition, 
        selected: userProfile.medicalConditions.includes(condition.id) 
      }))
    );
    setPhysicalLimitations(prev => 
      prev.map(limitation => ({ 
        ...limitation, 
        selected: userProfile.mobilityLimitations === limitation.id 
      }))
    );
    setAdditionalNotes("");
    onReset();
  };

  const getFitnessLevelDescription = (level: string) => {
    switch (level) {
      case "beginner": 
        return "New to exercise or returning after a long break. Focus on building foundational fitness.";
      case "intermediate": 
        return "Regularly active with some exercise experience. Ready for more challenging workouts.";
      case "advanced": 
        return "Consistently active with significant exercise experience. Capable of high-intensity training.";
      default: 
        return "";
    }
  };

  const getGoalDescription = (goal: string) => {
    switch (goal) {
      case "general": 
        return "Improve overall fitness and cardiovascular health";
      case "weight-loss": 
        return "Lose weight and reduce body fat";
      case "strength": 
        return "Build muscle strength and endurance";
      case "flexibility": 
        return "Improve flexibility and mobility";
      default: 
        return "";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Dumbbell className="h-8 w-8" />
            Exercise Plan Builder
          </h1>
          <p className="text-muted-foreground">Create your personalized exercise program</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
        </div>
      </div>

      {/* Safety Notice */}
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Important Safety Information</AlertTitle>
        <AlertDescription>
          This exercise plan is designed for cardiovascular health improvement. 
          Please consult with your healthcare provider before starting any new exercise program, 
          especially if you have existing medical conditions.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - User Profile Summary */}
        <div className="lg:col-span-1 space-y-6">
          {/* User Profile Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Your Profile
              </CardTitle>
              <CardDescription>Information used for plan customization</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Age</span>
                  <span className="font-medium">{userProfile.age} years</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sex</span>
                  <span className="font-medium">{userProfile.sex}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Height</span>
                  <span className="font-medium">{userProfile.heightCm} cm</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Weight</span>
                  <span className="font-medium">{userProfile.weightKg} kg</span>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h4 className="font-medium mb-2">Medical Conditions</h4>
                {userProfile.medicalConditions.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {userProfile.medicalConditions.map((condition, index) => (
                      <Badge key={index} variant="destructive">
                        {condition}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">None reported</p>
                )}
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Mobility Limitations</h4>
                {userProfile.mobilityLimitations && userProfile.mobilityLimitations !== "none" ? (
                  <Badge variant="destructive">{userProfile.mobilityLimitations}</Badge>
                ) : (
                  <p className="text-sm text-muted-foreground">None reported</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Plan Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Plan Summary</CardTitle>
              <CardDescription>Your current exercise plan preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fitness Level</span>
                  <span className="font-medium capitalize">{fitnessLevel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Goal</span>
                  <span className="font-medium capitalize">{goal.replace("-", " ")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Duration</span>
                  <span className="font-medium">{durationWeeks} weeks</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Frequency</span>
                  <span className="font-medium">{daysPerWeek} days/week</span>
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="font-medium mb-2">Selected Conditions</h4>
                  <div className="flex flex-wrap gap-1">
                    {comorbidities.filter(c => c.selected).map(condition => (
                      <Badge key={condition.id} variant="secondary" className="text-xs">
                        {condition.name}
                      </Badge>
                    ))}
                    {physicalLimitations.filter(p => p.selected).map(limitation => (
                      <Badge key={limitation.id} variant="outline" className="text-xs">
                        {limitation.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Plan Configuration */}
        <div className="lg:col-span-2 space-y-6">
          {/* Fitness Level */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Fitness Level
              </CardTitle>
              <CardDescription>Assess your current exercise experience</CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup value={fitnessLevel} onValueChange={setFitnessLevel} className="space-y-3">
                <div className="flex items-start space-x-3 p-3 rounded-lg border bg-card">
                  <RadioGroupItem value="beginner" id="beginner" className="mt-1" />
                  <div className="grid gap-1.5">
                    <Label htmlFor="beginner" className="font-medium">
                      Beginner
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {getFitnessLevelDescription("beginner")}
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-3 rounded-lg border bg-card">
                  <RadioGroupItem value="intermediate" id="intermediate" className="mt-1" />
                  <div className="grid gap-1.5">
                    <Label htmlFor="intermediate" className="font-medium">
                      Intermediate
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {getFitnessLevelDescription("intermediate")}
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-3 rounded-lg border bg-card">
                  <RadioGroupItem value="advanced" id="advanced" className="mt-1" />
                  <div className="grid gap-1.5">
                    <Label htmlFor="advanced" className="font-medium">
                      Advanced
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {getFitnessLevelDescription("advanced")}
                    </p>
                  </div>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Exercise Goal */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Exercise Goal
              </CardTitle>
              <CardDescription>What would you like to achieve?</CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup value={goal} onValueChange={setGoal} className="space-y-3">
                <div className="flex items-start space-x-3 p-3 rounded-lg border bg-card">
                  <RadioGroupItem value="general" id="general" className="mt-1" />
                  <div className="grid gap-1.5">
                    <Label htmlFor="general" className="font-medium">
                      General Health
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {getGoalDescription("general")}
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-3 rounded-lg border bg-card">
                  <RadioGroupItem value="weight-loss" id="weight-loss" className="mt-1" />
                  <div className="grid gap-1.5">
                    <Label htmlFor="weight-loss" className="font-medium">
                      Weight Loss
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {getGoalDescription("weight-loss")}
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-3 rounded-lg border bg-card">
                  <RadioGroupItem value="strength" id="strength" className="mt-1" />
                  <div className="grid gap-1.5">
                    <Label htmlFor="strength" className="font-medium">
                      Strength Building
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {getGoalDescription("strength")}
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-3 rounded-lg border bg-card">
                  <RadioGroupItem value="flexibility" id="flexibility" className="mt-1" />
                  <div className="grid gap-1.5">
                    <Label htmlFor="flexibility" className="font-medium">
                      Flexibility & Mobility
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {getGoalDescription("flexibility")}
                    </p>
                  </div>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Plan Duration and Frequency */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Duration */}
            <Card>
              <CardHeader>
                <CardTitle>Plan Duration</CardTitle>
                <CardDescription>How long would you like your plan?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Weeks</span>
                    <span className="text-sm font-bold">{durationWeeks}</span>
                  </div>
                  <Slider
                    value={[durationWeeks]}
                    onValueChange={(value) => setDurationWeeks(value[0])}
                    min={2}
                    max={12}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>2</span>
                    <span>12</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-2">
                  <Button 
                    variant={durationWeeks === 4 ? "default" : "outline"} 
                    size="sm"
                    onClick={() => setDurationWeeks(4)}
                  >
                    4 Weeks
                  </Button>
                  <Button 
                    variant={durationWeeks === 8 ? "default" : "outline"} 
                    size="sm"
                    onClick={() => setDurationWeeks(8)}
                  >
                    8 Weeks
                  </Button>
                  <Button 
                    variant={durationWeeks === 12 ? "default" : "outline"} 
                    size="sm"
                    onClick={() => setDurationWeeks(12)}
                  >
                    12 Weeks
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Frequency */}
            <Card>
              <CardHeader>
                <CardTitle>Weekly Frequency</CardTitle>
                <CardDescription>How many days per week?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Days</span>
                    <span className="text-sm font-bold">{daysPerWeek}</span>
                  </div>
                  <Slider
                    value={[daysPerWeek]}
                    onValueChange={(value) => setDaysPerWeek(value[0])}
                    min={1}
                    max={7}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>1</span>
                    <span>7</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-2">
                  <Button 
                    variant={daysPerWeek === 2 ? "default" : "outline"} 
                    size="sm"
                    onClick={() => setDaysPerWeek(2)}
                  >
                    2 Days
                  </Button>
                  <Button 
                    variant={daysPerWeek === 3 ? "default" : "outline"} 
                    size="sm"
                    onClick={() => setDaysPerWeek(3)}
                  >
                    3 Days
                  </Button>
                  <Button 
                    variant={daysPerWeek === 5 ? "default" : "outline"} 
                    size="sm"
                    onClick={() => setDaysPerWeek(5)}
                  >
                    5 Days
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Medical Conditions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5" />
                Medical Conditions
              </CardTitle>
              <CardDescription>Select any existing health conditions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {comorbidities.map((condition) => (
                  <div 
                    key={condition.id} 
                    className={`flex items-center space-x-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                      condition.selected 
                        ? "border-primary bg-primary/10" 
                        : "border-border hover:bg-accent"
                    }`}
                    onClick={() => toggleComorbidity(condition.id)}
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

          {/* Physical Limitations */}
          <Card>
            <CardHeader>
              <CardTitle>Physical Limitations</CardTitle>
              <CardDescription>Select any physical limitations or concerns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {physicalLimitations.map((limitation) => (
                  <div 
                    key={limitation.id} 
                    className={`flex items-center space-x-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                      limitation.selected 
                        ? "border-primary bg-primary/10" 
                        : "border-border hover:bg-accent"
                    }`}
                    onClick={() => togglePhysicalLimitation(limitation.id)}
                  >
                    <Checkbox 
                      id={limitation.id} 
                      checked={limitation.selected} 
                      className="cursor-pointer"
                    />
                    <Label htmlFor={limitation.id} className="cursor-pointer">
                      {limitation.name}
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Additional Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
              <CardDescription>Any other details to consider for your plan</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Please share any additional information that might help customize your exercise plan..."
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                rows={4}
              />
            </CardContent>
          </Card>

          {/* Generate Button */}
          <Button className="w-full" size="lg" onClick={handleGeneratePlan}>
            <Settings className="h-5 w-5 mr-2" />
            Generate Exercise Plan
          </Button>
        </div>
      </div>
    </div>
  );
}