import { useState } from "react";
import { 
  Dumbbell, 
  Play, 
  Calendar, 
  TrendingUp, 
  Target, 
  Clock, 
  Flame,
  Award,
  BarChart3,
  User,
  CheckCircle
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

interface Workout {
  id: string;
  title: string;
  duration: number;
  intensity: "low" | "moderate" | "high";
  completed: boolean;
  scheduledTime: string;
}

interface ProgressMetric {
  name: string;
  current: number;
  target: number;
  unit: string;
  trend: "up" | "down" | "stable";
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  earnedDate: string;
  icon: string;
}

interface ExerciseHomeScreenProps {
  currentPlan: {
    id: string;
    name: string;
    level: string;
    durationWeeks: number;
    progress: number;
    startDate: string;
    endDate: string;
  };
  todayWorkout: Workout | null;
  weeklyProgress: ProgressMetric[];
  achievements: Achievement[];
  onStartWorkout: (workoutId: string) => void;
  onViewPlan: () => void;
  onViewHistory: () => void;
}

export default function ExerciseHomeScreen({ 
  currentPlan, 
  todayWorkout, 
  weeklyProgress, 
  achievements, 
  onStartWorkout, 
  onViewPlan, 
  onViewHistory 
}: ExerciseHomeScreenProps) {
  const [timeLeft, setTimeLeft] = useState<number>(5); // Countdown timer
  const [isStarting, setIsStarting] = useState<boolean>(false);

  const startWorkoutCountdown = () => {
    if (!todayWorkout) return;
    
    setIsStarting(true);
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          onStartWorkout(todayWorkout.id);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const getIntensityColor = (intensity: string) => {
    switch (intensity) {
      case "low": return "bg-green-100 text-green-800 border-green-200";
      case "moderate": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "high": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up": return <TrendingUp className="h-4 w-4 text-green-600" />;
      case "down": return <TrendingUp className="h-4 w-4 text-red-600 rotate-180" />;
      case "stable": return <div className="h-4 w-4 flex items-center justify-center text-muted-foreground">→</div>;
      default: return null;
    }
  };

  const getProgressColor = (percentage: number) => {
    if (percentage < 30) return "bg-red-500";
    if (percentage < 70) return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Dumbbell className="h-8 w-8" />
            Exercise Dashboard
          </h1>
          <p className="text-muted-foreground">Track your fitness journey and workouts</p>
        </div>
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>{new Date().toLocaleDateString()}</span>
        </div>
      </div>

      {/* Current Plan Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Current Exercise Plan
            </span>
            <Button variant="outline" size="sm" onClick={onViewPlan}>
              View Details
            </Button>
          </CardTitle>
          <CardDescription>Your personalized exercise program</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="font-medium">{currentPlan.name}</span>
                <span className="text-sm text-muted-foreground">
                  Week {Math.ceil((new Date().getTime() - new Date(currentPlan.startDate).getTime()) / (1000 * 60 * 60 * 24 * 7))} of {currentPlan.durationWeeks}
                </span>
              </div>
              <Progress 
                value={currentPlan.progress} 
                className={getProgressColor(currentPlan.progress)} 
              />
              <div className="flex justify-between text-sm text-muted-foreground mt-1">
                <span>Level: {currentPlan.level}</span>
                <span>{Math.round(currentPlan.progress)}% Complete</span>
              </div>
            </div>
            
            <Separator />
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-primary/5 rounded-lg">
                <div className="text-2xl font-bold">{currentPlan.durationWeeks}</div>
                <div className="text-sm text-muted-foreground">Weeks</div>
              </div>
              <div className="text-center p-3 bg-primary/5 rounded-lg">
                <div className="text-2xl font-bold">
                  {Math.ceil((new Date(currentPlan.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))}
                </div>
                <div className="text-sm text-muted-foreground">Days Left</div>
              </div>
              <div className="text-center p-3 bg-primary/5 rounded-lg">
                <div className="text-2xl font-bold">
                  {weeklyProgress.reduce((acc, metric) => acc + metric.current, 0)}
                </div>
                <div className="text-sm text-muted-foreground">Minutes</div>
              </div>
              <div className="text-center p-3 bg-primary/5 rounded-lg">
                <div className="text-2xl font-bold">
                  {achievements.length}
                </div>
                <div className="text-sm text-muted-foreground">Badges</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Today's Workout */}
      {todayWorkout ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="h-5 w-5" />
              Today's Workout
            </CardTitle>
            <CardDescription>Your scheduled exercise for today</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg border bg-card">
              <div className="flex-1">
                <h3 className="font-bold text-lg">{todayWorkout.title}</h3>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{todayWorkout.duration} mins</span>
                  </div>
                  <Badge className={getIntensityColor(todayWorkout.intensity)}>
                    {todayWorkout.intensity.charAt(0).toUpperCase() + todayWorkout.intensity.slice(1)}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  Scheduled for {todayWorkout.scheduledTime}
                </div>
              </div>
              
              {isStarting ? (
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">{timeLeft}</div>
                  <div className="text-sm text-muted-foreground">Starting...</div>
                </div>
              ) : (
                <Button 
                  size="lg" 
                  onClick={startWorkoutCountdown}
                  disabled={todayWorkout.completed}
                >
                  {todayWorkout.completed ? (
                    <>
                      <CheckCircle className="h-5 w-5 mr-2" />
                      Completed
                    </>
                  ) : (
                    <>
                      <Play className="h-5 w-5 mr-2" />
                      Start Workout
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <Dumbbell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-bold text-lg mb-2">No Workout Scheduled</h3>
            <p className="text-muted-foreground mb-4">
              You don't have a workout scheduled for today. Check your exercise plan or rest day.
            </p>
            <Button onClick={onViewPlan}>View Exercise Plan</Button>
          </CardContent>
        </Card>
      )}

      {/* Weekly Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Weekly Progress
          </CardTitle>
          <CardDescription>Your exercise metrics this week</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {weeklyProgress.map((metric, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{metric.name}</span>
                    {getTrendIcon(metric.trend)}
                  </div>
                  <span className="text-sm font-mono">
                    {metric.current} / {metric.target} {metric.unit}
                  </span>
                </div>
                <Progress 
                  value={(metric.current / metric.target) * 100} 
                  className={getProgressColor((metric.current / metric.target) * 100)} 
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Recent Achievements
          </CardTitle>
          <CardDescription>Your fitness milestones</CardDescription>
        </CardHeader>
        <CardContent>
          {achievements.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {achievements.slice(0, 3).map((achievement) => (
                <div 
                  key={achievement.id} 
                  className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent transition-colors"
                >
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-lg">
                    {achievement.icon}
                  </div>
                  <div>
                    <div className="font-medium">{achievement.title}</div>
                    <div className="text-sm text-muted-foreground">{achievement.description}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Earned {new Date(achievement.earnedDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium mb-2">No Achievements Yet</h3>
              <p className="text-sm text-muted-foreground">
                Complete workouts to earn badges and track your progress.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <Button variant="outline" onClick={onViewHistory}>
          <BarChart3 className="h-4 w-4 mr-2" />
          View History
        </Button>
        <Button variant="outline" onClick={onViewPlan}>
          <User className="h-4 w-4 mr-2" />
          My Plan
        </Button>
      </div>
    </div>
  );
}