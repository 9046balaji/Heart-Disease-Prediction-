import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import ClinicalDataForm from "@/components/ClinicalDataForm";
import RiskScoreCard from "@/components/RiskScoreCard";
import ShapExplanation from "@/components/ShapExplanation";
import MealPlanCard from "@/components/MealPlanCard";
import ExercisePlanCard from "@/components/ExercisePlanCard";
import EmergencyButton from "@/components/EmergencyButton";
import ThemeToggle from "@/components/ThemeToggle";

export default function Predict() {
  const [showResults, setShowResults] = useState(false);
  
  // Mock data - in real app, this would come from API
  const mockShapFeatures = [
    {
      feature: "Systolic Blood Pressure",
      contribution: 15.2,
      direction: "positive" as const,
      explanation: "Your blood pressure of 160 mmHg is elevated. High blood pressure is a major risk factor for heart disease."
    },
    {
      feature: "Age",
      contribution: 12.8,
      direction: "positive" as const,
      explanation: "Age is a non-modifiable risk factor. Cardiovascular risk naturally increases with age."
    },
    {
      feature: "Cholesterol Level",
      contribution: -8.5,
      direction: "negative" as const,
      explanation: "Your cholesterol level is within the healthy range, which helps reduce cardiovascular risk."
    }
  ];

  const handleFormSubmit = (data: any) => {
    console.log("Form data:", data);
    // Simulate API call
    setTimeout(() => {
      setShowResults(true);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <EmergencyButton />
      
      <header className="border-b bg-card/50 backdrop-blur sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2" data-testid="button-back">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </Link>
          <h1 className="font-bold text-xl font-[family-name:var(--font-sans)]">Risk Assessment</h1>
          <ThemeToggle />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {!showResults ? (
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold font-[family-name:var(--font-sans)]">
                Clinical Data Entry
              </h2>
              <p className="text-muted-foreground">
                Please provide your health information for accurate risk assessment
              </p>
            </div>
            <ClinicalDataForm onSubmit={handleFormSubmit} />
          </div>
        ) : (
          <div className="space-y-8">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold font-[family-name:var(--font-sans)]">
                Your Risk Assessment Results
              </h2>
              <p className="text-muted-foreground">
                Based on your clinical data, here's your personalized risk analysis
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              <RiskScoreCard score={55} category="medium" />
              <ShapExplanation features={mockShapFeatures} />
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-bold font-[family-name:var(--font-sans)]">
                Personalized Recommendations
              </h3>
              <p className="text-muted-foreground">
                Based on your risk factors, here are tailored lifestyle suggestions
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              <MealPlanCard
                title="Heart-Healthy DASH Diet"
                description="Low-sodium meal plan designed for cardiovascular health"
                calories={1800}
                prepTime={30}
                tags={["Low Sodium", "High Fiber"]}
                meals={[
                  "Oat porridge with berries and flaxseed",
                  "Grilled salmon with quinoa",
                  "Mixed bean salad",
                  "Greek yogurt with almonds"
                ]}
              />
              <ExercisePlanCard
                level="beginner"
                duration={15}
                weeklyGoal="3x per week"
                exercises={[
                  "Day 1: 10-minute brisk walk",
                  "Day 2: Gentle stretching",
                  "Day 3: 15-minute walk",
                  "Day 4: Rest day"
                ]}
              />
            </div>

            <div className="flex gap-4">
              <Button 
                variant="outline" 
                onClick={() => setShowResults(false)}
                data-testid="button-new-assessment"
              >
                New Assessment
              </Button>
              <Link href="/health">
                <Button data-testid="button-view-dashboard">
                  View Health Dashboard
                </Button>
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
