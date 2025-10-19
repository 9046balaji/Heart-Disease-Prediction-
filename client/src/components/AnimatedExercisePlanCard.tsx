import { motion } from "framer-motion";
import { Dumbbell, Clock, Target, Shield } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface AnimatedExercisePlanCardProps {
  level: "beginner" | "intermediate" | "advanced";
  duration: number;
  weeklyGoal: string;
  exercises: string[];
  className?: string;
  onStartWorkout?: () => void;
}

export default function AnimatedExercisePlanCard({ 
  level, 
  duration, 
  weeklyGoal, 
  exercises,
  className,
  onStartWorkout
}: AnimatedExercisePlanCardProps) {
  // Get level color
  const getLevelColor = () => {
    switch (level) {
      case "beginner": return "bg-green-100 text-green-800";
      case "intermediate": return "bg-yellow-100 text-yellow-800";
      case "advanced": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  // Get level icon
  const getLevelIcon = () => {
    switch (level) {
      case "beginner": return <Shield className="h-4 w-4" />;
      case "intermediate": return <Target className="h-4 w-4" />;
      case "advanced": return <Dumbbell className="h-4 w-4" />;
      default: return <Dumbbell className="h-4 w-4" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      whileHover={{ y: -5 }}
      className={className}
    >
      <Card className="h-full flex flex-col">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-medium">Exercise Plan</CardTitle>
            <Dumbbell className="h-5 w-5 text-muted-foreground" />
          </div>
          <CardDescription>{level.charAt(0).toUpperCase() + level.slice(1)} level fitness program</CardDescription>
        </CardHeader>
        <CardContent className="flex-1">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{duration} min/session</span>
              </div>
              <Badge className={getLevelColor()}>
                <div className="flex items-center gap-1">
                  {getLevelIcon()}
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </div>
              </Badge>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Weekly Goal</h4>
              <p className="text-sm text-muted-foreground">{weeklyGoal}</p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Sample Exercises</h4>
              <ul className="space-y-2">
                {exercises.slice(0, 4).map((exercise, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="text-sm flex items-start gap-2"
                  >
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                    <span>{exercise}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="p-3 rounded-lg bg-muted/50 border"
            >
              <div className="flex items-start gap-2">
                <Shield className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-xs text-muted-foreground">
                  Always warm up before exercising and cool down afterward. Stop immediately if you experience chest pain, dizziness, or severe breathlessness.
                </p>
              </div>
            </motion.div>
          </div>
        </CardContent>
        <CardFooter>
          <motion.div whileTap={{ scale: 0.98 }} className="w-full">
            <Button 
              onClick={onStartWorkout}
              className="w-full"
            >
              Start Workout
            </Button>
          </motion.div>
        </CardFooter>
      </Card>
    </motion.div>
  );
}