import { useState, useEffect } from "react";
import { Trophy, Target, Calendar, Plus, Edit, Trash2, CheckCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface HealthGoal {
  id: string;
  title: string;
  description: string;
  category: "diet" | "exercise" | "medication" | "sleep" | "stress" | "other";
  targetValue: number;
  currentValue: number;
  unit: string;
  deadline?: string;
  isCompleted: boolean;
  completionDate?: string;
  createdAt: string;
  updatedAt: string;
}

interface GoalAchievement {
  id: string;
  title: string;
  description: string;
  badgeIcon: string;
  awardedDate: string;
}

export default function GoalTracking() {
  const { toast } = useToast();
  const [goals, setGoals] = useState<HealthGoal[]>([]);
  const [achievements, setAchievements] = useState<GoalAchievement[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSmallTargetDialogOpen, setIsSmallTargetDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "exercise" as "diet" | "exercise" | "medication" | "sleep" | "stress" | "other",
    targetValue: 0,
    unit: "",
    deadline: ""
  });
  
  const [smallTargetFormData, setSmallTargetFormData] = useState({
    title: "",
    description: "",
    category: "exercise" as "diet" | "exercise" | "medication" | "sleep" | "stress" | "other",
    targetValue: 1,
    unit: "times"
  });

  // Mock data - in a real app, this would come from an API
  useEffect(() => {
    // Simulate fetching goals
    const mockGoals: HealthGoal[] = [
      {
        id: "1",
        title: "Walk 10,000 steps daily",
        description: "Increase daily activity to improve cardiovascular health",
        category: "exercise",
        targetValue: 10000,
        currentValue: 7500,
        unit: "steps",
        deadline: "2025-12-31",
        isCompleted: false,
        createdAt: "2025-10-01T00:00:00Z",
        updatedAt: "2025-10-12T10:30:00Z"
      },
      {
        id: "2",
        title: "Reduce sodium intake",
        description: "Limit sodium to less than 2,300mg daily",
        category: "diet",
        targetValue: 2300,
        currentValue: 1800,
        unit: "mg",
        deadline: "2025-11-30",
        isCompleted: false,
        createdAt: "2025-10-05T00:00:00Z",
        updatedAt: "2025-10-12T09:15:00Z"
      },
      {
        id: "3",
        title: "Take medication on time",
        description: "Take prescribed heart medication daily without missing doses",
        category: "medication",
        targetValue: 30,
        currentValue: 28,
        unit: "days",
        deadline: "2025-10-31",
        isCompleted: false,
        createdAt: "2025-10-01T00:00:00Z",
        updatedAt: "2025-10-12T08:45:00Z"
      },
      {
        id: "4",
        title: "Achieve 7-8 hours of sleep",
        description: "Get quality sleep each night for better heart health",
        category: "sleep",
        targetValue: 30,
        currentValue: 30,
        unit: "days",
        deadline: "2025-10-31",
        isCompleted: true,
        completionDate: "2025-10-10T00:00:00Z",
        createdAt: "2025-09-01T00:00:00Z",
        updatedAt: "2025-10-10T00:00:00Z"
      }
    ];
    
    // Simulate fetching achievements
    const mockAchievements: GoalAchievement[] = [
      {
        id: "1",
        title: "Goal Achieved: Achieve 7-8 hours of sleep",
        description: 'You completed your goal "Achieve 7-8 hours of sleep"!',
        badgeIcon: "🏆",
        awardedDate: "2025-10-10T00:00:00Z"
      },
      {
        id: "2",
        title: "Consistency Champion",
        description: "You've tracked your health metrics for 7 consecutive days",
        badgeIcon: "🔥",
        awardedDate: "2025-10-08T00:00:00Z"
      }
    ];
    
    setGoals(mockGoals);
    setAchievements(mockAchievements);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.targetValue || !formData.unit) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }
    
    // In a real app, this would be an API call
    const newGoal: HealthGoal = {
      id: editingGoalId || Date.now().toString(),
      ...formData,
      currentValue: 0,
      isCompleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    if (isEditing && editingGoalId) {
      // Update existing goal
      setGoals(prev => prev.map(goal => 
        goal.id === editingGoalId ? { ...newGoal, currentValue: goal.currentValue } : goal
      ));
      toast({
        title: "Success",
        description: "Goal updated successfully"
      });
    } else {
      // Add new goal
      setGoals(prev => [...prev, newGoal]);
      toast({
        title: "Success",
        description: "Goal created successfully"
      });
    }
    
    // Reset form
    setFormData({
      title: "",
      description: "",
      category: "exercise",
      targetValue: 0,
      unit: "",
      deadline: ""
    });
    setIsDialogOpen(false);
    setIsEditing(false);
    setEditingGoalId(null);
  };

  const handleEdit = (goal: HealthGoal) => {
    setFormData({
      title: goal.title,
      description: goal.description,
      category: goal.category,
      targetValue: goal.targetValue,
      unit: goal.unit,
      deadline: goal.deadline || ""
    });
    
    setIsEditing(true);
    setEditingGoalId(goal.id);
    setIsDialogOpen(true);
  };

  const handleDelete = (goalId: string) => {
    setGoals(prev => prev.filter(goal => goal.id !== goalId));
    toast({
      title: "Success",
      description: "Goal deleted successfully"
    });
  };

  const handleUpdateProgress = (goalId: string, increment: number) => {
    setGoals(prev => prev.map(goal => {
      if (goal.id === goalId) {
        const newCurrentValue = Math.min(goal.currentValue + increment, goal.targetValue);
        const isCompleted = newCurrentValue >= goal.targetValue;
        
        // If goal is completed, add to achievements
        if (isCompleted && !goal.isCompleted) {
          const newAchievement: GoalAchievement = {
            id: Date.now().toString(),
            title: `Goal Achieved: ${goal.title}`,
            description: `You completed your goal "${goal.title}"!`,
            badgeIcon: "🏆",
            awardedDate: new Date().toISOString()
          };
          setAchievements(prev => [newAchievement, ...prev]);
          
          toast({
            title: "Congratulations!",
            description: `You've achieved your goal: ${goal.title}`
          });
        }
        
        return {
          ...goal,
          currentValue: newCurrentValue,
          isCompleted,
          completionDate: isCompleted ? new Date().toISOString() : goal.completionDate
        };
      }
      return goal;
    }));
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

  const progressPercentage = (current: number, target: number) => {
    return Math.min(100, Math.max(0, (current / target) * 100));
  };

  return (
    <Card className="hover-elevate">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Health Goals
            </CardTitle>
            <CardDescription>
              Set and track your health goals with progress tracking
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <div className="flex gap-2">
              <DialogTrigger asChild>
                <Button 
                  size="sm" 
                  onClick={() => {
                    setIsEditing(false);
                    setEditingGoalId(null);
                    setFormData({
                      title: "",
                      description: "",
                      category: "exercise",
                      targetValue: 0,
                      unit: "",
                      deadline: ""
                    });
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Goal
                </Button>
              </DialogTrigger>
              <Dialog open={isSmallTargetDialogOpen} onOpenChange={setIsSmallTargetDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => {
                      setSmallTargetFormData({
                        title: "",
                        description: "",
                        category: "exercise",
                        targetValue: 1,
                        unit: "times"
                      });
                    }}
                  >
                    <Target className="h-4 w-4 mr-2" />
                    Quick Target
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Add Small Target</DialogTitle>
                    <DialogDescription>
                      Create a quick, achievable target that can be completed in a short time
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    
                    if (!smallTargetFormData.title) {
                      toast({
                        title: "Error",
                        description: "Please enter a title for your small target",
                        variant: "destructive"
                      });
                      return;
                    }
                    
                    // In a real app, this would be an API call
                    const newGoal: HealthGoal = {
                      id: Date.now().toString(),
                      ...smallTargetFormData,
                      currentValue: 0,
                      isCompleted: false,
                      createdAt: new Date().toISOString(),
                      updatedAt: new Date().toISOString()
                    };
                    
                    setGoals(prev => [...prev, newGoal]);
                    toast({
                      title: "Success",
                      description: "Small target created successfully"
                    });
                    
                    setIsSmallTargetDialogOpen(false);
                  }} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="small-target-title">Target Title *</Label>
                      <Input
                        id="small-target-title"
                        value={smallTargetFormData.title}
                        onChange={(e) => setSmallTargetFormData(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="e.g., Take 20 min walk today"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="small-target-description">Description</Label>
                      <Textarea
                        id="small-target-description"
                        value={smallTargetFormData.description}
                        onChange={(e) => setSmallTargetFormData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Describe your small target..."
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="small-target-category">Category</Label>
                        <Select 
                          value={smallTargetFormData.category} 
                          onValueChange={(value) => setSmallTargetFormData(prev => ({ ...prev, category: value as any }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="diet">Diet & Nutrition</SelectItem>
                            <SelectItem value="exercise">Exercise & Fitness</SelectItem>
                            <SelectItem value="medication">Medication</SelectItem>
                            <SelectItem value="sleep">Sleep</SelectItem>
                            <SelectItem value="stress">Stress Management</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="small-target-unit">Unit</Label>
                        <Input
                          id="small-target-unit"
                          value={smallTargetFormData.unit}
                          onChange={(e) => setSmallTargetFormData(prev => ({ ...prev, unit: e.target.value }))}
                          placeholder="e.g., times, minutes"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="small-target-value">Target Value</Label>
                      <Input
                        id="small-target-value"
                        type="number"
                        min="1"
                        value={smallTargetFormData.targetValue}
                        onChange={(e) => setSmallTargetFormData(prev => ({ ...prev, targetValue: parseInt(e.target.value) || 1 }))}
                      />
                    </div>
                    
                    <div className="flex justify-end gap-2">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setIsSmallTargetDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit">
                        Create Small Target
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {isEditing ? "Edit Goal" : "Add New Goal"}
                </DialogTitle>
                <DialogDescription>
                  {isEditing ? "Update your health goal" : "Create a new health goal to track"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Goal Title *</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="e.g., Walk 10,000 steps daily"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Describe your goal..."
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select 
                      value={formData.category} 
                      onValueChange={(value) => handleSelectChange("category", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="diet">Diet & Nutrition</SelectItem>
                        <SelectItem value="exercise">Exercise & Fitness</SelectItem>
                        <SelectItem value="medication">Medication</SelectItem>
                        <SelectItem value="sleep">Sleep</SelectItem>
                        <SelectItem value="stress">Stress Management</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="unit">Unit *</Label>
                    <Input
                      id="unit"
                      name="unit"
                      value={formData.unit}
                      onChange={handleInputChange}
                      placeholder="e.g., steps, mg, days"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="targetValue">Target Value *</Label>
                    <Input
                      id="targetValue"
                      name="targetValue"
                      type="number"
                      value={formData.targetValue || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, targetValue: parseInt(e.target.value) || 0 }))}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="deadline">Deadline (Optional)</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="deadline"
                        name="deadline"
                        type="date"
                        value={formData.deadline}
                        onChange={handleInputChange}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    {isEditing ? "Update Goal" : "Create Goal"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {goals.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Target className="h-12 w-12 mx-auto mb-4" />
            <p>No health goals set yet</p>
            <p className="text-sm mt-2">Create your first goal to start tracking your progress</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-4">
              {goals.map(goal => (
                <div key={goal.id} className="p-4 rounded-lg border">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{goal.title}</h4>
                        <Badge variant="outline" className={getCategoryColor(goal.category)}>
                          {getCategoryIcon(goal.category)} {goal.category.charAt(0).toUpperCase() + goal.category.slice(1)}
                        </Badge>
                        {goal.isCompleted && (
                          <Badge variant="default" className="bg-green-500">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Completed
                          </Badge>
                        )}
                      </div>
                      {goal.description && (
                        <p className="text-sm text-muted-foreground">{goal.description}</p>
                      )}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress: {goal.currentValue} / {goal.targetValue} {goal.unit}</span>
                          <span>{Math.round(progressPercentage(goal.currentValue, goal.targetValue))}%</span>
                        </div>
                        <Progress 
                          value={progressPercentage(goal.currentValue, goal.targetValue)} 
                          className="h-2"
                        />
                      </div>
                      {goal.deadline && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <span>Deadline: {new Date(goal.deadline).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-1">
                      {!goal.isCompleted && (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleUpdateProgress(goal.id, Math.max(1, Math.floor(goal.targetValue * 0.1)))}
                        >
                          +{Math.max(1, Math.floor(goal.targetValue * 0.1))} {goal.unit}
                        </Button>
                      )}
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        onClick={() => handleEdit(goal)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        onClick={() => handleDelete(goal.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {achievements.length > 0 && (
              <div className="space-y-4 pt-4 border-t">
                <h4 className="font-medium flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  Recent Achievements
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {achievements.slice(0, 4).map(achievement => (
                    <div key={achievement.id} className="p-3 rounded-lg bg-yellow-50 border border-yellow-200 flex items-start gap-3">
                      <span className="text-2xl">{achievement.badgeIcon}</span>
                      <div>
                        <h5 className="font-medium text-sm">{achievement.title}</h5>
                        <p className="text-xs text-muted-foreground mt-1">{achievement.description}</p>
                        <p className="text-xs text-yellow-700 mt-1">
                          Awarded {new Date(achievement.awardedDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}