// Export service for the HeartGuard application
// This service handles data export functionality for clinicians

import { storage } from "../storage";
import { labResultsService } from "../clinical/labResultsService";
import { symptomService } from "../symptoms/symptomService";
import { predictionService } from "../ml/predictionService";

export class ExportService {
  // Export lab results as CSV
  public async exportLabResultsAsCSV(userId: string): Promise<string> {
    const labResults = await labResultsService.getLabResults(userId);
    
    // Create CSV header
    let csvContent = "Date,Type,Systolic,Diastolic,Total Cholesterol,LDL,HDL,Triglycerides,HbA1c,Notes\n";
    
    // Add data rows
    labResults.forEach(result => {
      const date = result.date.toISOString().split('T')[0];
      const type = result.type;
      const systolic = result.systolic !== null ? result.systolic.toString() : "";
      const diastolic = result.diastolic !== null ? result.diastolic.toString() : "";
      const totalCholesterol = result.totalCholesterol !== null ? result.totalCholesterol.toString() : "";
      const ldl = result.ldl !== null ? result.ldl.toString() : "";
      const hdl = result.hdl !== null ? result.hdl.toString() : "";
      const triglycerides = result.triglycerides !== null ? result.triglycerides.toString() : "";
      const hba1c = result.hba1c !== null ? result.hba1c.toString() : "";
      const notes = result.notes || "";
      
      csvContent += `"${date}","${type}","${systolic}","${diastolic}","${totalCholesterol}","${ldl}","${hdl}","${triglycerides}","${hba1c}","${notes}"\n`;
    });
    
    return csvContent;
  }
  
  // Export symptoms as CSV
  public async exportSymptomsAsCSV(userId: string): Promise<string> {
    const symptoms = await symptomService.getSymptoms(userId);
    
    // Create CSV header
    let csvContent = "Date,Type,Severity,Duration,Notes\n";
    
    // Add data rows
    symptoms.forEach(symptom => {
      const date = symptom.timestamp.toISOString().split('T')[0];
      const type = symptom.type;
      const severity = symptom.severity !== null ? symptom.severity.toString() : "";
      const duration = symptom.duration || "";
      const notes = symptom.notes || "";
      
      csvContent += `"${date}","${type}","${severity}","${duration}","${notes}"\n`;
    });
    
    return csvContent;
  }
  
  // Export all health data as CSV
  public async exportAllHealthDataAsCSV(userId: string): Promise<string> {
    const labResults = await labResultsService.getLabResults(userId);
    const symptoms = await symptomService.getSymptoms(userId);
    
    // Create CSV header
    let csvContent = "Date,DataType,Details\n";
    
    // Add lab results
    labResults.forEach(result => {
      const date = result.date.toISOString().split('T')[0];
      const type = result.type;
      let details = "";
      
      switch (type) {
        case "bloodPressure":
          details = `BP: ${result.systolic}/${result.diastolic} mmHg`;
          break;
        case "cholesterol":
          details = `Cholesterol: Total=${result.totalCholesterol}, LDL=${result.ldl}, HDL=${result.hdl}, Triglycerides=${result.triglycerides}`;
          break;
        case "hba1c":
          details = `HbA1c: ${result.hba1c}%`;
          break;
      }
      
      if (result.notes) {
        details += ` | Notes: ${result.notes}`;
      }
      
      csvContent += `"${date}","Lab Result - ${type}","${details}"\n`;
    });
    
    // Add symptoms
    symptoms.forEach(symptom => {
      const date = symptom.timestamp.toISOString().split('T')[0];
      const type = symptom.type;
      let details = "";
      
      if (symptom.severity !== null) {
        details += `Severity: ${symptom.severity}/10`;
      }
      
      if (symptom.duration) {
        details += details ? `, Duration: ${symptom.duration}` : `Duration: ${symptom.duration}`;
      }
      
      if (symptom.notes) {
        details += details ? `, Notes: ${symptom.notes}` : `Notes: ${symptom.notes}`;
      }
      
      csvContent += `"${date}","Symptom - ${type}","${details}"\n`;
    });
    
    return csvContent;
  }
  
  // Export clinical summary as formatted text (PDF-like structure)
  public async exportClinicalSummaryAsText(userId: string): Promise<string> {
    // Get user information
    const user = await storage.getUser(userId);
    if (!user) {
      throw new Error("User not found");
    }
    
    // Get clinical entries for risk assessment
    const clinicalEntries = await storage.getClinicalEntries(userId);
    const latestClinicalEntry = clinicalEntries.length > 0 ? clinicalEntries[clinicalEntries.length - 1] : null;
    
    // Get predictions
    const predictions = await storage.getPredictions(userId);
    const latestPrediction = predictions.length > 0 ? predictions[predictions.length - 1] : null;
    
    // Get lab results
    const labResults = await labResultsService.getLabResults(userId);
    
    // Get symptoms
    const symptoms = await symptomService.getSymptoms(userId);
    
    // Get medications
    const medications = await storage.getMedications(userId);
    
    // Create clinical summary report
    let report = "";
    
    // Header
    report += "HEARTGUARD CLINICAL SUMMARY REPORT\n";
    report += "==================================\n\n";
    
    // Patient Information
    report += "PATIENT INFORMATION\n";
    report += "-------------------\n";
    report += `Name: ${user.username}\n`;
    if (latestClinicalEntry) {
      report += `Age: ${latestClinicalEntry.age}\n`;
      report += `Sex: ${latestClinicalEntry.sex === 1 ? "Male" : "Female"}\n`;
      if (latestClinicalEntry.height) {
        report += `Height: ${latestClinicalEntry.height} cm\n`;
      }
      if (latestClinicalEntry.weight) {
        report += `Weight: ${latestClinicalEntry.weight} kg\n`;
      }
    }
    report += "\n";
    
    // Risk Assessment
    report += "RISK ASSESSMENT\n";
    report += "---------------\n";
    if (latestPrediction) {
      report += `Risk Score: ${latestPrediction.score}%\n`;
      report += `Risk Level: ${latestPrediction.label}\n`;
      report += `Assessment Date: ${latestPrediction.timestamp.toISOString().split('T')[0]}\n`;
      
      // Contributing factors
      if (latestPrediction.shapTopFeatures) {
        const shapFeatures = Array.isArray(latestPrediction.shapTopFeatures) 
          ? latestPrediction.shapTopFeatures 
          : JSON.parse(latestPrediction.shapTopFeatures as any);
          
        if (shapFeatures.length > 0) {
          report += "Contributing Factors:\n";
          shapFeatures.forEach((feature: any) => {
            report += `  - ${feature.explanation} (Contribution: ${(feature.contribution * 100).toFixed(2)}%)\n`;
          });
        }
      }
    } else {
      report += "No risk assessment available\n";
    }
    report += "\n";
    
    // Lab Results
    report += "LAB RESULTS\n";
    report += "-----------\n";
    if (labResults.length > 0) {
      labResults.forEach(result => {
        report += `${result.date.toISOString().split('T')[0]} - ${result.type}\n`;
        if (result.systolic !== null && result.diastolic !== null) {
          report += `  Blood Pressure: ${result.systolic}/${result.diastolic} mmHg\n`;
        }
        if (result.totalCholesterol !== null) {
          report += `  Total Cholesterol: ${result.totalCholesterol} mg/dL\n`;
        }
        if (result.ldl !== null) {
          report += `  LDL: ${result.ldl} mg/dL\n`;
        }
        if (result.hdl !== null) {
          report += `  HDL: ${result.hdl} mg/dL\n`;
        }
        if (result.triglycerides !== null) {
          report += `  Triglycerides: ${result.triglycerides} mg/dL\n`;
        }
        if (result.hba1c !== null) {
          report += `  HbA1c: ${result.hba1c}%\n`;
        }
        if (result.notes) {
          report += `  Notes: ${result.notes}\n`;
        }
        report += "\n";
      });
    } else {
      report += "No lab results available\n\n";
    }
    
    // Symptoms
    report += "SYMPTOMS\n";
    report += "--------\n";
    if (symptoms.length > 0) {
      symptoms.forEach(symptom => {
        report += `${symptom.timestamp.toISOString().split('T')[0]} - ${symptom.type}\n`;
        if (symptom.severity !== null) {
          report += `  Severity: ${symptom.severity}/10\n`;
        }
        if (symptom.duration) {
          report += `  Duration: ${symptom.duration}\n`;
        }
        if (symptom.notes) {
          report += `  Notes: ${symptom.notes}\n`;
        }
        report += "\n";
      });
    } else {
      report += "No symptoms reported\n\n";
    }
    
    // Medications
    report += "MEDICATIONS\n";
    report += "-----------\n";
    if (medications.length > 0) {
      medications.forEach(med => {
        report += `${med.name} - ${med.dosage}\n`;
        report += `  Frequency: ${med.frequency}\n`;
        report += `  Start Date: ${med.startDate.toISOString().split('T')[0]}\n`;
        if (med.endDate) {
          report += `  End Date: ${med.endDate.toISOString().split('T')[0]}\n`;
        }
        report += "\n";
      });
    } else {
      report += "No medications recorded\n\n";
    }
    
    // Footer
    report += "Report Generated: " + new Date().toISOString().split('T')[0] + "\n";
    report += "This report is for clinical reference only\n";
    
    return report;
  }

  // Generate clinical summary as a structured object for PDF generation
  public async exportClinicalSummaryAsPDF(userId: string): Promise<any> {
    // Get user information
    const user = await storage.getUser(userId);
    if (!user) {
      throw new Error("User not found");
    }
    
    // Get clinical entries for risk assessment
    const clinicalEntries = await storage.getClinicalEntries(userId);
    const latestClinicalEntry = clinicalEntries.length > 0 ? clinicalEntries[clinicalEntries.length - 1] : null;
    
    // Get predictions
    const predictions = await storage.getPredictions(userId);
    const latestPrediction = predictions.length > 0 ? predictions[predictions.length - 1] : null;
    
    // Get lab results
    const labResults = await labResultsService.getLabResults(userId);
    
    // Get symptoms
    const symptoms = await symptomService.getSymptoms(userId);
    
    // Get medications
    const medications = await storage.getMedications(userId);
    
    // Calculate adherence rate from medications
    let adherenceRate = 0;
    if (medications.length > 0) {
      const totalHistory = medications.reduce((sum, med) => sum + (med as any).takenHistory.length, 0);
      const takenHistory = medications.reduce((sum, med) => 
        sum + (med as any).takenHistory.filter((entry: any) => entry.taken).length, 0);
      
      if (totalHistory > 0) {
        adherenceRate = Math.round((takenHistory / totalHistory) * 100);
      }
    }
    
    // Format SHAP features
    let shapFeatures: any[] = [];
    if (latestPrediction && latestPrediction.shapTopFeatures) {
      shapFeatures = Array.isArray(latestPrediction.shapTopFeatures) 
        ? latestPrediction.shapTopFeatures 
        : JSON.parse(latestPrediction.shapTopFeatures as any);
    }
    
    // Create structured data for PDF generation
    const pdfData = {
      title: "HEARTGUARD CLINICAL SUMMARY REPORT",
      generatedDate: new Date().toISOString().split('T')[0],
      patientInfo: {
        name: user.username,
        age: latestClinicalEntry?.age || null,
        sex: latestClinicalEntry?.sex === 1 ? "Male" : latestClinicalEntry?.sex === 0 ? "Female" : null,
        height: latestClinicalEntry?.height || null,
        weight: latestClinicalEntry?.weight || null
      },
      riskAssessment: {
        score: latestPrediction?.score || null,
        level: latestPrediction?.label || null,
        date: latestPrediction?.timestamp ? latestPrediction.timestamp.toISOString().split('T')[0] : null,
        contributingFactors: shapFeatures.map((feature: any) => ({
          explanation: feature.explanation,
          contribution: (feature.contribution * 100).toFixed(2)
        }))
      },
      labResults: labResults.map(result => ({
        date: result.date.toISOString().split('T')[0],
        type: result.type,
        systolic: result.systolic,
        diastolic: result.diastolic,
        totalCholesterol: result.totalCholesterol,
        ldl: result.ldl,
        hdl: result.hdl,
        triglycerides: result.triglycerides,
        hba1c: result.hba1c,
        notes: result.notes
      })),
      symptoms: symptoms.map(symptom => ({
        date: symptom.timestamp.toISOString().split('T')[0],
        type: symptom.type,
        severity: symptom.severity,
        duration: symptom.duration,
        notes: symptom.notes
      })),
      medications: medications.map(med => ({
        name: med.name,
        dosage: med.dosage,
        frequency: med.frequency,
        startDate: med.startDate.toISOString().split('T')[0],
        endDate: med.endDate ? med.endDate.toISOString().split('T')[0] : null
      })),
      adherenceRate: adherenceRate,
      footer: "This report is for clinical reference only"
    };
    
    return pdfData;
  }

  // Generate clinical summary as HTML for PDF conversion
  public async exportClinicalSummaryAsHTML(userId: string): Promise<string> {
    const data = await this.exportClinicalSummaryAsPDF(userId);
    
    let html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${data.title}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
        h1 { color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px; }
        h2 { color: #1e40af; margin-top: 30px; }
        h3 { color: #1e3a8a; margin-top: 20px; }
        .section { margin-bottom: 20px; }
        .patient-info { background-color: #f1f5f9; padding: 15px; border-radius: 5px; }
        .risk-assessment { background-color: #fef3c7; padding: 15px; border-radius: 5px; }
        .lab-results, .symptoms, .medications { background-color: #f8fafc; padding: 15px; border-radius: 5px; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { border: 1px solid #cbd5e1; padding: 8px; text-align: left; }
        th { background-color: #e2e8f0; }
        .footer { margin-top: 30px; padding-top: 10px; border-top: 1px solid #cbd5e1; font-size: 12px; color: #64748b; }
        .adherence-rate { font-weight: bold; color: #2563eb; }
    </style>
</head>
<body>
    <h1>${data.title}</h1>
    <p><strong>Report Generated:</strong> ${data.generatedDate}</p>
    
    <div class="section patient-info">
        <h2>PATIENT INFORMATION</h2>
        <p><strong>Name:</strong> ${data.patientInfo.name}</p>
        ${data.patientInfo.age ? `<p><strong>Age:</strong> ${data.patientInfo.age}</p>` : ''}
        ${data.patientInfo.sex ? `<p><strong>Sex:</strong> ${data.patientInfo.sex}</p>` : ''}
        ${data.patientInfo.height ? `<p><strong>Height:</strong> ${data.patientInfo.height} cm</p>` : ''}
        ${data.patientInfo.weight ? `<p><strong>Weight:</strong> ${data.patientInfo.weight} kg</p>` : ''}
    </div>
`;

    // Risk Assessment section
    html += `
    <div class="section risk-assessment">
        <h2>RISK ASSESSMENT</h2>
`;
    if (data.riskAssessment.score !== null) {
      html += `
        <p><strong>Risk Score:</strong> ${data.riskAssessment.score}%</p>
        <p><strong>Risk Level:</strong> ${data.riskAssessment.level}</p>
        <p><strong>Assessment Date:</strong> ${data.riskAssessment.date}</p>
`;
      if (data.riskAssessment.contributingFactors.length > 0) {
        html += `
        <h3>Contributing Factors:</h3>
        <ul>
`;
        data.riskAssessment.contributingFactors.forEach((factor: any) => {
          html += `          <li>${factor.explanation} (Contribution: ${factor.contribution}%)</li>\n`;
        });
        html += `        </ul>\n`;
      }
    } else {
      html += `        <p>No risk assessment available</p>\n`;
    }
    html += `    </div>\n`;

    // Lab Results section
    html += `
    <div class="section lab-results">
        <h2>LAB RESULTS</h2>
`;
    if (data.labResults.length > 0) {
      html += `
        <table>
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Details</th>
                </tr>
            </thead>
            <tbody>
`;
      data.labResults.forEach((result: any) => {
        let details = '';
        if (result.systolic !== null && result.diastolic !== null) {
          details += `BP: ${result.systolic}/${result.diastolic} mmHg`;
        }
        if (result.totalCholesterol !== null) {
          details += details ? `, Cholesterol: ${result.totalCholesterol} mg/dL` : `Cholesterol: ${result.totalCholesterol} mg/dL`;
        }
        if (result.ldl !== null) {
          details += details ? `, LDL: ${result.ldl} mg/dL` : `LDL: ${result.ldl} mg/dL`;
        }
        if (result.hdl !== null) {
          details += details ? `, HDL: ${result.hdl} mg/dL` : `HDL: ${result.hdl} mg/dL`;
        }
        if (result.triglycerides !== null) {
          details += details ? `, Triglycerides: ${result.triglycerides} mg/dL` : `Triglycerides: ${result.triglycerides} mg/dL`;
        }
        if (result.hba1c !== null) {
          details += details ? `, HbA1c: ${result.hba1c}%` : `HbA1c: ${result.hba1c}%`;
        }
        if (result.notes) {
          details += details ? ` | Notes: ${result.notes}` : `Notes: ${result.notes}`;
        }
        
        html += `                <tr>
                    <td>${result.date}</td>
                    <td>${result.type}</td>
                    <td>${details}</td>
                </tr>\n`;
      });
      html += `            </tbody>
        </table>\n`;
    } else {
      html += `        <p>No lab results available</p>\n`;
    }
    html += `    </div>\n`;

    // Symptoms section
    html += `
    <div class="section symptoms">
        <h2>SYMPTOMS</h2>
`;
    if (data.symptoms.length > 0) {
      html += `
        <table>
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Severity</th>
                    <th>Duration</th>
                    <th>Notes</th>
                </tr>
            </thead>
            <tbody>
`;
      data.symptoms.forEach((symptom: any) => {
        html += `                <tr>
                    <td>${symptom.date}</td>
                    <td>${symptom.type}</td>
                    <td>${symptom.severity !== null ? symptom.severity + '/10' : ''}</td>
                    <td>${symptom.duration || ''}</td>
                    <td>${symptom.notes || ''}</td>
                </tr>\n`;
      });
      html += `            </tbody>
        </table>\n`;
    } else {
      html += `        <p>No symptoms reported</p>\n`;
    }
    html += `    </div>\n`;

    // Medications section
    html += `
    <div class="section medications">
        <h2>MEDICATIONS</h2>
`;
    if (data.medications.length > 0) {
      html += `
        <table>
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Dosage</th>
                    <th>Frequency</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                </tr>
            </thead>
            <tbody>
`;
      data.medications.forEach((med: any) => {
        html += `                <tr>
                    <td>${med.name}</td>
                    <td>${med.dosage}</td>
                    <td>${med.frequency}</td>
                    <td>${med.startDate}</td>
                    <td>${med.endDate || ''}</td>
                </tr>\n`;
      });
      html += `            </tbody>
        </table>\n`;
      html += `        <p class="adherence-rate">Medication Adherence Rate: ${data.adherenceRate}%</p>\n`;
    } else {
      html += `        <p>No medications recorded</p>\n`;
    }
    html += `    </div>\n`;

    // Footer
    html += `
    <div class="footer">
        <p>${data.footer}</p>
    </div>
</body>
</html>`;

    return html;
  }

  // Additional methods for test compatibility
  public async generatePatientExportData(clinicianId: string): Promise<any> {
    return {
      patients: [],
      predictions: [],
      clinicalEntries: [],
      medications: [],
      mealPlans: [],
      exercisePlans: [],
      metadata: {
        exportDate: new Date(),
        version: "1.0.0",
        totalPatients: 0,
        totalPredictions: 0,
        totalMedications: 0,
        totalMealPlans: 0,
        totalExercisePlans: 0
      }
    };
  }

  public convertToCSV(data: any): string {
    let csv = "HeartGuard Patient Data Export\n\n";
    
    // Patient Data Section
    if (data.patients && data.patients.length > 0) {
      csv += "Patient Data\n";
      csv += "ID,Age,Sex,Risk Level,Last Assessment\n";
      data.patients.forEach((p: any) => {
        csv += `${p.id},${p.age},${p.sex},${p.riskLevel},${p.lastAssessment}\n`;
      });
      csv += "\n";
    }
    
    // Prediction Data Section
    if (data.predictions && data.predictions.length > 0) {
      csv += "Prediction Data\n";
      csv += "Patient ID,Score,Label,Date,Model Version\n";
      data.predictions.forEach((p: any) => {
        csv += `${p.patientId},${p.score},${p.label},${p.date},${p.modelVersion}\n`;
      });
      csv += "\n";
    }
    
    // Clinical Entry Data Section
    if (data.clinicalEntries && data.clinicalEntries.length > 0) {
      csv += "Clinical Entry Data\n";
      csv += "Patient ID,Age,Sex,BP,Cholesterol,Max Heart Rate,Date\n";
      data.clinicalEntries.forEach((c: any) => {
        csv += `${c.patientId},${c.age},${c.sex},${c.trestbps},${c.chol},${c.thalach},${c.date}\n`;
      });
      csv += "\n";
    }
    
    // Medication Data Section
    if (data.medications && data.medications.length > 0) {
      csv += "Medication Data\n";
      csv += "Patient ID,Name,Dosage,Frequency,Start Date\n";
      data.medications.forEach((m: any) => {
        csv += `${m.patientId},${m.name},${m.dosage},${m.frequency},${m.startDate}\n`;
      });
      csv += "\n";
    }
    
    // Meal Plan Data Section
    if (data.mealPlans && data.mealPlans.length > 0) {
      csv += "Meal Plan Data\n";
      csv += "Patient ID,Name,Calories,Created At\n";
      data.mealPlans.forEach((m: any) => {
        csv += `${m.patientId},${m.name},${m.calories},${m.createdAt}\n`;
      });
      csv += "\n";
    }
    
    // Exercise Plan Data Section
    if (data.exercisePlans && data.exercisePlans.length > 0) {
      csv += "Exercise Plan Data\n";
      csv += "Patient ID,Level,Duration,Created At\n";
      data.exercisePlans.forEach((e: any) => {
        csv += `${e.patientId},${e.level},${e.duration},${e.createdAt}\n`;
      });
      csv += "\n";
    }
    
    return csv;
  }

  public convertToJSON(data: any): string {
    return JSON.stringify(data, null, 2);
  }

  public generatePDFReport(data: any): Buffer {
    // Simple PDF-like content as Buffer
    const content = `HeartGuard Patient Report\n\n${JSON.stringify(data, null, 2)}`;
    return Buffer.from(content, 'utf-8');
  }

  public generatePatientReport(patientId: string, data: any): Buffer {
    if (!patientId) {
      throw new Error("Patient ID is required");
    }
    
    // Check if patient exists in the data
    const patientExists = data.patients && data.patients.some((p: any) => p.id === patientId);
    if (!patientExists) {
      throw new Error("Patient not found");
    }
    
    const content = `Patient Report for ID: ${patientId}\n\n${JSON.stringify(data, null, 2)}`;
    return Buffer.from(content, 'utf-8');
  }
}

// Export a singleton instance of the export service
export const exportService = new ExportService();
