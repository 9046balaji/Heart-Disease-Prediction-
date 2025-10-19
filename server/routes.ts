import express from 'express';
import { storage } from "./storage";
import { predictionService } from "./ml/predictionService";
import { setupChatbotRoutes } from "./chatbot/chatbotRoutes";
import { setupMedicationRoutes } from "./medication/medicationRoutes";
import { setupLifestyleRoutes } from "./profiles/lifestyleRoutes";
import { setupEmergencyRoutes } from "./emergency/emergencyRoutes";
import { setupNotificationRoutes } from "./notifications/notificationRoutes";
import { setupTeleConsultRoutes } from "./teleconsult/teleConsultRoutes";
import { setupForumRoutes } from "./forums/forumRoutes";
import { setupGoalRoutes } from "./goals/goalRoutes";
import { setupChallengeRoutes } from "./goals/challengeRoutes";
import { setupMicroLessonRoutes } from "./education/microLessonRoutes";
import { authService } from "./auth/authService";
import { authenticateUser, authenticateClinician } from "./auth/authMiddleware";
import { mealPlanService } from "./nutrition/mealPlans";
import { exercisePlanService } from "./exercise/exercisePlans";
import labTrackerRoutes from "./clinical/labTrackerRoutes";
import nutritionRoutes from "./nutritionRoutes";
import exerciseRoutes from "./exercise/exerciseRoutes";
import exerciseLibraryRoutes from "./exercise/exerciseLibraryRoutes";
import workoutRoutes from "./exercise/workoutRoutes";
import safetyCheckRoutes from "./exercise/safetyCheckRoutes";
import groceryRoutes from "./nutrition/groceryRoutes";
import symptomTrackerRoutes from "./symptoms/symptomTrackerRoutes";
import exportRoutes from "./exports/exportRoutes";
import triageRoutes from "./emergency/triageRoutes";
import healthTrendsRoutes from "./clinical/healthTrendsRoutes";
import pdfExportRoutes from "./exports/pdfExportRoutes";
import allergyRoutes from "./nutrition/allergyRoutes";
import { setupAMARoutes } from "./education/amaRoutes";
import userProfileRoutes from "./profiles/userProfileRoutes";
import mfaRoutes from "./auth/mfaRoutes";
import biometricRoutes from "./auth/biometricRoutes";
import { setupPrivacyRoutes } from "./privacy/privacyRoutes";
import { setupFileUploadRoutes } from "./utils/fileUpload/fileUploadRoutes";
import { catchAsync } from "./utils/errors";
import { logger } from "./utils/logger";
import { validateBody, validationSchemas } from "./middleware/validation";
import { riskStratificationService } from "./ml/riskStratificationService";
import { researchExportService } from "./analytics/researchExportService";
import { automatedReportService } from "./exports/automatedReportService";
import { cohortAnalysisService } from "./analytics/cohortAnalysisService";

export function setupRoutes(app: express.Application) {
  // put application routes here
  // prefix all routes with /api

  // use storage to perform CRUD operations on the storage interface
  // e.g. storage.insertUser(user) or storage.getUserByUsername(username)
  
  // User registration endpoint
  app.post("/api/auth/register", validateBody(validationSchemas.userRegistration), catchAsync(async (req: any, res: any) => {
    const { username, password } = req.body;
    
    // Register user
    const result = await authService.registerUser({ username, password });
    if (!result) {
      return res.status(409).json({ 
        success: false,
        error: {
          message: "Username already exists",
          statusCode: 409
        }
      });
    }
    
    res.status(201).json({ 
      success: true,
      message: "User created successfully",
      data: {
        user: { id: result.user.id, username: result.user.username },
        tokens: result.tokens
      }
    });
  }));
  
  // User login endpoint
  app.post("/api/auth/login", validateBody(validationSchemas.userLogin), catchAsync(async (req: any, res: any) => {
    const { username, password, mfaCode, mfaMethod } = req.body;
    
    // Login user
    const result = await authService.loginUser({ username, password, mfaCode, mfaMethod });
    if (!result) {
      return res.status(401).json({ 
        success: false,
        error: {
          message: "Invalid credentials",
          statusCode: 401
        }
      });
    }
    
    // Check if there was an error during MFA verification
    if (result.error) {
      return res.status(401).json({ 
        success: false,
        error: {
          message: result.error,
          statusCode: 401
        }
      });
    }
    
    // Check if MFA is required
    if (result.requiresMfa && !result.tokens) {
      return res.status(200).json({ 
        success: true,
        message: "MFA required",
        data: {
          user: { id: result.user.id, username: result.user.username },
          requiresMfa: true,
          mfaMethod: result.mfaMethod
        }
      });
    }
    
    res.status(200).json({ 
      success: true,
      message: "Login successful",
      data: {
        user: { id: result.user.id, username: result.user.username },
        tokens: result.tokens
      }
    });
  }));
  
  // Token refresh endpoint
  app.post("/api/auth/refresh", catchAsync(async (req: any, res: any) => {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({ 
        success: false,
        error: {
          message: "Refresh token is required",
          statusCode: 400
        }
      });
    }
    
    // Refresh tokens
    const tokens = authService.refreshTokens(refreshToken);
    if (!tokens) {
      return res.status(401).json({ 
        success: false,
        error: {
          message: "Invalid or expired refresh token",
          statusCode: 401
        }
      });
    }
    
    res.status(200).json({ 
      success: true,
      data: { tokens }
    });
  }));
  
  // Clinical data submission endpoint
  app.post("/api/clinical-data", authenticateUser, validateBody(validationSchemas.clinicalData), catchAsync(async (req: any, res: any) => {
    const userId = req.userId;
    const clinicalData = req.body;
    
    // Create clinical entry
    const clinicalEntry = await storage.createClinicalEntry({
      userId,
      timestamp: new Date(),
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
      height: clinicalData.height ? parseInt(clinicalData.height) : null,
      weight: clinicalData.weight ? parseInt(clinicalData.weight) : null,
      smokingStatus: clinicalData.smokingStatus
    });
    
    res.status(201).json({
      success: true,
      data: clinicalEntry
    });
  }));
  
  // Get clinical data history for a user
  app.get("/api/clinical-data", authenticateUser, catchAsync(async (req: any, res: any) => {
    const userId = req.userId;
    
    // Get clinical data history
    const clinicalEntries = await storage.getClinicalEntries(userId);
    
    res.status(200).json({
      success: true,
      data: clinicalEntries
    });
  }));
  
  // Get a specific clinical entry by ID
  app.get("/api/clinical-data/:id", authenticateUser, catchAsync(async (req: any, res: any) => {
    const clinicalEntryId = req.params.id;
    const userId = req.userId;
    
    // Get clinical entry by ID
    const clinicalEntry = await storage.getClinicalEntry(clinicalEntryId, userId);
    
    if (!clinicalEntry) {
      return res.status(404).json({ 
        success: false,
        error: {
          message: "Clinical entry not found",
          statusCode: 404
        }
      });
    }
    
    res.status(200).json({
      success: true,
      data: clinicalEntry
    });
  }));
  
  // Clinical data submission and prediction endpoint
  app.post("/api/predict", authenticateUser, validateBody(validationSchemas.clinicalData), catchAsync(async (req: any, res: any) => {
    const userId = req.userId;
    
    // Save clinical data first
    const clinicalData = req.body;
    const clinicalEntry = await storage.createClinicalEntry({
      userId,
      timestamp: new Date(),
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
      height: clinicalData.height ? parseInt(clinicalData.height) : null,
      weight: clinicalData.weight ? parseInt(clinicalData.weight) : null,
      smokingStatus: clinicalData.smokingStatus
    });
    
    // Make prediction
    const predictionResult = await predictionService.predict(userId, clinicalData);
    
    // Save prediction to database
    const prediction = await storage.createPrediction({
      userId,
      clinicalEntryId: clinicalEntry.id,
      timestamp: new Date(),
      score: Math.round(predictionResult.score * 100), // Convert to percentage
      label: predictionResult.label,
      modelVersion: predictionResult.model_version,
      shapTopFeatures: predictionResult.shap_top_features
    });
    
    // Generate personalized meal plan based on prediction
    const healthConditions: string[] = [];
    if (clinicalData.trestbps >= 140) healthConditions.push("hypertension");
    if (clinicalData.chol >= 240) healthConditions.push("high-cholesterol");
    if (clinicalData.fbs === 1) healthConditions.push("diabetes");
    
    // Get user's dietary preferences (in a real app, this would come from user profile)
    const dietaryPreferences: string[] = [];
    
    // Generate meal plan
    const mealPlan = await mealPlanService.generatePersonalizedMealPlan(
      userId,
      clinicalEntry,
      prediction,
      dietaryPreferences,
      healthConditions
    );
    
    // Generate exercise plan
    const exercisePlan = await exercisePlanService.generatePersonalizedExercisePlan(
      userId,
      clinicalEntry,
      prediction,
      healthConditions
    );
    
    res.status(200).json({
      success: true,
      data: {
        clinicalEntry,
        prediction: {
          ...prediction,
          riskFactors: predictionResult.risk_factors,
          lifestyleRecommendations: predictionResult.lifestyle_recommendations
        },
        mealPlan,
        exercisePlan
      }
    });
  }));
  
  // Get prediction history for a user
  app.get("/api/predictions", authenticateUser, catchAsync(async (req: any, res: any) => {
    const userId = req.userId;
    
    // Get prediction history
    const predictions = await storage.getPredictions(userId);
    
    res.status(200).json({
      success: true,
      data: predictions
    });
  }));
  
  // Get a specific prediction by ID
  app.get("/api/predictions/:id", authenticateUser, catchAsync(async (req: any, res: any) => {
    const predictionId = req.params.id;
    const userId = req.userId;
    
    // Get prediction by ID
    const prediction = await storage.getPrediction(predictionId, userId);
    
    if (!prediction) {
      return res.status(404).json({ 
        success: false,
        error: {
          message: "Prediction not found",
          statusCode: 404
        }
      });
    }
    
    res.status(200).json({
      success: true,
      data: prediction
    });
  }));
  
  // Meal plans endpoints
  app.get("/api/meal-plans", authenticateUser, catchAsync(async (req: any, res: any) => {
    const userId = req.userId;
    
    // Get meal plans
    const mealPlans = await storage.getMealPlans(userId);
    
    res.status(200).json({
      success: true,
      data: mealPlans
    });
  }));
  
  app.post("/api/meal-plans", authenticateUser, catchAsync(async (req: any, res: any) => {
    const userId = req.userId;
    const mealPlanData = req.body;
    
    // Create meal plan
    const mealPlan = await storage.createMealPlan({
      userId,
      name: mealPlanData.name,
      description: mealPlanData.description,
      calories: parseInt(mealPlanData.calories),
      tags: mealPlanData.tags,
      meals: mealPlanData.meals,
      createdAt: new Date()
    });
    
    res.status(201).json({
      success: true,
      data: mealPlan
    });
  }));
  
  // Exercise plans endpoints
  app.get("/api/exercise-plans", authenticateUser, catchAsync(async (req: any, res: any) => {
    const userId = req.userId;
    
    // Get exercise plans
    const exercisePlans = await storage.getExercisePlans(userId);
    
    res.status(200).json({
      success: true,
      data: exercisePlans
    });
  }));
  
  app.post("/api/exercise-plans", authenticateUser, catchAsync(async (req: any, res: any) => {
    const userId = req.userId;
    const exercisePlanData = req.body;
    
    // Create exercise plan
    const exercisePlan = await storage.createExercisePlan({
      userId,
      level: exercisePlanData.level,
      duration: parseInt(exercisePlanData.duration),
      weeklyGoal: exercisePlanData.weeklyGoal,
      exercises: exercisePlanData.exercises,
      createdAt: new Date()
    });
    
    res.status(201).json({
      success: true,
      data: exercisePlan
    });
  }));
  
  // Clinician routes - get patient details
  app.get("/api/clinician/patients/:userId", authenticateClinician, catchAsync(async (req: any, res: any) => {
    const userId = req.params.userId;
    
    // Get patient profile
    const patient = await storage.getUser(userId);
    if (!patient) {
      return res.status(404).json({ 
        success: false,
        error: {
          message: "Patient not found",
          statusCode: 404
        }
      });
    }
    
    // Get patient's clinical entries
    const clinicalEntries = await storage.getClinicalEntries(userId);
    
    // Get patient's predictions
    const predictions = await storage.getPredictions(userId);
    
    // Get patient's medications
    const medications = await storage.getMedications(userId);
    
    // Get patient's meal plans
    const mealPlans = await storage.getMealPlans(userId);
    
    // Get patient's exercise plans
    const exercisePlans = await storage.getExercisePlans(userId);
    
    // Get patient's risk stratification
    const riskProfile = await riskStratificationService.getPatientRiskProfile(userId);
    
    res.status(200).json({
      success: true,
      data: {
        patient: {
          id: patient.id,
          username: patient.username
        },
        clinicalEntries,
        predictions,
        medications,
        mealPlans,
        exercisePlans,
        riskProfile
      }
    });
  }));
  
  // Clinician routes - get all patients with summary data
  app.get("/api/clinician/patients", authenticateClinician, catchAsync(async (req: any, res: any) => {
    // In a real implementation, we would fetch all patients
    // For now, we'll return mock data but in a real app this would come from the database
    const patients = [
      {
        id: "1",
        name: "Raj Kumar",
        age: 52,
        sex: 1,
        lastAssessment: "2025-10-10",
        riskScore: 75,
        riskLevel: "high",
        riskStratification: "very-high",
        conditions: ["hypertension", "high cholesterol"]
      },
      {
        id: "2",
        name: "Meera Patel",
        age: 28,
        sex: 0,
        lastAssessment: "2025-10-12",
        riskScore: 25,
        riskLevel: "low",
        riskStratification: "low",
        conditions: []
      },
      {
        id: "3",
        name: "Amit Sharma",
        age: 45,
        sex: 1,
        lastAssessment: "2025-10-08",
        riskScore: 55,
        riskLevel: "medium",
        riskStratification: "moderate",
        conditions: ["family history"]
      }
    ];
    
    res.status(200).json({
      success: true,
      data: patients
    });
  }));

  // Clinician routes - get risk stratification categories
  app.get("/api/clinician/risk-categories", authenticateClinician, catchAsync(async (req: any, res: any) => {
    const riskCategories = riskStratificationService.getRiskCategories();
    
    res.status(200).json({
      success: true,
      data: riskCategories
    });
  }));

  // Clinician routes - perform cohort analysis
  app.get("/api/clinician/cohort-analysis", authenticateClinician, catchAsync(async (req: any, res: any) => {
    const cohortAnalysis = await riskStratificationService.performCohortAnalysis();
    
    res.status(200).json({
      success: true,
      data: cohortAnalysis
    });
  }));

  // Clinician routes - analyze cohort
  app.post("/api/clinician/cohort-analyses", authenticateClinician, catchAsync(async (req: any, res: any) => {
    try {
      const analysis = await cohortAnalysisService.analyzeCohort(req.body.name, req.body.filters);
      
      res.status(201).json({
        success: true,
        data: analysis
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          message: "Failed to analyze cohort",
          statusCode: 500
        }
      });
    }
  }));

  // Clinician routes - get cohort analyses
  app.get("/api/clinician/cohort-analyses", authenticateClinician, catchAsync(async (req: any, res: any) => {
    try {
      const analyses = await cohortAnalysisService.getCohortAnalyses();
      
      res.status(200).json({
        success: true,
        data: analyses
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          message: "Failed to get cohort analyses",
          statusCode: 500
        }
      });
    }
  }));

  // Clinician routes - get cohort analysis by ID
  app.get("/api/clinician/cohort-analyses/:id", authenticateClinician, catchAsync(async (req: any, res: any) => {
    try {
      const analysis = await cohortAnalysisService.getCohortAnalysis(req.params.id);
      
      if (!analysis) {
        return res.status(404).json({
          success: false,
          error: {
            message: "Cohort analysis not found",
            statusCode: 404
          }
        });
      }
      
      res.status(200).json({
        success: true,
        data: analysis
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          message: "Failed to get cohort analysis",
          statusCode: 500
        }
      });
    }
  }));

  // Clinician routes - compare cohorts
  app.post("/api/clinician/cohort-comparisons", authenticateClinician, catchAsync(async (req: any, res: any) => {
    try {
      const comparison = await cohortAnalysisService.compareCohorts(req.body.cohortId1, req.body.cohortId2);
      
      res.status(200).json({
        success: true,
        data: comparison
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          message: "Failed to compare cohorts",
          statusCode: 500
        }
      });
    }
  }));

  // Clinician routes - get predefined cohort templates
  app.get("/api/clinician/cohort-templates", authenticateClinician, catchAsync(async (req: any, res: any) => {
    try {
      const templates = cohortAnalysisService.getPredefinedCohortTemplates();
      
      res.status(200).json({
        success: true,
        data: templates
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          message: "Failed to get cohort templates",
          statusCode: 500
        }
      });
    }
  }));

  // Clinician routes - export research dataset as JSON
  app.get("/api/clinician/research-export/json", authenticateClinician, catchAsync(async (req: any, res: any) => {
    try {
      const jsonData = await researchExportService.exportResearchDatasetAsJSON();
      
      res.status(200).json({
        success: true,
        data: JSON.parse(jsonData)
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          message: "Failed to export research dataset as JSON",
          statusCode: 500
        }
      });
    }
  }));

  // Clinician routes - export research dataset as CSV
  app.get("/api/clinician/research-export/csv", authenticateClinician, catchAsync(async (req: any, res: any) => {
    try {
      const csvData = await researchExportService.exportResearchDatasetAsCSV();
      
      res.status(200).json({
        success: true,
        data: csvData
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          message: "Failed to export research dataset as CSV",
          statusCode: 500
        }
      });
    }
  }));

  // Clinician routes - get research dataset statistics
  app.get("/api/clinician/research-statistics", authenticateClinician, catchAsync(async (req: any, res: any) => {
    try {
      const statistics = await researchExportService.getResearchDatasetStatistics();
      
      res.status(200).json({
        success: true,
        data: statistics
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          message: "Failed to get research dataset statistics",
          statusCode: 500
        }
      });
    }
  }));

  // Clinician routes - create report template
  app.post("/api/clinician/report-templates", authenticateClinician, catchAsync(async (req: any, res: any) => {
    try {
      const template = await automatedReportService.createReportTemplate(req.body);
      
      res.status(201).json({
        success: true,
        data: template
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          message: "Failed to create report template",
          statusCode: 500
        }
      });
    }
  }));

  // Clinician routes - get report templates
  app.get("/api/clinician/report-templates", authenticateClinician, catchAsync(async (req: any, res: any) => {
    try {
      const templates = await automatedReportService.getReportTemplates();
      
      res.status(200).json({
        success: true,
        data: templates
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          message: "Failed to get report templates",
          statusCode: 500
        }
      });
    }
  }));

  // Clinician routes - get report template by ID
  app.get("/api/clinician/report-templates/:id", authenticateClinician, catchAsync(async (req: any, res: any) => {
    try {
      const template = await automatedReportService.getReportTemplate(req.params.id);
      
      if (!template) {
        return res.status(404).json({
          success: false,
          error: {
            message: "Report template not found",
            statusCode: 404
          }
        });
      }
      
      res.status(200).json({
        success: true,
        data: template
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          message: "Failed to get report template",
          statusCode: 500
        }
      });
    }
  }));

  // Clinician routes - update report template
  app.put("/api/clinician/report-templates/:id", authenticateClinician, catchAsync(async (req: any, res: any) => {
    try {
      const template = await automatedReportService.updateReportTemplate(req.params.id, req.body);
      
      if (!template) {
        return res.status(404).json({
          success: false,
          error: {
            message: "Report template not found",
            statusCode: 404
          }
        });
      }
      
      res.status(200).json({
        success: true,
        data: template
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          message: "Failed to update report template",
          statusCode: 500
        }
      });
    }
  }));

  // Clinician routes - delete report template
  app.delete("/api/clinician/report-templates/:id", authenticateClinician, catchAsync(async (req: any, res: any) => {
    try {
      const result = await automatedReportService.deleteReportTemplate(req.params.id);
      
      if (!result) {
        return res.status(404).json({
          success: false,
          error: {
            message: "Report template not found",
            statusCode: 404
          }
        });
      }
      
      res.status(200).json({
        success: true,
        message: "Report template deleted successfully"
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          message: "Failed to delete report template",
          statusCode: 500
        }
      });
    }
  }));

  // Clinician routes - generate automated report
  app.post("/api/clinician/reports/generate", authenticateClinician, catchAsync(async (req: any, res: any) => {
    try {
      const report = await automatedReportService.generateAutomatedReport(req.body.templateId);
      
      if (!report) {
        return res.status(404).json({
          success: false,
          error: {
            message: "Report template not found",
            statusCode: 404
          }
        });
      }
      
      res.status(201).json({
        success: true,
        data: report
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          message: "Failed to generate automated report",
          statusCode: 500
        }
      });
    }
  }));

  // Clinician routes - get automated reports
  app.get("/api/clinician/reports", authenticateClinician, catchAsync(async (req: any, res: any) => {
    try {
      const reports = await automatedReportService.getAutomatedReports();
      
      res.status(200).json({
        success: true,
        data: reports
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          message: "Failed to get automated reports",
          statusCode: 500
        }
      });
    }
  }));

  // Clinician routes - get automated reports by template
  app.get("/api/clinician/reports/template/:templateId", authenticateClinician, catchAsync(async (req: any, res: any) => {
    try {
      const reports = await automatedReportService.getAutomatedReportsByTemplate(req.params.templateId);
      
      res.status(200).json({
        success: true,
        data: reports
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          message: "Failed to get automated reports",
          statusCode: 500
        }
      });
    }
  }));

  // Setup other routes
  setupChatbotRoutes(app);
  setupMedicationRoutes(app);
  setupLifestyleRoutes(app);
  setupEmergencyRoutes(app);
  setupNotificationRoutes(app);
  setupTeleConsultRoutes(app);
  setupForumRoutes(app);
  setupGoalRoutes(app);
  setupChallengeRoutes(app);
  app.use("/api/lab-tracker", labTrackerRoutes);
  app.use("/api/nutrition", nutritionRoutes);
  app.use("/api", allergyRoutes);
  app.use("/api/exercise", exerciseRoutes);
  app.use("/api/exercise-library", exerciseLibraryRoutes);
  app.use("/api", workoutRoutes);
  app.use("/api", safetyCheckRoutes);
  app.use("/api", groceryRoutes);
  app.use("/api", symptomTrackerRoutes);
  app.use("/api", exportRoutes);
  app.use("/api", triageRoutes);
  app.use("/api", healthTrendsRoutes);
  app.use("/api", pdfExportRoutes);
  app.use("/api", userProfileRoutes);
  app.use("/api", mfaRoutes);
  app.use("/api", biometricRoutes);
  setupMicroLessonRoutes(app);
  setupAMARoutes(app);
  setupPrivacyRoutes(app);
  setupFileUploadRoutes(app);
  
  return app;
}

// Export alias for compatibility
export const registerRoutes = setupRoutes;