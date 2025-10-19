import { ArrowLeft, Dumbbell, Utensils } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import HealthDashboard from "@/components/HealthDashboard";
import MedicationReminder from "@/components/MedicationReminder";
import EmergencyButton from "@/components/EmergencyButton";
import ThemeToggle from "@/components/ThemeToggle";
import RiskTrendChart from "@/components/RiskTrendChart";
import RiskFactorCard from "@/components/RiskFactorCard";
import PersonalizedRecommendations from "@/components/PersonalizedRecommendations";
import HealthMetrics from "@/components/HealthMetrics";
import TeleConsultBooking from "@/components/TeleConsultBooking";
import GoalTracking from "@/components/GoalTracking";
import WeeklyChallenges from "@/components/WeeklyChallenges";
import BottomNav from "@/components/BottomNav";
import { useEffect, useState } from "react";

export default function Health() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      setIsAuthenticated(!!token);
    };
    
    // Initial check
    checkAuth();
    
    // Listen for storage changes (e.g., login/logout in other tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'token') {
        checkAuth();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Cleanup listener
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Mock data for the components
  const mockVitals = [
    {
      name: "Blood Pressure",
      value: "128/82",
      unit: "mmHg",
      status: "warning" as const,
      trend: "up" as const
    },
    {
      name: "Heart Rate",
      value: "72",
      unit: "bpm",
      status: "normal" as const,
      trend: "stable" as const
    },
    {
      name: "Cholesterol",
      value: "195",
      unit: "mg/dL",
      status: "normal" as const,
      trend: "down" as const
    },
    {
      name: "Blood Glucose",
      value: "105",
      unit: "mg/dL",
      status: "normal" as const,
      trend: "stable" as const
    }
  ];

  // Mock historical data for charts
  const mockVitalHistory = [
    { date: "2025-01-01", "Blood Pressure": 130, "Heart Rate": 75, "Cholesterol": 200, "Blood Glucose": 110 },
    { date: "2025-02-01", "Blood Pressure": 132, "Heart Rate": 73, "Cholesterol": 198, "Blood Glucose": 108 },
    { date: "2025-03-01", "Blood Pressure": 128, "Heart Rate": 72, "Cholesterol": 195, "Blood Glucose": 105 },
    { date: "2025-04-01", "Blood Pressure": 126, "Heart Rate": 70, "Cholesterol": 193, "Blood Glucose": 103 },
    { date: "2025-05-01", "Blood Pressure": 128, "Heart Rate": 72, "Cholesterol": 195, "Blood Glucose": 105 },
    { date: "2025-06-01", "Blood Pressure": 125, "Heart Rate": 69, "Cholesterol": 192, "Blood Glucose": 102 },
    { date: "2025-07-01", "Blood Pressure": 128, "Heart Rate": 72, "Cholesterol": 195, "Blood Glucose": 105 },
  ];

  // Mock risk trend data
  const mockRiskTrendData = [
    { date: "2025-01-01", riskScore: 65, bloodPressure: 130, cholesterol: 200 },
    { date: "2025-02-01", riskScore: 62, bloodPressure: 132, cholesterol: 198 },
    { date: "2025-03-01", riskScore: 58, bloodPressure: 128, cholesterol: 195 },
    { date: "2025-04-01", riskScore: 55, bloodPressure: 126, cholesterol: 193 },
    { date: "2025-05-01", riskScore: 52, bloodPressure: 128, cholesterol: 195 },
    { date: "2025-06-01", riskScore: 48, bloodPressure: 125, cholesterol: 192 },
    { date: "2025-07-01", riskScore: 45, bloodPressure: 128, cholesterol: 195 },
  ];

  // Mock risk factors
  const mockRiskFactors = [
    {
      category: "Blood Pressure",
      level: "moderate" as const,
      value: "128/82",
      target: "<130/80",
      recommendation: "Continue monitoring and maintain current medication regimen. Reduce sodium intake.",
      explanation: "Your systolic pressure is slightly elevated but manageable with lifestyle changes."
    },
    {
      category: "Cholesterol",
      level: "low" as const,
      value: 195,
      target: "<200",
      recommendation: "Maintain your healthy diet and regular exercise routine.",
      explanation: "Your cholesterol levels are within a healthy range."
    },
    {
      category: "Physical Activity",
      level: "high" as const,
      value: "12,500",
      target: "10,000+",
      recommendation: "Continue your excellent activity level. Consider adding strength training twice per week.",
      explanation: "You're exceeding the recommended daily step count."
    }
  ];

  // Mock personalized recommendations
  const mockRecommendations = [
    {
      id: "1",
      category: "diet" as const,
      title: "Reduce Sodium Intake",
      description: "Limit sodium to less than 2,300mg daily to help manage blood pressure.",
      priority: "high" as const,
      action: "View low-sodium recipes"
    },
    {
      id: "2",
      category: "exercise" as const,
      title: "Add Strength Training",
      description: "Incorporate two strength training sessions per week to improve overall cardiovascular health.",
      priority: "medium" as const,
      action: "View exercise plan"
    },
    {
      id: "3",
      category: "lifestyle" as const,
      title: "Improve Sleep Quality",
      description: "Aim for 7-9 hours of quality sleep each night to support heart health.",
      priority: "medium" as const,
      action: "Sleep hygiene tips"
    }
  ];

  // Mock health metrics
  const mockHealthMetrics = [
    {
      id: "1",
      name: "Blood Pressure",
      value: 128,
      unit: "mmHg",
      target: 130,
      previousValue: 132,
      icon: "heart" as const,
      status: "improving" as const,
      trend: "down" as const
    },
    {
      id: "2",
      name: "Daily Steps",
      value: 8500,
      unit: "steps",
      target: 10000,
      previousValue: 7800,
      icon: "activity" as const,
      status: "improving" as const,
      trend: "up" as const
    },
    {
      id: "3",
      name: "Cholesterol",
      value: 195,
      unit: "mg/dL",
      target: 200,
      previousValue: 205,
      icon: "droplets" as const,
      status: "improving" as const,
      trend: "down" as const
    }
  ];

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
          <h1 className="font-bold text-xl font-[family-name:var(--font-sans)]">Health Tracking</h1>
          <ThemeToggle />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-12">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold font-[family-name:var(--font-sans)]">
            Your Health Dashboard
          </h2>
          <p className="text-muted-foreground">
            Monitor your vital signs, track your progress, and receive personalized recommendations
          </p>
        </div>

        {!isAuthenticated ? (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <div className="max-w-md space-y-4">
              <h3 className="text-xl font-semibold">Authentication Required</h3>
              <p className="text-muted-foreground">
                Please sign in to access your health dashboard and personalized health data.
              </p>
              <div className="flex gap-2 justify-center">
                <Link href="/login">
                  <Button>Sign In</Button>
                </Link>
                <Link href="/register">
                  <Button variant="outline">Create Account</Button>
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Quick Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link href="/exercise">
                <Button className="w-full h-24 text-lg flex flex-col items-center justify-center gap-2">
                  <Dumbbell className="h-8 w-8" />
                  <span>Exercise & Fitness</span>
                </Button>
              </Link>
              <Link href="/nutrition">
                <Button className="w-full h-24 text-lg flex flex-col items-center justify-center gap-2">
                  <Utensils className="h-8 w-8" />
                  <span>Nutrition & Diet</span>
                </Button>
              </Link>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              <HealthDashboard 
                vitals={mockVitals} 
                lastUpdated="Today, 9:30 AM" 
                vitalHistory={mockVitalHistory}
                userId="user-123"
              />
              <MedicationReminder />
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-bold">Risk Trend Analysis</h3>
                <p className="text-muted-foreground">
                  Track how your cardiovascular risk has changed over time
                </p>
              </div>
              <RiskTrendChart data={mockRiskTrendData} />
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-bold">Key Risk Factors</h3>
                <p className="text-muted-foreground">
                  Areas that most impact your cardiovascular health
                </p>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {mockRiskFactors.map((factor, index) => (
                  <RiskFactorCard key={index} factor={factor} />
                ))}
              </div>
            </div>

            <HealthMetrics metrics={mockHealthMetrics} />

            <PersonalizedRecommendations recommendations={mockRecommendations} />
            
            <TeleConsultBooking />
            
            <GoalTracking />
            
            <WeeklyChallenges />
          </>
        )}
      </main>
      <BottomNav />
    </div>
  );
}