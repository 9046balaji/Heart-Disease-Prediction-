import { AlertTriangle, CheckCircle, Info } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface RiskScoreCardProps {
  score: number;
  category: "low" | "medium" | "high";
  modelVersion?: string;
}

export default function RiskScoreCard({ score, category, modelVersion = "v1.0.2" }: RiskScoreCardProps) {
  const getRiskColor = () => {
    switch (category) {
      case "low": return "text-risk-low";
      case "medium": return "text-risk-medium";
      case "high": return "text-risk-high";
      default: return "text-foreground";
    }
  };

  const getRiskBgColor = () => {
    switch (category) {
      case "low": return "bg-risk-low/10 border-risk-low/20";
      case "medium": return "bg-risk-medium/10 border-risk-medium/20";
      case "high": return "bg-risk-high/10 border-risk-high/20";
      default: return "bg-muted";
    }
  };

  const getRiskIcon = () => {
    switch (category) {
      case "low": return <CheckCircle className="h-8 w-8 text-risk-low" />;
      case "medium": return <Info className="h-8 w-8 text-risk-medium" />;
      case "high": return <AlertTriangle className="h-8 w-8 text-risk-high" />;
      default: return null;
    }
  };

  return (
    <Card className="border-2" data-testid="card-risk-score">
      <CardHeader className="space-y-3 pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">Your Risk Assessment</CardTitle>
          <Badge variant="outline" className="text-xs">
            Model {modelVersion}
          </Badge>
        </div>
        <CardDescription>
          AI-powered prediction based on your clinical data
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className={`flex items-center justify-center p-8 rounded-2xl border-2 ${getRiskBgColor()}`}>
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              {getRiskIcon()}
            </div>
            <div>
              <div className={`font-mono text-5xl font-semibold ${getRiskColor()}`} data-testid="text-risk-score">
                {score}%
              </div>
              <p className="text-sm text-muted-foreground mt-2">Risk Score</p>
            </div>
            <Badge 
              variant="outline" 
              className={`${getRiskColor()} border-current text-base px-4 py-1`}
              data-testid="badge-risk-category"
            >
              {category.toUpperCase()} RISK
            </Badge>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Risk Level</span>
            <span className="font-medium">{score}%</span>
          </div>
          <Progress 
            value={score} 
            className="h-3"
            data-testid="progress-risk"
          />
          <div className="flex justify-between text-xs text-muted-foreground pt-1">
            <span>Low</span>
            <span>Medium</span>
            <span>High</span>
          </div>
        </div>

        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground text-center">
            This assessment is for informational purposes only. Consult a healthcare professional for medical advice.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
