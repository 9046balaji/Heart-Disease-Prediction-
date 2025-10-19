import { motion } from "framer-motion";
import { Utensils, Clock, Flame, Tag } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface AnimatedMealPlanCardProps {
  title: string;
  description: string;
  calories: number;
  prepTime: number;
  tags: string[];
  meals: string[];
  className?: string;
  onAddToPlan?: () => void;
}

export default function AnimatedMealPlanCard({ 
  title, 
  description, 
  calories, 
  prepTime, 
  tags, 
  meals,
  className,
  onAddToPlan
}: AnimatedMealPlanCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -5 }}
      className={className}
    >
      <Card className="h-full flex flex-col">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-medium">{title}</CardTitle>
            <Utensils className="h-5 w-5 text-muted-foreground" />
          </div>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="flex-1">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Flame className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{calories} cal</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{prepTime} min</span>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {tags.map((tag, index) => (
                <motion.div
                  key={tag}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                >
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Tag className="h-3 w-3" />
                    {tag}
                  </Badge>
                </motion.div>
              ))}
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Sample Meals</h4>
              <ul className="space-y-1">
                {meals.slice(0, 3).map((meal, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    className="text-sm text-muted-foreground flex items-start gap-2"
                  >
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                    {meal}
                  </motion.li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <motion.div whileTap={{ scale: 0.98 }} className="w-full">
            <Button 
              onClick={onAddToPlan}
              className="w-full"
            >
              Add to My Plan
            </Button>
          </motion.div>
        </CardFooter>
      </Card>
    </motion.div>
  );
}