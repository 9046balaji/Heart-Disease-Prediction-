import React, { useState, useEffect } from "react";
import { 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Heart, 
  Activity,
  User,
  Clock,
  FileText
} from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Alert, 
  AlertDescription, 
  AlertTitle 
} from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

interface SafetyQuestion {
  id: string;
  question: string;
  type: "boolean" | "text";
  required: boolean;
}

interface SafetyCheckResponse {
  questionId: string;
  answer: boolean | string;
}

interface SafetyAssessment {
  riskLevel: "low" | "moderate" | "high";
  recommendations: string[];
  approved: boolean;
}

interface PreExerciseSafetyChecksProps {
  userId: string;
  exercisePlanId?: string;
  onSafetyCheckComplete?: (assessment: SafetyAssessment) => void;
  onExit?: () => void;
}

const PreExerciseSafetyChecks: React.FC<PreExerciseSafetyChecksProps> = ({ 
  userId,
  exercisePlanId,
  onSafetyCheckComplete,
  onExit
}) => {
  const [questions, setQuestions] = useState<SafetyQuestion[]>([]);
  const [responses, setResponses] = useState<Record<string, boolean | string>>({});
  const [assessment, setAssessment] = useState<SafetyAssessment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Simulate fetching safety questions from API
  useEffect(() => {
    const fetchSafetyQuestions = async () => {
      try {
        setIsLoading(true);
        // In a real app, this would be an API call
        // const response = await fetch(`/api/exercise/safety-requirements/${exercisePlanId}?userId=${userId}`);
        // const data = await response.json();
        // setQuestions(data.safetyQuestions);
        
        // Simulated data for demo
        const mockQuestions: SafetyQuestion[] = [
          {
            id: "feelingWell",
            question: "Are you feeling well today?",
            type: "boolean",
            required: true
          },
          {
            id: "chestPain",
            question: "Do you have chest pain or discomfort?",
            type: "boolean",
            required: true
          },
          {
            id: "dizziness",
            question: "Do you feel dizzy or lightheaded?",
            type: "boolean",
            required: true
          },
          {
            id: "jointPain",
            question: "Do you have any joint or muscle pain that might affect your exercise?",
            type: "boolean",
            required: true
          },
          {
            id: "medicationTaken",
            question: "Have you taken your medication as prescribed today?",
            type: "boolean",
            required: true
          },
          {
            id: "notes",
            question: "Any additional notes or concerns?",
            type: "text",
            required: false
          }
        ];
        
        setQuestions(mockQuestions);
        
        // Initialize responses
        const initialResponses: Record<string, boolean | string> = {};
        mockQuestions.forEach(question => {
          if (question.type === "boolean") {
            initialResponses[question.id] = false;
          } else {
            initialResponses[question.id] = "";
          }
        });
        setResponses(initialResponses);
      } catch (err) {
        setError("Failed to load safety questions");
        console.error("Error fetching safety questions:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSafetyQuestions();
  }, [userId, exercisePlanId]);

  const handleResponseChange = (questionId: string, value: boolean | string) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      // Validate required questions
      const requiredQuestions = questions.filter(q => q.required);
      for (const question of requiredQuestions) {
        if (question.type === "boolean" && responses[question.id] === undefined) {
          setError(`Please answer: ${question.question}`);
          return;
        }
        if (question.type === "text" && !responses[question.id] && question.required) {
          setError(`Please answer: ${question.question}`);
          return;
        }
      }
      
      setIsSubmitting(true);
      setError(null);
      
      // In a real app, this would be an API call
      // const response = await fetch('/api/exercise/safety-check', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ 
      //     userId, 
      //     exercisePlanId, 
      //     answers: responses 
      //   })
      // });
      // const data = await response.json();
      // setAssessment(data.assessment);
      
      // Simulate assessment based on responses
      const chestPain = responses.chestPain as boolean;
      const dizziness = responses.dizziness as boolean;
      const feelingWell = responses.feelingWell as boolean;
      const jointPain = responses.jointPain as boolean;
      const medicationTaken = responses.medicationTaken as boolean;
      
      let riskLevel: "low" | "moderate" | "high" = "low";
      let approved = true;
      const recommendations: string[] = [];
      
      // Check for immediate stop conditions (high risk)
      if (chestPain) {
        riskLevel = "high";
        approved = false;
        recommendations.push("STOP EXERCISE IMMEDIATELY: Chest pain is a serious warning sign. Seek medical attention right away.");
      }
      
      if (dizziness) {
        riskLevel = "high";
        approved = false;
        recommendations.push("STOP EXERCISE IMMEDIATELY: Dizziness can lead to falls or other injuries. Rest and seek medical attention if symptoms persist.");
      }
      
      // Check for moderate risk conditions
      if (feelingWell === false && riskLevel !== "high") {
        riskLevel = "moderate";
        recommendations.push("You're not feeling well today. Consider postponing exercise until you feel better.");
      }
      
      if (jointPain && riskLevel !== "high") {
        riskLevel = "moderate";
        recommendations.push("Joint or muscle pain may affect your exercise. Consider modifying the intensity or type of exercise.");
      }
      
      if (medicationTaken === false && riskLevel !== "high") {
        riskLevel = "moderate";
        recommendations.push("Missed medication may affect your exercise response. Consider consulting with your healthcare provider.");
      }
      
      // If no issues, provide positive feedback
      if (riskLevel === "low" && recommendations.length === 0) {
        recommendations.push("You're cleared for exercise! Remember to stay hydrated and listen to your body.");
      }
      
      const assessmentResult: SafetyAssessment = {
        riskLevel,
        recommendations,
        approved
      };
      
      setAssessment(assessmentResult);
      onSafetyCheckComplete?.(assessmentResult);
    } catch (err) {
      setError("Failed to submit safety check");
      console.error("Error submitting safety check:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel) {
      case "low": return "bg-green-100 text-green-800 border-green-200";
      case "moderate": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "high": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getRiskLevelIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case "low": return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "moderate": return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case "high": return <XCircle className="h-5 w-5 text-red-600" />;
      default: return <AlertTriangle className="h-5 w-5 text-gray-600" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (assessment) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Activity className="h-8 w-8" />
            Safety Check Complete
          </h1>
          <p className="text-muted-foreground">
            Your pre-exercise safety assessment results
          </p>
        </div>

        {/* Assessment Result */}
        <Card className={assessment.approved ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {assessment.approved ? (
                <CheckCircle className="h-6 w-6 text-green-600" />
              ) : (
                <XCircle className="h-6 w-6 text-red-600" />
              )}
              {assessment.approved ? "Cleared for Exercise" : "Exercise Not Recommended"}
            </CardTitle>
            <CardDescription>
              Based on your safety check responses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Risk Level</h4>
                <Badge className={getRiskLevelColor(assessment.riskLevel)}>
                  <div className="flex items-center gap-1">
                    {getRiskLevelIcon(assessment.riskLevel)}
                    {assessment.riskLevel.charAt(0).toUpperCase() + assessment.riskLevel.slice(1)}
                  </div>
                </Badge>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Recommendations</h4>
                <ul className="space-y-2">
                  {assessment.recommendations.map((rec, index) => (
                    <li key={index} className="flex gap-2">
                      {assessment.riskLevel === "high" ? (
                        <XCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                      ) : assessment.riskLevel === "moderate" ? (
                        <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                      ) : (
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      )}
                      <span className="text-sm">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <Separator />
              
              <div className="flex gap-3">
                {assessment.approved ? (
                  <Button 
                    className="flex-1"
                    onClick={() => onSafetyCheckComplete?.(assessment)}
                  >
                    <Activity className="h-4 w-4 mr-2" />
                    Start Exercise
                  </Button>
                ) : (
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={onExit}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Exit Safety Check
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary of Responses */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Your Responses
            </CardTitle>
            <CardDescription>
              Summary of your safety check answers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {questions.map((question) => (
                <div key={question.id} className="flex items-start gap-3">
                  <div className="mt-1">
                    {responses[question.id] !== undefined && responses[question.id] !== "" ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">{question.question}</h4>
                    <p className="text-sm text-muted-foreground">
                      {question.type === "boolean" 
                        ? responses[question.id] ? "Yes" : "No" 
                        : responses[question.id] || "No response"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Heart className="h-8 w-8 text-red-600" />
          Pre-Exercise Safety Check
        </h1>
        <p className="text-muted-foreground">
          Please answer the following questions to ensure your safety during exercise
        </p>
      </div>

      {/* Important Notice */}
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Important</AlertTitle>
        <AlertDescription>
          If you experience chest pain, severe dizziness, or shortness of breath, stop exercising immediately and seek medical attention.
        </AlertDescription>
      </Alert>

      {/* Safety Questions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Health Screening Questions
          </CardTitle>
          <CardDescription>
            Answer all questions honestly to ensure your safety
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {questions.map((question) => (
            <div key={question.id} className="space-y-3">
              <Label 
                htmlFor={question.id} 
                className={question.required ? "after:content-['*'] after:text-red-500 after:ml-1" : ""}
              >
                {question.question}
              </Label>
              
              {question.type === "boolean" ? (
                <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id={`${question.id}-yes`}
                      checked={responses[question.id] === true}
                      onCheckedChange={() => handleResponseChange(question.id, true)}
                    />
                    <Label htmlFor={`${question.id}-yes`}>Yes</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id={`${question.id}-no`}
                      checked={responses[question.id] === false}
                      onCheckedChange={() => handleResponseChange(question.id, false)}
                    />
                    <Label htmlFor={`${question.id}-no`}>No</Label>
                  </div>
                </div>
              ) : (
                <Textarea
                  id={question.id}
                  value={responses[question.id] as string || ""}
                  onChange={(e) => handleResponseChange(question.id, e.target.value)}
                  placeholder="Enter any additional notes or concerns..."
                />
              )}
            </div>
          ))}
          
          <Separator />
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              variant="outline" 
              onClick={onExit}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Checking...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Complete Safety Check
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Safety Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Safety Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <span>Always warm up before exercising and cool down afterward</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <span>Stay hydrated before, during, and after exercise</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <span>Listen to your body and stop if you feel pain or discomfort</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <span>Exercise in a safe environment with proper equipment</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default PreExerciseSafetyChecks;