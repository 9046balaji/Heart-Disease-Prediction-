import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Lightbulb, Clock, User, Heart, BookOpen, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { authenticatedFetch } from "@/utils/auth";

interface HealthTip {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  difficulty: "beginner" | "intermediate" | "advanced";
  estimatedTime: number;
  createdAt: string;
  updatedAt: string;
}

export default function MicroLessonViewer() {
  const { toast } = useToast();
  const [dailyTip, setDailyTip] = useState<HealthTip | null>(null);
  const [allTips, setAllTips] = useState<HealthTip[]>([]);
  const [personalizedTips, setPersonalizedTips] = useState<HealthTip[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("daily");

  // Fetch tips on component mount
  useEffect(() => {
    fetchAllTips();
    fetchDailyTip();
    fetchPersonalizedTips();
  }, []);

  const fetchDailyTip = async () => {
    try {
      const response = await authenticatedFetch('/api/tips/daily');
      if (response.ok) {
        const result = await response.json();
        setDailyTip(result.data);
      }
    } catch (error) {
      console.error("Error fetching daily tip:", error);
      toast({
        title: "Error",
        description: "Failed to fetch daily tip",
        variant: "destructive"
      });
    }
  };

  const fetchAllTips = async () => {
    try {
      setLoading(true);
      const response = await authenticatedFetch('/api/tips');
      if (response.ok) {
        const result = await response.json();
        setAllTips(result.data || []);
      }
    } catch (error) {
      console.error("Error fetching tips:", error);
      toast({
        title: "Error",
        description: "Failed to fetch tips",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPersonalizedTips = async () => {
    try {
      const response = await authenticatedFetch('/api/tips/personalized');
      if (response.ok) {
        const result = await response.json();
        setPersonalizedTips(result.data || []);
      }
    } catch (error) {
      console.error("Error fetching personalized tips:", error);
      toast({
        title: "Error",
        description: "Failed to fetch personalized tips",
        variant: "destructive"
      });
    }
  };

  const markTipAsCompleted = async (tipId: string) => {
    try {
      const response = await authenticatedFetch(`/api/tips/${tipId}/interaction`, {
        method: 'POST',
        body: JSON.stringify({ completed: true, completionDate: new Date().toISOString() })
      });
      
      if (response.ok) {
        toast({
          title: "Success",
          description: "Tip marked as completed!"
        });
        
        // Refresh daily tip if it was the one completed
        if (dailyTip?.id === tipId) {
          fetchDailyTip();
        }
        
        // Refresh personalized tips
        fetchPersonalizedTips();
      }
    } catch (error) {
      console.error("Error marking tip as completed:", error);
      toast({
        title: "Error",
        description: "Failed to mark tip as completed",
        variant: "destructive"
      });
    }
  };

  const getTipsByCategory = (category: string) => {
    return allTips.filter(tip => tip.category === category);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner": return "bg-green-100 text-green-800";
      case "intermediate": return "bg-yellow-100 text-yellow-800";
      case "advanced": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "diet": return "🥗";
      case "exercise": return "🏃";
      case "medication": return "💊";
      case "stress": return "🧘";
      case "sleep": return "😴";
      default: return "💡";
    }
  };

  const renderTipCard = (tip: HealthTip, isCompleted = false) => (
    <Card key={tip.id} className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <span>{getCategoryIcon(tip.category)}</span>
              {tip.title}
            </CardTitle>
            <CardDescription className="mt-1">
              {tip.category.charAt(0).toUpperCase() + tip.category.slice(1)}
            </CardDescription>
          </div>
          {isCompleted && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              Completed
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4">{tip.content}</p>
        
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge variant="outline" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {tip.estimatedTime} min
          </Badge>
          <Badge className={getDifficultyColor(tip.difficulty)}>
            {tip.difficulty}
          </Badge>
          {tip.tags.map(tag => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>
        
        {!isCompleted && (
          <Button onClick={() => markTipAsCompleted(tip.id)} size="sm">
            Mark as Completed
          </Button>
        )}
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2">Loading tips...</span>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5" />
          Micro-lessons & Daily Tips
        </CardTitle>
        <CardDescription>
          Quick, actionable health tips to improve your heart health
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="daily" className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Daily Tip
            </TabsTrigger>
            <TabsTrigger value="personalized" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              For You
            </TabsTrigger>
            <TabsTrigger value="all" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              All Tips
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="daily" className="mt-6">
            {dailyTip ? (
              renderTipCard(dailyTip)
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Lightbulb className="h-12 w-12 mx-auto mb-4" />
                <p>No daily tip available at the moment.</p>
                <p className="text-sm mt-2">Check back later for new tips!</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="personalized" className="mt-6">
            <ScrollArea className="h-[500px] pr-4">
              {personalizedTips.length > 0 ? (
                personalizedTips.map(tip => renderTipCard(tip))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <User className="h-12 w-12 mx-auto mb-4" />
                  <p>No personalized tips available yet.</p>
                  <p className="text-sm mt-2">Complete some tips to get personalized recommendations!</p>
                </div>
              )}
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="all" className="mt-6">
            <ScrollArea className="h-[500px] pr-4">
              {allTips.length > 0 ? (
                allTips.map(tip => renderTipCard(tip))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <BookOpen className="h-12 w-12 mx-auto mb-4" />
                  <p>No tips available at the moment.</p>
                  <p className="text-sm mt-2">Check back later for new content!</p>
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}