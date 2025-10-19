import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";

interface CohortFilter {
  ageRange?: { min: number; max: number };
  sex?: number;
  riskLevel?: string;
  conditions?: string[];
}

interface CohortAnalysisData {
  cohortId: string;
  name: string;
  filters: CohortFilter;
  statistics: {
    totalPatients: number;
    riskDistribution: {
      low: number;
      moderate: number;
      high: number;
      "very-high": number;
    };
    averageRiskScore: number;
    medianRiskScore: number;
    ageDistribution: {
      "18-30": number;
      "31-50": number;
      "51-65": number;
      "65+": number;
    };
    conditionPrevalence: Record<string, number>;
    treatmentAdherence: {
      averageAdherence: number;
      adherenceByRiskLevel: Record<string, number>;
    };
  };
  trends: {
    riskScoreTrend: Array<{
      date: string;
      averageRisk: number;
      patientCount: number;
    }>;
    conditionTrend: Array<{
      date: string;
      condition: string;
      prevalence: number;
    }>;
  };
  comparisons: Array<{
    cohortId: string;
    cohortName: string;
    riskDifference: number;
    statisticalSignificance: number;
  }>;
  createdAt: string;
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

export default function CohortAnalysis() {
  const [cohorts, setCohorts] = useState<CohortAnalysisData[]>([]);
  const [selectedCohort, setSelectedCohort] = useState<CohortAnalysisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<CohortFilter>({
    ageRange: { min: 18, max: 100 },
    sex: undefined,
    riskLevel: undefined,
    conditions: []
  });
  const [cohortName, setCohortName] = useState("My Cohort Analysis");

  useEffect(() => {
    // In a real implementation, this would fetch from the API
    // For now, we'll use mock data
    setTimeout(() => {
      const mockCohorts: CohortAnalysisData[] = [
        {
          cohortId: "cohort1",
          name: "High Risk Patients",
          filters: {
            riskLevel: "high|very-high"
          },
          statistics: {
            totalPatients: 150,
            riskDistribution: {
              low: 0,
              moderate: 0,
              high: 95,
              "very-high": 55
            },
            averageRiskScore: 72.5,
            medianRiskScore: 75.2,
            ageDistribution: {
              "18-30": 5,
              "31-50": 30,
              "51-65": 65,
              "65+": 50
            },
            conditionPrevalence: {
              "hypertension": 120,
              "high-cholesterol": 110,
              "diabetes": 65,
              "smoking": 85
            },
            treatmentAdherence: {
              averageAdherence: 68.5,
              adherenceByRiskLevel: {
                low: 0,
                moderate: 0,
                high: 65.2,
                "very-high": 62.4
              }
            }
          },
          trends: {
            riskScoreTrend: [
              { date: "2025-01-01", averageRisk: 68.1, patientCount: 120 },
              { date: "2025-02-01", averageRisk: 69.5, patientCount: 125 },
              { date: "2025-03-01", averageRisk: 70.2, patientCount: 130 },
              { date: "2025-04-01", averageRisk: 71.8, patientCount: 135 },
              { date: "2025-05-01", averageRisk: 72.9, patientCount: 140 },
              { date: "2025-06-01", averageRisk: 72.5, patientCount: 150 }
            ],
            conditionTrend: [
              { date: "2025-01-01", condition: "hypertension", prevalence: 110 },
              { date: "2025-02-01", condition: "hypertension", prevalence: 112 },
              { date: "2025-03-01", condition: "hypertension", prevalence: 114 },
              { date: "2025-04-01", condition: "hypertension", prevalence: 116 },
              { date: "2025-05-01", condition: "hypertension", prevalence: 118 },
              { date: "2025-06-01", condition: "hypertension", prevalence: 120 }
            ]
          },
          comparisons: [],
          createdAt: "2025-10-15T10:30:00Z"
        },
        {
          cohortId: "cohort2",
          name: "Elderly Patients",
          filters: {
            ageRange: { min: 65, max: 120 }
          },
          statistics: {
            totalPatients: 200,
            riskDistribution: {
              low: 45,
              moderate: 80,
              high: 65,
              "very-high": 10
            },
            averageRiskScore: 45.2,
            medianRiskScore: 42.5,
            ageDistribution: {
              "18-30": 0,
              "31-50": 0,
              "51-65": 45,
              "65+": 200
            },
            conditionPrevalence: {
              "hypertension": 130,
              "high-cholesterol": 115,
              "diabetes": 75,
              "smoking": 45
            },
            treatmentAdherence: {
              averageAdherence: 78.5,
              adherenceByRiskLevel: {
                low: 85.2,
                moderate: 76.8,
                high: 72.1,
                "very-high": 68.4
              }
            }
          },
          trends: {
            riskScoreTrend: [
              { date: "2025-01-01", averageRisk: 42.1, patientCount: 170 },
              { date: "2025-02-01", averageRisk: 43.5, patientCount: 175 },
              { date: "2025-03-01", averageRisk: 44.2, patientCount: 180 },
              { date: "2025-04-01", averageRisk: 45.8, patientCount: 185 },
              { date: "2025-05-01", averageRisk: 44.9, patientCount: 190 },
              { date: "2025-06-01", averageRisk: 45.2, patientCount: 200 }
            ],
            conditionTrend: [
              { date: "2025-01-01", condition: "hypertension", prevalence: 125 },
              { date: "2025-02-01", condition: "hypertension", prevalence: 126 },
              { date: "2025-03-01", condition: "hypertension", prevalence: 127 },
              { date: "2025-04-01", condition: "hypertension", prevalence: 128 },
              { date: "2025-05-01", condition: "hypertension", prevalence: 129 },
              { date: "2025-06-01", condition: "hypertension", prevalence: 130 }
            ]
          },
          comparisons: [],
          createdAt: "2025-10-15T10:30:00Z"
        }
      ];
      
      setCohorts(mockCohorts);
      setSelectedCohort(mockCohorts[0]);
      setLoading(false);
    }, 1000);
  }, []);

  const handleAnalyzeCohort = () => {
    // In a real implementation, this would call the API to analyze a new cohort
    alert(`Analyzing cohort: ${cohortName}`);
  };

  const handleCompareCohorts = () => {
    // In a real implementation, this would call the API to compare cohorts
    alert("Comparing cohorts");
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <p>Loading cohort analysis data...</p>
      </div>
    );
  }

  // Prepare data for charts
  const riskDistributionData = selectedCohort ? [
    { name: "Low", value: selectedCohort.statistics.riskDistribution.low },
    { name: "Moderate", value: selectedCohort.statistics.riskDistribution.moderate },
    { name: "High", value: selectedCohort.statistics.riskDistribution.high },
    { name: "Very High", value: selectedCohort.statistics.riskDistribution["very-high"] }
  ] : [];

  const ageDistributionData = selectedCohort ? [
    { name: "18-30", value: selectedCohort.statistics.ageDistribution["18-30"] },
    { name: "31-50", value: selectedCohort.statistics.ageDistribution["31-50"] },
    { name: "51-65", value: selectedCohort.statistics.ageDistribution["51-65"] },
    { name: "65+", value: selectedCohort.statistics.ageDistribution["65+"] }
  ] : [];

  const conditionPrevalenceData = selectedCohort ? 
    Object.entries(selectedCohort.statistics.conditionPrevalence).map(([condition, count]) => ({
      name: condition,
      value: count
    })) : [];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Cohort Analysis</h2>
        <Button onClick={handleAnalyzeCohort}>New Analysis</Button>
      </div>

      <div className="grid md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Patients</CardDescription>
            <CardTitle className="text-3xl">{selectedCohort?.statistics.totalPatients || 0}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Average Risk Score</CardDescription>
            <CardTitle className="text-3xl">{selectedCohort?.statistics.averageRiskScore.toFixed(1) || 0}%</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Median Risk Score</CardDescription>
            <CardTitle className="text-3xl">{selectedCohort?.statistics.medianRiskScore.toFixed(1) || 0}%</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Treatment Adherence</CardDescription>
            <CardTitle className="text-3xl">{selectedCohort?.statistics.treatmentAdherence.averageAdherence.toFixed(1) || 0}%</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Risk Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={riskDistributionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {riskDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Age Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={ageDistributionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Condition Prevalence</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={conditionPrevalenceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Risk Score Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={selectedCohort?.trends.riskScoreTrend || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="averageRisk" stroke="#8884d8" activeDot={{ r: 8 }} />
              <Line type="monotone" dataKey="patientCount" stroke="#82ca9d" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Select onValueChange={(value) => setSelectedCohort(cohorts.find(c => c.cohortId === value) || null)}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select cohort" />
          </SelectTrigger>
          <SelectContent>
            {cohorts.map((cohort) => (
              <SelectItem key={cohort.cohortId} value={cohort.cohortId}>{cohort.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={handleCompareCohorts}>Compare Cohorts</Button>
      </div>
    </div>
  );
}