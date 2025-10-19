// Notification service for the HeartGuard application
// This service handles push notifications for medication reminders and exercise prompts

import { medicationService } from "../medication/medicationService";
import { storage } from "../storage";

// Define notification types
export type NotificationType = 'medication_reminder' | 'exercise_prompt' | 'health_tip' | 'emergency_alert';

// Define notification priority levels
export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

// Define the notification structure
export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  priority: NotificationPriority;
  scheduledTime: Date;
  delivered: boolean;
  deliveredAt?: Date;
  actionUrl?: string; // URL to navigate to when notification is tapped
  data?: any; // Additional data for the notification
}

// Define platform-specific notification options
export interface PlatformNotificationOptions {
  fcmToken?: string; // Firebase Cloud Messaging token for mobile
  apnsToken?: string; // Apple Push Notification Service token for iOS
  webPushSubscription?: any; // Web Push subscription object
}

// Define notification channel
export interface NotificationChannel {
  id: string;
  name: string;
  description: string;
  importance: 'low' | 'default' | 'high';
}

export class NotificationService {
  private notifications: Map<string, Notification>;
  private userNotificationPreferences: Map<string, any>;
  private notificationChannels: NotificationChannel[];

  constructor() {
    this.notifications = new Map();
    this.userNotificationPreferences = new Map();
    this.notificationChannels = [
      {
        id: 'medication_reminders',
        name: 'Medication Reminders',
        description: 'Notifications for medication schedules',
        importance: 'high'
      },
      {
        id: 'exercise_prompts',
        name: 'Exercise Prompts',
        description: 'Notifications to encourage physical activity',
        importance: 'default'
      },
      {
        id: 'health_tips',
        name: 'Health Tips',
        description: 'Daily health and wellness tips',
        importance: 'low'
      },
      {
        id: 'emergency_alerts',
        name: 'Emergency Alerts',
        description: 'Critical health alerts and emergency notifications',
        importance: 'high'
      }
    ];
  }

  // Get notification channels
  public getNotificationChannels(): NotificationChannel[] {
    return this.notificationChannels;
  }

  // Set user notification preferences
  public async setUserNotificationPreferences(userId: string, preferences: any): Promise<void> {
    this.userNotificationPreferences.set(userId, preferences);
  }

  // Get user notification preferences
  public async getUserNotificationPreferences(userId: string): Promise<any> {
    return this.userNotificationPreferences.get(userId) || {
      medicationReminders: true,
      exercisePrompts: true,
      healthTips: true,
      emergencyAlerts: true,
      quietHours: {
        start: '22:00',
        end: '07:00'
      }
    };
  }

  // Check if notification should be sent during quiet hours
  private isDuringQuietHours(scheduledTime: Date, quietHours: { start: string, end: string }): boolean {
    const currentTime = scheduledTime.getHours() * 60 + scheduledTime.getMinutes();
    const [startHours, startMinutes] = quietHours.start.split(':').map(Number);
    const [endHours, endMinutes] = quietHours.end.split(':').map(Number);
    const startTime = startHours * 60 + startMinutes;
    const endTime = endHours * 60 + endMinutes;
    
    // Handle overnight quiet hours (e.g., 22:00 to 07:00)
    if (startTime > endTime) {
      return currentTime >= startTime || currentTime <= endTime;
    }
    
    return currentTime >= startTime && currentTime <= endTime;
  }

  // Create a medication reminder notification
  public async createMedicationReminderNotification(
    userId: string, 
    medicationName: string, 
    dosage: string, 
    time: string,
    scheduledTime: Date
  ): Promise<Notification> {
    const notification: Notification = {
      id: this.generateId(),
      userId,
      type: 'medication_reminder',
      title: 'Medication Reminder',
      message: `It's time to take your ${medicationName} (${dosage})`,
      priority: 'high',
      scheduledTime,
      delivered: false,
      actionUrl: '/medications',
      data: {
        medicationName,
        dosage,
        time
      }
    };
    
    this.notifications.set(notification.id, notification);
    return notification;
  }

  // Create an exercise prompt notification
  public async createExercisePromptNotification(
    userId: string,
    exerciseName: string,
    duration: number,
    scheduledTime: Date
  ): Promise<Notification> {
    const notification: Notification = {
      id: this.generateId(),
      userId,
      type: 'exercise_prompt',
      title: 'Exercise Time!',
      message: `Time for your ${exerciseName} session (${duration} minutes)`,
      priority: 'normal',
      scheduledTime,
      delivered: false,
      actionUrl: '/exercise',
      data: {
        exerciseName,
        duration
      }
    };
    
    this.notifications.set(notification.id, notification);
    return notification;
  }

  // Create a health tip notification
  public async createHealthTipNotification(
    userId: string,
    tipTitle: string,
    tipContent: string,
    scheduledTime: Date
  ): Promise<Notification> {
    const notification: Notification = {
      id: this.generateId(),
      userId,
      type: 'health_tip',
      title: tipTitle,
      message: tipContent,
      priority: 'low',
      scheduledTime,
      delivered: false,
      actionUrl: '/health-tips',
      data: {
        tipTitle,
        tipContent
      }
    };
    
    this.notifications.set(notification.id, notification);
    return notification;
  }

  // Get all pending notifications for a user
  public async getPendingNotifications(userId: string): Promise<Notification[]> {
    const now = new Date();
    const pendingNotifications: Notification[] = [];
    
    const notifications = Array.from(this.notifications.values());
    for (let i = 0; i < notifications.length; i++) {
      const notification = notifications[i];
      if (notification.userId === userId && 
          !notification.delivered && 
          notification.scheduledTime <= now) {
        pendingNotifications.push(notification);
      }
    }
    
    return pendingNotifications;
  }

  // Get upcoming scheduled notifications for a user
  public async getUpcomingNotifications(userId: string, hoursAhead: number = 24): Promise<Notification[]> {
    const now = new Date();
    const future = new Date(now.getTime() + hoursAhead * 60 * 60 * 1000);
    const upcomingNotifications: Notification[] = [];
    
    const notifications = Array.from(this.notifications.values());
    for (let i = 0; i < notifications.length; i++) {
      const notification = notifications[i];
      if (notification.userId === userId && 
          !notification.delivered && 
          notification.scheduledTime >= now && 
          notification.scheduledTime <= future) {
        upcomingNotifications.push(notification);
      }
    }
    
    return upcomingNotifications;
  }

  // Mark notification as delivered
  public async markNotificationAsDelivered(notificationId: string): Promise<boolean> {
    const notification = this.notifications.get(notificationId);
    if (!notification) {
      return false;
    }
    
    notification.delivered = true;
    notification.deliveredAt = new Date();
    this.notifications.set(notificationId, notification);
    return true;
  }

  // Cancel a notification
  public async cancelNotification(notificationId: string): Promise<boolean> {
    const notification = this.notifications.get(notificationId);
    if (!notification) {
      return false;
    }
    
    this.notifications.delete(notificationId);
    return true;
  }

  // Send notification through platform-specific channels
  public async sendNotification(notification: Notification): Promise<boolean> {
    try {
      // Check user preferences
      const preferences = await this.getUserNotificationPreferences(notification.userId);
      
      // Check if notification type is enabled
      switch (notification.type) {
        case 'medication_reminder':
          if (!preferences.medicationReminders) return false;
          break;
        case 'exercise_prompt':
          if (!preferences.exercisePrompts) return false;
          break;
        case 'health_tip':
          if (!preferences.healthTips) return false;
          break;
        case 'emergency_alert':
          if (!preferences.emergencyAlerts) return false;
          break;
      }
      
      // Check quiet hours
      if (preferences.quietHours && 
          this.isDuringQuietHours(notification.scheduledTime, preferences.quietHours) &&
          notification.priority !== 'urgent') {
        console.log(`Notification ${notification.id} suppressed due to quiet hours`);
        return false;
      }
      
      // In a real implementation, this would integrate with platform-specific notification services:
      // - Firebase Cloud Messaging for Android
      // - Apple Push Notification Service for iOS
      // - Web Push API for web browsers
      
      console.log(`Sending ${notification.type} notification to user ${notification.userId}: ${notification.title} - ${notification.message}`);
      
      // Mark as delivered
      await this.markNotificationAsDelivered(notification.id);
      
      return true;
    } catch (error) {
      console.error("Error sending notification:", error);
      return false;
    }
  }

  // Schedule medication reminder notifications
  public async scheduleMedicationReminders(userId: string): Promise<Notification[]> {
    try {
      const medications = await medicationService.getMedications(userId);
      const notifications: Notification[] = [];
      
      for (let i = 0; i < medications.length; i++) {
        const medication = medications[i];
        
        // Parse medication time
        const [hours, minutes] = medication.time.split(':').map(Number);
        const scheduledTime = new Date();
        scheduledTime.setHours(hours, minutes, 0, 0);
        
        // If the time has already passed today, schedule for tomorrow
        const now = new Date();
        if (scheduledTime < now) {
          scheduledTime.setDate(scheduledTime.getDate() + 1);
        }
        
        // Create notification
        const notification = await this.createMedicationReminderNotification(
          userId,
          medication.name,
          medication.dosage,
          medication.time,
          scheduledTime
        );
        
        notifications.push(notification);
      }
      
      return notifications;
    } catch (error) {
      console.error("Error scheduling medication reminders:", error);
      return [];
    }
  }

  // Schedule exercise prompt notifications based on user goals
  public async scheduleExercisePrompts(userId: string): Promise<Notification[]> {
    try {
      // In a real implementation, this would fetch user's exercise plan and goals
      // For now, we'll create sample exercise prompts
      
      const notifications: Notification[] = [];
      const now = new Date();
      
      // Schedule a few exercise prompts for the next few days
      for (let i = 0; i < 3; i++) {
        const scheduledTime = new Date(now);
        scheduledTime.setDate(now.getDate() + i);
        scheduledTime.setHours(10 + i, 0, 0, 0); // 10 AM, 11 AM, 12 PM
        
        const notification = await this.createExercisePromptNotification(
          userId,
          'Walking',
          30,
          scheduledTime
        );
        
        notifications.push(notification);
      }
      
      return notifications;
    } catch (error) {
      console.error("Error scheduling exercise prompts:", error);
      return [];
    }
  }

  // Process pending notifications (to be called periodically)
  public async processPendingNotifications(): Promise<void> {
    try {
      // In a real implementation, this would be called by a background job/scheduler
      // For now, we'll just process all pending notifications
      
      // Get all notifications (in a real app, we'd filter by user or batch process)
      const notifications = Array.from(this.notifications.values());
      
      for (let i = 0; i < notifications.length; i++) {
        const notification = notifications[i];
        if (!notification.delivered && notification.scheduledTime <= new Date()) {
          await this.sendNotification(notification);
        }
      }
    } catch (error) {
      console.error("Error processing pending notifications:", error);
    }
  }

  // Generate a unique ID
  private generateId(): string {
    return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export a singleton instance of the notification service
export const notificationService = new NotificationService();