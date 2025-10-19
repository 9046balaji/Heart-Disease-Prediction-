import express from "express";
import { authenticateUser } from "../auth/authMiddleware";
import { exportService } from "./exportService";
import { catchAsync } from "../utils/errors";

const router = express.Router();

// Export lab results as CSV
router.get("/export/lab-results", authenticateUser, catchAsync(async (req: any, res: any) => {
  try {
    const userId = req.userId;
    
    const csvContent = await exportService.exportLabResultsAsCSV(userId);
    
    res.header("Content-Type", "text/csv");
    res.attachment("lab-results.csv");
    return res.send(csvContent);
  } catch (error: any) {
    console.error("Error exporting lab results:", error);
    res.status(500).json({ 
      success: false,
      error: {
        message: "Failed to export lab results",
        details: error.message,
        statusCode: 500
      }
    });
  }
}));

// Export symptoms as CSV
router.get("/export/symptoms", authenticateUser, catchAsync(async (req: any, res: any) => {
  try {
    const userId = req.userId;
    
    const csvContent = await exportService.exportSymptomsAsCSV(userId);
    
    res.header("Content-Type", "text/csv");
    res.attachment("symptoms.csv");
    return res.send(csvContent);
  } catch (error: any) {
    console.error("Error exporting symptoms:", error);
    res.status(500).json({ 
      success: false,
      error: {
        message: "Failed to export symptoms",
        details: error.message,
        statusCode: 500
      }
    });
  }
}));

// Export all health data as CSV
router.get("/export/all", authenticateUser, catchAsync(async (req: any, res: any) => {
  try {
    const userId = req.userId;
    
    const csvContent = await exportService.exportAllHealthDataAsCSV(userId);
    
    res.header("Content-Type", "text/csv");
    res.attachment("health-data.csv");
    return res.send(csvContent);
  } catch (error: any) {
    console.error("Error exporting health data:", error);
    res.status(500).json({ 
      success: false,
      error: {
        message: "Failed to export health data",
        details: error.message,
        statusCode: 500
      }
    });
  }
}));
  
// Export clinical summary as text (PDF-like)
router.get("/export/clinical-summary", authenticateUser, catchAsync(async (req: any, res: any) => {
  try {
    const userId = req.userId;
    
    const summaryContent = await exportService.exportClinicalSummaryAsText(userId);
    
    res.header("Content-Type", "text/plain");
    res.attachment("clinical-summary.txt");
    return res.send(summaryContent);
  } catch (error: any) {
    console.error("Error exporting clinical summary:", error);
    res.status(500).json({ 
      success: false,
      error: {
        message: "Failed to export clinical summary",
        details: error.message,
        statusCode: 500
      }
    });
  }
}));

// Export clinical summary as HTML (for PDF conversion)
router.get("/export/clinical-summary-html", authenticateUser, catchAsync(async (req: any, res: any) => {
  try {
    const userId = req.userId;
    
    const htmlContent = await exportService.exportClinicalSummaryAsHTML(userId);
    
    res.header("Content-Type", "text/html");
    res.attachment("clinical-summary.html");
    return res.send(htmlContent);
  } catch (error: any) {
    console.error("Error exporting clinical summary as HTML:", error);
    res.status(500).json({ 
      success: false,
      error: {
        message: "Failed to export clinical summary as HTML",
        details: error.message,
        statusCode: 500
      }
    });
  }
}));

export default router;