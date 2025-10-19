import { useState, useEffect } from "react";
import { Link } from "wouter";
import { ArrowLeft, Users, Activity, Heart, FileText, Download, BarChart3, Database, FileBarChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ThemeToggle from "@/components/ThemeToggle";
import BottomNav from "@/components/BottomNav";
import CohortAnalysis from "@/components/CohortAnalysis";
import ResearchDataExport from "@/components/ResearchDataExport";
import AutomatedReports from "@/components/AutomatedReports";

interface Patient {
  id: string;
  name: string;
  age: number;
  sex: number;
  lastAssessment: string;
  riskScore: number;
  riskLevel: string;
  riskStratification: string;
  conditions: string[];
}

export default function Clinician() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalPatients: 0,
    highRisk: 0,
    recentAssessments: 0,
    reportsGenerated: 0
  });
  const [activeTab, setActiveTab] = useState("patients");

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        // In a real implementation, this would fetch from the API
        // For now, we'll use mock data but in a real app this would come from:
        // const response = await fetch("/api/clinician/patients");
        // const data = await response.json();
        
        setTimeout(() => {
          const mockPatients: Patient[] = [
            {
              id: "1",
              name: "Raj Kumar",
              age: 52,
              sex: 1,
              lastAssessment: "2025-10-10",
              riskScore: 75,
              riskLevel: "high",
              riskStratification: "very-high",
              conditions: ["hypertension", "high cholesterol"]
            },
            {
              id: "2",
              name: "Meera Patel",
              age: 28,
              sex: 0,
              lastAssessment: "2025-10-12",
              riskScore: 25,
              riskLevel: "low",
              riskStratification: "low",
              conditions: []
            },
            {
              id: "3",
              name: "Amit Sharma",
              age: 45,
              sex: 1,
              lastAssessment: "2025-10-08",
              riskScore: 55,
              riskLevel: "medium",
              riskStratification: "moderate",
              conditions: ["family history"]
            }
          ];
          
          setPatients(mockPatients);
          setStats({
            totalPatients: mockPatients.length,
            highRisk: mockPatients.filter(p => p.riskLevel === "high").length,
            recentAssessments: mockPatients.filter(p => {
              const assessmentDate = new Date(p.lastAssessment);
              const sevenDaysAgo = new Date();
              sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
              return assessmentDate >= sevenDaysAgo;
            }).length,
            reportsGenerated: 156 // Mock value
          });
          setLoading(false);
        }, 1000);
      } catch (err) {
        setError("Failed to fetch patient data");
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  const handleExportData = async (format: "csv" | "json" | "pdf") => {
    try {
      // In a real implementation, this would call the export API
      // For now, we'll simulate the export
      alert(`Exporting patient data as ${format.toUpperCase()}...`);
      
      // Simulate API call
      // const response = await fetch(`/api/export/patients.${format}`);
      // const blob = await response.blob();
      // const url = window.URL.createObjectURL(blob);
      // const a = document.createElement('a');
      // a.href = url;
      // a.download = `heartguard-patients.${format}`;
      // document.body.appendChild(a);
      // a.click();
      // window.URL.revokeObjectURL(url);
      // document.body.removeChild(a);
    } catch (err) {
      console.error("Export error:", err);
      alert("Failed to export data");
    }
  };

  const handleExportResearchData = async (format: "csv" | "json") => {
    try {
      // In a real implementation, this would call the research export API
      // For now, we'll simulate the export
      alert(`Exporting research data as ${format.toUpperCase()}...`);
      
      // Simulate API call
      // const response = await fetch(`/api/clinician/research-export/${format}`);
      // const blob = await response.blob();
      // const url = window.URL.createObjectURL(blob);
      // const a = document.createElement('a');
      // a.href = url;
      // a.download = `heartguard-research-data.${format}`;
      // document.body.appendChild(a);
      // a.click();
      // window.URL.revokeObjectURL(url);
      // document.body.removeChild(a);
    } catch (err) {
      console.error("Research export error:", err);
      alert("Failed to export research data");
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <header className="border-b bg-card/50 backdrop-blur sticky top-0 z-30">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-2" data-testid="button-back">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            </Link>
            <h1 className="font-bold text-xl font-[family-name:var(--font-sans)]">Clinician Dashboard</h1>
            <ThemeToggle />
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="p-8 text-center">
            <p className="text-red-500">{error}</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="border-b bg-card/50 backdrop-blur sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2" data-testid="button-back">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </Link>
          <h1 className="font-bold text-xl font-[family-name:var(--font-sans)]">Clinician Dashboard</h1>
          <ThemeToggle />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="patients" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Patients
            </TabsTrigger>
            <TabsTrigger value="cohort" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Cohort Analysis
            </TabsTrigger>
            <TabsTrigger value="research" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Research Data
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <FileBarChart className="h-4 w-4" />
              Automated Reports
            </TabsTrigger>
          </TabsList>

          <TabsContent value="patients">
            <div className="space-y-8">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold font-[family-name:var(--font-sans)]">
                  Patient Overview
                </h2>
                <p className="text-muted-foreground">
                  Monitor your patients' heart health assessments and risk factors
                </p>
              </div>

              <div className="grid md:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Total Patients</CardDescription>
                    <CardTitle className="text-3xl">{stats.totalPatients}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>Active in system</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>High Risk</CardDescription>
                    <CardTitle className="text-3xl">{stats.highRisk}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Heart className="h-4 w-4" />
                      <span>Require attention</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Recent Assessments</CardDescription>
                    <CardTitle className="text-3xl">{stats.recentAssessments}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Activity className="h-4 w-4" />
                      <span>Last 7 days</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Reports Generated</CardDescription>
                    <CardTitle className="text-3xl">{stats.reportsGenerated}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <FileText className="h-4 w-4" />
                      <span>This month</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold font-[family-name:var(--font-sans)]">
                  Patient List
                </h3>
                <div className="flex gap-2">
                  <Button onClick={() => handleExportData("csv")} className="gap-2" variant="outline">
                    <Download className="h-4 w-4" />
                    Patient CSV
                  </Button>
                  <Button onClick={() => handleExportData("json")} className="gap-2" variant="outline">
                    <Download className="h-4 w-4" />
                    Patient JSON
                  </Button>
                  <Button onClick={() => handleExportData("pdf")} className="gap-2">
                    <Download className="h-4 w-4" />
                    Patient PDF
                  </Button>
                  <Button onClick={() => handleExportResearchData("csv")} className="gap-2" variant="outline">
                    <Download className="h-4 w-4" />
                    Research CSV
                  </Button>
                  <Button onClick={() => handleExportResearchData("json")} className="gap-2" variant="outline">
                    <Download className="h-4 w-4" />
                    Research JSON
                  </Button>
                </div>
              </div>

              <Card>
                <CardContent className="p-0">
                  {loading ? (
                    <div className="p-8 text-center">
                      <p>Loading patient data...</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Patient Name</TableHead>
                          <TableHead>Age</TableHead>
                          <TableHead>Last Assessment</TableHead>
                          <TableHead>Risk Score</TableHead>
                          <TableHead>Risk Level</TableHead>
                          <TableHead>Risk Stratification</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {patients.map((patient) => (
                          <TableRow key={patient.id}>
                            <TableCell className="font-medium">{patient.name}</TableCell>
                            <TableCell>{patient.age}</TableCell>
                            <TableCell>{patient.lastAssessment}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <span>{patient.riskScore}%</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                patient.riskLevel === "high" 
                                  ? "bg-red-100 text-red-800" 
                                  : patient.riskLevel === "medium" 
                                  ? "bg-yellow-100 text-yellow-800" 
                                  : "bg-green-100 text-green-800"
                              }`}>
                                {patient.riskLevel.charAt(0).toUpperCase() + patient.riskLevel.slice(1)}
                              </span>
                            </TableCell>
                            <TableCell>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                patient.riskStratification === "very-high" 
                                  ? "bg-red-600 text-white" 
                                  : patient.riskStratification === "high" 
                                  ? "bg-red-100 text-red-800" 
                                  : patient.riskStratification === "moderate" 
                                  ? "bg-yellow-100 text-yellow-800" 
                                  : "bg-green-100 text-green-800"
                              }`}>
                                {patient.riskStratification.charAt(0).toUpperCase() + patient.riskStratification.slice(1).replace("-", " ")}
                              </span>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Link href={`/clinician/patient/${patient.id}`}>
                                  <Button variant="outline" size="sm">
                                    View Details
                                  </Button>
                                </Link>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => {
                                    // In a real implementation, this would export individual patient report
                                    alert(`Exporting report for ${patient.name}...`);
                                  }}
                                >
                                  Report
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="cohort">
            <CohortAnalysis />
          </TabsContent>

          <TabsContent value="research">
            <ResearchDataExport />
          </TabsContent>

          <TabsContent value="reports">
            <AutomatedReports />
          </TabsContent>
        </Tabs>
      </main>
      
      <BottomNav />
    </div>
  );
}