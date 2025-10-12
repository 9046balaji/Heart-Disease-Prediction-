import { Activity, Clock, Target, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ExercisePlanCardProps {
  level: "beginner" | "intermediate" | "advanced";
  duration: number;
  exercises: string[];
  weeklyGoal: string;
}

export default function ExercisePlanCard({ level, duration, exercises, weeklyGoal }: ExercisePlanCardProps) {
  const levelColors = {
    beginner: "bg-health-green/10 text-health-green border-health-green/20",
    intermediate: "bg-health-amber/10 text-health-amber border-health-amber/20",
    advanced: "bg-primary/10 text-primary border-primary/20"
  };

  return (
    <Card className="hover-elevate" data-testid="card-exercise-plan">
      <CardHeader className="space-y-3 pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <CardTitle className="text-lg">Exercise Plan</CardTitle>
              <Badge variant="outline" className={levelColors[level]}>
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </Badge>
            </div>
            <CardDescription>Tailored for your cardiac risk profile</CardDescription>
          </div>
          <div className="p-2 rounded-lg bg-primary/10">
            <Activity className="h-5 w-5 text-primary" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className="border-health-amber/50 bg-health-amber/5">
          <AlertCircle className="h-4 w-4 text-health-amber" />
          <AlertDescription className="text-sm">
            Stop immediately if you experience chest pain, dizziness, or severe breathlessness
          </AlertDescription>
        </Alert>

        <div className="space-y-3">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">{duration} min/session</span>
            </div>
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">{weeklyGoal}</span>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-sm">This Week's Activities:</h4>
            <ul className="space-y-1.5">
              {exercises.map((exercise, index) => (
                <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>{exercise}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Button 
          className="w-full gap-2"
          onClick={() => console.log('Start exercise')}
          data-testid="button-start-exercise"
        >
          <Activity className="h-4 w-4" />
          Start Workout
        </Button>
      </CardContent>
    </Card>
  );
}
