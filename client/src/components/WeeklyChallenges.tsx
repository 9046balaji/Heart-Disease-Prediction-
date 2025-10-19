import { useState, useEffect } from "react";
import { Trophy, Target, Calendar, Plus, CheckCircle, Flame } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface WeeklyChallenge {
  id: string;
  title: string;
  description: string;
  category: "diet" | "exercise" | "medication" | "sleep" | "stress" | "other";
  difficulty: "beginner" | "intermediate" | "advanced";
  points: number;
  durationDays: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
}

interface UserChallengeParticipation {
  id: string;
  userId: string;
  challengeId: string;
  startDate: string;
  completionDate?: string;
  isCompleted: boolean;
  progress: number;
  earnedPoints: number;
  createdAt: string;
}

export default function WeeklyChallenges() {
  const { toast } = useToast();
  const [challenges, setChallenges] = useState<WeeklyChallenge[]>([]);
  const [participations, setParticipations] = useState<UserChallengeParticipation[]>([]);
  const [activeTab, setActiveTab] = useState<"available" | "myChallenges">("available");

  // Mock data - in a real app, this would come from an API
  useEffect(() => {
    // Simulate fetching challenges
    const mockChallenges: WeeklyChallenge[] = [
      {
        id: "1",
        title: "10,000 Steps Daily",
        description: "Walk at least 10,000 steps every day for a week",
        category: "exercise",
        difficulty: "beginner",
        points: 50,
        durationDays: 7,
        startDate: "2025-10-15T00:00:00Z",
        endDate: "2025-10-22T00:00:00Z",
        isActive: true,
        createdAt: "2025-10-10T00:00:00Z"
      },
      {
        id: "2",
        title: "Heart-Healthy Eating",
        description: "Follow a heart-healthy diet for 5 days straight",
        category: "diet",
        difficulty: "intermediate",
        points: 75,
        durationDays: 5,
        startDate: "2025-10-15T00:00:00Z",
        endDate: "2025-10-20T00:00:00Z",
        isActive: true,
        createdAt: "2025-10-10T00:00:00Z"
      },
      {
        id: "3",
        title: "Stress Management",
        description: "Practice stress management techniques daily for a week",
        category: "stress",
        difficulty: "beginner",
        points: 40,
        durationDays: 7,
        startDate: "2025-10-15T00:00:00Z",
        endDate: "2025-10-22T00:00:00Z",
        isActive: true,
        createdAt: "2025-10-10T00:00:00Z"
      }
    ];
    
    // Simulate fetching user participations
    const mockParticipations: UserChallengeParticipation[] = [
      {
        id: "1",
        userId: "user1",
        challengeId: "1",
        startDate: "2025-10-15T00:00:00Z",
        completionDate: undefined,
        isCompleted: false,
        progress: 43,
        earnedPoints: 0,
        createdAt: "2025-10-15T00:00:00Z"
      }
    ];
    
    setChallenges(mockChallenges);
    setParticipations(mockParticipations);
  }, []);

  const handleJoinChallenge = (challengeId: string) => {
    // In a real app, this would be an API call
    const challenge = challenges.find(c => c.id === challengeId);
    if (!challenge) return;
    
    const newParticipation: UserChallengeParticipation = {
      id: Date.now().toString(),
      userId: "user1",
      challengeId,
      startDate: new Date().toISOString(),
      completionDate: undefined,
      isCompleted: false,
      progress: 0,
      earnedPoints: 0,
      createdAt: new Date().toISOString()
    };
    
    setParticipations(prev => [...prev, newParticipation]);
    toast({
      title: "Success",
      description: `You've joined the "${challenge.title}" challenge!`
    });
  };

  const handleUpdateProgress = (participationId: string, increment: number) => {
    setParticipations(prev => prev.map(p => {
      if (p.id === participationId) {
        const newProgress = Math.min(100, p.progress + increment);
        const isCompleted = newProgress >= 100;
        
        // If challenge is completed, show toast
        if (isCompleted && !p.isCompleted) {
          const challenge = challenges.find(c => c.id === p.challengeId);
          toast({
            title: "Congratulations!",
            description: `You've completed the "${challenge?.title}" challenge and earned ${challenge?.points} points!`
          });
        }
        
        return {
          ...p,
          progress: newProgress,
          isCompleted,
          completionDate: isCompleted ? new Date().toISOString() : p.completionDate
        };
      }
      return p;
    }));
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner": return "bg-green-100 text-green-800";
      case "intermediate": return "bg-yellow-100 text-yellow-800";
      case "advanced": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "diet": return "bg-blue-100 text-blue-800";
      case "exercise": return "bg-green-100 text-green-800";
      case "medication": return "bg-purple-100 text-purple-800";
      case "sleep": return "bg-indigo-100 text-indigo-800";
      case "stress": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "diet": return "🥗";
      case "exercise": return "🏃";
      case "medication": return "💊";
      case "sleep": return "😴";
      case "stress": return "🧘";
      default: return "⭐";
    }
  };

  const getActiveChallenges = () => {
    return challenges.filter(challenge => challenge.isActive);
  };

  const getMyChallenges = () => {
    return participations.map(participation => {
      const challenge = challenges.find(c => c.id === participation.challengeId);
      return { ...participation, challenge };
    }).filter(item => item.challenge);
  };

  return (
    <Card className="hover-elevate">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Weekly Challenges
            </CardTitle>
            <CardDescription>
              Participate in weekly challenges to earn points and improve your health
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button 
              variant={activeTab === "available" ? "default" : "outline"} 
              size="sm"
              onClick={() => setActiveTab("available")}
            >
              Available Challenges
            </Button>
            <Button 
              variant={activeTab === "myChallenges" ? "default" : "outline"} 
              size="sm"
              onClick={() => setActiveTab("myChallenges")}
            >
              My Challenges
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {activeTab === "available" ? (
          <div className="space-y-4">
            {getActiveChallenges().length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Target className="h-12 w-12 mx-auto mb-4" />
                <p>No active challenges available</p>
                <p className="text-sm mt-2">Check back later for new challenges</p>
              </div>
            ) : (
              getActiveChallenges().map(challenge => (
                <div key={challenge.id} className="p-4 rounded-lg border">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{challenge.title}</h4>
                        <Badge variant="outline" className={getCategoryColor(challenge.category)}>
                          {getCategoryIcon(challenge.category)} {challenge.category.charAt(0).toUpperCase() + challenge.category.slice(1)}
                        </Badge>
                        <Badge variant="outline" className={getDifficultyColor(challenge.difficulty)}>
                          {challenge.difficulty.charAt(0).toUpperCase() + challenge.difficulty.slice(1)}
                        </Badge>
                        <Badge variant="secondary">
                          <Trophy className="h-3 w-3 mr-1" />
                          {challenge.points} pts
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{challenge.description}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{challenge.durationDays} days</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Flame className="h-4 w-4" />
                          <span>Starts {new Date(challenge.startDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      onClick={() => handleJoinChallenge(challenge.id)}
                      disabled={participations.some(p => p.challengeId === challenge.id)}
                    >
                      {participations.some(p => p.challengeId === challenge.id) ? "Joined" : "Join Challenge"}
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {getMyChallenges().length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Target className="h-12 w-12 mx-auto mb-4" />
                <p>You haven't joined any challenges yet</p>
                <p className="text-sm mt-2">Join a challenge to start tracking your progress</p>
                <Button className="mt-4" onClick={() => setActiveTab("available")}>
                  Browse Challenges
                </Button>
              </div>
            ) : (
              getMyChallenges().map(({ challenge, ...participation }) => (
                <div key={participation.id} className="p-4 rounded-lg border">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{challenge?.title}</h4>
                        {participation.isCompleted ? (
                          <Badge variant="default" className="bg-green-500">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Completed
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            <Flame className="h-3 w-3 mr-1" />
                            In Progress
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{challenge?.description}</p>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress: {participation.progress}%</span>
                          <span>{participation.earnedPoints}/{challenge?.points} points</span>
                        </div>
                        <Progress 
                          value={participation.progress} 
                          className="h-2"
                        />
                      </div>
                      {!participation.isCompleted && (
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleUpdateProgress(participation.id, 10)}
                          >
                            +10% Progress
                          </Button>
                          <Button 
                            size="sm" 
                            onClick={() => handleUpdateProgress(participation.id, 100)}
                          >
                            Mark Complete
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}