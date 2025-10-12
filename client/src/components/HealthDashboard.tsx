import { Activity, Heart, TrendingUp, Calendar } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface VitalSign {
  name: string;
  value: string;
  unit: string;
  status: "normal" | "warning" | "alert";
  trend: "up" | "down" | "stable";
}

interface HealthDashboardProps {
  vitals: VitalSign[];
  lastUpdated: string;
}

export default function HealthDashboard({ vitals, lastUpdated }: HealthDashboardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "normal": return "text-health-green";
      case "warning": return "text-health-amber";
      case "alert": return "text-risk-high";
      default: return "text-muted-foreground";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "normal": return <Badge variant="outline" className="bg-health-green/10 text-health-green border-health-green/20">Normal</Badge>;
      case "warning": return <Badge variant="outline" className="bg-health-amber/10 text-health-amber border-health-amber/20">Monitor</Badge>;
      case "alert": return <Badge variant="outline" className="bg-risk-high/10 text-risk-high border-risk-high/20">Alert</Badge>;
      default: return null;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up": return <TrendingUp className="h-4 w-4 text-risk-high" />;
      case "down": return <TrendingUp className="h-4 w-4 text-health-green rotate-180" />;
      case "stable": return <div className="h-4 w-4 flex items-center justify-center text-muted-foreground">→</div>;
      default: return null;
    }
  };

  return (
    <Card data-testid="card-health-dashboard">
      <CardHeader className="space-y-1 pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Health Dashboard
          </CardTitle>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            <span>{lastUpdated}</span>
          </div>
        </div>
        <CardDescription>Track your vital signs and health metrics</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {vitals.map((vital, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 rounded-lg border bg-card hover-elevate"
              data-testid={`vital-${index}`}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Heart className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="font-medium text-sm">{vital.name}</div>
                  <div className={`text-lg font-mono font-semibold ${getStatusColor(vital.status)}`}>
                    {vital.value} <span className="text-sm text-muted-foreground">{vital.unit}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {getTrendIcon(vital.trend)}
                {getStatusBadge(vital.status)}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">Tip:</strong> Regular monitoring helps identify trends early. Log your vitals at the same time each day for accurate tracking.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
