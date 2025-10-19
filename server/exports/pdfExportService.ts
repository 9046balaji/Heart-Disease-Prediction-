// PDF Export service for the HeartGuard application
// This service handles PDF generation for clinician summary reports

import { labResultsService } from "../clinical/labResultsService";
import { symptomService } from "../symptoms/symptomService";
import { storage } from "../storage";

// In a real implementation, we would use a library like pdfkit or puppeteer
// For this implementation, we'll create a simple text-based PDF-like structure

export interface ClinicalSummary {
  patientInfo: {
    name: string;
    age: number;
    sex: string;
    height?: number;
    weight?: number;
  };
  riskAssessment: {
    riskScore?: number;
    riskLevel?: string;
    lastAssessmentDate?: Date;
    contributingFactors?: string[];
  };
  labResults: Array<{
    date: Date;
    type: string;
    systolic?: number;
    diastolic?: number;
    totalCholesterol?: number;
    ldl?: number;
    hdl?: number;
    triglycerides?: number;
    hba1c?: number;
    notes?: string;
  }>;
  symptoms: Array<{
    date: Date;
    type: string;
    severity?: number;
    duration?: string;
    notes?: string;
  }>;
  medications: Array<{
    name: string;
    dosage: string;
    frequency: string;
    startDate: Date;
    endDate?: Date;
  }>;
  adherenceRate?: number;
  lastUpdated: Date;
}

export class PDFExportService {
  // Generate a clinical summary report as a formatted text (PDF-like structure)
  public async generateClinicalSummaryPDF(userId: string): Promise<string> {
    try {
      // Get user information
      const user = await storage.getUser(userId);
      if (!user) {
        throw new Error("User not found");
      }
      
      // Get clinical entries for risk assessment
      const clinicalEntries = await storage.getClinicalEntries(userId);
      const latestClinicalEntry = clinicalEntries.length > 0 ? clinicalEntries[clinicalEntries.length - 1] : null;
      
      // Get lab results
      const labResults = await labResultsService.getLabResults(userId);
      
      // Get symptoms
      const symptoms = await symptomService.getSymptoms(userId);
      
      // Get medications
      const medications = await storage.getMedications(userId);
      
      // Calculate adherence rate from medications
      let adherenceRate = 0;
      if (medications.length > 0) {
        const totalHistory = medications.reduce((sum, med) => sum + (med.takenHistory as any[]).length, 0);
        const takenHistory = medications.reduce((sum, med) => 
          sum + (med.takenHistory as any[]).filter((entry: any) => entry.taken).length, 0);
        
        if (totalHistory > 0) {
          adherenceRate = Math.round((takenHistory / totalHistory) * 100);
        }
      }
      
      // Create clinical summary object
      const summary: ClinicalSummary = {
        patientInfo: {
          name: user.username,
          age: latestClinicalEntry?.age || 0,
          sex: latestClinicalEntry?.sex === 1 ? "Male" : "Female",
          height: latestClinicalEntry?.height || undefined,
          weight: latestClinicalEntry?.weight || undefined
        },
        riskAssessment: {
          riskScore: undefined, // In a real implementation, this would come from the prediction service
          riskLevel: undefined,
          lastAssessmentDate: latestClinicalEntry?.timestamp,
          contributingFactors: latestClinicalEntry ? [
            `Age: ${latestClinicalEntry.age}`,
            `Sex: ${latestClinicalEntry.sex === 1 ? "Male" : "Female"}`,
            `Blood Pressure: ${latestClinicalEntry.trestbps} mmHg`,
            `Cholesterol: ${latestClinicalEntry.chol} mg/dL`
          ] : []
        },
        labResults: labResults.map(result => ({
          date: result.date,
          type: result.type,
          systolic: result.systolic !== null ? result.systolic : undefined,
          diastolic: result.diastolic !== null ? result.diastolic : undefined,
          totalCholesterol: result.totalCholesterol !== null ? result.totalCholesterol : undefined,
          ldl: result.ldl !== null ? result.ldl : undefined,
          hdl: result.hdl !== null ? result.hdl : undefined,
          triglycerides: result.triglycerides !== null ? result.triglycerides : undefined,
          hba1c: result.hba1c !== null ? result.hba1c : undefined,
          notes: result.notes !== null ? result.notes : undefined
        })),
        symptoms: symptoms.map(symptom => ({
          date: symptom.timestamp,
          type: symptom.type,
          severity: symptom.severity !== null ? symptom.severity : undefined,
          duration: symptom.duration !== null ? symptom.duration : undefined,
          notes: symptom.notes !== null ? symptom.notes : undefined
        })),
        medications: medications.map(med => ({
          name: med.name,
          dosage: med.dosage,
          frequency: med.frequency,
          startDate: med.startDate,
          endDate: med.endDate !== null ? med.endDate : undefined
        })),
        adherenceRate,
        lastUpdated: new Date()
      };
      
      // Generate formatted text report
      return this.formatClinicalSummary(summary);
    } catch (error) {
      console.error("Error generating clinical summary PDF:", error);
      throw new Error(`Failed to generate clinical summary: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  // Format clinical summary as a text-based report
  private formatClinicalSummary(summary: ClinicalSummary): string {
    let report = "";
    
    // Header
    report += "HEARTGUARD CLINICAL SUMMARY REPORT\n";
    report += "==================================\n\n";
    
    // Patient Information
    report += "PATIENT INFORMATION\n";
    report += "-------------------\n";
    report += `Name: ${summary.patientInfo.name}\n`;
    report += `Age: ${summary.patientInfo.age}\n`;
    report += `Sex: ${summary.patientInfo.sex}\n`;
    if (summary.patientInfo.height) {
      report += `Height: ${summary.patientInfo.height} cm\n`;
    }
    if (summary.patientInfo.weight) {
      report += `Weight: ${summary.patientInfo.weight} kg\n`;
    }
    report += "\n";
    
    // Risk Assessment
    report += "RISK ASSESSMENT\n";
    report += "---------------\n";
    if (summary.riskAssessment.riskScore !== undefined) {
      report += `Risk Score: ${summary.riskAssessment.riskScore}\n`;
    }
    if (summary.riskAssessment.riskLevel) {
      report += `Risk Level: ${summary.riskAssessment.riskLevel}\n`;
    }
    if (summary.riskAssessment.lastAssessmentDate) {
      report += `Last Assessment: ${summary.riskAssessment.lastAssessmentDate.toISOString().split('T')[0]}\n`;
    }
    if (summary.riskAssessment.contributingFactors && summary.riskAssessment.contributingFactors.length > 0) {
      report += "Contributing Factors:\n";
      summary.riskAssessment.contributingFactors.forEach(factor => {
        report += `  - ${factor}\n`;
      });
    }
    report += "\n";
    
    // Lab Results
    report += "LAB RESULTS\n";
    report += "-----------\n";
    if (summary.labResults.length > 0) {
      summary.labResults.forEach(result => {
        report += `${result.date.toISOString().split('T')[0]} - ${result.type}\n`;
        if (result.systolic !== undefined && result.diastolic !== undefined) {
          report += `  Blood Pressure: ${result.systolic}/${result.diastolic} mmHg\n`;
        }
        if (result.totalCholesterol !== undefined) {
          report += `  Total Cholesterol: ${result.totalCholesterol} mg/dL\n`;
        }
        if (result.ldl !== undefined) {
          report += `  LDL: ${result.ldl} mg/dL\n`;
        }
        if (result.hdl !== undefined) {
          report += `  HDL: ${result.hdl} mg/dL\n`;
        }
        if (result.triglycerides !== undefined) {
          report += `  Triglycerides: ${result.triglycerides} mg/dL\n`;
        }
        if (result.hba1c !== undefined) {
          report += `  HbA1c: ${result.hba1c}%\n`;
        }
        if (result.notes) {
          report += `  Notes: ${result.notes}\n`;
        }
        report += "\n";
      });
    } else {
      report += "No lab results available.\n\n";
    }
    
    // Symptoms
    report += "SYMPTOMS\n";
    report += "--------\n";
    if (summary.symptoms.length > 0) {
      summary.symptoms.forEach(symptom => {
        report += `${symptom.date.toISOString().split('T')[0]} - ${symptom.type}\n`;
        if (symptom.severity !== undefined) {
          report += `  Severity: ${symptom.severity}/10\n`;
        }
        if (symptom.duration) {
          report += `  Duration: ${symptom.duration}\n`;
        }
        if (symptom.notes) {
          report += `  Notes: ${symptom.notes}\n`;
        }
        report += "\n";
      });
    } else {
      report += "No symptoms reported.\n\n";
    }
    
    // Medications
    report += "MEDICATIONS\n";
    report += "-----------\n";
    if (summary.medications.length > 0) {
      summary.medications.forEach(med => {
        report += `${med.name} - ${med.dosage}\n`;
        report += `  Frequency: ${med.frequency}\n`;
        report += `  Start Date: ${med.startDate.toISOString().split('T')[0]}\n`;
        if (med.endDate) {
          report += `  End Date: ${med.endDate.toISOString().split('T')[0]}\n`;
        }
        report += "\n";
      });
    } else {
      report += "No medications recorded.\n\n";
    }
    
    // Adherence Rate
    report += "ADHERENCE RATE\n";
    report += "--------------\n";
    report += `${summary.adherenceRate}%\n\n`;
    
    // Footer
    report += "Report Generated: " + summary.lastUpdated.toISOString().split('T')[0] + "\n";
    report += "This report is for clinical reference only.\n";
    
    return report;
  }
  
  // One-click sharing function (in a real implementation, this would send the report to a clinician)
  public async shareWithClinician(userId: string, clinicianEmail: string): Promise<boolean> {
    try {
      // In a real implementation, this would:
      // 1. Generate the PDF report
      // 2. Send it via email to the clinician
      // 3. Log the sharing event
      
      console.log(`Sharing clinical summary with clinician: ${clinicianEmail}`);
      
      // For now, we'll just simulate the sharing
      // In a real app, you would integrate with an email service like SendGrid or Nodemailer
      
      return true;
    } catch (error) {
      console.error("Error sharing with clinician:", error);
      return false;
    }
  }
}

// Export a singleton instance of the PDF export service
export const pdfExportService = new PDFExportService();