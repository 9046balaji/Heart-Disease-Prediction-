import { TrendingUp, TrendingDown, Info } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ShapFeature {
  feature: string;
  contribution: number;
  direction: "positive" | "negative";
  explanation: string;
}

interface ShapExplanationProps {
  features: ShapFeature[];
}

export default function ShapExplanation({ features }: ShapExplanationProps) {
  return (
    <Card data-testid="card-shap-explanation">
      <CardHeader className="space-y-1 pb-4">
        <CardTitle className="text-xl">Top Contributing Factors</CardTitle>
        <CardDescription>
          Features that most influenced your risk assessment
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {features.map((feature, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {feature.direction === "positive" ? (
                  <TrendingUp className="h-4 w-4 text-risk-high" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-risk-low" />
                )}
                <span className="font-medium text-sm">{feature.feature}</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-3.5 w-3.5 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p className="text-sm">{feature.explanation}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <span className="text-sm font-mono text-muted-foreground">
                {feature.contribution > 0 ? "+" : ""}{feature.contribution}%
              </span>
            </div>
            <div className="relative">
              <Progress 
                value={Math.abs(feature.contribution)} 
                className={`h-2 ${feature.direction === "positive" ? "[&>div]:bg-risk-high" : "[&>div]:bg-risk-low"}`}
                data-testid={`progress-shap-${index}`}
              />
            </div>
          </div>
        ))}

        <div className="pt-4 mt-4 border-t space-y-3">
          <h4 className="font-semibold text-sm">What This Means</h4>
          <div className="grid gap-2">
            <div className="flex items-start gap-2 text-sm">
              <TrendingUp className="h-4 w-4 text-risk-high mt-0.5" />
              <p className="text-muted-foreground">
                <span className="text-risk-high font-medium">Positive contributions</span> increase your risk
              </p>
            </div>
            <div className="flex items-start gap-2 text-sm">
              <TrendingDown className="h-4 w-4 text-risk-low mt-0.5" />
              <p className="text-muted-foreground">
                <span className="text-risk-low font-medium">Negative contributions</span> decrease your risk
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
