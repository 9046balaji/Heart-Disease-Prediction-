import express from "express";
import { labResultsService } from "./labResultsService";
import { authenticateUser } from "../auth/authMiddleware";

const router = express.Router();

// Add a new lab result
router.post("/lab-results", authenticateUser, async (req: any, res: any) => {
  try {
    const userId = req.userId;
    const labResultData = req.body;
    
    // Validate required fields
    if (!labResultData.type) {
      return res.status(400).json({ error: "Lab result type is required" });
    }
    
    // Convert date string to Date object if provided
    if (labResultData.date) {
      labResultData.date = new Date(labResultData.date);
    } else {
      labResultData.date = new Date();
    }
    
    const result = await labResultsService.addLabResult(userId, labResultData);
    res.status(201).json(result);
  } catch (error: any) {
    if (error.message.includes("requires")) {
      res.status(400).json({ error: error.message });
    } else {
      console.error("Error adding lab result:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
});

// Get all lab results for the user
router.get("/lab-results", authenticateUser, async (req: any, res: any) => {
  try {
    const userId = req.userId;
    const results = await labResultsService.getLabResults(userId);
    res.json(results);
  } catch (error) {
    console.error("Error fetching lab results:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get lab results by type
router.get("/lab-results/:type", authenticateUser, async (req: any, res: any) => {
  try {
    const userId = req.userId;
    const { type } = req.params;
    
    // Validate type parameter
    if (!["bloodPressure", "cholesterol", "hba1c"].includes(type)) {
      return res.status(400).json({ error: "Invalid lab result type" });
    }
    
    const results = await labResultsService.getLabResultsByType(userId, type as any);
    res.json(results);
  } catch (error) {
    console.error("Error fetching lab results by type:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get lab trends
router.get("/lab-trends", authenticateUser, async (req: any, res: any) => {
  try {
    const userId = req.userId;
    const trends = await labResultsService.getLabTrends(userId);
    res.json(trends);
  } catch (error) {
    console.error("Error fetching lab trends:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update a lab result
router.put("/lab-results/:id", authenticateUser, async (req: any, res: any) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const updates = req.body;
    
    // Convert date string to Date object if provided
    if (updates.date) {
      updates.date = new Date(updates.date);
    }
    
    const result = await labResultsService.updateLabResult(userId, id, updates);
    
    if (!result) {
      return res.status(404).json({ error: "Lab result not found" });
    }
    
    res.json(result);
  } catch (error: any) {
    if (error.message.includes("requires")) {
      res.status(400).json({ error: error.message });
    } else {
      console.error("Error updating lab result:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
});

// Delete a lab result
router.delete("/lab-results/:id", authenticateUser, async (req: any, res: any) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    
    const deleted = await labResultsService.deleteLabResult(userId, id);
    
    if (!deleted) {
      return res.status(404).json({ error: "Lab result not found" });
    }
    
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting lab result:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;