import { useState } from "react";
import { Download, Share, FileText } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { authenticatedFetch } from "@/utils/auth";

export default function ClinicalSummaryExport() {
  const { toast } = useToast();
  const [clinicianEmail, setClinicianEmail] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDownloadingHTML, setIsDownloadingHTML] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  const handleDownloadPDF = async () => {
    try {
      setIsDownloading(true);
      
      const response = await authenticatedFetch("/api/export/clinical-summary");
      
      if (!response.ok) {
        throw new Error("Failed to generate clinical summary");
      }
      
      // Create a blob from the response
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "clinical-summary.txt";
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Success",
        description: "Clinical summary downloaded successfully"
      });
    } catch (error) {
      console.error("Error downloading clinical summary:", error);
      toast({
        title: "Error",
        description: "Failed to download clinical summary",
        variant: "destructive"
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDownloadHTML = async () => {
    try {
      setIsDownloadingHTML(true);
      
      const response = await authenticatedFetch("/api/export/clinical-summary-html");
      
      if (!response.ok) {
        throw new Error("Failed to generate clinical summary");
      }
      
      // Create a blob from the response
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "clinical-summary.html";
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Success",
        description: "Clinical summary HTML downloaded successfully"
      });
    } catch (error) {
      console.error("Error downloading clinical summary HTML:", error);
      toast({
        title: "Error",
        description: "Failed to download clinical summary HTML",
        variant: "destructive"
      });
    } finally {
      setIsDownloadingHTML(false);
    }
  };

  const handleShareWithClinician = async () => {
    if (!clinicianEmail) {
      toast({
        title: "Error",
        description: "Please enter a clinician email address",
        variant: "destructive"
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(clinicianEmail)) {
      toast({
        title: "Error",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSharing(true);
      
      const response = await authenticatedFetch("/api/export/share-clinician", {
        method: "POST",
        body: JSON.stringify({ clinicianEmail })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "Failed to share clinical summary");
      }
      
      const result = await response.json();
      
      if (result.success) {
        toast({
          title: "Success",
          description: "Clinical summary shared with clinician successfully"
        });
        setClinicianEmail("");
      } else {
        throw new Error(result.error?.message || "Failed to share clinical summary");
      }
    } catch (error: any) {
      console.error("Error sharing with clinician:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to share clinical summary with clinician",
        variant: "destructive"
      });
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <Card className="hover-elevate">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Clinical Summary Export
        </CardTitle>
        <CardDescription>
          Download or share your clinical summary with your healthcare provider
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">Download Clinical Summary</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Download a comprehensive report of your health data, risk assessments, 
              medications, and lab results for your personal records or to share with healthcare providers.
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button 
                onClick={handleDownloadPDF} 
                disabled={isDownloading}
                className="w-full sm:w-auto"
              >
                {isDownloading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                    Generating Report...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Download as Text
                  </div>
                )}
              </Button>
              <Button 
                onClick={handleDownloadHTML} 
                disabled={isDownloadingHTML}
                variant="outline"
                className="w-full sm:w-auto"
              >
                {isDownloadingHTML ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                    Generating HTML...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Download as HTML
                  </div>
                )}
              </Button>
            </div>
          </div>
          
          <div className="border-t pt-4">
            <h3 className="font-medium mb-2">Share with Clinician</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Send your clinical summary directly to your healthcare provider via email.
            </p>
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="clinician-email">Clinician Email</Label>
                <Input
                  id="clinician-email"
                  type="email"
                  placeholder="doctor@example.com"
                  value={clinicianEmail}
                  onChange={(e) => setClinicianEmail(e.target.value)}
                />
              </div>
              <Button 
                onClick={handleShareWithClinician} 
                disabled={isSharing}
                className="w-full sm:w-auto"
              >
                {isSharing ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                    Sending...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Share className="h-4 w-4" />
                    Share with Clinician
                  </div>
                )}
              </Button>
            </div>
          </div>
        </div>
        
        <div className="rounded-lg bg-muted p-4">
          <h4 className="font-medium mb-2">What's included in the report?</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Personal information and health metrics</li>
            <li>• Latest risk assessment and contributing factors</li>
            <li>• Lab results history</li>
            <li>• Symptom tracking history</li>
            <li>• Current medications and adherence rate</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}