import { Activity, Heart, Droplets, Scale, Target } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface HealthMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  target: number;
  previousValue?: number;
  icon: "heart" | "activity" | "droplets" | "scale" | "target";
  status: "improving" | "declining" | "stable";
  trend: "up" | "down" | "stable";
}

interface HealthMetricsProps {
  metrics: HealthMetric[];
}

export default function HealthMetrics({ metrics }: HealthMetricsProps) {
  const getIcon = (icon: string) => {
    switch (icon) {
      case "heart": return <Heart className="h-5 w-5" />;
      case "activity": return <Activity className="h-5 w-5" />;
      case "droplets": return <Droplets className="h-5 w-5" />;
      case "scale": return <Scale className="h-5 w-5" />;
      case "target": return <Target className="h-5 w-5" />;
      default: return <Activity className="h-5 w-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "improving": return "text-green-600";
      case "declining": return "text-red-600";
      case "stable": return "text-blue-600";
      default: return "text-gray-600";
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up": return <span className="text-red-600">↑</span>;
      case "down": return <span className="text-green-600">↓</span>;
      case "stable": return <span className="text-blue-600">→</span>;
      default: return <span className="text-gray-600">→</span>;
    }
  };

  const calculateProgress = (value: number, target: number) => {
    // For metrics where lower is better (like blood pressure, cholesterol)
    if (value <= target) {
      return 100;
    }
    
    // For metrics where higher is better (like exercise minutes)
    if (target === 0) {
      return Math.min(100, value);
    }
    
    // Calculate percentage progress toward target
    const progress = Math.max(0, Math.min(100, (target / value) * 100));
    return progress;
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-xl font-bold">Health Metrics</h3>
        <p className="text-muted-foreground">
          Track your progress toward health goals
        </p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {metrics.map((metric) => (
          <Card key={metric.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-full bg-primary/10">
                    {getIcon(metric.icon)}
                  </div>
                  <CardTitle className="text-lg">{metric.name}</CardTitle>
                </div>
                <div className={`flex items-center gap-1 ${getStatusColor(metric.status)}`}>
                  {getTrendIcon(metric.trend)}
                  <span className="text-sm font-medium">
                    {metric.status.charAt(0).toUpperCase() + metric.status.slice(1)}
                  </span>
                </div>
              </div>
              <CardDescription>
                {metric.value} {metric.unit} {metric.previousValue !== undefined && (
                  <span className="ml-1">
                    (was {metric.previousValue} {metric.unit})
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress toward target</span>
                  <span>{Math.round(calculateProgress(metric.value, metric.target))}%</span>
                </div>
                <Progress 
                  value={calculateProgress(metric.value, metric.target)} 
                  className="h-2" 
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Target: {metric.target} {metric.unit}</span>
                  <span>{Math.abs(metric.value - metric.target)} {metric.unit} to go</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}