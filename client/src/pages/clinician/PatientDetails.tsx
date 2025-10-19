import { useState, useEffect } from "react";
import { Link, useLocation, useParams } from "wouter";
import { ArrowLeft, Heart, Activity, Pill, Utensils, Dumbbell, FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import ThemeToggle from "@/components/ThemeToggle";
import BottomNav from "@/components/BottomNav";

interface PatientData {
  patient: {
    id: string;
    username: string;
  };
  clinicalEntries: any[];
  predictions: any[];
  medications: any[];
  mealPlans: any[];
  exercisePlans: any[];
  riskProfile?: {
    userId: string;
    username: string;
    riskScore: number;
    riskLevel: string;
    stratificationLevel: string;
    lastAssessmentDate: string;
    age: number;
    sex: number;
    conditions: string[];
    contributingFactors: Array<{
      factor: string;
      contribution: number;
      explanation: string;
    }>;
  };
}

interface ShapFeature {
  feature: string;
  contribution: number;
  explanation: string;
}

export default function PatientDetails() {
  const [patientData, setPatientData] = useState<PatientData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [, setLocation] = useLocation();
  const params = useParams();

  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        // In a real implementation, this would fetch from the API
        // For now, we'll use mock data
        setTimeout(() => {
          setPatientData({
            patient: {
              id: params.userId || "1",
              username: "Raj Kumar"
            },
            clinicalEntries: [
              {
                id: "1",
                userId: params.userId || "1",
                timestamp: "2025-10-10T10:30:00Z",
                age: 52,
                sex: 1,
                cp: 2,
                trestbps: 145,
                chol: 250,
                fbs: 1,
                restecg: 1,
                thalach: 160,
                exang: 1,
                oldpeak: 2.0,
                slope: 2,
                ca: 1,
                thal: 2,
                height: 175,
                weight: 85,
                smokingStatus: "current"
              }
            ],
            predictions: [
              {
                id: "1",
                userId: params.userId || "1",
                clinicalEntryId: "1",
                timestamp: "2025-10-10T10:30:00Z",
                score: 75,
                label: "high",
                modelVersion: "v3.0.0",
                shapTopFeatures: [
                  { feature: "trestbps", contribution: 0.15, explanation: "High blood pressure significantly increases risk" },
                  { feature: "chol", contribution: 0.12, explanation: "Elevated cholesterol levels contribute to risk" },
                  { feature: "smoking", contribution: 0.15, explanation: "Current smoking status significantly increases risk" }
                ]
              }
            ],
            medications: [
              {
                id: "1",
                userId: params.userId || "1",
                name: "Atorvastatin",
                dosage: "20mg",
                frequency: "daily",
                time: "08:00",
                startDate: "2025-09-01T00:00:00Z",
                endDate: null,
                taken: true,
                takenHistory: []
              },
              {
                id: "2",
                userId: params.userId || "1",
                name: "Lisinopril",
                dosage: "10mg",
                frequency: "daily",
                time: "08:00",
                startDate: "2025-09-01T00:00:00Z",
                endDate: null,
                taken: false,
                takenHistory: []
              }
            ],
            mealPlans: [
              {
                id: "1",
                userId: params.userId || "1",
                name: "High-Risk Hypertension & High-Cholesterol Meal Plan",
                description: "This intensive meal plan is designed to help reduce high cardiovascular risk factors for managing hypertension and high-cholesterol.",
                calories: 1800,
                tags: ["heart-healthy", "low-sodium", "low-cholesterol"],
                meals: [
                  {
                    day: 1,
                    meals: {
                      breakfast: {
                        name: "Oatmeal with Berries",
                        description: "Steel-cut oats topped with fresh berries and a drizzle of honey",
                        calories: 320,
                        ingredients: ["steel-cut oats", "blueberries", "strawberries", "honey", "almond milk"],
                        preparationTime: 15,
                        dietaryTags: ["heart-healthy", "high-fiber"]
                      },
                      lunch: {
                        name: "Quinoa Salad",
                        description: "Quinoa with mixed vegetables, chickpeas, and lemon-tahini dressing",
                        calories: 420,
                        ingredients: ["quinoa", "cucumber", "cherry tomatoes", "chickpeas", "tahini", "lemon"],
                        preparationTime: 20,
                        dietaryTags: ["heart-healthy", "high-fiber", "plant-based"]
                      },
                      dinner: {
                        name: "Baked Chicken with Vegetables",
                        description: "Herb-roasted chicken breast with roasted vegetables",
                        calories: 420,
                        ingredients: ["chicken breast", "sweet potatoes", "broccoli", "olive oil", "herbs"],
                        preparationTime: 35,
                        dietaryTags: ["high-protein", "low-fat"]
                      },
                      snacks: [
                        {
                          name: "Mixed Nuts",
                          description: "Small portion of unsalted mixed nuts",
                          calories: 180,
                          ingredients: ["unsalted almonds", "unsalted walnuts", "unsalted pecans"],
                          preparationTime: 2,
                          dietaryTags: ["healthy-fats", "high-protein"]
                        }
                      ]
                    },
                    totalCalories: 1340,
                    dietaryNotes: ["Limit sodium intake to less than 2,300mg daily", "Drink plenty of water throughout the day"]
                  }
                ],
                createdAt: "2025-10-10T10:30:00Z"
              }
            ],
            exercisePlans: [
              {
                id: "1",
                userId: params.userId || "1",
                level: "beginner",
                duration: 120,
                weeklyGoal: "Complete 14 exercise sessions",
                exercises: [
                  {
                    day: 1,
                    exercises: [
                      {
                        name: "Brisk Walking",
                        description: "Walk at a pace that makes you breathe harder but still able to talk",
                        duration: 15,
                        intensity: "moderate",
                        equipmentNeeded: [],
                        instructions: [
                          "Start with normal walking pace",
                          "Gradually increase speed",
                          "Swing arms naturally",
                          "Keep head up and look ahead"
                        ],
                        safetyNotes: [
                          "Stop if you feel dizzy or short of breath",
                          "Stay hydrated",
                          "Wear comfortable shoes"
                        ]
                      }
                    ],
                    totalDuration: 25,
                    focus: "cardio",
                    warmup: [
                      {
                        name: "Gentle Walking",
                        description: "Start with slow walking to gradually increase heart rate",
                        duration: 5,
                        intensity: "low",
                        equipmentNeeded: [],
                        instructions: [
                          "Walk at a comfortable pace",
                          "Keep shoulders relaxed",
                          "Breathe naturally"
                        ],
                        safetyNotes: [
                          "Stop if you experience chest pain or severe shortness of breath",
                          "Maintain good posture"
                        ]
                      }
                    ],
                    cooldown: [
                      {
                        name: "Deep Breathing",
                        description: "Slow, deep breaths to lower heart rate and promote relaxation",
                        duration: 5,
                        intensity: "low",
                        equipmentNeeded: [],
                        instructions: [
                          "Sit or lie down comfortably",
                          "Place one hand on chest and one on belly",
                          "Breathe in slowly through nose for 4 counts",
                          "Hold for 4 counts",
                          "Exhale slowly through mouth for 6 counts",
                          "Repeat for duration"
                        ],
                        safetyNotes: [
                          "Breathe naturally, don't force it",
                          "Focus on relaxation",
                          "Let go of tension with each exhale"
                        ]
                      }
                    ]
                  }
                ],
                createdAt: "2025-10-10T10:30:00Z"
              }
            ],
            riskProfile: {
              userId: params.userId || "1",
              username: "Raj Kumar",
              riskScore: 75,
              riskLevel: "high",
              stratificationLevel: "very-high",
              lastAssessmentDate: "2025-10-10T10:30:00Z",
              age: 52,
              sex: 1,
              conditions: ["hypertension", "high-cholesterol", "smoking"],
              contributingFactors: [
                { factor: "trestbps", contribution: 0.15, explanation: "High blood pressure significantly increases risk" },
                { factor: "chol", contribution: 0.12, explanation: "Elevated cholesterol levels contribute to risk" },
                { factor: "smoking", contribution: 0.15, explanation: "Current smoking status significantly increases risk" }
              ]
            }
          });
          setLoading(false);
        }, 1000);
      } catch (err) {
        setError("Failed to fetch patient data");
        setLoading(false);
      }
    };

    fetchPatientData();
  }, [params.userId]);

  const handleExportReport = async (format: "pdf" | "csv" | "json") => {
    try {
      if (format === "pdf") {
        // In a real implementation, this would call the export API
        // For now, we'll simulate the export
        alert(`Exporting patient report as PDF...`);
        
        // Simulate API call
        // const response = await fetch(`/api/export/patient/${params.userId}.pdf`);
        // const blob = await response.blob();
        // const url = window.URL.createObjectURL(blob);
        // const a = document.createElement('a');
        // a.href = url;
        // a.download = `heartguard-patient-${params.userId}.pdf`;
        // document.body.appendChild(a);
        // a.click();
        // window.URL.revokeObjectURL(url);
        // document.body.removeChild(a);
      } else {
        // For other formats, export all patient data
        alert(`Exporting all patient data as ${format.toUpperCase()}...`);
      }
    } catch (err) {
      console.error("Export error:", err);
      alert("Failed to export report");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <header className="border-b bg-card/50 backdrop-blur sticky top-0 z-30">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <Button variant="ghost" size="sm" className="gap-2" onClick={() => setLocation("/clinician")}>
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <h1 className="font-bold text-xl font-[family-name:var(--font-sans)]">Patient Details</h1>
            <ThemeToggle />
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="p-8 text-center">
            <p>Loading patient data...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error || !patientData) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <header className="border-b bg-card/50 backdrop-blur sticky top-0 z-30">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <Button variant="ghost" size="sm" className="gap-2" onClick={() => setLocation("/clinician")}>
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <h1 className="font-bold text-xl font-[family-name:var(--font-sans)]">Patient Details</h1>
            <ThemeToggle />
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="p-8 text-center">
            <p className="text-red-500">{error || "Failed to load patient data"}</p>
          </div>
        </main>
      </div>
    );
  }

  const latestPrediction = patientData.predictions[0];
  const latestClinicalEntry = patientData.clinicalEntries[0];

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="border-b bg-card/50 backdrop-blur sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" size="sm" className="gap-2" onClick={() => setLocation("/clinician")}>
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <h1 className="font-bold text-xl font-[family-name:var(--font-sans)]">Patient Details</h1>
          <ThemeToggle />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold font-[family-name:var(--font-sans)]">
              {patientData.patient.username}
            </h2>
            <p className="text-muted-foreground">
              Patient ID: {patientData.patient.id}
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => handleExportReport("pdf")} className="gap-2">
              <Download className="h-4 w-4" />
              PDF Report
            </Button>
            <Button onClick={() => handleExportReport("csv")} variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              CSV
            </Button>
            <Button onClick={() => handleExportReport("json")} variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              JSON
            </Button>
          </div>
        </div>

        {/* Patient Overview */}
        <div className="grid md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Latest Risk Score</CardDescription>
              <CardTitle className="text-3xl">{latestPrediction?.score || 0}%</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Heart className="h-4 w-4" />
                <span className={`font-medium ${
                  latestPrediction?.label === "high" 
                    ? "text-red-600" 
                    : latestPrediction?.label === "medium" 
                    ? "text-yellow-600" 
                    : "text-green-600"
                }`}>
                  {latestPrediction?.label?.charAt(0).toUpperCase() + (latestPrediction?.label?.slice(1) || "")} Risk
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Age & Sex</CardDescription>
              <CardTitle className="text-3xl">{latestClinicalEntry?.age || "N/A"}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Activity className="h-4 w-4" />
                <span>{latestClinicalEntry?.sex === 1 ? "Male" : "Female"}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Blood Pressure</CardDescription>
              <CardTitle className="text-3xl">{latestClinicalEntry?.trestbps || "N/A"}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Activity className="h-4 w-4" />
                <span>mmHg</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Cholesterol</CardDescription>
              <CardTitle className="text-3xl">{latestClinicalEntry?.chol || "N/A"}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Activity className="h-4 w-4" />
                <span>mg/dL</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Risk Stratification */}
        {patientData?.riskProfile && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5" />
                Risk Stratification
              </CardTitle>
              <CardDescription>
                Patient's cardiovascular risk categorization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Risk Category</span>
                    <Badge 
                      className={`px-3 py-1 text-sm font-medium ${
                        patientData.riskProfile.stratificationLevel === "very-high" 
                          ? "bg-red-600 text-white" 
                          : patientData.riskProfile.stratificationLevel === "high" 
                          ? "bg-red-100 text-red-800" 
                          : patientData.riskProfile.stratificationLevel === "moderate" 
                          ? "bg-yellow-100 text-yellow-800" 
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {patientData.riskProfile.stratificationLevel.charAt(0).toUpperCase() + 
                       patientData.riskProfile.stratificationLevel.slice(1).replace("-", " ")}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Risk Score</span>
                    <span className="font-bold text-lg">{patientData.riskProfile.riskScore}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Assessment Date</span>
                    <span>{new Date(patientData.riskProfile.lastAssessmentDate).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Conditions</h4>
                    <div className="flex flex-wrap gap-2">
                      {patientData.riskProfile.conditions.map((condition, index) => (
                        <Badge key={index} variant="secondary">{condition}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Risk Factors */}
        {latestPrediction?.shapTopFeatures && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5" />
                Key Risk Factors
              </CardTitle>
              <CardDescription>
                Top contributing factors to patient's cardiovascular risk
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                {latestPrediction.shapTopFeatures.map((factor: ShapFeature, index: number) => (
                  <div key={index} className="p-4 rounded-lg border bg-card space-y-2">
                    <h4 className="font-semibold">{factor.feature}</h4>
                    <p className="text-sm text-muted-foreground">{factor.explanation}</p>
                    <Badge variant="secondary">+{Math.round(factor.contribution * 100)}% risk</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Medications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Pill className="h-5 w-5" />
              Current Medications
            </CardTitle>
            <CardDescription>
              Patient's prescribed medications and adherence
            </CardDescription>
          </CardHeader>
          <CardContent>
            {patientData.medications.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Medication</TableHead>
                    <TableHead>Dosage</TableHead>
                    <TableHead>Frequency</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {patientData.medications.map((med) => (
                    <TableRow key={med.id}>
                      <TableCell className="font-medium">{med.name}</TableCell>
                      <TableCell>{med.dosage}</TableCell>
                      <TableCell>{med.frequency}</TableCell>
                      <TableCell>{med.time}</TableCell>
                      <TableCell>
                        <Badge variant={med.taken ? "default" : "destructive"}>
                          {med.taken ? "Taken" : "Missed"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-muted-foreground">No medications recorded</p>
            )}
          </CardContent>
        </Card>

        {/* Meal Plan */}
        {patientData.mealPlans.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Utensils className="h-5 w-5" />
                Personalized Meal Plan
              </CardTitle>
              <CardDescription>
                {patientData.mealPlans[0].name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p>{patientData.mealPlans[0].description}</p>
                <div className="flex flex-wrap gap-2">
                  {patientData.mealPlans[0].tags.map((tag: string, index: number) => (
                    <Badge key={index} variant="secondary">{tag}</Badge>
                  ))}
                </div>
                <div className="pt-4 border-t">
                  <h4 className="font-semibold mb-2">Sample Day Plan ({patientData.mealPlans[0].meals[0].totalCalories} calories)</h4>
                  <div className="grid md:grid-cols-4 gap-4">
                    <div>
                      <h5 className="font-medium text-sm mb-1">Breakfast</h5>
                      <p className="text-sm text-muted-foreground">{patientData.mealPlans[0].meals[0].meals.breakfast.name}</p>
                    </div>
                    <div>
                      <h5 className="font-medium text-sm mb-1">Lunch</h5>
                      <p className="text-sm text-muted-foreground">{patientData.mealPlans[0].meals[0].meals.lunch.name}</p>
                    </div>
                    <div>
                      <h5 className="font-medium text-sm mb-1">Dinner</h5>
                      <p className="text-sm text-muted-foreground">{patientData.mealPlans[0].meals[0].meals.dinner.name}</p>
                    </div>
                    <div>
                      <h5 className="font-medium text-sm mb-1">Snacks</h5>
                      <p className="text-sm text-muted-foreground">
                        {patientData.mealPlans[0].meals[0].meals.snacks.map((snack: any) => snack.name).join(", ")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Exercise Plan */}
        {patientData.exercisePlans.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Dumbbell className="h-5 w-5" />
                Personalized Exercise Plan
              </CardTitle>
              <CardDescription>
                {patientData.exercisePlans[0].name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p>{patientData.exercisePlans[0].description}</p>
                <div className="pt-4 border-t">
                  <h4 className="font-semibold mb-2">Sample Day Plan ({patientData.exercisePlans[0].exercises[0].totalDuration} minutes)</h4>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <h5 className="font-medium text-sm mb-1">Focus</h5>
                      <p className="text-sm text-muted-foreground capitalize">{patientData.exercisePlans[0].exercises[0].focus}</p>
                    </div>
                    <div>
                      <h5 className="font-medium text-sm mb-1">Main Exercise</h5>
                      <p className="text-sm text-muted-foreground">{patientData.exercisePlans[0].exercises[0].exercises[0].name}</p>
                    </div>
                    <div>
                      <h5 className="font-medium text-sm mb-1">Duration</h5>
                      <p className="text-sm text-muted-foreground">{patientData.exercisePlans[0].exercises[0].exercises[0].duration} minutes</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Clinical History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Clinical History
            </CardTitle>
            <CardDescription>
              Patient's clinical assessments over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            {patientData.clinicalEntries.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Age</TableHead>
                    <TableHead>BP</TableHead>
                    <TableHead>Chol</TableHead>
                    <TableHead>Risk Score</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {patientData.clinicalEntries.map((entry) => {
                    const prediction = patientData.predictions.find(p => p.clinicalEntryId === entry.id);
                    return (
                      <TableRow key={entry.id}>
                        <TableCell>{new Date(entry.timestamp).toLocaleDateString()}</TableCell>
                        <TableCell>{entry.age}</TableCell>
                        <TableCell>{entry.trestbps}</TableCell>
                        <TableCell>{entry.chol}</TableCell>
                        <TableCell>
                          <span className={`font-medium ${
                            prediction?.label === "high" 
                              ? "text-red-600" 
                              : prediction?.label === "medium" 
                              ? "text-yellow-600" 
                              : "text-green-600"
                          }`}>
                            {prediction?.score || "N/A"}%
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            ) : (
              <p className="text-muted-foreground">No clinical history recorded</p>
            )}
          </CardContent>
        </Card>
      </main>
      
      <BottomNav />
    </div>
  );
}