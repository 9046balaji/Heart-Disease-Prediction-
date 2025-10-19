import { microLessonService } from "./microLessonService";
import { authenticateUser } from "../auth/authMiddleware";

export function setupMicroLessonRoutes(app: any) {
  // Get all tips
  app.get("/api/tips", authenticateUser, async (req: any, res: any) => {
    try {
      const tips = await microLessonService.getAllTips();
      res.status(200).json({ data: tips });
    } catch (error) {
      console.error("Error fetching tips:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get tips by category
  app.get("/api/tips/category/:category", authenticateUser, async (req: any, res: any) => {
    try {
      const { category } = req.params;
      const tips = await microLessonService.getTipsByCategory(category);
      res.status(200).json({ data: tips });
    } catch (error) {
      console.error("Error fetching tips by category:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get tips by tag
  app.get("/api/tips/tag/:tag", authenticateUser, async (req: any, res: any) => {
    try {
      const { tag } = req.params;
      const tips = await microLessonService.getTipsByTag(tag);
      res.status(200).json({ data: tips });
    } catch (error) {
      console.error("Error fetching tips by tag:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get tips by difficulty
  app.get("/api/tips/difficulty/:difficulty", authenticateUser, async (req: any, res: any) => {
    try {
      const { difficulty } = req.params;
      const tips = await microLessonService.getTipsByDifficulty(difficulty as any);
      res.status(200).json({ data: tips });
    } catch (error) {
      console.error("Error fetching tips by difficulty:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Search tips
  app.get("/api/tips/search", authenticateUser, async (req: any, res: any) => {
    try {
      const { query } = req.query;
      if (!query) {
        return res.status(400).json({ message: "Query parameter is required" });
      }
      const tips = await microLessonService.searchTips(query as string);
      res.status(200).json({ data: tips });
    } catch (error) {
      console.error("Error searching tips:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get personalized tips for a user
  app.get("/api/tips/personalized", authenticateUser, async (req: any, res: any) => {
    try {
      const userId = req.userId;
      const tips = await microLessonService.getPersonalizedTips(userId);
      res.status(200).json({ data: tips });
    } catch (error) {
      console.error("Error fetching personalized tips:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get daily tip for a user
  app.get("/api/tips/daily", authenticateUser, async (req: any, res: any) => {
    try {
      const userId = req.userId;
      const tip = await microLessonService.getDailyTip(userId);
      if (!tip) {
        return res.status(404).json({ message: "No tips available" });
      }
      res.status(200).json({ data: tip });
    } catch (error) {
      console.error("Error fetching daily tip:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Record user interaction with a tip
  app.post("/api/tips/:tipId/interaction", authenticateUser, async (req: any, res: any) => {
    try {
      const userId = req.userId;
      const { tipId } = req.params;
      const interactionData = req.body;

      // Validate tip exists
      const tip = await microLessonService.getTipById(tipId);
      if (!tip) {
        return res.status(404).json({ message: "Tip not found" });
      }

      const interaction = await microLessonService.recordUserInteraction(userId, tipId, interactionData);
      res.status(201).json({ data: interaction });
    } catch (error: any) {
      console.error("Error recording tip interaction:", error);
      res.status(400).json({ message: error.message || "Error recording tip interaction" });
    }
  });

  // Get user's completed tips
  app.get("/api/tips/completed", authenticateUser, async (req: any, res: any) => {
    try {
      const userId = req.userId;
      const tips = await microLessonService.getUserCompletedTips(userId);
      res.status(200).json({ data: tips });
    } catch (error) {
      console.error("Error fetching completed tips:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Admin route to add a new tip (in a real app, this would be protected)
  app.post("/api/tips", authenticateUser, async (req: any, res: any) => {
    try {
      const tipData = req.body;

      // Validate required fields
      if (!tipData.title || !tipData.content || !tipData.category) {
        return res.status(400).json({ message: "Title, content, and category are required" });
      }

      const tip = await microLessonService.addTip(tipData);
      res.status(201).json({ data: tip });
    } catch (error: any) {
      console.error("Error creating tip:", error);
      res.status(400).json({ message: error.message || "Error creating tip" });
    }
  });
}