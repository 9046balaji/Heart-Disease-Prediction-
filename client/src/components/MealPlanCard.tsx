import { Apple, Clock, Flame } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface MealPlanCardProps {
  title: string;
  description: string;
  calories: number;
  prepTime: number;
  tags: string[];
  meals: string[];
}

export default function MealPlanCard({ title, description, calories, prepTime, tags, meals }: MealPlanCardProps) {
  return (
    <Card className="hover-elevate" data-testid="card-meal-plan">
      <CardHeader className="space-y-3 pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <CardTitle className="text-lg">{title}</CardTitle>
            <CardDescription className="mt-1">{description}</CardDescription>
          </div>
          <div className="p-2 rounded-lg bg-health-green/10">
            <Apple className="h-5 w-5 text-health-green" />
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Flame className="h-4 w-4" />
            <span>{calories} kcal</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{prepTime} min</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>

        <div className="space-y-2">
          <h4 className="font-semibold text-sm">Sample Meals:</h4>
          <ul className="space-y-1.5">
            {meals.map((meal, index) => (
              <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>{meal}</span>
              </li>
            ))}
          </ul>
        </div>

        <Button 
          className="w-full gap-2" 
          variant="outline"
          onClick={() => console.log('View full meal plan')}
          data-testid="button-view-meal-plan"
        >
          View Full Plan
        </Button>
      </CardContent>
    </Card>
  );
}
