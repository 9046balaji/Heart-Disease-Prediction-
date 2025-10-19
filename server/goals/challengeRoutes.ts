import { challengeService } from "./challengeService";
import { authenticateUser } from "../auth/authMiddleware";

export function setupChallengeRoutes(app: any) {
  // Get all weekly challenges
  app.get("/api/challenges", authenticateUser, async (req: any, res: any) => {
    try {
      const challenges = await challengeService.getChallenges();
      res.status(200).json(challenges);
    } catch (error) {
      console.error("Error fetching weekly challenges:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Get active weekly challenges
  app.get("/api/challenges/active", authenticateUser, async (req: any, res: any) => {
    try {
      const challenges = await challengeService.getActiveChallenges();
      res.status(200).json(challenges);
    } catch (error) {
      console.error("Error fetching active weekly challenges:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Get a specific weekly challenge
  app.get("/api/challenges/:challengeId", authenticateUser, async (req: any, res: any) => {
    try {
      const { challengeId } = req.params;
      
      const challenge = await challengeService.getChallengeById(challengeId);
      if (!challenge) {
        return res.status(404).json({ message: "Challenge not found" });
      }
      
      res.status(200).json(challenge);
    } catch (error) {
      console.error("Error fetching weekly challenge:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Join a weekly challenge
  app.post("/api/challenges/:challengeId/join", authenticateUser, async (req: any, res: any) => {
    try {
      const userId = req.userId;
      const { challengeId } = req.params;
      
      // Check if challenge exists
      const challenge = await challengeService.getChallengeById(challengeId);
      if (!challenge) {
        return res.status(404).json({ message: "Challenge not found" });
      }
      
      const participation = await challengeService.joinChallenge(userId, challengeId);
      res.status(201).json(participation);
    } catch (error: any) {
      console.error("Error joining weekly challenge:", error);
      if (error.message === "Challenge not found") {
        return res.status(404).json({ message: "Challenge not found" });
      }
      if (error.message === "User is already participating in this challenge") {
        return res.status(409).json({ message: "You are already participating in this challenge" });
      }
      res.status(400).json({ message: error.message || "Error joining weekly challenge" });
    }
  });
  
  // Get user's challenge participations
  app.get("/api/challenges/participations", authenticateUser, async (req: any, res: any) => {
    try {
      const userId = req.userId;
      const participations = await challengeService.getUserParticipations(userId);
      res.status(200).json(participations);
    } catch (error) {
      console.error("Error fetching user challenge participations:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Get user's participation in a specific challenge
  app.get("/api/challenges/:challengeId/participation", authenticateUser, async (req: any, res: any) => {
    try {
      const userId = req.userId;
      const { challengeId } = req.params;
      
      const participation = await challengeService.getUserParticipation(userId, challengeId);
      if (!participation) {
        return res.status(404).json({ message: "Participation not found" });
      }
      
      res.status(200).json(participation);
    } catch (error) {
      console.error("Error fetching user challenge participation:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Update challenge progress
  app.post("/api/challenges/:challengeId/progress", authenticateUser, async (req: any, res: any) => {
    try {
      const userId = req.userId;
      const { challengeId } = req.params;
      const { progress } = req.body;
      
      // Validate progress value
      if (progress === undefined || typeof progress !== 'number') {
        return res.status(400).json({ message: "Progress value is required and must be a number" });
      }
      
      // Check if user is participating in the challenge
      const participation = await challengeService.getUserParticipation(userId, challengeId);
      if (!participation) {
        return res.status(404).json({ message: "You are not participating in this challenge" });
      }
      
      const updatedParticipation = await challengeService.updateParticipationProgress(userId, challengeId, progress);
      res.status(200).json(updatedParticipation);
    } catch (error: any) {
      console.error("Error updating challenge progress:", error);
      if (error.message === "User is not participating in this challenge") {
        return res.status(404).json({ message: "You are not participating in this challenge" });
      }
      res.status(400).json({ message: error.message || "Error updating challenge progress" });
    }
  });
  
  // Complete a challenge
  app.post("/api/challenges/:challengeId/complete", authenticateUser, async (req: any, res: any) => {
    try {
      const userId = req.userId;
      const { challengeId } = req.params;
      
      // Check if user is participating in the challenge
      const participation = await challengeService.getUserParticipation(userId, challengeId);
      if (!participation) {
        return res.status(404).json({ message: "You are not participating in this challenge" });
      }
      
      const completedParticipation = await challengeService.completeChallenge(userId, challengeId);
      res.status(200).json(completedParticipation);
    } catch (error: any) {
      console.error("Error completing challenge:", error);
      if (error.message === "User is not participating in this challenge") {
        return res.status(404).json({ message: "You are not participating in this challenge" });
      }
      if (error.message === "Challenge not found") {
        return res.status(404).json({ message: "Challenge not found" });
      }
      res.status(400).json({ message: error.message || "Error completing challenge" });
    }
  });
}