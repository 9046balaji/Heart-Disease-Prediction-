import { useState } from "react";
import ClinicalDataForm from "@/components/ClinicalDataForm";
import RiskScoreCard from "@/components/RiskScoreCard";
import ShapExplanation from "@/components/ShapExplanation";
import MealPlanCard from "@/components/MealPlanCard";
import ExercisePlanCard from "@/components/ExercisePlanCard";
import RiskFactorCard from "@/components/RiskFactorCard";
import { apiRequest } from "@/lib/queryClient";
import { handleApiError, handleApiSuccess } from "@/lib/errorHandler";
import { toast } from "@/hooks/use-toast";
import BottomNav from "@/components/BottomNav";

interface PredictionResult {
  clinicalEntry: any;
  prediction: {
    score: number;
    label: string;
    model_version: string;
    shap_top_features: {
      feature: string;
      contribution: number;
      explanation: string;
    }[];
    riskFactors: {
      category: string;
      level: "low" | "moderate" | "high";
      recommendation: string;
    }[];
    lifestyleRecommendations: string[];
  };
  mealPlan: any;
  exercisePlan: any;
}

export default function Predict() {
  const [showResults, setShowResults] = useState(false);
  const [predictionData, setPredictionData] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(false);
  
  const handleFormSubmit = async (data: any) => {
    console.log("Form data:", data);
    
    setLoading(true);
    try {
      // Make API call to predict endpoint
      const response = await apiRequest("POST", "/api/predict", data);
      
      if (response.ok) {
        const result = await response.json();
        setPredictionData(result);
        setShowResults(true);
        handleApiSuccess("Prediction completed successfully!");
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error: any) {
      handleApiError(error, "Failed to make prediction. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Mock risk factors based on prediction data
  const mockRiskFactors = predictionData?.prediction.riskFactors || [
    {
      category: "Blood Pressure",
      level: "high",
      recommendation: "Work with your doctor to manage high blood pressure through medication, diet, and exercise."
    },
    {
      category: "Cholesterol",
      level: "moderate",
      recommendation: "Improve your diet by reducing saturated fats and increasing fiber intake."
    }
  ];

  // Mock lifestyle recommendations
  const mockRecommendations = predictionData?.prediction.lifestyleRecommendations || [
    "Aim for at least 150 minutes of moderate-intensity aerobic activity per week.",
    "Follow a Mediterranean-style diet rich in fruits, vegetables, and whole grains.",
    "Limit alcohol consumption to moderate levels (up to one drink per day for women, two for men)."
  ];

  // Transform SHAP features to include direction
  const transformShapFeatures = (features: any[]) => {
    return features.map(feature => ({
      ...feature,
      direction: feature.contribution >= 0 ? "positive" as const : "negative" as const
    }));
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="border-b bg-card/50 backdrop-blur sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="font-bold text-xl font-[family-name:var(--font-sans)]">Heart Disease Risk Assessment</h1>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        {!showResults ? (
          <div className="max-w-2xl mx-auto">
            <ClinicalDataForm onSubmit={handleFormSubmit} />
          </div>
        ) : (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-2xl font-bold">Your Risk Assessment</h2>
              <button
                onClick={() => setShowResults(false)}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                New Assessment
              </button>
            </div>
            
            {predictionData && (
              <>
                <RiskScoreCard 
                  score={predictionData.prediction.score * 100} 
                  category={predictionData.prediction.label as "low" | "medium" | "high"}
                  modelVersion={predictionData.prediction.model_version}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <ShapExplanation features={transformShapFeatures(predictionData.prediction.shap_top_features)} />
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-semibold mb-4">Key Risk Factors</h3>
                      <div className="space-y-4">
                        {mockRiskFactors.map((factor, index) => (
                          <RiskFactorCard key={index} factor={factor} />
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-semibold mb-4">Personalized Recommendations</h3>
                      <ul className="space-y-2">
                        {mockRecommendations.map((rec, index) => (
                          <li key={index} className="flex items-start">
                            <span className="text-primary mr-2">•</span>
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <MealPlanCard 
                    title={predictionData.mealPlan?.name || "Personalized Meal Plan"}
                    description={predictionData.mealPlan?.description || "A heart-healthy meal plan tailored to your risk factors"}
                    calories={predictionData.mealPlan?.calories || 1800}
                    prepTime={30}
                    tags={predictionData.mealPlan?.tags || ["heart-healthy", "balanced"]}
                    meals={predictionData.mealPlan?.meals || [
                      "Oatmeal with berries and nuts",
                      "Grilled salmon with quinoa and vegetables",
                      "Greek yogurt with fruit"
                    ]}
                  />
                  <ExercisePlanCard 
                    level={predictionData.exercisePlan?.level || "beginner"}
                    duration={predictionData.exercisePlan?.duration || 30}
                    exercises={predictionData.exercisePlan?.exercises || [
                      "30-minute brisk walk",
                      "15-minute stretching routine",
                      "Basic strength training"
                    ]}
                    weeklyGoal={predictionData.exercisePlan?.weeklyGoal || "150 minutes"}
                  />
                </div>
              </>
            )}
          </div>
        )}
      </main>
      
      <BottomNav />
    </div>
  );
}