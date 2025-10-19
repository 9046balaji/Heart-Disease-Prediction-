import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

interface ResearchDatasetStatistics {
  totalPatients: number;
  riskDistribution: {
    low: number;
    medium: number;
    high: number;
  };
  ageDistribution: {
    "18-29": number;
    "30-49": number;
    "50-64": number;
    "65+": number;
  };
  conditionPrevalence: Record<string, number>;
  averageRiskScore: number;
}

export default function ResearchDataExport() {
  const [statistics, setStatistics] = useState<ResearchDatasetStatistics | null>(null);
  const [loading, setLoading] = useState(false);
  const [exportFormat, setExportFormat] = useState("json");
  const [anonymizationLevel, setAnonymizationLevel] = useState("full");
  const [includeConditions, setIncludeConditions] = useState(true);
  const [includeRiskFactors, setIncludeRiskFactors] = useState(true);

  const handleExport = () => {
    // In a real implementation, this would call the API to export research data
    alert(`Exporting research data in ${exportFormat} format with ${anonymizationLevel} anonymization`);
  };

  const handleGetStatistics = () => {
    setLoading(true);
    // In a real implementation, this would fetch from the API
    // For now, we'll use mock data
    setTimeout(() => {
      const mockStatistics: ResearchDatasetStatistics = {
        totalPatients: 1250,
        riskDistribution: {
          low: 425,
          medium: 510,
          high: 315
        },
        ageDistribution: {
          "18-29": 275,
          "30-49": 450,
          "50-64": 350,
          "65+": 175
        },
        conditionPrevalence: {
          "hypertension": 580,
          "high-cholesterol": 520,
          "diabetes": 210,
          "smoking": 315,
          "family-history": 375
        },
        averageRiskScore: 48.7
      };
      
      setStatistics(mockStatistics);
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Research Data Export</h2>
        <Button onClick={handleGetStatistics} disabled={loading}>
          {loading ? "Loading..." : "Refresh Statistics"}
        </Button>
      </div>

      {statistics && (
        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Patients</CardDescription>
              <CardTitle className="text-3xl">{statistics.totalPatients}</CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Average Risk Score</CardDescription>
              <CardTitle className="text-3xl">{statistics.averageRiskScore.toFixed(1)}%</CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Conditions Tracked</CardDescription>
              <CardTitle className="text-3xl">{Object.keys(statistics.conditionPrevalence).length}</CardTitle>
            </CardHeader>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Export Settings</CardTitle>
          <CardDescription>Configure research data export options</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="export-format">Export Format</Label>
                <Select value={exportFormat} onValueChange={setExportFormat}>
                  <SelectTrigger id="export-format">
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="json">JSON</SelectItem>
                    <SelectItem value="csv">CSV</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="anonymization-level">Anonymization Level</Label>
                <Select value={anonymizationLevel} onValueChange={setAnonymizationLevel}>
                  <SelectTrigger id="anonymization-level">
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full">Full Anonymization</SelectItem>
                    <SelectItem value="partial">Partial Anonymization</SelectItem>
                    <SelectItem value="minimal">Minimal Anonymization</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="include-conditions">Include Conditions</Label>
                <Switch
                  id="include-conditions"
                  checked={includeConditions}
                  onCheckedChange={setIncludeConditions}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="include-risk-factors">Include Risk Factors</Label>
                <Switch
                  id="include-risk-factors"
                  checked={includeRiskFactors}
                  onCheckedChange={setIncludeRiskFactors}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleExport} size="lg">
              Export Research Dataset
            </Button>
          </div>
        </CardContent>
      </Card>

      {statistics && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Risk Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-green-100 text-green-800">Low Risk</Badge>
                  <span>{statistics.riskDistribution.low} patients</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Medium Risk</Badge>
                  <span>{statistics.riskDistribution.medium} patients</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-red-100 text-red-800">High Risk</Badge>
                  <span>{statistics.riskDistribution.high} patients</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Age Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                {Object.entries(statistics.ageDistribution).map(([ageGroup, count]) => (
                  <div key={ageGroup} className="flex items-center gap-2">
                    <Badge variant="secondary">{ageGroup}</Badge>
                    <span>{count} patients</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Condition Prevalence</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                {Object.entries(statistics.conditionPrevalence).map(([condition, count]) => (
                  <div key={condition} className="flex items-center gap-2">
                    <Badge variant="secondary">{condition}</Badge>
                    <span>{count} patients</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}