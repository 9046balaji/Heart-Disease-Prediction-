import { useState } from "react";
import { ArrowLeft, Dumbbell, Play, Calendar, TrendingUp, Target, Clock, Flame, Award, BarChart3, User, CheckCircle } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import ExerciseHomeScreen from "@/components/ExerciseHomeScreen";
import ExercisePlanBuilder from "@/components/ExercisePlanBuilder";
import PreExerciseSafetyChecks from "@/components/PreExerciseSafetyChecks";
import ExerciseDemo from "@/components/ExerciseDemo";
import BottomNav from "@/components/BottomNav";

export default function Exercise() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "plan" | "safety" | "demo">("dashboard");
  
  // Mock data for the exercise components
  const mockCurrentPlan = {
    id: "plan-1",
    name: "Cardiovascular Fitness Program",
    level: "Intermediate",
    durationWeeks: 8,
    progress: 65,
    startDate: "2025-10-01",
    endDate: "2025-11-26"
  };
  
  const mockTodayWorkout = {
    id: "workout-1",
    title: "Morning Cardio Blast",
    duration: 30,
    intensity: "moderate" as const,
    completed: false,
    scheduledTime: "8:00 AM"
  };
  
  const mockWeeklyProgress = [
    { name: "Duration", current: 120, target: 150, unit: "mins", trend: "up" as const },
    { name: "Calories", current: 2400, target: 3000, unit: "kcal", trend: "up" as const },
    { name: "Workouts", current: 4, target: 5, unit: "sessions", trend: "stable" as const },
    { name: "Steps", current: 35000, target: 50000, unit: "steps", trend: "up" as const }
  ];
  
  const mockAchievements = [
    { id: "ach-1", title: "First Workout", description: "Complete your first exercise session", earnedDate: "2025-10-01", icon: "💪" },
    { id: "ach-2", title: "Week Warrior", description: "Complete 5 workouts in a week", earnedDate: "2025-10-07", icon: "🏆" },
    { id: "ach-3", title: "Consistency King", description: "Workout for 7 consecutive days", earnedDate: "2025-10-10", icon: "👑" }
  ];
  
  // Mock user profile for ExercisePlanBuilder
  const mockUserProfile = {
    age: 45,
    sex: "male",
    heightCm: 175,
    weightKg: 80,
    medicalConditions: ["hypertension"],
    mobilityLimitations: "none"
  };

  const handleStartWorkout = (workoutId: string) => {
    console.log("Starting workout:", workoutId);
    // In a real app, this would navigate to the workout screen
  };

  const handleViewPlan = () => {
    setActiveTab("plan");
  };

  const handleViewHistory = () => {
    console.log("Viewing exercise history");
  };
  
  const handleGeneratePlan = (preferences: any) => {
    console.log("Generating exercise plan with preferences:", preferences);
  };
  
  const handleReset = () => {
    console.log("Resetting exercise plan builder");
  };
  
  const handleSafetyCheckComplete = (assessment: any) => {
    console.log("Safety check complete:", assessment);
  };
  
  const handleExitSafetyCheck = () => {
    console.log("Exiting safety check");
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
          <h1 className="font-bold text-xl font-[family-name:var(--font-sans)]">Exercise & Fitness</h1>
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
            <Dumbbell className="h-4 w-4 mr-2" />
            Dashboard
          </Button>
          <Button
            variant={activeTab === "plan" ? "default" : "ghost"}
            className="flex-1"
            onClick={() => setActiveTab("plan")}
          >
            <Target className="h-4 w-4 mr-2" />
            My Plan
          </Button>
          <Button
            variant={activeTab === "safety" ? "default" : "ghost"}
            className="flex-1"
            onClick={() => setActiveTab("safety")}
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Safety Check
          </Button>
          <Button
            variant={activeTab === "demo" ? "default" : "ghost"}
            className="flex-1"
            onClick={() => setActiveTab("demo")}
          >
            <Play className="h-4 w-4 mr-2" />
            Demos
          </Button>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === "dashboard" && (
          <ExerciseHomeScreen
            currentPlan={mockCurrentPlan}
            todayWorkout={mockTodayWorkout}
            weeklyProgress={mockWeeklyProgress}
            achievements={mockAchievements}
            onStartWorkout={handleStartWorkout}
            onViewPlan={handleViewPlan}
            onViewHistory={handleViewHistory}
          />
        )}
        
        {activeTab === "plan" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">My Exercise Plan</h2>
              <p className="text-muted-foreground">Your personalized fitness program</p>
            </div>
            <ExercisePlanBuilder 
              userProfile={mockUserProfile}
              onGeneratePlan={handleGeneratePlan}
              onReset={handleReset}
            />
          </div>
        )}
        
        {activeTab === "safety" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">Pre-Exercise Safety Check</h2>
              <p className="text-muted-foreground">Complete these checks before starting your workout</p>
            </div>
            <PreExerciseSafetyChecks 
              userId="user-123"
              onSafetyCheckComplete={handleSafetyCheckComplete}
              onExit={handleExitSafetyCheck}
            />
          </div>
        )}
        
        {activeTab === "demo" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">Exercise Demonstrations</h2>
              <p className="text-muted-foreground">Learn proper form and technique</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ExerciseDemo 
                exercise={{
                  name: "Walking",
                  description: "Low-impact cardiovascular exercise",
                  duration: 30,
                  intensity: "low",
                  equipmentNeeded: [],
                  instructions: [
                    "Start with a 5-minute warm-up walk at a slow pace",
                    "Gradually increase your pace to a comfortable walking speed",
                    "Maintain good posture with your head up and shoulders relaxed",
                    "Swing your arms naturally at your sides",
                    "Cool down with a 5-minute slow walk"
                  ],
                  safetyNotes: [
                    "Wear comfortable, supportive shoes",
                    "Stay hydrated throughout your walk",
                    "Stop if you experience any chest pain or severe shortness of breath"
                  ]
                }}
              />
              <ExerciseDemo 
                exercise={{
                  name: "Bodyweight Squats",
                  description: "Strength exercise for legs and glutes",
                  duration: 15,
                  intensity: "moderate",
                  equipmentNeeded: [],
                  instructions: [
                    "Stand with your feet shoulder-width apart",
                    "Extend your arms straight out in front of you",
                    "Lower your body by bending your knees and pushing your hips back",
                    "Keep your chest up and back straight",
                    "Lower until your thighs are parallel to the floor",
                    "Push through your heels to return to the starting position"
                  ],
                  safetyNotes: [
                    "Keep your knees aligned with your toes",
                    "Don't let your knees cave inward",
                    "Stop if you feel pain in your knees or lower back"
                  ]
                }}
              />
            </div>
          </div>
        )}
      </main>
      
      <BottomNav />
    </div>
  );
}