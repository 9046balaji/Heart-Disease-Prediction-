import { randomUUID } from "crypto";
import { ValidationError } from "../utils/errors";

// More sophisticated implementation of a heart disease prediction model
// Based on the UCI Heart Disease dataset and common medical knowledge

// Define the clinical data structure
export interface ClinicalData {
  age: number;
  sex: number; // 0 = female, 1 = male
  cp: number; // chest pain type (0-3)
  trestbps: number; // resting blood pressure
  chol: number; // serum cholesterol
  fbs: number; // fasting blood sugar > 120 mg/dl (0 = false, 1 = true)
  restecg: number; // resting electrocardiographic results (0-2)
  thalach: number; // maximum heart rate achieved
  exang: number; // exercise induced angina (0 = no, 1 = yes)
  oldpeak: number; // ST depression induced by exercise relative to rest
  slope: number; // the slope of the peak exercise ST segment (0-2)
  ca: number; // number of major vessels (0-3) colored by fluoroscopy
  thal: number; // thalassemia (0 = normal, 1 = fixed defect, 2 = reversable defect)
  // Additional features for enhanced model
  height?: number; // height in cm
  weight?: number; // weight in kg
  smokingStatus?: "never" | "former" | "current";
}

// Define the prediction result structure
export interface PredictionResult {
  score: number; // Risk score between 0 and 1
  label: "low" | "medium" | "high";
  model_version: string;
  shap_top_features: {
    feature: string;
    contribution: number;
    explanation: string;
  }[];
  // Additional insights for enhanced model
  risk_factors: {
    category: string;
    level: "low" | "moderate" | "high";
    recommendation: string;
  }[];
  lifestyle_recommendations: string[];
}

// Enhanced heart disease prediction model with more sophisticated algorithms
export class HeartDiseaseModel {
  private modelVersion: string;
  
  constructor() {
    this.modelVersion = "v3.0.0"; // Updated version
  }
  
  // Predict heart disease risk based on clinical data using a more sophisticated algorithm
  public predict(data: ClinicalData): PredictionResult {
    try {
      // Validate input data
      this.validateClinicalData(data);
    } catch (error) {
      // Re-throw as our custom ValidationError
      if (error instanceof Error) {
        throw new ValidationError(error.message);
      }
      throw error;
    }
    
    // Calculate risk score using weighted factors based on medical research
    let riskScore = 0.0;
    
    // Baseline risk (age and sex factors)
    riskScore += this.calculateAgeRisk(data.age);
    riskScore += this.calculateSexRisk(data.sex, data.age);
    
    // Medical factors with weights based on medical literature
    riskScore += this.calculateBloodPressureRisk(data.trestbps) * 0.15;
    riskScore += this.calculateCholesterolRisk(data.chol) * 0.12;
    riskScore += this.calculateExerciseAnginaRisk(data.exang) * 0.18;
    riskScore += this.calculateChestPainRisk(data.cp) * 0.10;
    riskScore += this.calculateMaxHeartRateRisk(data.thalach, data.age) * 0.08;
    riskScore += this.calculateSTDepressionRisk(data.oldpeak) * 0.10;
    riskScore += this.calculateSlopeRisk(data.slope) * 0.07;
    riskScore += this.calculateMajorVesselsRisk(data.ca) * 0.12;
    riskScore += this.calculateThalassemiaRisk(data.thal) * 0.08;
    
    // Additional factors for enhanced model
    if (data.fbs === 1) {
      riskScore += 0.03;
    }
    
    // Resting ECG has minimal impact unless abnormal
    if (data.restecg === 2) {
      riskScore += 0.05;
    }
    
    // Enhanced factors using additional data
    if (data.height && data.weight) {
      const bmi = this.calculateBMI(data.weight, data.height);
      riskScore += this.calculateBMIRisk(bmi) * 0.05;
    }
    
    if (data.smokingStatus === "current") {
      riskScore += 0.15; // Significant risk factor
    } else if (data.smokingStatus === "former") {
      riskScore += 0.08; // Reduced but still elevated risk
    }
    // "never" smoking contributes 0 to risk score
    
    // Cap the risk score between 0 and 1
    riskScore = Math.max(0, Math.min(1, riskScore));
    
    // Determine risk label with medical thresholds
    let label: "low" | "medium" | "high" = "low";
    if (riskScore >= 0.7) {
      label = "high";
    } else if (riskScore >= 0.4) {
      label = "medium";
    }
    
    // Generate detailed SHAP-like explanations for top contributing features
    const shapFeatures = this.generateSHAPExplanations(data, riskScore);
    
    // Generate risk factors analysis
    const riskFactors = this.generateRiskFactors(data);
    
    // Generate lifestyle recommendations
    const lifestyleRecommendations = this.generateLifestyleRecommendations(data, riskScore);
    
    return {
      score: parseFloat(riskScore.toFixed(4)),
      label,
      model_version: this.modelVersion,
      shap_top_features: shapFeatures,
      risk_factors: riskFactors,
      lifestyle_recommendations: lifestyleRecommendations
    };
  }
  
  // Validate clinical data
  private validateClinicalData(data: ClinicalData): void {
    // Age validation
    if (data.age < 0 || data.age > 120) {
      throw new ValidationError("Age must be between 0 and 120");
    }
    
    // Sex validation
    if (data.sex !== 0 && data.sex !== 1) {
      throw new ValidationError("Sex must be 0 (female) or 1 (male)");
    }
    
    // Chest pain type validation
    if (data.cp < 0 || data.cp > 3) {
      throw new ValidationError("Chest pain type must be between 0 and 3");
    }
    
    // Resting blood pressure validation
    if (data.trestbps < 50 || data.trestbps > 300) {
      throw new ValidationError("Resting blood pressure must be between 50 and 300 mmHg");
    }
    
    // Cholesterol validation
    if (data.chol < 100 || data.chol > 600) {
      throw new ValidationError("Cholesterol must be between 100 and 600 mg/dL");
    }
    
    // Fasting blood sugar validation
    if (data.fbs !== 0 && data.fbs !== 1) {
      throw new ValidationError("Fasting blood sugar must be 0 or 1");
    }
    
    // Resting ECG validation
    if (data.restecg < 0 || data.restecg > 2) {
      throw new ValidationError("Resting ECG results must be between 0 and 2");
    }
    
    // Maximum heart rate validation
    if (data.thalach < 50 || data.thalach > 250) {
      throw new ValidationError("Maximum heart rate must be between 50 and 250 bpm");
    }
    
    // Exercise induced angina validation
    if (data.exang !== 0 && data.exang !== 1) {
      throw new ValidationError("Exercise induced angina must be 0 or 1");
    }
    
    // ST depression validation
    if (data.oldpeak < 0 || data.oldpeak > 10) {
      throw new ValidationError("ST depression must be between 0 and 10");
    }
    
    // Slope validation
    if (data.slope < 0 || data.slope > 2) {
      throw new ValidationError("Slope must be between 0 and 2");
    }
    
    // Major vessels validation
    if (data.ca < 0 || data.ca > 3) {
      throw new ValidationError("Number of major vessels must be between 0 and 3");
    }
    
    // Thalassemia validation
    if (data.thal < 0 || data.thal > 2) {
      throw new ValidationError("Thalassemia must be between 0 and 2");
    }
    
    // Additional validations for enhanced model
    if (data.height !== undefined && (data.height < 100 || data.height > 250)) {
      throw new ValidationError("Height must be between 100 and 250 cm");
    }
    
    if (data.weight !== undefined && (data.weight < 30 || data.weight > 300)) {
      throw new ValidationError("Weight must be between 30 and 300 kg");
    }
    
    if (data.smokingStatus !== undefined && !["never", "former", "current"].includes(data.smokingStatus)) {
      throw new ValidationError("Smoking status must be 'never', 'former', or 'current'");
    }
  }
  
  // Calculate age-related risk
  private calculateAgeRisk(age: number): number {
    // Risk increases significantly after age 40
    if (age < 40) {
      return 0.05;
    } else if (age < 50) {
      return 0.10;
    } else if (age < 60) {
      return 0.15;
    } else if (age < 70) {
      return 0.25;
    } else {
      return 0.35;
    }
  }
  
  // Calculate sex-related risk with age adjustment
  private calculateSexRisk(sex: number, age: number): number {
    // Males have higher risk, especially after age 45
    if (sex === 1) {
      if (age < 45) {
        return 0.05;
      } else {
        return 0.12;
      }
    } else {
      // Females have lower risk until menopause (around age 55)
      if (age < 55) {
        return 0.02;
      } else {
        return 0.08;
      }
    }
  }
  
  // Calculate blood pressure risk
  private calculateBloodPressureRisk(trestbps: number): number {
    if (trestbps < 120) {
      return 0.0; // Normal
    } else if (trestbps < 130) {
      return 0.05; // Elevated
    } else if (trestbps < 140) {
      return 0.10; // Stage 1 hypertension
    } else if (trestbps < 180) {
      return 0.20; // Stage 2 hypertension
    } else {
      return 0.35; // Hypertensive crisis
    }
  }
  
  // Calculate cholesterol risk
  private calculateCholesterolRisk(chol: number): number {
    if (chol < 200) {
      return 0.0; // Desirable
    } else if (chol < 240) {
      return 0.08; // Borderline high
    } else {
      return 0.18; // High
    }
  }
  
  // Calculate exercise angina risk
  private calculateExerciseAnginaRisk(exang: number): number {
    return exang === 1 ? 0.25 : 0.0; // Significant risk factor when present
  }
  
  // Calculate chest pain risk
  private calculateChestPainRisk(cp: number): number {
    // More severe chest pain types indicate higher risk
    switch (cp) {
      case 0: return 0.0; // No pain
      case 1: return 0.05; // Typical angina
      case 2: return 0.12; // Atypical angina
      case 3: return 0.20; // Non-anginal pain
      default: return 0.0;
    }
  }
  
  // Calculate maximum heart rate risk
  private calculateMaxHeartRateRisk(thalach: number, age: number): number {
    // Calculate predicted maximum heart rate (220 - age)
    const predictedMaxHR = 220 - age;
    
    // Calculate heart rate reserve percentage
    const hrReservePercent = (thalach / predictedMaxHR) * 100;
    
    // Lower than expected max heart rate indicates higher risk
    if (hrReservePercent < 70) {
      return 0.15;
    } else if (hrReservePercent < 80) {
      return 0.08;
    } else {
      return 0.0; // Normal or above normal
    }
  }
  
  // Calculate ST depression risk
  private calculateSTDepressionRisk(oldpeak: number): number {
    if (oldpeak === 0) {
      return 0.0; // Normal
    } else if (oldpeak < 1) {
      return 0.08; // Mild
    } else if (oldpeak < 2) {
      return 0.15; // Moderate
    } else {
      return 0.25; // Severe
    }
  }
  
  // Calculate slope risk
  private calculateSlopeRisk(slope: number): number {
    switch (slope) {
      case 0: return 0.05; // Upsloping (least risk)
      case 1: return 0.10; // Flat (moderate risk)
      case 2: return 0.20; // Downsloping (highest risk)
      default: return 0.0;
    }
  }
  
  // Calculate major vessels risk
  private calculateMajorVesselsRisk(ca: number): number {
    // More vessels with abnormalities indicate higher risk
    switch (ca) {
      case 0: return 0.0; // No vessels
      case 1: return 0.10; // 1 vessel
      case 2: return 0.20; // 2 vessels
      case 3: return 0.30; // 3 vessels
      default: return 0.0;
    }
  }
  
  // Calculate thalassemia risk
  private calculateThalassemiaRisk(thal: number): number {
    switch (thal) {
      case 0: return 0.0; // Normal
      case 1: return 0.15; // Fixed defect
      case 2: return 0.25; // Reversible defect
      default: return 0.0;
    }
  }
  
  // Calculate BMI
  private calculateBMI(weight: number, height: number): number {
    // Convert height from cm to meters
    const heightInMeters = height / 100;
    return weight / (heightInMeters * heightInMeters);
  }
  
  // Calculate BMI-related risk
  private calculateBMIRisk(bmi: number): number {
    if (bmi < 18.5) {
      return 0.05; // Underweight
    } else if (bmi < 25) {
      return 0.0; // Normal weight
    } else if (bmi < 30) {
      return 0.10; // Overweight
    } else {
      return 0.20; // Obese
    }
  }
  
  // Generate SHAP-like explanations for the prediction
  private generateSHAPExplanations(data: ClinicalData, riskScore: number): PredictionResult['shap_top_features'] {
    const contributions: { feature: string; contribution: number; explanation: string }[] = [];
    
    // Calculate individual contributions
    const ageContribution = this.calculateAgeRisk(data.age);
    const sexContribution = this.calculateSexRisk(data.sex, data.age);
    const bpContribution = this.calculateBloodPressureRisk(data.trestbps) * 0.15;
    const cholContribution = this.calculateCholesterolRisk(data.chol) * 0.12;
    const exangContribution = this.calculateExerciseAnginaRisk(data.exang) * 0.18;
    const cpContribution = this.calculateChestPainRisk(data.cp) * 0.10;
    const hrContribution = this.calculateMaxHeartRateRisk(data.thalach, data.age) * 0.08;
    const stContribution = this.calculateSTDepressionRisk(data.oldpeak) * 0.10;
    const slopeContribution = this.calculateSlopeRisk(data.slope) * 0.07;
    const vesselsContribution = this.calculateMajorVesselsRisk(data.ca) * 0.12;
    const thalContribution = this.calculateThalassemiaRisk(data.thal) * 0.08;
    
    // Enhanced contributions
    let bmiContribution = 0;
    if (data.height && data.weight) {
      const bmi = this.calculateBMI(data.weight, data.height);
      bmiContribution = this.calculateBMIRisk(bmi) * 0.05;
    }
    
    let smokingContribution = 0;
    if (data.smokingStatus === "current") {
      smokingContribution = 0.15;
    } else if (data.smokingStatus === "former") {
      smokingContribution = 0.08;
    }
    
    // Add contributions to the list
    contributions.push({
      feature: "age",
      contribution: parseFloat(ageContribution.toFixed(4)),
      explanation: `At ${data.age} years old, your age contributes to cardiovascular risk. Risk naturally increases after age 40.`
    });
    
    contributions.push({
      feature: "sex",
      contribution: parseFloat(sexContribution.toFixed(4)),
      explanation: `${data.sex === 1 ? "Male" : "Female"} sex affects cardiovascular risk differently. Males typically have higher risk, especially after age 45.`
    });
    
    contributions.push({
      feature: "trestbps",
      contribution: parseFloat(bpContribution.toFixed(4)),
      explanation: `Resting blood pressure of ${data.trestbps} mmHg ${data.trestbps >= 140 ? "is elevated and" : data.trestbps >= 120 ? "is borderline high and" : "is within normal range and"} affects heart disease risk.`
    });
    
    contributions.push({
      feature: "chol",
      contribution: parseFloat(cholContribution.toFixed(4)),
      explanation: `Cholesterol level of ${data.chol} mg/dL ${data.chol >= 240 ? "is high and" : data.chol >= 200 ? "is borderline high and" : "is within healthy range and"} impacts cardiovascular health.`
    });
    
    if (data.exang === 1) {
      contributions.push({
        feature: "exang",
        contribution: parseFloat(exangContribution.toFixed(4)),
        explanation: `Exercise-induced angina indicates reduced blood flow to the heart during physical activity, which is a significant risk factor.`
      });
    }
    
    if (data.cp > 0) {
      contributions.push({
        feature: "cp",
        contribution: parseFloat(cpContribution.toFixed(4)),
        explanation: `Chest pain type ${data.cp} suggests possible cardiac issues. More severe types indicate higher risk.`
      });
    }
    
    contributions.push({
      feature: "thalach",
      contribution: parseFloat(hrContribution.toFixed(4)),
      explanation: `Maximum heart rate of ${data.thalach} bpm during exercise ${data.thalach < 150 ? "is lower than expected for your age and" : "is within normal range and"} affects risk assessment.`
    });
    
    if (data.oldpeak > 0) {
      contributions.push({
        feature: "oldpeak",
        contribution: parseFloat(stContribution.toFixed(4)),
        explanation: `ST depression of ${data.oldpeak} during exercise indicates possible myocardial ischemia (reduced blood flow to heart muscle).`
      });
    }
    
    if (data.slope !== 0) {
      contributions.push({
        feature: "slope",
        contribution: parseFloat(slopeContribution.toFixed(4)),
        explanation: `Slope of the peak exercise ST segment being ${data.slope === 1 ? "flat" : "downsloping"} indicates abnormal heart response to exercise.`
      });
    }
    
    if (data.ca > 0) {
      contributions.push({
        feature: "ca",
        contribution: parseFloat(vesselsContribution.toFixed(4)),
        explanation: `${data.ca} major vessels showing abnormalities on fluoroscopy indicates reduced blood flow to the heart.`
      });
    }
    
    if (data.thal !== 0) {
      contributions.push({
        feature: "thal",
        contribution: parseFloat(thalContribution.toFixed(4)),
        explanation: `Thalassemia type ${data.thal === 1 ? "fixed defect" : "reversible defect"} indicates abnormal blood flow to the heart.`
      });
    }
    
    // Add enhanced contributions
    if (data.height && data.weight) {
      const bmi = this.calculateBMI(data.weight, data.height);
      contributions.push({
        feature: "bmi",
        contribution: parseFloat(bmiContribution.toFixed(4)),
        explanation: `Your BMI of ${bmi.toFixed(1)} ${bmi >= 30 ? "indicates obesity, which" : bmi >= 25 ? "indicates overweight, which" : "is in the healthy range and"} affects cardiovascular risk.`
      });
    }
    
    if (data.smokingStatus && data.smokingStatus !== "never") {
      contributions.push({
        feature: "smoking",
        contribution: parseFloat(smokingContribution.toFixed(4)),
        explanation: `Your smoking status as ${data.smokingStatus === "current" ? "a current smoker" : "a former smoker"} significantly ${data.smokingStatus === "current" ? "increases" : "elevates"} cardiovascular risk.`
      });
    }
    
    // Sort by contribution magnitude and take top 5 (increased from 3)
    contributions.sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution));
    
    return contributions.slice(0, 5);
  }
  
  // Generate risk factors analysis
  private generateRiskFactors(data: ClinicalData): PredictionResult['risk_factors'] {
    const riskFactors: PredictionResult['risk_factors'] = [];
    
    // Blood pressure risk factor
    if (data.trestbps >= 140) {
      riskFactors.push({
        category: "Blood Pressure",
        level: "high",
        recommendation: "Work with your doctor to manage high blood pressure through medication, diet, and exercise."
      });
    } else if (data.trestbps >= 120) {
      riskFactors.push({
        category: "Blood Pressure",
        level: "moderate",
        recommendation: "Monitor your blood pressure regularly and maintain heart-healthy habits."
      });
    }
    
    // Cholesterol risk factor
    if (data.chol >= 240) {
      riskFactors.push({
        category: "Cholesterol",
        level: "high",
        recommendation: "Focus on a low-cholesterol diet and consider medication as prescribed by your doctor."
      });
    } else if (data.chol >= 200) {
      riskFactors.push({
        category: "Cholesterol",
        level: "moderate",
        recommendation: "Improve your diet by reducing saturated fats and increasing fiber intake."
      });
    }
    
    // Smoking risk factor
    if (data.smokingStatus === "current") {
      riskFactors.push({
        category: "Smoking",
        level: "high",
        recommendation: "Seek support to quit smoking immediately - this is one of the most impactful changes you can make."
      });
    } else if (data.smokingStatus === "former") {
      riskFactors.push({
        category: "Smoking",
        level: "moderate",
        recommendation: "Maintain your smoke-free lifestyle and avoid exposure to secondhand smoke."
      });
    }
    
    // BMI risk factor
    if (data.height && data.weight) {
      const bmi = this.calculateBMI(data.weight, data.height);
      if (bmi >= 30) {
        riskFactors.push({
          category: "Weight",
          level: "high",
          recommendation: "Work with a healthcare provider on a safe weight loss plan to reduce cardiovascular risk."
        });
      } else if (bmi >= 25) {
        riskFactors.push({
          category: "Weight",
          level: "moderate",
          recommendation: "Focus on maintaining a healthy weight through balanced nutrition and regular activity."
        });
      }
    }
    
    // Exercise angina risk factor
    if (data.exang === 1) {
      riskFactors.push({
        category: "Exercise Response",
        level: "high",
        recommendation: "Report exercise-induced chest pain to your doctor immediately for further evaluation."
      });
    }
    
    // Age risk factor
    if (data.age >= 65) {
      riskFactors.push({
        category: "Age",
        level: "moderate",
        recommendation: "Regular cardiac screenings become more important with age - maintain regular check-ups."
      });
    } else if (data.age >= 50) {
      riskFactors.push({
        category: "Age",
        level: "low",
        recommendation: "Begin focusing on preventive heart health measures as you approach higher risk years."
      });
    }
    
    return riskFactors;
  }
  
  // Generate lifestyle recommendations
  private generateLifestyleRecommendations(data: ClinicalData, riskScore: number): string[] {
    const recommendations: string[] = [];
    
    // General recommendations based on risk score
    if (riskScore >= 0.7) {
      recommendations.push("Seek immediate medical consultation for a comprehensive cardiac evaluation.");
      recommendations.push("Consider cardiac rehabilitation programs under medical supervision.");
    } else if (riskScore >= 0.4) {
      recommendations.push("Schedule a consultation with a cardiologist for preventive care.");
      recommendations.push("Begin a physician-supervised exercise program.");
    } else {
      recommendations.push("Maintain your healthy habits and continue regular check-ups.");
    }
    
    // Specific recommendations based on data
    if (data.trestbps >= 140) {
      recommendations.push("Reduce sodium intake to less than 1,500mg daily.");
      recommendations.push("Practice stress-reduction techniques like meditation or deep breathing.");
    }
    
    if (data.chol >= 240) {
      recommendations.push("Limit saturated fats and eliminate trans fats from your diet.");
      recommendations.push("Increase intake of omega-3 fatty acids through fish or supplements.");
    }
    
    if (data.smokingStatus === "current") {
      recommendations.push("Contact a smoking cessation program or your doctor for quit support.");
      recommendations.push("Consider nicotine replacement therapy or prescription quit aids.");
    } else if (data.smokingStatus === "former") {
      recommendations.push("Continue avoiding tobacco products and secondhand smoke.");
    }
    
    // BMI-based recommendations
    if (data.height && data.weight) {
      const bmi = this.calculateBMI(data.weight, data.height);
      if (bmi >= 30) {
        recommendations.push("Focus on gradual weight loss of 1-2 pounds per week through diet and exercise.");
        recommendations.push("Consider working with a registered dietitian for a personalized nutrition plan.");
      } else if (bmi >= 25) {
        recommendations.push("Maintain your current weight through balanced nutrition and regular activity.");
      }
    }
    
    // General heart-healthy recommendations
    recommendations.push("Aim for at least 150 minutes of moderate-intensity aerobic activity per week.");
    recommendations.push("Follow a Mediterranean-style diet rich in fruits, vegetables, and whole grains.");
    recommendations.push("Limit alcohol consumption to moderate levels (up to one drink per day for women, two for men).");
    recommendations.push("Get 7-9 hours of quality sleep each night.");
    
    return recommendations;
  }
}

// Export a singleton instance of the model
export const heartDiseaseModel = new HeartDiseaseModel();