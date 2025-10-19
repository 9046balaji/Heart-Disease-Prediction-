import { labResultsService, LabTrend } from "./labResultsService";
import { symptomService, SymptomTrend } from "../symptoms/symptomService";

export interface HealthTrendData {
  labTrends: LabTrend[];
  symptomTrends: SymptomTrend[];
  compositeRisk?: CompositeRiskTrend;
}

export interface CompositeRiskTrend {
  values: Array<{
    date: Date;
    riskScore: number;
    contributingFactors: Array<{
      factor: string;
      contribution: number;
    }>;
  }>;
}

export interface TrendFilterOptions {
  startDate?: Date;
  endDate?: Date;
  metrics?: string[];
  timeRange?: "7d" | "30d" | "90d" | "1y" | "all";
}

// Define health metric ranges for comparison
export interface HealthMetricRange {
  metric: string;
  optimalRange: { min: number | null; max: number | null };
  normalRange: { min: number | null; max: number | null };
  highRiskRange: { min: number | null; max: number | null };
}

export class HealthTrendsService {
  // Get all health trend data for a user
  public async getHealthTrends(userId: string, filterOptions?: TrendFilterOptions): Promise<HealthTrendData> {
    // Get lab trends
    let labTrends = await labResultsService.getLabTrends(userId);
    
    // Get symptom trends
    let symptomTrends = await symptomService.getSymptomTrends(userId);
    
    // Apply filters if provided
    if (filterOptions) {
      // Filter by date range
      if (filterOptions.startDate || filterOptions.endDate) {
        labTrends = this.filterLabTrendsByDate(labTrends, filterOptions.startDate, filterOptions.endDate);
        symptomTrends = this.filterSymptomTrendsByDate(symptomTrends, filterOptions.startDate, filterOptions.endDate);
      }
      
      // Filter by specific metrics
      if (filterOptions.metrics && filterOptions.metrics.length > 0) {
        // Only filter lab trends by lab-specific metrics
        // Common lab metrics: bloodPressure, cholesterol, hba1c
        const labMetrics = filterOptions.metrics.filter((m: any) => 
          ['bloodPressure', 'cholesterol', 'hba1c'].includes(m)
        );
        const symptomMetrics = filterOptions.metrics.filter((m: any) => 
          !['bloodPressure', 'cholesterol', 'hba1c'].includes(m)
        );
        
        if (labMetrics.length > 0) {
          labTrends = labTrends.filter((trend: any) => labMetrics.includes(trend.type));
        }
        
        if (symptomMetrics.length > 0) {
          symptomTrends = symptomTrends.filter((trend: any) => symptomMetrics.includes(trend.type));
        }
      }
      
      // Filter by time range
      if (filterOptions.timeRange && filterOptions.timeRange !== "all") {
        const endDate = new Date();
        let startDate: Date;
        
        switch (filterOptions.timeRange) {
          case "7d":
            startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          case "30d":
            startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);
            break;
          case "90d":
            startDate = new Date(endDate.getTime() - 90 * 24 * 60 * 60 * 1000);
            break;
          case "1y":
            startDate = new Date(endDate.getTime() - 365 * 24 * 60 * 60 * 1000);
            break;
          default:
            startDate = new Date(0);
        }
        
        labTrends = this.filterLabTrendsByDate(labTrends, startDate, endDate);
        symptomTrends = this.filterSymptomTrendsByDate(symptomTrends, startDate, endDate);
      }
    }
    
    // Calculate composite risk trend
    const compositeRisk = this.calculateCompositeRiskTrend(labTrends, symptomTrends);
    
    return {
      labTrends,
      symptomTrends,
      compositeRisk
    };
  }
  
  // Filter lab trends by date range
  private filterLabTrendsByDate(labTrends: LabTrend[], startDate?: Date, endDate?: Date): LabTrend[] {
    if (!startDate && !endDate) return labTrends;
    
    return labTrends.map((trend: any) => {
      const filteredValues = trend.values.filter((value: any) => {
        const valueDate = new Date(value.date);
        return (!startDate || valueDate >= startDate) && (!endDate || valueDate <= endDate);
      });
      
      return {
        ...trend,
        values: filteredValues
      };
    }).filter((trend: any) => trend.values.length > 0);
  }
  
  // Filter symptom trends by date range
  private filterSymptomTrendsByDate(symptomTrends: SymptomTrend[], startDate?: Date, endDate?: Date): SymptomTrend[] {
    if (!startDate && !endDate) return symptomTrends;
    
    return symptomTrends.map((trend: any) => {
      const filteredValues = trend.values.filter((value: any) => {
        const valueDate = new Date(value.date);
        return (!startDate || valueDate >= startDate) && (!endDate || valueDate <= endDate);
      });
      
      return {
        ...trend,
        values: filteredValues
      };
    }).filter((trend: any) => trend.values.length > 0);
  }
  
  // Calculate composite risk trend based on lab and symptom data
  private calculateCompositeRiskTrend(labTrends: LabTrend[], symptomTrends: SymptomTrend[]): CompositeRiskTrend | undefined {
    // If we don't have enough data, return undefined
    if (labTrends.length === 0 && symptomTrends.length === 0) {
      return undefined;
    }
    
    // Collect all dates from both lab and symptom trends
    const allDates: Date[] = [];
    
    labTrends.forEach(trend => {
      trend.values.forEach(value => {
        const date = new Date(value.date);
        if (!allDates.some(d => d.getTime() === date.getTime())) {
          allDates.push(date);
        }
      });
    });
    
    symptomTrends.forEach(trend => {
      trend.values.forEach((value: any) => {
        const date = new Date(value.date);
        if (!allDates.some(d => d.getTime() === date.getTime())) {
          allDates.push(date);
        }
      });
    });
    
    // Sort dates
    allDates.sort((a: any, b: any) => a.getTime() - b.getTime());
    
    // Calculate risk score for each date
    const riskValues = allDates.map((date: any) => {
      // This is a simplified risk calculation
      // In a real implementation, this would use the ML model
      let riskScore = 0;
      const contributingFactors: Array<{ factor: string; contribution: number }> = [];
      
      // Check blood pressure
      const bpTrend = labTrends.find(t => t.type === "bloodPressure");
      if (bpTrend) {
        const bpValue = bpTrend.values.find((v: any) => new Date(v.date).getTime() === date.getTime());
        if (bpValue && bpValue.systolic && bpValue.diastolic) {
          // High blood pressure contributes to risk
          if (bpValue.systolic > 140 || bpValue.diastolic > 90) {
            const contribution = Math.min(30, (bpValue.systolic - 140) * 0.5 + (bpValue.diastolic - 90) * 1);
            riskScore += contribution;
            contributingFactors.push({ factor: "High Blood Pressure", contribution });
          }
        }
      }
      
      // Check cholesterol
      const cholesterolTrend = labTrends.find(t => t.type === "cholesterol");
      if (cholesterolTrend) {
        const cholesterolValue = cholesterolTrend.values.find((v: any) => new Date(v.date).getTime() === date.getTime());
        if (cholesterolValue && cholesterolValue.totalCholesterol) {
          // High cholesterol contributes to risk
          if (cholesterolValue.totalCholesterol > 200) {
            const contribution = Math.min(20, (cholesterolValue.totalCholesterol - 200) * 0.2);
            riskScore += contribution;
            contributingFactors.push({ factor: "High Cholesterol", contribution });
          }
        }
      }
      
      // Check symptoms
      symptomTrends.forEach(trend => {
        const symptomValue = trend.values.find((v: any) => new Date(v.date).getTime() === date.getTime());
        if (symptomValue && symptomValue.severity) {
          // Severe symptoms contribute to risk
          const contribution = Math.min(15, symptomValue.severity * 1.5);
          riskScore += contribution;
          contributingFactors.push({ factor: `Severe ${trend.type}`, contribution });
        }
      });
      
      // Cap risk score at 100
      riskScore = Math.min(100, Math.max(0, riskScore));
      
      return {
        date,
        riskScore,
        contributingFactors
      };
    });
    
    return {
      values: riskValues
    };
  }
  
  // Get lab trends only
  public async getLabTrends(userId: string): Promise<LabTrend[]> {
    return await labResultsService.getLabTrends(userId);
  }
  
  // Get symptom trends only
  public async getSymptomTrends(userId: string): Promise<SymptomTrend[]> {
    return await symptomService.getSymptomTrends(userId);
  }
  
  // Get health metric ranges for comparison
  public getHealthMetricRanges(): HealthMetricRange[] {
    return [
      {
        metric: "bloodPressure_systolic",
        optimalRange: { min: null, max: 120 },
        normalRange: { min: 120, max: 139 },
        highRiskRange: { min: 140, max: null }
      },
      {
        metric: "bloodPressure_diastolic",
        optimalRange: { min: null, max: 80 },
        normalRange: { min: 80, max: 89 },
        highRiskRange: { min: 90, max: null }
      },
      {
        metric: "cholesterol_total",
        optimalRange: { min: null, max: 200 },
        normalRange: { min: 200, max: 239 },
        highRiskRange: { min: 240, max: null }
      },
      {
        metric: "cholesterol_ldl",
        optimalRange: { min: null, max: 100 },
        normalRange: { min: 100, max: 129 },
        highRiskRange: { min: 130, max: null }
      },
      {
        metric: "cholesterol_hdl",
        optimalRange: { min: 60, max: null },
        normalRange: { min: 40, max: 59 },
        highRiskRange: { min: null, max: 40 }
      },
      {
        metric: "hba1c",
        optimalRange: { min: null, max: 5.7 },
        normalRange: { min: 5.7, max: 6.4 },
        highRiskRange: { min: 6.5, max: null }
      }
    ];
  }
  
  // Get comparative analysis data
  public async getComparativeAnalysisData(userId: string): Promise<any> {
    const healthTrends = await this.getHealthTrends(userId);
    
    // Get the latest values for each metric
    const latestData: any = {};
    
    // Blood pressure
    const bpTrend = healthTrends.labTrends.find(t => t.type === "bloodPressure");
    if (bpTrend && bpTrend.values.length > 0) {
      const latest = bpTrend.values[bpTrend.values.length - 1];
      latestData.bloodPressure = {
        systolic: latest.systolic,
        diastolic: latest.diastolic
      };
    }
    
    // Cholesterol
    const cholesterolTrend = healthTrends.labTrends.find(t => t.type === "cholesterol");
    if (cholesterolTrend && cholesterolTrend.values.length > 0) {
      const latest = cholesterolTrend.values[cholesterolTrend.values.length - 1];
      latestData.cholesterol = {
        total: latest.totalCholesterol,
        ldl: latest.ldl,
        hdl: latest.hdl
      };
    }
    
    // HbA1c
    const hba1cTrend = healthTrends.labTrends.find(t => t.type === "hba1c");
    if (hba1cTrend && hba1cTrend.values.length > 0) {
      const latest = hba1cTrend.values[hba1cTrend.values.length - 1];
      latestData.hba1c = latest.hba1c;
    }
    
    // Composite risk
    if (healthTrends.compositeRisk && healthTrends.compositeRisk.values.length > 0) {
      const latest = healthTrends.compositeRisk.values[healthTrends.compositeRisk.values.length - 1];
      latestData.compositeRisk = {
        score: latest.riskScore,
        factors: latest.contributingFactors
      };
    }
    
    return {
      latestData,
      metricRanges: this.getHealthMetricRanges()
    };
  }
}

// Export a singleton instance of the health trends service
export const healthTrendsService = new HealthTrendsService();