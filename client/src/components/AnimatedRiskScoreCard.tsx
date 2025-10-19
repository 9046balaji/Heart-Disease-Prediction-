import { motion } from "framer-motion";
import { Heart, TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface AnimatedRiskScoreCardProps {
  score: number;
  category: "low" | "medium" | "high";
  previousScore?: number;
  className?: string;
}

export default function AnimatedRiskScoreCard({ 
  score, 
  category, 
  previousScore,
  className 
}: AnimatedRiskScoreCardProps) {
  // Determine color based on risk category
  const getRiskColor = () => {
    switch (category) {
      case "high": return "text-red-500";
      case "medium": return "text-yellow-500";
      case "low": return "text-green-500";
      default: return "text-gray-500";
    }
  };

  // Determine background color based on risk category
  const getRiskBgColor = () => {
    switch (category) {
      case "high": return "bg-red-50 border-red-200";
      case "medium": return "bg-yellow-50 border-yellow-200";
      case "low": return "bg-green-50 border-green-200";
      default: return "bg-gray-50 border-gray-200";
    }
  };

  // Determine trend
  const getTrend = () => {
    if (previousScore === undefined) return null;
    if (score > previousScore) return "up";
    if (score < previousScore) return "down";
    return "same";
  };

  const trend = getTrend();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={className}
    >
      <Card className={`${getRiskBgColor()} transition-all duration-300 hover:shadow-lg`}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-medium">Risk Score</CardTitle>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ 
                type: "spring", 
                stiffness: 260, 
                damping: 20,
                delay: 0.2
              }}
            >
              <Heart className={`h-5 w-5 ${getRiskColor()}`} />
            </motion.div>
          </div>
          <CardDescription>Your cardiovascular risk assessment</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-end justify-between">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ 
                type: "spring", 
                stiffness: 300, 
                damping: 15,
                delay: 0.4
              }}
              className="flex items-baseline gap-1"
            >
              <span className={`text-3xl font-bold ${getRiskColor()}`}>
                {score}
              </span>
              <span className="text-muted-foreground">/100</span>
            </motion.div>
            
            {trend && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                className="flex items-center gap-1"
              >
                {trend === "up" ? (
                  <TrendingUp className="h-4 w-4 text-red-500" />
                ) : trend === "down" ? (
                  <TrendingDown className="h-4 w-4 text-green-500" />
                ) : null}
                <span className="text-xs text-muted-foreground">
                  {trend === "up" 
                    ? `+${(score - previousScore!).toFixed(1)}` 
                    : trend === "down" 
                    ? `-${(previousScore! - score).toFixed(1)}` 
                    : "No change"}
                </span>
              </motion.div>
            )}
          </div>
          
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 1, delay: 0.8 }}
            className="mt-4 h-2 w-full rounded-full bg-muted"
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${score}%` }}
              transition={{ 
                duration: 1.2, 
                delay: 1,
                type: "spring",
                stiffness: 100
              }}
              className={`h-full rounded-full ${
                category === "high" 
                  ? "bg-red-500" 
                  : category === "medium" 
                  ? "bg-yellow-500" 
                  : "bg-green-500"
              }`}
            />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="mt-3"
          >
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
              category === "high" 
                ? "bg-red-100 text-red-800" 
                : category === "medium" 
                ? "bg-yellow-100 text-yellow-800" 
                : "bg-green-100 text-green-800"
            }`}>
              {category.charAt(0).toUpperCase() + category.slice(1)} Risk
            </span>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}