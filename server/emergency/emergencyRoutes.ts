import { emergencyService } from "./emergencyService";
import { authenticateUser } from "../auth/authMiddleware";

// Emergency routes
export function setupEmergencyRoutes(app: any) {
  // Add emergency contact
  app.post("/api/emergency/contacts", authenticateUser, async (req: any, res: any) => {
    try {
      const userId = req.userId;
      const contactData = req.body;
      
      // Validate required fields
      if (!contactData.name || !contactData.phoneNumber) {
        return res.status(400).json({ 
          message: "Name and phone number are required" 
        });
      }
      
      // Add emergency contact
      const contact = await emergencyService.addEmergencyContact(userId, contactData);
      
      res.status(201).json(contact);
    } catch (error) {
      console.error("Error adding emergency contact:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get all emergency contacts
  app.get("/api/emergency/contacts", authenticateUser, async (req: any, res: any) => {
    try {
      const userId = req.userId;
      
      // Get emergency contacts
      const contacts = await emergencyService.getEmergencyContacts(userId);
      
      res.status(200).json(contacts);
    } catch (error) {
      console.error("Error fetching emergency contacts:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Update emergency contact
  app.put("/api/emergency/contacts/:contactId", authenticateUser, async (req: any, res: any) => {
    try {
      const userId = req.userId;
      const contactId = req.params.contactId;
      const updateData = req.body;
      
      // Update emergency contact
      const contact = await emergencyService.updateEmergencyContact(userId, contactId, updateData);
      
      if (!contact) {
        return res.status(404).json({ message: "Emergency contact not found" });
      }
      
      res.status(200).json(contact);
    } catch (error) {
      console.error("Error updating emergency contact:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Delete emergency contact
  app.delete("/api/emergency/contacts/:contactId", authenticateUser, async (req: any, res: any) => {
    try {
      const userId = req.userId;
      const contactId = req.params.contactId;
      
      // Delete emergency contact
      const success = await emergencyService.deleteEmergencyContact(userId, contactId);
      
      if (!success) {
        return res.status(404).json({ message: "Emergency contact not found" });
      }
      
      res.status(200).json({ message: "Emergency contact deleted successfully" });
    } catch (error) {
      console.error("Error deleting emergency contact:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Send emergency message
  app.post("/api/emergency/message", authenticateUser, async (req: any, res: any) => {
    try {
      const userId = req.userId;
      const { message, contactIds } = req.body;
      
      // Validate message
      if (!message) {
        return res.status(400).json({ message: "Message is required" });
      }
      
      // Send emergency message
      const emergencyMessage = await emergencyService.sendEmergencyMessage(userId, message, contactIds);
      
      res.status(200).json(emergencyMessage);
    } catch (error) {
      console.error("Error sending emergency message:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Call emergency services
  app.post("/api/emergency/call", authenticateUser, async (req: any, res: any) => {
    try {
      const userId = req.userId;
      
      // Call emergency services
      const success = await emergencyService.callEmergencyServices(userId);
      
      if (success) {
        res.status(200).json({ message: "Emergency services contacted" });
      } else {
        res.status(500).json({ message: "Failed to contact emergency services" });
      }
    } catch (error) {
      console.error("Error calling emergency services:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get emergency message history
  app.get("/api/emergency/messages", authenticateUser, async (req: any, res: any) => {
    try {
      const userId = req.userId;
      
      // Get emergency message history
      const messages = await emergencyService.getEmergencyMessageHistory(userId);
      
      res.status(200).json(messages);
    } catch (error) {
      console.error("Error fetching emergency message history:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Automatic emergency notification
  app.post("/api/emergency/automatic-notification", authenticateUser, async (req: any, res: any) => {
    try {
      const userId = req.userId;
      
      // Trigger automatic emergency notification
      const emergencyMessage = await emergencyService.automaticEmergencyNotification(userId);
      
      res.status(200).json({
        message: "Automatic emergency notification sent",
        emergencyMessage
      });
    } catch (error) {
      console.error("Error sending automatic emergency notification:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Update user location
  app.post("/api/emergency/location", authenticateUser, async (req: any, res: any) => {
    try {
      const userId = req.userId;
      const locationData = req.body;
      
      // Validate required fields
      if (locationData.latitude === undefined || locationData.longitude === undefined) {
        return res.status(400).json({ 
          message: "Latitude and longitude are required" 
        });
      }
      
      // Update user location
      const location = await emergencyService.updateLocation(userId, locationData);
      
      res.status(200).json(location);
    } catch (error) {
      console.error("Error updating location:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get user location
  app.get("/api/emergency/location", authenticateUser, async (req: any, res: any) => {
    try {
      const userId = req.userId;
      
      // Get user location
      const location = await emergencyService.getLocation(userId);
      
      if (!location) {
        return res.status(404).json({ message: "Location not found" });
      }
      
      res.status(200).json(location);
    } catch (error) {
      console.error("Error fetching location:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Create or update medical ID
  app.post("/api/emergency/medical-id", authenticateUser, async (req: any, res: any) => {
    try {
      const userId = req.userId;
      const medicalData = req.body;
      
      // Create or update medical ID
      const medicalId = await emergencyService.upsertMedicalId(userId, medicalData);
      
      res.status(200).json(medicalId);
    } catch (error) {
      console.error("Error creating/updating medical ID:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get medical ID
  app.get("/api/emergency/medical-id", authenticateUser, async (req: any, res: any) => {
    try {
      const userId = req.userId;
      
      // Get medical ID
      const medicalId = await emergencyService.getMedicalId(userId);
      
      if (!medicalId) {
        return res.status(404).json({ message: "Medical ID not found" });
      }
      
      res.status(200).json(medicalId);
    } catch (error) {
      console.error("Error fetching medical ID:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Create or update emergency configuration
  app.post("/api/emergency/configuration", authenticateUser, async (req: any, res: any) => {
    try {
      const userId = req.userId;
      const configData = req.body;
      
      // Create or update emergency configuration
      const config = await emergencyService.upsertEmergencyConfiguration(userId, configData);
      
      res.status(200).json(config);
    } catch (error) {
      console.error("Error creating/updating emergency configuration:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get emergency configuration
  app.get("/api/emergency/configuration", authenticateUser, async (req: any, res: any) => {
    try {
      const userId = req.userId;
      
      // Get emergency configuration
      const config = await emergencyService.getEmergencyConfiguration(userId);
      
      if (!config) {
        return res.status(404).json({ message: "Emergency configuration not found" });
      }
      
      res.status(200).json(config);
    } catch (error) {
      console.error("Error fetching emergency configuration:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Enhanced automatic emergency notification
  app.post("/api/emergency/enhanced-notification", authenticateUser, async (req: any, res: any) => {
    try {
      const userId = req.userId;
      
      // Trigger enhanced automatic emergency notification
      const emergencyMessage = await emergencyService.enhancedAutomaticEmergencyNotification(userId);
      
      res.status(200).json({
        message: "Enhanced automatic emergency notification sent",
        emergencyMessage
      });
    } catch (error) {
      console.error("Error sending enhanced automatic emergency notification:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
}