import { storage } from "../storage";
import { riskStratificationService } from "../ml/riskStratificationService";

// Define cohort analysis filters
export interface CohortFilters {
  ageRange?: { min: number; max: number };
  sex?: number;
  riskLevel?: string;
  conditions?: string[];
  dateRange?: { start: Date; end: Date };
}

// Define cohort analysis results
export interface CohortAnalysisResults {
  cohortId: string;
  name: string;
  filters: CohortFilters;
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
      date: Date;
      averageRisk: number;
      patientCount: number;
    }>;
    conditionTrend: Array<{
      date: Date;
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
  createdAt: Date;
}

export class CohortAnalysisService {
  private cohorts: Map<string, CohortAnalysisResults> = new Map();

  // Analyze a cohort based on filters
  public async analyzeCohort(name: string, filters: CohortFilters): Promise<CohortAnalysisResults> {
    const cohortId = this.generateId();
    
    try {
      // In a real implementation, we would:
      // 1. Fetch patients based on filters
      // 2. Calculate statistics
      // 3. Generate trends
      // 4. Perform comparisons
      
      // For now, we'll return mock data
      const results: CohortAnalysisResults = {
        cohortId,
        name,
        filters,
        statistics: {
          totalPatients: 150,
          riskDistribution: {
            low: 45,
            moderate: 50,
            high: 40,
            "very-high": 15
          },
          averageRiskScore: 45.2,
          medianRiskScore: 42.5,
          ageDistribution: {
            "18-30": 25,
            "31-50": 50,
            "51-65": 55,
            "65+": 20
          },
          conditionPrevalence: {
            "hypertension": 65,
            "high-cholesterol": 58,
            "diabetes": 22,
            "smoking": 35
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
            { date: new Date("2025-01-01"), averageRisk: 42.1, patientCount: 120 },
            { date: new Date("2025-02-01"), averageRisk: 43.5, patientCount: 125 },
            { date: new Date("2025-03-01"), averageRisk: 44.2, patientCount: 130 },
            { date: new Date("2025-04-01"), averageRisk: 45.8, patientCount: 135 },
            { date: new Date("2025-05-01"), averageRisk: 44.9, patientCount: 140 },
            { date: new Date("2025-06-01"), averageRisk: 45.2, patientCount: 150 }
          ],
          conditionTrend: [
            { date: new Date("2025-01-01"), condition: "hypertension", prevalence: 62 },
            { date: new Date("2025-02-01"), condition: "hypertension", prevalence: 63 },
            { date: new Date("2025-03-01"), condition: "hypertension", prevalence: 64 },
            { date: new Date("2025-04-01"), condition: "hypertension", prevalence: 65 },
            { date: new Date("2025-05-01"), condition: "hypertension", prevalence: 66 },
            { date: new Date("2025-06-01"), condition: "hypertension", prevalence: 65 }
          ]
        },
        comparisons: [
          {
            cohortId: "comp1",
            cohortName: "All Patients",
            riskDifference: -2.3,
            statisticalSignificance: 0.05
          }
        ],
        createdAt: new Date()
      };
      
      this.cohorts.set(cohortId, results);
      return results;
    } catch (error) {
      console.error("Error analyzing cohort:", error);
      throw new Error("Failed to analyze cohort");
    }
  }

  // Get all cohort analyses
  public async getCohortAnalyses(): Promise<CohortAnalysisResults[]> {
    return Array.from(this.cohorts.values());
  }

  // Get a specific cohort analysis
  public async getCohortAnalysis(cohortId: string): Promise<CohortAnalysisResults | undefined> {
    return this.cohorts.get(cohortId);
  }

  // Compare two cohorts
  public async compareCohorts(cohortId1: string, cohortId2: string): Promise<any> {
    const cohort1 = this.cohorts.get(cohortId1);
    const cohort2 = this.cohorts.get(cohortId2);
    
    if (!cohort1 || !cohort2) {
      throw new Error("One or both cohorts not found");
    }
    
    // Calculate differences
    const riskDifference = cohort1.statistics.averageRiskScore - cohort2.statistics.averageRiskScore;
    
    return {
      cohort1: {
        id: cohortId1,
        name: cohort1.name,
        averageRiskScore: cohort1.statistics.averageRiskScore
      },
      cohort2: {
        id: cohortId2,
        name: cohort2.name,
        averageRiskScore: cohort2.statistics.averageRiskScore
      },
      riskDifference,
      percentageDifference: (riskDifference / cohort2.statistics.averageRiskScore) * 100
    };
  }

  // Get predefined cohort templates
  public getPredefinedCohortTemplates(): any[] {
    return [
      {
        id: "high-risk",
        name: "High Risk Patients",
        description: "Patients with high or very-high risk stratification",
        filters: {
          riskLevel: "high|very-high"
        }
      },
      {
        id: "hypertensive",
        name: "Hypertensive Patients",
        description: "Patients with hypertension condition",
        filters: {
          conditions: ["hypertension"]
        }
      },
      {
        id: "elderly",
        name: "Elderly Patients",
        description: "Patients aged 65 and above",
        filters: {
          ageRange: { min: 65, max: 120 }
        }
      },
      {
        id: "poor-adherence",
        name: "Poor Treatment Adherence",
        description: "Patients with medication adherence below 70%",
        filters: {
          // This would require additional data in a real implementation
        }
      }
    ];
  }

  // Generate a unique ID
  private generateId(): string {
    return `cohort_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export a singleton instance of the cohort analysis service
export const cohortAnalysisService = new CohortAnalysisService();