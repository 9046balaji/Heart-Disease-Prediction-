import express from "express";
import { authenticateUser } from "../auth/authMiddleware";
import { triageService } from "./triageService";
import { catchAsync } from "../utils/errors";

const router = express.Router();

// Get triage alerts for the user
router.get("/triage/alerts", authenticateUser, catchAsync(async (req: any, res: any) => {
  try {
    const userId = req.userId;
    
    const alerts = await triageService.getAlerts(userId);
    
    res.status(200).json({
      success: true,
      data: alerts
    });
  } catch (error: any) {
    console.error("Error fetching triage alerts:", error);
    res.status(500).json({ 
      success: false,
      error: {
        message: "Failed to fetch triage alerts",
        details: error.message,
        statusCode: 500
      }
    });
  }
}));

export default router;