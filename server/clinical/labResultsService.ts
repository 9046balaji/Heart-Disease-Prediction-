import { storage } from "../storage";
import { LabResult } from "@shared/schema";

export interface LabResultInput {
  type: "bloodPressure" | "cholesterol" | "hba1c";
  systolic?: number;
  diastolic?: number;
  totalCholesterol?: number;
  ldl?: number;
  hdl?: number;
  triglycerides?: number;
  hba1c?: number;
  date?: Date;
  notes?: string;
}

export interface LabTrend {
  type: "bloodPressure" | "cholesterol" | "hba1c";
  values: Array<{
    date: Date;
    value: number;
    systolic?: number;
    diastolic?: number;
    totalCholesterol?: number;
    ldl?: number;
    hdl?: number;
    triglycerides?: number;
    hba1c?: number;
  }>;
}

export class LabResultsService {
  // Add a new lab result for a user
  public async addLabResult(userId: string, labResultData: LabResultInput): Promise<LabResult> {
    // Validate the lab result based on type
    this.validateLabResult(labResultData);
    
    const labResult = await storage.createLabResult({
      userId,
      type: labResultData.type,
      systolic: labResultData.systolic,
      diastolic: labResultData.diastolic,
      totalCholesterol: labResultData.totalCholesterol,
      ldl: labResultData.ldl,
      hdl: labResultData.hdl,
      triglycerides: labResultData.triglycerides,
      hba1c: labResultData.hba1c,
      date: labResultData.date || new Date(),
      notes: labResultData.notes,
      createdAt: new Date()
    });
    
    return labResult;
  }
  
  // Get all lab results for a user
  public async getLabResults(userId: string): Promise<LabResult[]> {
    const results = await storage.getLabResultsByUserId(userId);
    return results.map(result => ({
      ...result,
      systolic: result.systolic !== null ? result.systolic : null,
      diastolic: result.diastolic !== null ? result.diastolic : null,
      totalCholesterol: result.totalCholesterol !== null ? result.totalCholesterol : null,
      ldl: result.ldl !== null ? result.ldl : null,
      hdl: result.hdl !== null ? result.hdl : null,
      triglycerides: result.triglycerides !== null ? result.triglycerides : null,
      hba1c: result.hba1c !== null ? result.hba1c : null,
      notes: result.notes !== null ? result.notes : null
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
          systolic: r.systolic !== null ? r.systolic : undefined,
          diastolic: r.diastolic !== null ? r.diastolic : undefined
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
          value: r.totalCholesterol || 0,
          totalCholesterol: r.totalCholesterol !== null ? r.totalCholesterol : undefined,
          ldl: r.ldl !== null ? r.ldl : undefined,
          hdl: r.hdl !== null ? r.hdl : undefined,
          triglycerides: r.triglycerides !== null ? r.triglycerides : undefined
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
          value: r.hba1c || 0,
          hba1c: r.hba1c !== null ? r.hba1c : undefined
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
      systolic: updated.systolic !== null ? updated.systolic : null,
      diastolic: updated.diastolic !== null ? updated.diastolic : null,
      totalCholesterol: updated.totalCholesterol !== null ? updated.totalCholesterol : null,
      ldl: updated.ldl !== null ? updated.ldl : null,
      hdl: updated.hdl !== null ? updated.hdl : null,
      triglycerides: updated.triglycerides !== null ? updated.triglycerides : null,
      hba1c: updated.hba1c !== null ? updated.hba1c : null,
      notes: updated.notes !== null ? updated.notes : null
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
}

// Export a singleton instance of the lab results service
export const labResultsService = new LabResultsService();