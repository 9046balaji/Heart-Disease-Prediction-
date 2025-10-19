import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  frequency: "daily" | "weekly" | "monthly" | "quarterly";
  format: "pdf" | "csv" | "json";
  recipients: string[];
  filters: {
    riskLevel?: string;
    ageRange?: { min: number; max: number };
    conditions?: string[];
  };
  sections: string[];
  createdAt: string;
  updatedAt: string;
}

interface AutomatedReport {
  id: string;
  templateId: string;
  name: string;
  generatedAt: string;
  periodStart: string;
  periodEnd: string;
  format: "pdf" | "csv" | "json";
  content: string;
  recipients: string[];
}

export default function AutomatedReports() {
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [reports, setReports] = useState<AutomatedReport[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [newTemplate, setNewTemplate] = useState({
    name: "",
    description: "",
    frequency: "weekly",
    format: "pdf",
    recipients: "",
    riskLevel: "",
    minAge: "",
    maxAge: "",
    conditions: ""
  });

  useEffect(() => {
    // In a real implementation, this would fetch from the API
    // For now, we'll use mock data
    setTimeout(() => {
      const mockTemplates: ReportTemplate[] = [
        {
          id: "template1",
          name: "Weekly High Risk Report",
          description: "Weekly report of high-risk patients requiring immediate attention",
          frequency: "weekly",
          format: "pdf",
          recipients: ["dr.smith@hospital.com", "nurse.jones@clinic.com"],
          filters: {
            riskLevel: "high|very-high"
          },
          sections: ["patient-list", "risk-factors", "treatment-adherence"],
          createdAt: "2025-10-01T10:30:00Z",
          updatedAt: "2025-10-10T14:20:00Z"
        },
        {
          id: "template2",
          name: "Monthly Cohort Analysis",
          description: "Monthly analysis of patient cohorts and treatment outcomes",
          frequency: "monthly",
          format: "csv",
          recipients: ["research.team@hospital.com"],
          filters: {},
          sections: ["cohort-analysis", "treatment-outcomes", "statistical-summary"],
          createdAt: "2025-09-15T09:15:00Z",
          updatedAt: "2025-10-12T09:15:00Z"
        }
      ];

      const mockReports: AutomatedReport[] = [
        {
          id: "report1",
          templateId: "template1",
          name: "Weekly High Risk Report - 2025-10-15",
          generatedAt: "2025-10-15T09:00:00Z",
          periodStart: "2025-10-08T00:00:00Z",
          periodEnd: "2025-10-15T00:00:00Z",
          format: "pdf",
          content: "PDF content would be here",
          recipients: ["dr.smith@hospital.com", "nurse.jones@clinic.com"]
        },
        {
          id: "report2",
          templateId: "template1",
          name: "Weekly High Risk Report - 2025-10-08",
          generatedAt: "2025-10-08T09:00:00Z",
          periodStart: "2025-10-01T00:00:00Z",
          periodEnd: "2025-10-08T00:00:00Z",
          format: "pdf",
          content: "PDF content would be here",
          recipients: ["dr.smith@hospital.com", "nurse.jones@clinic.com"]
        }
      ];

      setTemplates(mockTemplates);
      setReports(mockReports);
      setSelectedTemplate(mockTemplates[0]);
      setLoading(false);
    }, 1000);
  }, []);

  const handleCreateTemplate = () => {
    // In a real implementation, this would call the API to create a new template
    alert(`Creating report template: ${newTemplate.name}`);
  };

  const handleGenerateReport = () => {
    // In a real implementation, this would call the API to generate a report
    alert(`Generating report from template: ${selectedTemplate?.name}`);
  };

  const handleDeleteTemplate = (templateId: string) => {
    // In a real implementation, this would call the API to delete a template
    alert(`Deleting template: ${templateId}`);
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <p>Loading report templates...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Automated Reports</h2>
        <Button onClick={handleGenerateReport} disabled={!selectedTemplate}>
          Generate Report Now
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Create Report Template</CardTitle>
            <CardDescription>Set up automated report generation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="template-name">Template Name</Label>
              <Input
                id="template-name"
                value={newTemplate.name}
                onChange={(e) => setNewTemplate({...newTemplate, name: e.target.value})}
                placeholder="e.g., Weekly High Risk Report"
              />
            </div>

            <div>
              <Label htmlFor="template-description">Description</Label>
              <Textarea
                id="template-description"
                value={newTemplate.description}
                onChange={(e) => setNewTemplate({...newTemplate, description: e.target.value})}
                placeholder="Describe the purpose of this report"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="template-frequency">Frequency</Label>
                <Select value={newTemplate.frequency} onValueChange={(value) => setNewTemplate({...newTemplate, frequency: value})}>
                  <SelectTrigger id="template-frequency">
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="template-format">Format</Label>
                <Select value={newTemplate.format} onValueChange={(value) => setNewTemplate({...newTemplate, format: value})}>
                  <SelectTrigger id="template-format">
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="csv">CSV</SelectItem>
                    <SelectItem value="json">JSON</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="template-recipients">Recipients (comma-separated emails)</Label>
              <Input
                id="template-recipients"
                value={newTemplate.recipients}
                onChange={(e) => setNewTemplate({...newTemplate, recipients: e.target.value})}
                placeholder="e.g., dr.smith@hospital.com, nurse.jones@clinic.com"
              />
            </div>

            <div className="border-t pt-4">
              <h3 className="font-medium mb-2">Filters</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="risk-level">Risk Level</Label>
                  <Select value={newTemplate.riskLevel} onValueChange={(value) => setNewTemplate({...newTemplate, riskLevel: value})}>
                    <SelectTrigger id="risk-level">
                      <SelectValue placeholder="Select risk level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="very-high">Very High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Age Range</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      value={newTemplate.minAge}
                      onChange={(e) => setNewTemplate({...newTemplate, minAge: e.target.value})}
                      placeholder="Min"
                    />
                    <Input
                      type="number"
                      value={newTemplate.maxAge}
                      onChange={(e) => setNewTemplate({...newTemplate, maxAge: e.target.value})}
                      placeholder="Max"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-2">
                <Label htmlFor="conditions">Conditions (comma-separated)</Label>
                <Input
                  id="conditions"
                  value={newTemplate.conditions}
                  onChange={(e) => setNewTemplate({...newTemplate, conditions: e.target.value})}
                  placeholder="e.g., hypertension, diabetes"
                />
              </div>
            </div>

            <Button onClick={handleCreateTemplate} className="w-full">
              Create Template
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Report Templates</CardTitle>
              <CardDescription>Manage your automated report templates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {templates.map((template) => (
                <div key={template.id} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{template.name}</h3>
                      <p className="text-sm text-muted-foreground">{template.description}</p>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="secondary">{template.frequency}</Badge>
                        <Badge variant="secondary">{template.format.toUpperCase()}</Badge>
                        <Badge variant="secondary">{template.recipients.length} recipients</Badge>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedTemplate(template)}
                      >
                        Use
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteTemplate(template.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Reports</CardTitle>
              <CardDescription>Previously generated reports</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {reports.map((report) => (
                <div key={report.id} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{report.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Generated: {new Date(report.generatedAt).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Period: {new Date(report.periodStart).toLocaleDateString()} - {new Date(report.periodEnd).toLocaleDateString()}
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      Download
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}