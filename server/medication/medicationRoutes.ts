import { storage } from "../storage";
import { medicationService } from "./medicationService";
import { authenticateUser } from "../auth/authMiddleware";

// Medication routes
export function setupMedicationRoutes(app: any) {
  // Get all medications for a user
  app.get("/api/medications", authenticateUser, async (req: any, res: any) => {
    try {
      const userId = req.userId;
      const medications = await storage.getMedications(userId);
      res.status(200).json(medications);
    } catch (error) {
      console.error("Error fetching medications:", error);
      res.status(500).json({ message: "Error fetching medications" });
    }
  });

  // Add a new medication
  app.post("/api/medications", authenticateUser, async (req: any, res: any) => {
    try {
      const userId = req.userId;
      const medicationData = req.body;
      
      // Validate required fields
      if (!medicationData.name || !medicationData.dosage || !medicationData.time) {
        return res.status(400).json({ message: "Name, dosage, and time are required" });
      }
      
      const medication = await storage.createMedication({
        userId,
        name: medicationData.name,
        dosage: medicationData.dosage,
        frequency: medicationData.frequency,
        time: medicationData.time,
        startDate: new Date(medicationData.startDate),
        endDate: medicationData.endDate ? new Date(medicationData.endDate) : undefined,
        taken: false,
        takenHistory: []
      });
      
      res.status(201).json(medication);
    } catch (error) {
      console.error("Error adding medication:", error);
      res.status(500).json({ message: "Error adding medication" });
    }
  });

  // Get a specific medication
  app.get("/api/medications/:id", authenticateUser, async (req: any, res: any) => {
    try {
      const userId = req.userId;
      const medicationId = req.params.id;
      
      const medication = await storage.getMedication(medicationId, userId);
      if (!medication) {
        return res.status(404).json({ message: "Medication not found" });
      }
      
      res.status(200).json(medication);
    } catch (error) {
      console.error("Error fetching medication:", error);
      res.status(500).json({ message: "Error fetching medication" });
    }
  });

  // Update a medication
  app.put("/api/medications/:id", authenticateUser, async (req: any, res: any) => {
    try {
      const userId = req.userId;
      const medicationId = req.params.id;
      const updateData = req.body;
      
      const medication = await storage.updateMedication(medicationId, userId, updateData);
      if (!medication) {
        return res.status(404).json({ message: "Medication not found" });
      }
      
      res.status(200).json(medication);
    } catch (error) {
      console.error("Error updating medication:", error);
      res.status(500).json({ message: "Error updating medication" });
    }
  });

  // Mark medication as taken
  app.post("/api/medications/:id/taken", authenticateUser, async (req: any, res: any) => {
    try {
      const userId = req.userId;
      const medicationId = req.params.id;
      const { taken } = req.body;
      
      const medication = await storage.markMedicationTaken(medicationId, userId, taken);
      if (!medication) {
        return res.status(404).json({ message: "Medication not found" });
      }
      
      res.status(200).json(medication);
    } catch (error) {
      console.error("Error marking medication as taken:", error);
      res.status(500).json({ message: "Error marking medication as taken" });
    }
  });

  // Delete a medication
  app.delete("/api/medications/:id", authenticateUser, async (req: any, res: any) => {
    try {
      const userId = req.userId;
      const medicationId = req.params.id;
      
      const result = await storage.deleteMedication(medicationId, userId);
      if (!result) {
        return res.status(404).json({ message: "Medication not found" });
      }
      
      res.status(200).json({ message: "Medication deleted successfully" });
    } catch (error) {
      console.error("Error deleting medication:", error);
      res.status(500).json({ message: "Error deleting medication" });
    }
  });

  // Get upcoming reminders
  app.get("/api/reminders/upcoming", authenticateUser, async (req: any, res: any) => {
    try {
      const userId = req.userId;
      const medications = await storage.getMedications(userId);
      
      // Filter medications with upcoming reminders (within the next hour)
      const now = new Date();
      const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
      
      const upcomingReminders = medications.filter(medication => {
        // Parse medication time
        const [hours, minutes] = medication.time.split(':').map(Number);
        const reminderTime = new Date();
        reminderTime.setHours(hours, minutes, 0, 0);
        
        // Check if reminder is within the next hour
        return reminderTime >= now && reminderTime <= oneHourFromNow;
      });
      
      res.status(200).json(upcomingReminders);
    } catch (error) {
      console.error("Error fetching reminders:", error);
      res.status(500).json({ message: "Error fetching reminders" });
    }
  });
  
  // Check for medication interactions
  app.get("/api/medications/interactions", authenticateUser, async (req: any, res: any) => {
    try {
      const userId = req.userId;
      const interactions = await medicationService.checkInteractionsForUser(userId);
      res.status(200).json(interactions);
    } catch (error) {
      console.error("Error checking interactions:", error);
      res.status(500).json({ message: "Error checking interactions" });
    }
  });
  
  // Get interactions requiring clinician verification
  app.get("/api/medications/interactions/verification", authenticateUser, async (req: any, res: any) => {
    try {
      const userId = req.userId;
      const interactions = await medicationService.getClinicianVerificationInteractions(userId);
      res.status(200).json(interactions);
    } catch (error) {
      console.error("Error fetching verification interactions:", error);
      res.status(500).json({ message: "Error fetching verification interactions" });
    }
  });
  
  // Acknowledge an interaction
  app.post("/api/medications/interactions/:id/acknowledge", authenticateUser, async (req: any, res: any) => {
    try {
      const userId = req.userId;
      const interactionId = req.params.id;
      const result = await medicationService.acknowledgeInteraction(userId, interactionId);
      
      if (!result) {
        return res.status(404).json({ message: "Interaction not found" });
      }
      
      res.status(200).json({ message: "Interaction acknowledged" });
    } catch (error) {
      console.error("Error acknowledging interaction:", error);
      res.status(500).json({ message: "Error acknowledging interaction" });
    }
  });
  
  // Verify interaction by clinician
  app.post("/api/medications/interactions/:id/verify", authenticateUser, async (req: any, res: any) => {
    try {
      const userId = req.userId;
      const interactionId = req.params.id;
      const { verified } = req.body;
      
      const result = await medicationService.verifyInteractionByClinician(userId, interactionId, verified);
      
      if (!result) {
        return res.status(404).json({ message: "Interaction not found" });
      }
      
      res.status(200).json({ message: "Interaction verified" });
    } catch (error) {
      console.error("Error verifying interaction:", error);
      res.status(500).json({ message: "Error verifying interaction" });
    }
  });
  
  // Get medication adherence data
  app.get("/api/medications/:id/adherence", authenticateUser, async (req: any, res: any) => {
    try {
      const userId = req.userId;
      const medicationId = req.params.id;
      
      const medication = await medicationService.getMedication(medicationId, userId);
      if (!medication) {
        return res.status(404).json({ message: "Medication not found" });
      }
      
      res.status(200).json({
        adherenceRate: medication.adherenceRate,
        streak: medication.streak,
        lastTaken: medication.lastTaken,
        takenHistory: medication.takenHistory
      });
    } catch (error) {
      console.error("Error fetching adherence data:", error);
      res.status(500).json({ message: "Error fetching adherence data" });
    }
  });
}