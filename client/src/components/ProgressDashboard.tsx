import React from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart, 
  LineChart, 
  PieChart, 
  Bar, 
  Line, 
  Pie, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Cell
} from "recharts";
import { 
  Activity, 
  Dumbbell, 
  Apple, 
  Flame, 
  Target, 
  TrendingUp, 
  Calendar,
  Award
} from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

interface ExerciseDataPoint {
  date: string;
  duration: number;
  calories: number;
  intensity: "low" | "moderate" | "high";
}

interface NutritionDataPoint {
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface GoalProgress {
  id: string;
  title: string;
  category: "exercise" | "nutrition" | "medication" | "sleep";
  targetValue: number;
  currentValue: number;
  unit: string;
  isCompleted: boolean;
  progress: number;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  earnedDate: string;
  icon: string;
}

interface ProgressDashboardProps {
  exerciseData: ExerciseDataPoint[];
  nutritionData: NutritionDataPoint[];
  goalProgress: GoalProgress[];
  achievements: Achievement[];
  weeklyStats: {
    workoutsCompleted: number;
    totalWorkoutTime: number;
    caloriesBurned: number;
    mealsLogged: number;
    avgCalories: number;
  };
}

const ProgressDashboard: React.FC<ProgressDashboardProps> = ({ 
  exerciseData, 
  nutritionData, 
  goalProgress, 
  achievements,
  weeklyStats 
}) => {
  // Calculate overall progress
  const totalGoals = goalProgress.length;
  const completedGoals = goalProgress.filter(goal => goal.isCompleted).length;
  const overallProgress = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;

  // Prepare data for charts
  const exerciseChartData = exerciseData.map(item => ({
    ...item,
    date: new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' })
  }));

  const nutritionChartData = nutritionData.map(item => ({
    ...item,
    date: new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' })
  }));

  // Prepare data for pie chart (goal categories)
  const goalCategoryData = goalProgress.reduce((acc, goal) => {
    const existing = acc.find(item => item.category === goal.category);
    if (existing) {
      existing.count += 1;
      existing.completed += goal.isCompleted ? 1 : 0;
    } else {
      acc.push({
        category: goal.category,
        count: 1,
        completed: goal.isCompleted ? 1 : 0
      });
    }
    return acc;
  }, [] as { category: string; count: number; completed: number }[]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "exercise": return "bg-green-100 text-green-800";
      case "nutrition": return "bg-blue-100 text-blue-800";
      case "medication": return "bg-purple-100 text-purple-800";
      case "sleep": return "bg-indigo-100 text-indigo-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "exercise": return <Dumbbell className="h-4 w-4" />;
      case "nutrition": return <Apple className="h-4 w-4" />;
      case "medication": return <Activity className="h-4 w-4" />;
      case "sleep": return <Calendar className="h-4 w-4" />;
      default: return <Target className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <TrendingUp className="h-8 w-8" />
          Progress Dashboard
        </h1>
        <p className="text-muted-foreground">
          Track your health and fitness journey with detailed analytics
        </p>
      </div>

      {/* Weekly Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{weeklyStats.workoutsCompleted}</div>
            <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
              <Dumbbell className="h-3 w-3" />
              Workouts
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{weeklyStats.totalWorkoutTime}m</div>
            <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
              <Activity className="h-3 w-3" />
              Active Time
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{weeklyStats.caloriesBurned}</div>
            <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
              <Flame className="h-3 w-3" />
              Calories
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{weeklyStats.mealsLogged}</div>
            <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
              <Apple className="h-3 w-3" />
              Meals
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{weeklyStats.avgCalories}</div>
            <div className="text-sm text-muted-foreground">
              Avg Calories
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Exercise Progress Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Weekly Exercise Progress
            </CardTitle>
            <CardDescription>
              Duration and calories burned per workout
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={exerciseChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="duration" name="Duration (min)" fill="#8884d8" />
                  <Bar dataKey="calories" name="Calories Burned" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Nutrition Progress Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Apple className="h-5 w-5" />
              Weekly Nutrition Tracking
            </CardTitle>
            <CardDescription>
              Daily calorie and macronutrient intake
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={nutritionChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="calories" 
                    name="Calories" 
                    stroke="#8884d8" 
                    strokeWidth={2} 
                    dot={{ r: 4 }} 
                    activeDot={{ r: 6 }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="protein" 
                    name="Protein (g)" 
                    stroke="#82ca9d" 
                    strokeWidth={2} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="carbs" 
                    name="Carbs (g)" 
                    stroke="#ffc658" 
                    strokeWidth={2} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="fat" 
                    name="Fat (g)" 
                    stroke="#ff7300" 
                    strokeWidth={2} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Goals Progress Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Goals by Category
            </CardTitle>
            <CardDescription>
              Distribution of goals across categories
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={goalCategoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                    nameKey="category"
                    label={({ category, count }) => `${category}: ${count}`}
                  >
                    {goalCategoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Overall Progress Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Overall Progress
            </CardTitle>
            <CardDescription>
              Your health journey progress
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="font-medium">Overall Completion</span>
                <span className="font-bold">{overallProgress}%</span>
              </div>
              <Progress value={overallProgress} className="h-3" />
              <div className="text-sm text-muted-foreground">
                {completedGoals} of {totalGoals} goals completed
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Goal Progress by Category</h4>
              <div className="space-y-3">
                {goalProgress.map((goal) => (
                  <div key={goal.id} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getCategoryIcon(goal.category)}
                        <span className="text-sm">{goal.title}</span>
                      </div>
                      <Badge className={getCategoryColor(goal.category)} variant="secondary">
                        {goal.progress}%
                      </Badge>
                    </div>
                    <Progress value={goal.progress} className="h-1.5" />
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Achievements Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Recent Achievements
          </CardTitle>
          <CardDescription>
            Milestones you've reached in your health journey
          </CardDescription>
        </CardHeader>
        <CardContent>
          {achievements.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {achievements.slice(0, 4).map((achievement) => (
                <div 
                  key={achievement.id} 
                  className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent transition-colors"
                >
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-lg">
                    {achievement.icon}
                  </div>
                  <div>
                    <div className="font-medium text-sm">{achievement.title}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {new Date(achievement.earnedDate).toLocaleDateString()}
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
                Complete goals and workouts to earn badges and track your progress.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProgressDashboard;