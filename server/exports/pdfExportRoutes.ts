import express from "express";
import { authenticateUser } from "../auth/authMiddleware";
import { pdfExportService } from "./pdfExportService";
import { catchAsync } from "../utils/errors";

const router = express.Router();

// Generate and download clinical summary PDF
router.get("/export/clinical-summary", authenticateUser, catchAsync(async (req: any, res: any) => {
  try {
    const userId = req.userId;
    
    const pdfContent = await pdfExportService.generateClinicalSummaryPDF(userId);
    
    res.header("Content-Type", "text/plain");
    res.attachment("clinical-summary.txt");
    return res.send(pdfContent);
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

// Share clinical summary with clinician via email
router.post("/export/share-clinician", authenticateUser, catchAsync(async (req: any, res: any) => {
  try {
    const userId = req.userId;
    const { clinicianEmail } = req.body;
    
    if (!clinicianEmail) {
      return res.status(400).json({ 
        success: false,
        error: {
          message: "Clinician email is required",
          statusCode: 400
        }
      });
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(clinicianEmail)) {
      return res.status(400).json({ 
        success: false,
        error: {
          message: "Invalid email format",
          statusCode: 400
        }
      });
    }
    
    const result = await pdfExportService.shareWithClinician(userId, clinicianEmail);
    
    if (result) {
      res.status(200).json({ 
        success: true,
        message: "Clinical summary shared with clinician successfully"
      });
    } else {
      res.status(500).json({ 
        success: false,
        error: {
          message: "Failed to share clinical summary with clinician",
          statusCode: 500
        }
      });
    }
  } catch (error: any) {
    console.error("Error sharing with clinician:", error);
    res.status(500).json({ 
      success: false,
      error: {
        message: "Failed to share clinical summary with clinician",
        details: error.message,
        statusCode: 500
      }
    });
  }
}));

export default router;