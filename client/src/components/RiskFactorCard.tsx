import { AlertTriangle, CheckCircle, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export interface RiskFactor {
  category: string;
  level: "low" | "moderate" | "high";
  value?: number | string;
  target?: number | string;
  recommendation: string;
  explanation?: string;
}

interface RiskFactorCardProps {
  factor: RiskFactor;
}

export default function RiskFactorCard({ factor }: RiskFactorCardProps) {
  const getLevelColor = (level: string) => {
    switch (level) {
      case "high": return "text-red-600 bg-red-100";
      case "moderate": return "text-yellow-600 bg-yellow-100";
      case "low": return "text-green-600 bg-green-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case "high": return <AlertTriangle className="h-5 w-5 text-red-600" />;
      case "moderate": return <Info className="h-5 w-5 text-yellow-600" />;
      case "low": return <CheckCircle className="h-5 w-5 text-green-600" />;
      default: return <Info className="h-5 w-5 text-gray-600" />;
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {getLevelIcon(factor.level)}
            <CardTitle className="text-lg">{factor.category}</CardTitle>
          </div>
          <Badge className={getLevelColor(factor.level)}>
            {factor.level.charAt(0).toUpperCase() + factor.level.slice(1)}
          </Badge>
        </div>
        {factor.value !== undefined && (
          <CardDescription>
            Current: {factor.value} {factor.target !== undefined && ` | Target: ${factor.target}`}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-3">{factor.recommendation}</p>
        {factor.explanation && (
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-xs">{factor.explanation}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}