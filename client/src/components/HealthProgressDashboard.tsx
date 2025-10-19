import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Trophy, Target, Flame, CheckCircle } from "lucide-react";

interface HealthGoal {
  id: string;
  title: string;
  category: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  isCompleted: boolean;
}

interface ChallengeParticipation {
  id: string;
  challengeTitle: string;
  progress: number;
  points: number;
  totalPoints: number;
  isCompleted: boolean;
}

interface HealthProgressDashboardProps {
  goals: HealthGoal[];
  challenges: ChallengeParticipation[];
}

const HealthProgressDashboard: React.FC<HealthProgressDashboardProps> = ({ goals, challenges }) => {
  // Calculate overall progress
  const totalGoals = goals.length;
  const completedGoals = goals.filter(goal => goal.isCompleted).length;
  const goalsProgress = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;
  
  const totalChallenges = challenges.length;
  const completedChallenges = challenges.filter(challenge => challenge.isCompleted).length;
  const challengesProgress = totalChallenges > 0 ? Math.round((completedChallenges / totalChallenges) * 100) : 0;

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

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Goals Progress Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Goals Progress
            </CardTitle>
            <CardDescription>
              Track your health goals completion
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>Overall Progress</span>
                <span>{goalsProgress}%</span>
              </div>
              <Progress value={goalsProgress} className="h-2" />
              <div className="text-right text-sm text-muted-foreground">
                {completedGoals} of {totalGoals} goals completed
              </div>
              
              <div className="space-y-3 mt-4">
                {goals.map(goal => {
                  const progress = goal.targetValue > 0 
                    ? Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100))
                    : 0;
                  
                  return (
                    <div key={goal.id} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span>{getCategoryIcon(goal.category)}</span>
                          <span className="font-medium">{goal.title}</span>
                        </div>
                        <span>{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-1.5" />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{goal.currentValue} {goal.unit}</span>
                        <span>{goal.targetValue} {goal.unit}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Challenges Progress Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Challenges Progress
            </CardTitle>
            <CardDescription>
              Track your weekly challenges completion
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>Overall Progress</span>
                <span>{challengesProgress}%</span>
              </div>
              <Progress value={challengesProgress} className="h-2" />
              <div className="text-right text-sm text-muted-foreground">
                {completedChallenges} of {totalChallenges} challenges completed
              </div>
              
              <div className="space-y-3 mt-4">
                {challenges.map(challenge => (
                  <div key={challenge.id} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{challenge.challengeTitle}</span>
                      <span>{challenge.progress}%</span>
                    </div>
                    <Progress value={challenge.progress} className="h-1.5" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        {challenge.isCompleted ? (
                          <CheckCircle className="h-3 w-3 text-green-500" />
                        ) : (
                          <Flame className="h-3 w-3 text-orange-500" />
                        )}
                        <span>{challenge.points}/{challenge.totalPoints} pts</span>
                      </div>
                      {challenge.isCompleted ? (
                        <Badge variant="default" className="h-4 text-xs">
                          Completed
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="h-4 text-xs">
                          In Progress
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Summary Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Health Progress Summary</CardTitle>
          <CardDescription>
            Your overall health journey progress
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 rounded-lg bg-blue-50">
              <div className="text-2xl font-bold">{totalGoals}</div>
              <div className="text-sm text-muted-foreground">Total Goals</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-green-50">
              <div className="text-2xl font-bold">{completedGoals}</div>
              <div className="text-sm text-muted-foreground">Goals Completed</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-purple-50">
              <div className="text-2xl font-bold">{totalChallenges}</div>
              <div className="text-sm text-muted-foreground">Total Challenges</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-orange-50">
              <div className="text-2xl font-bold">
                {challenges.reduce((sum, challenge) => sum + challenge.points, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Points Earned</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HealthProgressDashboard;