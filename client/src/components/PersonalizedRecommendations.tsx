import { Lightbulb, Utensils, Dumbbell, Pill, Heart } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export interface Recommendation {
  id: string;
  category: "diet" | "exercise" | "medication" | "lifestyle" | "medical";
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  action?: string;
  deadline?: string;
}

interface PersonalizedRecommendationsProps {
  recommendations: Recommendation[];
}

export default function PersonalizedRecommendations({ recommendations }: PersonalizedRecommendationsProps) {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "diet": return <Utensils className="h-5 w-5" />;
      case "exercise": return <Dumbbell className="h-5 w-5" />;
      case "medication": return <Pill className="h-5 w-5" />;
      case "lifestyle": return <Heart className="h-5 w-5" />;
      case "medical": return <Heart className="h-5 w-5" />;
      default: return <Lightbulb className="h-5 w-5" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "diet": return "bg-blue-100 text-blue-800";
      case "exercise": return "bg-green-100 text-green-800";
      case "medication": return "bg-purple-100 text-purple-800";
      case "lifestyle": return "bg-yellow-100 text-yellow-800";
      case "medical": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "low": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-xl font-bold">Personalized Recommendations</h3>
        <p className="text-muted-foreground">
          Based on your risk factors and health profile
        </p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        {recommendations.map((rec) => (
          <Card key={rec.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-full ${getCategoryColor(rec.category)}`}>
                    {getCategoryIcon(rec.category)}
                  </div>
                  <CardTitle className="text-lg">{rec.title}</CardTitle>
                </div>
                <div className="flex gap-2">
                  <Badge className={getPriorityColor(rec.priority)}>
                    {rec.priority.charAt(0).toUpperCase() + rec.priority.slice(1)}
                  </Badge>
                  <Badge className={getCategoryColor(rec.category)}>
                    {rec.category.charAt(0).toUpperCase() + rec.category.slice(1)}
                  </Badge>
                </div>
              </div>
              {rec.deadline && (
                <CardDescription>
                  Due: {new Date(rec.deadline).toLocaleDateString()}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-3">{rec.description}</p>
              {rec.action && (
                <div className="flex justify-end">
                  <button className="text-sm font-medium text-primary hover:underline">
                    {rec.action}
                  </button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}