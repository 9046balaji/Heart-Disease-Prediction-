import { motion } from "framer-motion";
import { Info, TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";

interface ShapFeature {
  feature: string;
  contribution: number;
  explanation: string;
}

interface AnimatedShapExplanationProps {
  features: ShapFeature[];
  className?: string;
}

export default function AnimatedShapExplanation({ 
  features, 
  className 
}: AnimatedShapExplanationProps) {
  // Format feature names for display
  const formatFeatureName = (feature: string) => {
    return feature
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  // Get color based on contribution
  const getContributionColor = (contribution: number) => {
    if (contribution > 0) return "bg-red-100 text-red-800 hover:bg-red-200";
    if (contribution < 0) return "bg-green-100 text-green-800 hover:bg-green-200";
    return "bg-gray-100 text-gray-800 hover:bg-gray-200";
  };

  // Get icon based on contribution
  const getContributionIcon = (contribution: number) => {
    if (contribution > 0) return <TrendingUp className="h-4 w-4" />;
    if (contribution < 0) return <TrendingDown className="h-4 w-4" />;
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className={className}
    >
      <Card className="h-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">Key Risk Factors</CardTitle>
          <CardDescription>Top contributors to your risk score</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {features.map((feature, index) => (
              <motion.div
                key={feature.feature}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
              >
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-start gap-3">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-medium">
                          {index + 1}
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-sm">
                              {formatFeatureName(feature.feature)}
                            </span>
                            <Badge 
                              className={`${getContributionColor(feature.contribution)} transition-colors`}
                            >
                              <div className="flex items-center gap-1">
                                {getContributionIcon(feature.contribution)}
                                <span>
                                  {feature.contribution > 0 ? '+' : ''}{feature.contribution.toFixed(2)}
                                </span>
                              </div>
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {feature.explanation}
                          </p>
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent 
                      side="top" 
                      className="max-w-xs text-sm"
                      collisionPadding={10}
                    >
                      <div className="flex items-start gap-2">
                        <Info className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <p>{feature.explanation}</p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </motion.div>
            ))}
          </div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-4 pt-4 border-t border-muted"
          >
            <p className="text-xs text-muted-foreground">
              These factors were identified as the most significant contributors to your risk score 
              using SHAP (SHapley Additive exPlanations) analysis.
            </p>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}