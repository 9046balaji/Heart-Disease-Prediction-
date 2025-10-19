import { storage } from "../storage";
import { exportService } from "../exports/exportService";

// Define anonymized patient data structure
export interface AnonymizedPatientData {
  id: string;
  ageGroup: string;
  sex: number;
  riskScore: number;
  riskLevel: string;
  conditions: string[];
  contributingFactors: Array<{
    factor: string;
    contribution: number;
  }>;
  assessmentDate: Date;
}

// Define research dataset structure
export interface ResearchDataset {
  metadata: {
    generatedAt: Date;
    totalPatients: number;
    version: string;
  };
  patients: AnonymizedPatientData[];
}

export class ResearchExportService {
  // Anonymize patient data for research purposes
  private anonymizePatientData(patientData: any): AnonymizedPatientData {
    // Remove any personally identifiable information
    // Assign a new random ID
    const anonymizedId = this.generateAnonymizedId(patientData.userId);
    
    // Categorize age into groups
    const ageGroup = this.categorizeAge(patientData.age);
    
    // Extract conditions from clinical data
    const conditions: string[] = [];
    if (patientData.cp > 0) conditions.push("chest-pain");
    if (patientData.trestbps >= 140) conditions.push("hypertension");
    if (patientData.chol >= 240) conditions.push("high-cholesterol");
    if (patientData.fbs === 1) conditions.push("diabetes");
    if (patientData.exang === 1) conditions.push("exercise-angina");
    if (patientData.smokingStatus === "current") conditions.push("smoking");
    
    // Extract contributing factors from SHAP features
    let contributingFactors: Array<{ factor: string; contribution: number }> = [];
    if (patientData.shapTopFeatures) {
      const shapFeatures = Array.isArray(patientData.shapTopFeatures) 
        ? patientData.shapTopFeatures 
        : JSON.parse(patientData.shapTopFeatures as any);
      
      contributingFactors = shapFeatures.map((feature: any) => ({
        factor: feature.feature,
        contribution: feature.contribution
      }));
    }
    
    return {
      id: anonymizedId,
      ageGroup,
      sex: patientData.sex,
      riskScore: patientData.score,
      riskLevel: patientData.label,
      conditions,
      contributingFactors,
      assessmentDate: patientData.timestamp
    };
  }

  // Generate anonymized ID
  private generateAnonymizedId(originalId: string): string {
    // Simple hash-based anonymization (in a real implementation, use a proper hashing algorithm)
    let hash = 0;
    for (let i = 0; i < originalId.length; i++) {
      const char = originalId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return `PID${Math.abs(hash) % 1000000}`;
  }

  // Categorize age into groups
  private categorizeAge(age: number): string {
    if (age < 30) return "18-29";
    if (age < 50) return "30-49";
    if (age < 65) return "50-64";
    return "65+";
  }

  // Export anonymized research dataset as JSON
  public async exportResearchDatasetAsJSON(): Promise<string> {
    try {
      // In a real implementation, we would fetch all patients from the database
      // For now, we'll return mock data but in a real app this would come from the database
      
      // This is just for demonstration purposes
      const mockPatients: AnonymizedPatientData[] = [
        {
          id: "PID123456",
          ageGroup: "50-64",
          sex: 1,
          riskScore: 75,
          riskLevel: "high",
          conditions: ["hypertension", "high-cholesterol", "smoking"],
          contributingFactors: [
            { factor: "trestbps", contribution: 0.15 },
            { factor: "chol", contribution: 0.12 },
            { factor: "smoking", contribution: 0.15 }
          ],
          assessmentDate: new Date("2025-10-10")
        },
        {
          id: "PID654321",
          ageGroup: "30-49",
          sex: 0,
          riskScore: 25,
          riskLevel: "low",
          conditions: [],
          contributingFactors: [
            { factor: "age", contribution: 0.05 },
            { factor: "sex", contribution: 0.02 }
          ],
          assessmentDate: new Date("2025-10-12")
        }
      ];
      
      const dataset: ResearchDataset = {
        metadata: {
          generatedAt: new Date(),
          totalPatients: mockPatients.length,
          version: "1.0.0"
        },
        patients: mockPatients
      };
      
      return JSON.stringify(dataset, null, 2);
    } catch (error) {
      console.error("Error exporting research dataset as JSON:", error);
      throw new Error("Failed to export research dataset");
    }
  }

  // Export anonymized research dataset as CSV
  public async exportResearchDatasetAsCSV(): Promise<string> {
    try {
      // In a real implementation, we would fetch all patients from the database
      // For now, we'll return mock data but in a real app this would come from the database
      
      // This is just for demonstration purposes
      let csvContent = "PatientID,AgeGroup,Sex,RiskScore,RiskLevel,Conditions,Factors,AssessmentDate\n";
      
      const mockPatients: AnonymizedPatientData[] = [
        {
          id: "PID123456",
          ageGroup: "50-64",
          sex: 1,
          riskScore: 75,
          riskLevel: "high",
          conditions: ["hypertension", "high-cholesterol", "smoking"],
          contributingFactors: [
            { factor: "trestbps", contribution: 0.15 },
            { factor: "chol", contribution: 0.12 },
            { factor: "smoking", contribution: 0.15 }
          ],
          assessmentDate: new Date("2025-10-10")
        },
        {
          id: "PID654321",
          ageGroup: "30-49",
          sex: 0,
          riskScore: 25,
          riskLevel: "low",
          conditions: [],
          contributingFactors: [
            { factor: "age", contribution: 0.05 },
            { factor: "sex", contribution: 0.02 }
          ],
          assessmentDate: new Date("2025-10-12")
        }
      ];
      
      mockPatients.forEach(patient => {
        const conditions = patient.conditions.join("|");
        const factors = patient.contributingFactors.map(f => `${f.factor}:${f.contribution}`).join("|");
        const assessmentDate = patient.assessmentDate.toISOString().split('T')[0];
        
        csvContent += `"${patient.id}","${patient.ageGroup}",${patient.sex},${patient.riskScore},"${patient.riskLevel}","${conditions}","${factors}","${assessmentDate}"\n`;
      });
      
      return csvContent;
    } catch (error) {
      console.error("Error exporting research dataset as CSV:", error);
      throw new Error("Failed to export research dataset");
    }
  }

  // Get research dataset statistics
  public async getResearchDatasetStatistics(): Promise<any> {
    try {
      // In a real implementation, we would fetch all patients from the database
      // For now, we'll return mock data but in a real app this would come from the database
      
      return {
        totalPatients: 0,
        riskDistribution: {
          low: 0,
          medium: 0,
          high: 0
        },
        ageDistribution: {
          "18-29": 0,
          "30-49": 0,
          "50-64": 0,
          "65+": 0
        },
        conditionPrevalence: {},
        averageRiskScore: 0
      };
    } catch (error) {
      console.error("Error getting research dataset statistics:", error);
      throw new Error("Failed to get research dataset statistics");
    }
  }
}

// Export a singleton instance of the research export service
export const researchExportService = new ResearchExportService();