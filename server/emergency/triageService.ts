import { labResultsService } from "../clinical/labResultsService";
import { symptomService } from "../symptoms/symptomService";

export interface TriageAlert {
  type: "warning" | "danger";
  message: string;
  recommendation: string;
  triggeredAt: Date;
}

export class TriageService {
  // Check for threshold-based alerts
  public async checkForAlerts(userId: string): Promise<TriageAlert[]> {
    const alerts: TriageAlert[] = [];
    
    // Check lab results for dangerous thresholds
    const labResults = await labResultsService.getLabResults(userId);
    
    // Check for high blood pressure
    const recentBP = labResults
      .filter((r: any) => r.type === "bloodPressure")
      .sort((a: any, b: any) => b.date.getTime() - a.date.getTime())
      .slice(0, 3); // Check last 3 readings
    
    for (const bp of recentBP) {
      if (bp.systolic && bp.systolic >= 180) {
        alerts.push({
          type: "danger",
          message: `High blood pressure detected: ${bp.systolic}/${bp.diastolic} mmHg`,
          recommendation: "Seek immediate medical attention. Consider calling emergency services.",
          triggeredAt: new Date()
        });
      } else if (bp.systolic && bp.systolic >= 140) {
        alerts.push({
          type: "warning",
          message: `Elevated blood pressure detected: ${bp.systolic}/${bp.diastolic} mmHg`,
          recommendation: "Contact your healthcare provider to discuss this reading.",
          triggeredAt: new Date()
        });
      }
    }
    
    // Check for high cholesterol
    const recentCholesterol = labResults
      .filter((r: any) => r.type === "cholesterol")
      .sort((a: any, b: any) => b.date.getTime() - a.date.getTime())
      .slice(0, 1); // Check most recent reading
    
    for (const cholesterol of recentCholesterol) {
      if (cholesterol.totalCholesterol && cholesterol.totalCholesterol >= 240) {
        alerts.push({
          type: "warning",
          message: `High cholesterol detected: ${cholesterol.totalCholesterol} mg/dL`,
          recommendation: "Contact your healthcare provider to discuss cholesterol management.",
          triggeredAt: new Date()
        });
      }
    }
    
    // Check for high HbA1c
    const recentHbA1c = labResults
      .filter((r: any) => r.type === "hba1c")
      .sort((a: any, b: any) => b.date.getTime() - a.date.getTime())
      .slice(0, 1); // Check most recent reading
    
    for (const hba1c of recentHbA1c) {
      if (hba1c.hba1c && hba1c.hba1c >= 8) {
        alerts.push({
          type: "warning",
          message: `High HbA1c detected: ${hba1c.hba1c}%`,
          recommendation: "Contact your healthcare provider to discuss diabetes management.",
          triggeredAt: new Date()
        });
      }
    }
    
    // Check symptoms for concerning patterns
    const symptoms = await symptomService.getSymptoms(userId);
    
    // Check for recent chest pain
    const recentChestPain = symptoms
      .filter((s: any) => s.type === "chest_pain")
      .sort((a: any, b: any) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 1); // Check most recent
    
    for (const chestPain of recentChestPain) {
      if (chestPain.severity && chestPain.severity >= 7) {
        alerts.push({
          type: "danger",
          message: "Severe chest pain reported",
          recommendation: "Seek immediate medical attention. Consider calling emergency services.",
          triggeredAt: new Date()
        });
      }
    }
    
    // Check for recent shortness of breath
    const recentShortnessOfBreath = symptoms
      .filter((s: any) => s.type === "shortness_of_breath")
      .sort((a: any, b: any) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 1); // Check most recent
    
    for (const sob of recentShortnessOfBreath) {
      if (sob.severity && sob.severity >= 8) {
        alerts.push({
          type: "danger",
          message: "Severe shortness of breath reported",
          recommendation: "Seek immediate medical attention. Consider calling emergency services.",
          triggeredAt: new Date()
        });
      }
    }
    
    return alerts;
  }
  
  // Get alerts for a user
  public async getAlerts(userId: string): Promise<TriageAlert[]> {
    return await this.checkForAlerts(userId);
  }
}

// Export a singleton instance of the triage service
export const triageService = new TriageService();