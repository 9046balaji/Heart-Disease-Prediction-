import express from "express";
import { authenticateUser } from "../auth/authMiddleware";
import { healthTrendsService } from "./healthTrendsService";
import { catchAsync } from "../utils/errors";

const router = express.Router();

// Get all health trends for the user
router.get("/health/trends", authenticateUser, catchAsync(async (req: any, res: any) => {
  try {
    const userId = req.userId;
    
    // Parse filter options from query parameters
    const filterOptions: any = {};
    
    if (req.query.startDate) {
      filterOptions.startDate = new Date(req.query.startDate as string);
    }
    
    if (req.query.endDate) {
      filterOptions.endDate = new Date(req.query.endDate as string);
    }
    
    if (req.query.metrics) {
      filterOptions.metrics = (req.query.metrics as string).split(',');
    }
    
    if (req.query.timeRange) {
      filterOptions.timeRange = req.query.timeRange;
    }
    
    const trends = await healthTrendsService.getHealthTrends(userId, Object.keys(filterOptions).length > 0 ? filterOptions : undefined);
    
    res.status(200).json({
      success: true,
      data: trends
    });
  } catch (error: any) {
    console.error("Error fetching health trends:", error);
    res.status(500).json({ 
      success: false,
      error: {
        message: "Failed to fetch health trends",
        details: error.message,
        statusCode: 500
      }
    });
  }
}));

// Get lab trends only
router.get("/health/trends/lab", authenticateUser, catchAsync(async (req: any, res: any) => {
  try {
    const userId = req.userId;
    
    const trends = await healthTrendsService.getLabTrends(userId);
    
    res.status(200).json({
      success: true,
      data: trends
    });
  } catch (error: any) {
    console.error("Error fetching lab trends:", error);
    res.status(500).json({ 
      success: false,
      error: {
        message: "Failed to fetch lab trends",
        details: error.message,
        statusCode: 500
      }
    });
  }
}));

// Get symptom trends only
router.get("/health/trends/symptoms", authenticateUser, catchAsync(async (req: any, res: any) => {
  try {
    const userId = req.userId;
    
    const trends = await healthTrendsService.getSymptomTrends(userId);
    
    res.status(200).json({
      success: true,
      data: trends
    });
  } catch (error: any) {
    console.error("Error fetching symptom trends:", error);
    res.status(500).json({ 
      success: false,
      error: {
        message: "Failed to fetch symptom trends",
        details: error.message,
        statusCode: 500
      }
    });
  }
}));

// Get comparative analysis data
router.get("/health/trends/comparative", authenticateUser, catchAsync(async (req: any, res: any) => {
  try {
    const userId = req.userId;
    
    const analysisData = await healthTrendsService.getComparativeAnalysisData(userId);
    
    res.status(200).json({
      success: true,
      data: analysisData
    });
  } catch (error: any) {
    console.error("Error fetching comparative analysis data:", error);
    res.status(500).json({ 
      success: false,
      error: {
        message: "Failed to fetch comparative analysis data",
        details: error.message,
        statusCode: 500
      }
    });
  }
}));

export default router;