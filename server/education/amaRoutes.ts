import { amaService } from "./amaService";
import { authenticateUser } from "../auth/authMiddleware";

export function setupAMARoutes(app: any) {
  // Get all scheduled AMA events
  app.get("/api/ama/events", authenticateUser, async (req: any, res: any) => {
    try {
      const { status } = req.query;
      const events = await amaService.getAMAEvents(status as any);
      res.status(200).json(events);
    } catch (error) {
      console.error("Error fetching AMA events:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Get a specific AMA event
  app.get("/api/ama/events/:amaId", authenticateUser, async (req: any, res: any) => {
    try {
      const { amaId } = req.params;
      const event = await amaService.getAMAEventById(amaId);
      
      if (!event) {
        return res.status(404).json({ message: "AMA event not found" });
      }
      
      res.status(200).json(event);
    } catch (error) {
      console.error("Error fetching AMA event:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Register for an AMA event
  app.post("/api/ama/events/:amaId/register", authenticateUser, async (req: any, res: any) => {
    try {
      const userId = req.userId;
      const { amaId } = req.params;
      
      const registration = await amaService.registerForAMA(amaId, userId);
      res.status(201).json(registration);
    } catch (error: any) {
      console.error("Error registering for AMA event:", error);
      res.status(400).json({ message: error.message || "Error registering for AMA event" });
    }
  });
  
  // Get user's AMA registrations
  app.get("/api/ama/registrations", authenticateUser, async (req: any, res: any) => {
    try {
      const userId = req.userId;
      const registrations = await amaService.getRegistrationsForUser(userId);
      res.status(200).json(registrations);
    } catch (error) {
      console.error("Error fetching AMA registrations:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Get registrations for a specific AMA event (admin only)
  app.get("/api/ama/events/:amaId/registrations", authenticateUser, async (req: any, res: any) => {
    try {
      const { amaId } = req.params;
      
      // In a real implementation, check if user is admin
      // For now, we'll allow access to this endpoint
      
      const registrations = await amaService.getRegistrationsForAMA(amaId);
      res.status(200).json(registrations);
    } catch (error) {
      console.error("Error fetching AMA event registrations:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Cancel an AMA event (admin only)
  app.post("/api/ama/events/:amaId/cancel", authenticateUser, async (req: any, res: any) => {
    try {
      const { amaId } = req.params;
      
      // In a real implementation, check if user is admin
      // For now, we'll allow access to this endpoint
      
      const result = await amaService.cancelAMAEvent(amaId);
      if (!result) {
        return res.status(404).json({ message: "AMA event not found" });
      }
      
      res.status(200).json({ message: "AMA event cancelled successfully" });
    } catch (error: any) {
      console.error("Error cancelling AMA event:", error);
      res.status(400).json({ message: error.message || "Error cancelling AMA event" });
    }
  });
  
  // Start an AMA event (admin only)
  app.post("/api/ama/events/:amaId/start", authenticateUser, async (req: any, res: any) => {
    try {
      const { amaId } = req.params;
      
      // In a real implementation, check if user is admin
      // For now, we'll allow access to this endpoint
      
      const event = await amaService.startAMAEvent(amaId);
      if (!event) {
        return res.status(404).json({ message: "AMA event not found" });
      }
      
      res.status(200).json(event);
    } catch (error: any) {
      console.error("Error starting AMA event:", error);
      res.status(400).json({ message: error.message || "Error starting AMA event" });
    }
  });
  
  // Complete an AMA event (admin only)
  app.post("/api/ama/events/:amaId/complete", authenticateUser, async (req: any, res: any) => {
    try {
      const { amaId } = req.params;
      
      // In a real implementation, check if user is admin
      // For now, we'll allow access to this endpoint
      
      const event = await amaService.completeAMAEvent(amaId);
      if (!event) {
        return res.status(404).json({ message: "AMA event not found" });
      }
      
      res.status(200).json(event);
    } catch (error: any) {
      console.error("Error completing AMA event:", error);
      res.status(400).json({ message: error.message || "Error completing AMA event" });
    }
  });
}