import { storage } from "../storage";

// Define lab result types
export interface LabResult {
  id: string;
  userId: string;
  type: "bloodPressure" | "cholesterol" | "hba1c";
  systolic?: number; // For blood pressure
  diastolic?: number; // For blood pressure
  totalCholesterol?: number; // For cholesterol
  ldl?: number; // For cholesterol
  hdl?: number; // For cholesterol
  triglycerides?: number; // For cholesterol
  hba1c?: number; // For HbA1c
  date: Date;
  notes?: string;
  createdAt: Date;
}

export interface LabResultInput {
  type: "bloodPressure" | "cholesterol" | "hba1c";
  systolic?: number;
  diastolic?: number;
  totalCholesterol?: number;
  ldl?: number;
  hdl?: number;
  triglycerides?: number;
  hba1c?: number;
  date: Date;
  notes?: string;
}

export interface LabTrend {
  type: "bloodPressure" | "cholesterol" | "hba1c";
  values: Array<{
    date: Date;
    value: number;
    systolic?: number;
    diastolic?: number;
  }>;
}

export class LabTrackerService {
  // Add a new lab result for a user
  public async addLabResult(userId: string, labResult: LabResultInput): Promise<LabResult> {
    // Validate the lab result based on type
    this.validateLabResult(labResult);
    
    const result: LabResult = {
      id: this.generateId(),
      userId,
      ...labResult,
      createdAt: new Date()
    };
    
    // Save to database
    await storage.createLabResult(result);
    
    return result;
  }
  
  // Get all lab results for a user
  public async getLabResults(userId: string): Promise<LabResult[]> {
    const results = await storage.getLabResultsByUserId(userId);
    // Convert null values to undefined to match LabResult interface
    return results.map(result => ({
      ...result,
      systolic: result.systolic !== null ? result.systolic : undefined,
      diastolic: result.diastolic !== null ? result.diastolic : undefined,
      totalCholesterol: result.totalCholesterol !== null ? result.totalCholesterol : undefined,
      ldl: result.ldl !== null ? result.ldl : undefined,
      hdl: result.hdl !== null ? result.hdl : undefined,
      triglycerides: result.triglycerides !== null ? result.triglycerides : undefined,
      hba1c: result.hba1c !== null ? result.hba1c : undefined,
      notes: result.notes !== null ? result.notes : undefined
    }));
  }
  
  // Get lab results by type for a user
  public async getLabResultsByType(userId: string, type: "bloodPressure" | "cholesterol" | "hba1c"): Promise<LabResult[]> {
    const allResults = await this.getLabResults(userId);
    return allResults.filter(result => result.type === type);
  }
  
  // Get lab trends for a user
  public async getLabTrends(userId: string): Promise<LabTrend[]> {
    const results = await this.getLabResults(userId);
    
    const trends: LabTrend[] = [];
    
    // Blood pressure trend
    const bpResults = results.filter(r => r.type === "bloodPressure");
    if (bpResults.length > 0) {
      trends.push({
        type: "bloodPressure",
        values: bpResults.map(r => ({
          date: r.date,
          value: r.systolic || 0,
          systolic: r.systolic,
          diastolic: r.diastolic
        })).sort((a, b) => a.date.getTime() - b.date.getTime())
      });
    }
    
    // Cholesterol trend (using total cholesterol)
    const cholesterolResults = results.filter(r => r.type === "cholesterol");
    if (cholesterolResults.length > 0) {
      trends.push({
        type: "cholesterol",
        values: cholesterolResults.map(r => ({
          date: r.date,
          value: r.totalCholesterol || 0
        })).sort((a, b) => a.date.getTime() - b.date.getTime())
      });
    }
    
    // HbA1c trend
    const hba1cResults = results.filter(r => r.type === "hba1c");
    if (hba1cResults.length > 0) {
      trends.push({
        type: "hba1c",
        values: hba1cResults.map(r => ({
          date: r.date,
          value: r.hba1c || 0
        })).sort((a, b) => a.date.getTime() - b.date.getTime())
      });
    }
    
    return trends;
  }
  
  // Update a lab result
  public async updateLabResult(userId: string, resultId: string, updates: Partial<LabResultInput>): Promise<LabResult | null> {
    const existingResult = await storage.getLabResultById(resultId);
    
    if (!existingResult || existingResult.userId !== userId) {
      return null;
    }
    
    // Validate updates if type is being changed or values are provided
    if (updates.type || Object.keys(updates).some(key => key !== "type" && key !== "date" && key !== "notes")) {
      const updatedResult = { 
        ...existingResult, 
        ...updates,
        systolic: updates.systolic !== undefined ? updates.systolic : existingResult.systolic !== null ? existingResult.systolic : undefined,
        diastolic: updates.diastolic !== undefined ? updates.diastolic : existingResult.diastolic !== null ? existingResult.diastolic : undefined,
        totalCholesterol: updates.totalCholesterol !== undefined ? updates.totalCholesterol : existingResult.totalCholesterol !== null ? existingResult.totalCholesterol : undefined,
        ldl: updates.ldl !== undefined ? updates.ldl : existingResult.ldl !== null ? existingResult.ldl : undefined,
        hdl: updates.hdl !== undefined ? updates.hdl : existingResult.hdl !== null ? existingResult.hdl : undefined,
        triglycerides: updates.triglycerides !== undefined ? updates.triglycerides : existingResult.triglycerides !== null ? existingResult.triglycerides : undefined,
        hba1c: updates.hba1c !== undefined ? updates.hba1c : existingResult.hba1c !== null ? existingResult.hba1c : undefined,
        notes: updates.notes !== undefined ? updates.notes : existingResult.notes !== null ? existingResult.notes : undefined
      };
      this.validateLabResult(updatedResult);
    }
    
    const updated = await storage.updateLabResult(resultId, updates);
    
    if (!updated) {
      return null;
    }
    
    // Convert null values to undefined to match LabResult interface
    return {
      ...updated,
      systolic: updated.systolic !== null ? updated.systolic : undefined,
      diastolic: updated.diastolic !== null ? updated.diastolic : undefined,
      totalCholesterol: updated.totalCholesterol !== null ? updated.totalCholesterol : undefined,
      ldl: updated.ldl !== null ? updated.ldl : undefined,
      hdl: updated.hdl !== null ? updated.hdl : undefined,
      triglycerides: updated.triglycerides !== null ? updated.triglycerides : undefined,
      hba1c: updated.hba1c !== null ? updated.hba1c : undefined,
      notes: updated.notes !== null ? updated.notes : undefined
    };
  }
  
  // Delete a lab result
  public async deleteLabResult(userId: string, resultId: string): Promise<boolean> {
    const existingResult = await storage.getLabResultById(resultId);
    
    if (!existingResult || existingResult.userId !== userId) {
      return false;
    }
    
    return await storage.deleteLabResult(resultId);
  }
  
  // Validate lab result based on type
  private validateLabResult(labResult: LabResultInput): void {
    switch (labResult.type) {
      case "bloodPressure":
        if (labResult.systolic === undefined || labResult.diastolic === undefined) {
          throw new Error("Blood pressure requires both systolic and diastolic values");
        }
        if (labResult.systolic < 50 || labResult.systolic > 300) {
          throw new Error("Systolic blood pressure must be between 50 and 300 mmHg");
        }
        if (labResult.diastolic < 30 || labResult.diastolic > 150) {
          throw new Error("Diastolic blood pressure must be between 30 and 150 mmHg");
        }
        break;
        
      case "cholesterol":
        if (labResult.totalCholesterol === undefined) {
          throw new Error("Cholesterol requires total cholesterol value");
        }
        if (labResult.totalCholesterol < 100 || labResult.totalCholesterol > 500) {
          throw new Error("Total cholesterol must be between 100 and 500 mg/dL");
        }
        if (labResult.ldl !== undefined && (labResult.ldl < 50 || labResult.ldl > 400)) {
          throw new Error("LDL cholesterol must be between 50 and 400 mg/dL");
        }
        if (labResult.hdl !== undefined && (labResult.hdl < 10 || labResult.hdl > 100)) {
          throw new Error("HDL cholesterol must be between 10 and 100 mg/dL");
        }
        if (labResult.triglycerides !== undefined && (labResult.triglycerides < 50 || labResult.triglycerides > 500)) {
          throw new Error("Triglycerides must be between 50 and 500 mg/dL");
        }
        break;
        
      case "hba1c":
        if (labResult.hba1c === undefined) {
          throw new Error("HbA1c requires hba1c value");
        }
        if (labResult.hba1c < 4 || labResult.hba1c > 15) {
          throw new Error("HbA1c must be between 4% and 15%");
        }
        break;
        
      default:
        throw new Error("Invalid lab result type");
    }
  }
  
  // Generate a unique ID
  private generateId(): string {
    return `lr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export a singleton instance of the lab tracker service
export const labTrackerService = new LabTrackerService();