import { storage } from "../storage";
import { Symptom } from "@shared/schema";

export interface SymptomInput {
  type: string;
  severity?: number | null;
  duration?: string | null;
  notes?: string | null;
  timestamp?: Date;
}

export interface SymptomTrend {
  type: string;
  values: Array<{
    date: Date;
    severity: number | null;
  }>;
}

export class SymptomService {
  // Add a new symptom entry for a user
  public async addSymptom(userId: string, symptomData: SymptomInput): Promise<Symptom> {
    // Validate the symptom data
    this.validateSymptomData(symptomData);
    
    const symptom = await storage.createSymptom({
      userId,
      type: symptomData.type,
      severity: symptomData.severity || null,
      duration: symptomData.duration || null,
      notes: symptomData.notes || null,
      timestamp: symptomData.timestamp || new Date(),
      createdAt: new Date()
    });
    
    return symptom;
  }
  
  // Get all symptoms for a user
  public async getSymptoms(userId: string): Promise<Symptom[]> {
    return await storage.getSymptomsByUserId(userId);
  }
  
  // Get symptoms by type for a user
  public async getSymptomsByType(userId: string, type: string): Promise<Symptom[]> {
    const allSymptoms = await this.getSymptoms(userId);
    return allSymptoms.filter(symptom => symptom.type === type);
  }
  
  // Get symptom trends for a user
  public async getSymptomTrends(userId: string): Promise<SymptomTrend[]> {
    const symptoms = await this.getSymptoms(userId);
    
    // Group symptoms by type
    const symptomsByType: Record<string, Symptom[]> = {};
    symptoms.forEach(symptom => {
      if (!symptomsByType[symptom.type]) {
        symptomsByType[symptom.type] = [];
      }
      symptomsByType[symptom.type].push(symptom);
    });
    
    // Create trends for each type
    const trends: SymptomTrend[] = [];
    Object.keys(symptomsByType).forEach(type => {
      const typeSymptoms = symptomsByType[type];
      trends.push({
        type,
        values: typeSymptoms.map(symptom => ({
          date: symptom.timestamp,
          severity: symptom.severity
        })).sort((a, b) => a.date.getTime() - b.date.getTime())
      });
    });
    
    return trends;
  }
  
  // Update a symptom entry
  public async updateSymptom(userId: string, symptomId: string, updates: Partial<SymptomInput>): Promise<Symptom | null> {
    const existingSymptom = await storage.getSymptomById(symptomId);
    
    if (!existingSymptom || existingSymptom.userId !== userId) {
      return null;
    }
    
    // Validate updates if provided
    if (updates.type) {
      this.validateSymptomData(updates as SymptomInput);
    }
    
    const updated = await storage.updateSymptom(symptomId, updates);
    
    return updated || null;
  }
  
  // Delete a symptom entry
  public async deleteSymptom(userId: string, symptomId: string): Promise<boolean> {
    const existingSymptom = await storage.getSymptomById(symptomId);
    
    if (!existingSymptom || existingSymptom.userId !== userId) {
      return false;
    }
    
    return await storage.deleteSymptom(symptomId);
  }
  
  // Validate symptom data
  private validateSymptomData(symptomData: SymptomInput): void {
    if (!symptomData.type) {
      throw new Error("Symptom type is required");
    }
    
    if (symptomData.severity !== undefined && symptomData.severity !== null) {
      if (symptomData.severity < 1 || symptomData.severity > 10) {
        throw new Error("Severity must be between 1 and 10");
      }
    }
  }
}

// Export a singleton instance of the symptom service
export const symptomService = new SymptomService();