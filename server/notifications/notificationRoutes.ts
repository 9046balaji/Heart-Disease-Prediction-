import express from 'express';
import { authenticateUser } from '../auth/authMiddleware';
import { notificationService } from './notificationService';

// Notification routes
export function setupNotificationRoutes(app: any) {
  // Set user notification preferences
  app.post("/api/notifications/preferences", authenticateUser, async (req: any, res: any) => {
    try {
      const userId = req.userId;
      const preferences = req.body;
      
      await notificationService.setUserNotificationPreferences(userId, preferences);
      
      res.status(200).json({ message: "Notification preferences updated successfully" });
    } catch (error) {
      console.error("Error updating notification preferences:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get user notification preferences
  app.get("/api/notifications/preferences", authenticateUser, async (req: any, res: any) => {
    try {
      const userId = req.userId;
      
      const preferences = await notificationService.getUserNotificationPreferences(userId);
      
      res.status(200).json(preferences);
    } catch (error) {
      console.error("Error fetching notification preferences:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get pending notifications
  app.get("/api/notifications/pending", authenticateUser, async (req: any, res: any) => {
    try {
      const userId = req.userId;
      
      const notifications = await notificationService.getPendingNotifications(userId);
      
      res.status(200).json(notifications);
    } catch (error) {
      console.error("Error fetching pending notifications:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get upcoming notifications
  app.get("/api/notifications/upcoming", authenticateUser, async (req: any, res: any) => {
    try {
      const userId = req.userId;
      const hours = req.query.hours ? parseInt(req.query.hours as string) : 24;
      
      const notifications = await notificationService.getUpcomingNotifications(userId, hours);
      
      res.status(200).json(notifications);
    } catch (error) {
      console.error("Error fetching upcoming notifications:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Mark notification as delivered
  app.post("/api/notifications/:id/delivered", authenticateUser, async (req: any, res: any) => {
    try {
      const notificationId = req.params.id;
      
      const success = await notificationService.markNotificationAsDelivered(notificationId);
      
      if (success) {
        res.status(200).json({ message: "Notification marked as delivered" });
      } else {
        res.status(404).json({ message: "Notification not found" });
      }
    } catch (error) {
      console.error("Error marking notification as delivered:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Cancel a notification
  app.delete("/api/notifications/:id", authenticateUser, async (req: any, res: any) => {
    try {
      const notificationId = req.params.id;
      
      const success = await notificationService.cancelNotification(notificationId);
      
      if (success) {
        res.status(200).json({ message: "Notification cancelled successfully" });
      } else {
        res.status(404).json({ message: "Notification not found" });
      }
    } catch (error) {
      console.error("Error cancelling notification:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Schedule medication reminders
  app.post("/api/notifications/schedule/medication", authenticateUser, async (req: any, res: any) => {
    try {
      const userId = req.userId;
      
      const notifications = await notificationService.scheduleMedicationReminders(userId);
      
      res.status(200).json({
        message: `Scheduled ${notifications.length} medication reminders`,
        notifications
      });
    } catch (error) {
      console.error("Error scheduling medication reminders:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Schedule exercise prompts
  app.post("/api/notifications/schedule/exercise", authenticateUser, async (req: any, res: any) => {
    try {
      const userId = req.userId;
      
      const notifications = await notificationService.scheduleExercisePrompts(userId);
      
      res.status(200).json({
        message: `Scheduled ${notifications.length} exercise prompts`,
        notifications
      });
    } catch (error) {
      console.error("Error scheduling exercise prompts:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get notification channels
  app.get("/api/notifications/channels", authenticateUser, async (req: any, res: any) => {
    try {
      const channels = notificationService.getNotificationChannels();
      
      res.status(200).json(channels);
    } catch (error) {
      console.error("Error fetching notification channels:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
}