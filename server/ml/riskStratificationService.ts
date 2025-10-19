import { storage } from "../storage";
import { PredictionResult } from "./model";

// Define risk stratification levels
export type RiskStratificationLevel = "low" | "moderate" | "high" | "very-high";

// Define patient risk category
export interface PatientRiskCategory {
  level: RiskStratificationLevel;
  description: string;
  color: string;
  criteria: string[];
}

// Define patient risk profile
export interface PatientRiskProfile {
  userId: string;
  username: string;
  riskScore: number;
  riskLevel: "low" | "medium" | "high";
  stratificationLevel: RiskStratificationLevel;
  lastAssessmentDate: Date;
  age: number;
  sex: number;
  conditions: string[];
  contributingFactors: Array<{
    factor: string;
    contribution: number;
    explanation: string;
  }>;
}

// Define cohort analysis data
export interface CohortAnalysisData {
  totalPatients: number;
  riskDistribution: {
    low: number;
    moderate: number;
    high: number;
    "very-high": number;
  };
  averageRiskScore: number;
  ageDistribution: {
    "18-30": number;
    "31-50": number;
    "51-65": number;
    "65+": number;
  };
  conditionPrevalence: Record<string, number>;
  trendData: Array<{
    date: Date;
    averageRisk: number;
    patientCount: number;
  }>;
}

export class RiskStratificationService {
  // Define risk categories
  private riskCategories: PatientRiskCategory[] = [
    {
      level: "low",
      description: "Low Risk",
      color: "green",
      criteria: [
        "Risk score < 30%",
        "No significant contributing factors",
        "Stable health metrics"
      ]
    },
    {
      level: "moderate",
      description: "Moderate Risk",
      color: "yellow",
      criteria: [
        "Risk score 30-50%",
        "1-2 moderate risk factors",
        "Some health concerns requiring monitoring"
      ]
    },
    {
      level: "high",
      description: "High Risk",
      color: "orange",
      criteria: [
        "Risk score 51-75%",
        "Multiple risk factors present",
        "Requires regular monitoring and intervention"
      ]
    },
    {
      level: "very-high",
      description: "Very High Risk",
      color: "red",
      criteria: [
        "Risk score > 75%",
        "Multiple severe risk factors",
        "Requires immediate clinical attention"
      ]
    }
  ];

  // Stratify a patient based on their risk score and other factors
  public stratifyPatient(riskScore: number, contributingFactors: any[], conditions: string[]): RiskStratificationLevel {
    // Start with basic risk score stratification
    let stratificationLevel: RiskStratificationLevel = "low";
    
    if (riskScore > 75) {
      stratificationLevel = "very-high";
    } else if (riskScore > 50) {
      stratificationLevel = "high";
    } else if (riskScore > 30) {
      stratificationLevel = "moderate";
    }
    
    // Adjust based on contributing factors
    const highImpactFactors = contributingFactors.filter(factor => 
      Math.abs(factor.contribution) > 0.15
    );
    
    // If patient has multiple high-impact factors, elevate risk
    if (highImpactFactors.length >= 3 && stratificationLevel !== "very-high") {
      if (stratificationLevel === "high") {
        stratificationLevel = "very-high";
      } else {
        stratificationLevel = "high";
      }
    }
    
    // Adjust based on conditions
    const severeConditions = ["heart-disease", "severe-hypertension", "diabetes-type-2"];
    const hasSevereCondition = conditions.some(condition => 
      severeConditions.includes(condition)
    );
    
    // If patient has severe conditions, elevate risk
    if (hasSevereCondition && stratificationLevel !== "very-high") {
      if (stratificationLevel === "low") {
        stratificationLevel = "moderate";
      } else if (stratificationLevel === "moderate") {
        stratificationLevel = "high";
      } else if (stratificationLevel === "high") {
        stratificationLevel = "very-high";
      }
    }
    
    return stratificationLevel;
  }

  // Get patient risk profile
  public async getPatientRiskProfile(userId: string): Promise<PatientRiskProfile | null> {
    try {
      // Get user information
      const user = await storage.getUser(userId);
      if (!user) {
        return null;
      }
      
      // Get clinical entries
      const clinicalEntries = await storage.getClinicalEntries(userId);
      if (clinicalEntries.length === 0) {
        return null;
      }
      
      // Get latest clinical entry
      const latestClinicalEntry = clinicalEntries[clinicalEntries.length - 1];
      
      // Get predictions
      const predictions = await storage.getPredictions(userId);
      if (predictions.length === 0) {
        return null;
      }
      
      // Get latest prediction
      const latestPrediction = predictions[predictions.length - 1];
      
      // Get conditions from clinical entry
      const conditions: string[] = [];
      if (latestClinicalEntry.cp > 0) conditions.push("chest-pain");
      if (latestClinicalEntry.trestbps >= 140) conditions.push("hypertension");
      if (latestClinicalEntry.chol >= 240) conditions.push("high-cholesterol");
      if (latestClinicalEntry.fbs === 1) conditions.push("diabetes");
      if (latestClinicalEntry.exang === 1) conditions.push("exercise-angina");
      
      // Parse SHAP features
      let shapFeatures: any[] = [];
      if (latestPrediction.shapTopFeatures) {
        shapFeatures = Array.isArray(latestPrediction.shapTopFeatures) 
          ? latestPrediction.shapTopFeatures 
          : JSON.parse(latestPrediction.shapTopFeatures as any);
      }
      
      // Stratify patient
      const stratificationLevel = this.stratifyPatient(
        latestPrediction.score,
        shapFeatures,
        conditions
      );
      
      return {
        userId: user.id,
        username: user.username,
        riskScore: latestPrediction.score,
        riskLevel: latestPrediction.label as "low" | "medium" | "high",
        stratificationLevel,
        lastAssessmentDate: latestPrediction.timestamp,
        age: latestClinicalEntry.age,
        sex: latestClinicalEntry.sex,
        conditions,
        contributingFactors: shapFeatures.map((feature: any) => ({
          factor: feature.feature,
          contribution: feature.contribution,
          explanation: feature.explanation
        }))
      };
    } catch (error) {
      console.error("Error getting patient risk profile:", error);
      return null;
    }
  }

  // Get all patients with risk stratification
  public async getAllPatientsWithRiskStratification(): Promise<PatientRiskProfile[]> {
    try {
      // In a real implementation, we would fetch all patients from the database
      // For now, we'll return mock data but in a real app this would come from the database
      // This is just for demonstration purposes
      
      // In a real implementation, we would:
      // 1. Get all users
      // 2. For each user, get their latest clinical entry and prediction
      // 3. Apply risk stratification
      // 4. Return the results
      
      return [];
    } catch (error) {
      console.error("Error getting all patients with risk stratification:", error);
      return [];
    }
  }

  // Perform cohort analysis
  public async performCohortAnalysis(): Promise<CohortAnalysisData> {
    try {
      // In a real implementation, we would analyze all patients in the system
      // For now, we'll return mock data but in a real app this would come from the database
      
      return {
        totalPatients: 0,
        riskDistribution: {
          low: 0,
          moderate: 0,
          high: 0,
          "very-high": 0
        },
        averageRiskScore: 0,
        ageDistribution: {
          "18-30": 0,
          "31-50": 0,
          "51-65": 0,
          "65+": 0
        },
        conditionPrevalence: {},
        trendData: []
      };
    } catch (error) {
      console.error("Error performing cohort analysis:", error);
      return {
        totalPatients: 0,
        riskDistribution: {
          low: 0,
          moderate: 0,
          high: 0,
          "very-high": 0
        },
        averageRiskScore: 0,
        ageDistribution: {
          "18-30": 0,
          "31-50": 0,
          "51-65": 0,
          "65+": 0
        },
        conditionPrevalence: {},
        trendData: []
      };
    }
  }

  // Get risk categories
  public getRiskCategories(): PatientRiskCategory[] {
    return this.riskCategories;
  }
}

// Export a singleton instance of the risk stratification service
export const riskStratificationService = new RiskStratificationService();