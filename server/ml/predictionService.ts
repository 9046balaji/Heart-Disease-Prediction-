import { ClinicalData, PredictionResult, heartDiseaseModel } from "./model";
import { storage } from "../storage";
import { ValidationError } from "../utils/errors";

// Define the prediction log structure
export interface PredictionLog {
  id: string;
  userId: string;
  timestamp: Date;
  features: ClinicalData;
  prediction: PredictionResult;
}

// Prediction service class
export class PredictionService {
  private predictions: Map<string, PredictionLog>;
  
  constructor() {
    this.predictions = new Map();
  }
  
  // Make a prediction based on clinical data
  public async predict(userId: string, clinicalData: any): Promise<PredictionResult> {
    try {
      // Validate clinical data
      this.validateClinicalData(clinicalData);
      
      // Make prediction using the model
      const prediction = heartDiseaseModel.predict({
        age: parseInt(clinicalData.age),
        sex: parseInt(clinicalData.sex),
        cp: parseInt(clinicalData.cp),
        trestbps: parseInt(clinicalData.trestbps),
        chol: parseInt(clinicalData.chol),
        fbs: parseInt(clinicalData.fbs),
        restecg: parseInt(clinicalData.restecg),
        thalach: parseInt(clinicalData.thalach),
        exang: parseInt(clinicalData.exang),
        oldpeak: parseInt(clinicalData.oldpeak),
        slope: parseInt(clinicalData.slope),
        ca: parseInt(clinicalData.ca),
        thal: parseInt(clinicalData.thal),
        // Additional fields for enhanced model
        height: clinicalData.height ? parseInt(clinicalData.height) : undefined,
        weight: clinicalData.weight ? parseInt(clinicalData.weight) : undefined,
        smokingStatus: clinicalData.smokingStatus
      });
      
      // Log the prediction
      const predictionLog: PredictionLog = {
        id: this.generateId(),
        userId,
        timestamp: new Date(),
        features: {
          age: parseInt(clinicalData.age),
          sex: parseInt(clinicalData.sex),
          cp: parseInt(clinicalData.cp),
          trestbps: parseInt(clinicalData.trestbps),
          chol: parseInt(clinicalData.chol),
          fbs: parseInt(clinicalData.fbs),
          restecg: parseInt(clinicalData.restecg),
          thalach: parseInt(clinicalData.thalach),
          exang: parseInt(clinicalData.exang),
          oldpeak: parseInt(clinicalData.oldpeak),
          slope: parseInt(clinicalData.slope),
          ca: parseInt(clinicalData.ca),
          thal: parseInt(clinicalData.thal),
          // Additional fields for enhanced model
          height: clinicalData.height ? parseInt(clinicalData.height) : undefined,
          weight: clinicalData.weight ? parseInt(clinicalData.weight) : undefined,
          smokingStatus: clinicalData.smokingStatus
        },
        prediction
      };
      
      this.predictions.set(predictionLog.id, predictionLog);
      
      // In a real implementation, we would save this to a database
      // For now, we'll just keep it in memory
      
      return prediction;
    } catch (error) {
      // Re-throw validation errors as our custom ValidationError
      if (error instanceof Error && error.message) {
        throw new ValidationError(error.message);
      }
      throw error;
    }
  }
  
  // Get prediction history for a user
  public async getPredictionHistory(userId: string): Promise<PredictionLog[]> {
    const userPredictions: PredictionLog[] = [];
    
    // Filter predictions by user ID
    const values = Array.from(this.predictions.values());
    for (let i = 0; i < values.length; i++) {
      const prediction = values[i];
      if (prediction.userId === userId) {
        userPredictions.push(prediction);
      }
    }
    
    // Sort by timestamp (newest first)
    userPredictions.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    return userPredictions;
  }
  
  // Get a specific prediction by ID
  public async getPredictionById(predictionId: string): Promise<PredictionLog | undefined> {
    return this.predictions.get(predictionId);
  }
  
  // Validate clinical data
  private validateClinicalData(data: any): void {
    // Check that all required fields are present and valid
    if (!data.age || parseInt(data.age) < 0 || parseInt(data.age) > 120) {
      throw new ValidationError("Age must be between 0 and 120");
    }
    
    if (!data.sex || (parseInt(data.sex) !== 0 && parseInt(data.sex) !== 1)) {
      throw new ValidationError("Sex must be 0 (female) or 1 (male)");
    }
    
    if (!data.cp || parseInt(data.cp) < 0 || parseInt(data.cp) > 3) {
      throw new ValidationError("Chest pain type must be between 0 and 3");
    }
    
    if (!data.trestbps || parseInt(data.trestbps) < 0 || parseInt(data.trestbps) > 300) {
      throw new ValidationError("Resting blood pressure must be between 0 and 300");
    }
    
    if (!data.chol || parseInt(data.chol) < 0 || parseInt(data.chol) > 600) {
      throw new ValidationError("Cholesterol must be between 0 and 600");
    }
    
    if (!data.fbs || (parseInt(data.fbs) !== 0 && parseInt(data.fbs) !== 1)) {
      throw new ValidationError("Fasting blood sugar must be 0 or 1");
    }
    
    if (!data.restecg || parseInt(data.restecg) < 0 || parseInt(data.restecg) > 2) {
      throw new ValidationError("Resting ECG results must be between 0 and 2");
    }
    
    if (!data.thalach || parseInt(data.thalach) < 0 || parseInt(data.thalach) > 300) {
      throw new ValidationError("Maximum heart rate must be between 0 and 300");
    }
    
    if (!data.exang || (parseInt(data.exang) !== 0 && parseInt(data.exang) !== 1)) {
      throw new ValidationError("Exercise induced angina must be 0 or 1");
    }
    
    if (!data.oldpeak || parseInt(data.oldpeak) < 0 || parseInt(data.oldpeak) > 10) {
      throw new ValidationError("ST depression must be between 0 and 10");
    }
    
    if (!data.slope || parseInt(data.slope) < 0 || parseInt(data.slope) > 2) {
      throw new ValidationError("Slope must be between 0 and 2");
    }
    
    if (!data.ca || parseInt(data.ca) < 0 || parseInt(data.ca) > 3) {
      throw new ValidationError("Number of major vessels must be between 0 and 3");
    }
    
    if (!data.thal || parseInt(data.thal) < 0 || parseInt(data.thal) > 2) {
      throw new ValidationError("Thalassemia must be between 0 and 2");
    }
    
    // Validate optional fields
    if (data.height !== undefined && (parseInt(data.height) < 100 || parseInt(data.height) > 250)) {
      throw new ValidationError("Height must be between 100 and 250 cm");
    }
    
    if (data.weight !== undefined && (parseInt(data.weight) < 30 || parseInt(data.weight) > 300)) {
      throw new ValidationError("Weight must be between 30 and 300 kg");
    }
    
    if (data.smokingStatus !== undefined && !["never", "former", "current"].includes(data.smokingStatus)) {
      throw new ValidationError("Smoking status must be 'never', 'former', or 'current'");
    }
  }
  
  // Generate a unique ID
  private generateId(): string {
    return `pred_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export a singleton instance of the prediction service
export const predictionService = new PredictionService();