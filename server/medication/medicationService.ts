import { randomUUID } from "crypto";
import { checkMultipleMedicationInteractions, getClinicianVerificationInteractions } from "./medicationInteractionDb";

// Define the medication structure
export interface Medication {
  id: string;
  userId: string;
  name: string;
  dosage: string;
  frequency: string; // e.g., "daily", "twice daily", "weekly"
  time: string; // Time of day to take medication (HH:MM format)
  startDate: Date;
  endDate?: Date; // Optional end date
  taken: boolean;
  takenHistory: {
    date: Date;
    taken: boolean;
  }[];
  // Enhanced adherence tracking
  adherenceRate?: number; // Percentage of doses taken correctly
  streak?: number; // Consecutive days of perfect adherence
  lastTaken?: Date; // Last time medication was taken
  // Scheduling enhancements
  schedule?: MedicationSchedule[]; // Detailed dosing schedule
}

// Define the medication schedule structure for detailed dosing
export interface MedicationSchedule {
  id: string;
  time: string; // Time of day (HH:MM format)
  dosage: string; // Specific dosage for this time
  daysOfWeek?: string[]; // Days of week when this dose is taken
  notes?: string; // Additional instructions
}

// Define the medication interaction structure
export interface MedicationInteraction {
  id: string;
  medicationA: string;
  medicationB: string;
  severity: "mild" | "moderate" | "severe";
  description: string;
  recommendation: string;
  clinicianVerificationRequired: boolean;
  acknowledged: boolean; // Whether user has acknowledged the interaction
  verifiedByClinician?: boolean; // Whether clinician has verified the interaction
  verificationDate?: Date; // When clinician verified
}

// Define the medication reminder structure
export interface MedicationReminder {
  id: string;
  medicationId: string;
  userId: string;
  time: string; // Time for the reminder (HH:MM format)
  active: boolean;
  lastNotified?: Date;
}

export class MedicationService {
  private medications: Map<string, Medication>;
  private reminders: Map<string, MedicationReminder>;
  private interactions: Map<string, MedicationInteraction[]>;

  constructor() {
    this.medications = new Map();
    this.reminders = new Map();
    this.interactions = new Map();
  }

  // Add a new medication
  public async addMedication(userId: string, medicationData: Omit<Medication, 'id' | 'userId' | 'taken' | 'takenHistory' | 'adherenceRate' | 'streak' | 'lastTaken'>): Promise<Medication> {
    const medication: Medication = {
      id: randomUUID(),
      userId,
      ...medicationData,
      taken: false,
      takenHistory: [],
      adherenceRate: 0,
      streak: 0
    };

    this.medications.set(medication.id, medication);

    // Create a reminder for this medication
    await this.createReminder(medication.id, userId, medicationData.time);

    // Check for interactions with existing medications
    await this.checkInteractionsForUser(userId);

    return medication;
  }

  // Get all medications for a user
  public async getMedications(userId: string): Promise<Medication[]> {
    const userMeds: Medication[] = [];
    const medications = Array.from(this.medications.values());
    for (let i = 0; i < medications.length; i++) {
      const medication = medications[i];
      if (medication.userId === userId) {
        userMeds.push(medication);
      }
    }
    return userMeds;
  }

  // Get a specific medication by ID
  public async getMedication(medicationId: string, userId: string): Promise<Medication | undefined> {
    const medication = this.medications.get(medicationId);
    if (medication && medication.userId === userId) {
      return medication;
    }
    return undefined;
  }

  // Update medication taken status
  public async markMedicationTaken(medicationId: string, userId: string, taken: boolean): Promise<Medication | undefined> {
    const medication = await this.getMedication(medicationId, userId);
    if (!medication) {
      return undefined;
    }

    medication.taken = taken;
    medication.takenHistory.push({
      date: new Date(),
      taken
    });

    // Update adherence tracking
    await this.updateAdherenceTracking(medicationId, userId);

    return medication;
  }

  // Update medication details
  public async updateMedication(medicationId: string, userId: string, updateData: Partial<Omit<Medication, 'id' | 'userId' | 'takenHistory'>>): Promise<Medication | undefined> {
    const medication = await this.getMedication(medicationId, userId);
    if (!medication) {
      return undefined;
    }

    // Update the medication with new data
    Object.assign(medication, updateData);

    // If time was updated, update the reminder
    if (updateData.time) {
      const reminder = await this.getReminderForMedication(medicationId, userId);
      if (reminder) {
        await this.updateReminder(reminder.id, userId, { time: updateData.time });
      }
    }

    return medication;
  }

  // Delete a medication
  public async deleteMedication(medicationId: string, userId: string): Promise<boolean> {
    const medication = await this.getMedication(medicationId, userId);
    if (!medication) {
      return false;
    }

    this.medications.delete(medicationId);

    // Delete associated reminder
    const reminder = await this.getReminderForMedication(medicationId, userId);
    if (reminder) {
      this.reminders.delete(reminder.id);
    }

    return true;
  }

  // Create a medication reminder
  private async createReminder(medicationId: string, userId: string, time: string): Promise<MedicationReminder> {
    const reminder: MedicationReminder = {
      id: randomUUID(),
      medicationId,
      userId,
      time,
      active: true
    };

    this.reminders.set(reminder.id, reminder);
    return reminder;
  }

  // Get reminder for a medication
  private async getReminderForMedication(medicationId: string, userId: string): Promise<MedicationReminder | undefined> {
    const reminders = Array.from(this.reminders.values());
    for (let i = 0; i < reminders.length; i++) {
      const reminder = reminders[i];
      if (reminder.medicationId === medicationId && reminder.userId === userId) {
        return reminder;
      }
    }
    return undefined;
  }

  // Update a reminder
  private async updateReminder(reminderId: string, userId: string, updateData: Partial<Omit<MedicationReminder, 'id' | 'medicationId' | 'userId'>>): Promise<MedicationReminder | undefined> {
    const reminder = this.reminders.get(reminderId);
    if (!reminder || reminder.userId !== userId) {
      return undefined;
    }

    Object.assign(reminder, updateData);
    return reminder;
  }

  // Get all active reminders for a user
  public async getActiveReminders(userId: string): Promise<MedicationReminder[]> {
    const userReminders: MedicationReminder[] = [];
    const reminders = Array.from(this.reminders.values());
    for (let i = 0; i < reminders.length; i++) {
      const reminder = reminders[i];
      if (reminder.userId === userId && reminder.active) {
        userReminders.push(reminder);
      }
    }
    return userReminders;
  }

  // Check for interactions between user's medications
  public async checkInteractionsForUser(userId: string): Promise<MedicationInteraction[]> {
    // Get all medications for the user
    const userMeds = await this.getMedications(userId);
    const medicationNames = userMeds.map(med => med.name);
    
    // Check for interactions
    const interactions = checkMultipleMedicationInteractions(medicationNames);
    
    // Convert to our interaction format
    const formattedInteractions: MedicationInteraction[] = interactions.map(interaction => ({
      id: randomUUID(),
      medicationA: interaction.medicationA,
      medicationB: interaction.medicationB,
      severity: interaction.severity,
      description: interaction.description,
      recommendation: interaction.recommendation,
      clinicianVerificationRequired: interaction.clinicianVerificationRequired,
      acknowledged: false
    }));
    
    // Store interactions for the user
    this.interactions.set(userId, formattedInteractions);
    
    return formattedInteractions;
  }
  
  // Get interactions for a user
  public async getInteractionsForUser(userId: string): Promise<MedicationInteraction[]> {
    return this.interactions.get(userId) || [];
  }
  
  // Acknowledge an interaction
  public async acknowledgeInteraction(userId: string, interactionId: string): Promise<boolean> {
    const userInteractions = this.interactions.get(userId) || [];
    const interactionIndex = userInteractions.findIndex(i => i.id === interactionId);
    
    if (interactionIndex === -1) {
      return false;
    }
    
    userInteractions[interactionIndex].acknowledged = true;
    this.interactions.set(userId, userInteractions);
    return true;
  }
  
  // Verify interaction by clinician
  public async verifyInteractionByClinician(userId: string, interactionId: string, verified: boolean): Promise<boolean> {
    const userInteractions = this.interactions.get(userId) || [];
    const interactionIndex = userInteractions.findIndex(i => i.id === interactionId);
    
    if (interactionIndex === -1) {
      return false;
    }
    
    userInteractions[interactionIndex].verifiedByClinician = verified;
    userInteractions[interactionIndex].verificationDate = new Date();
    this.interactions.set(userId, userInteractions);
    return true;
  }
  
  // Get interactions requiring clinician verification
  public async getClinicianVerificationInteractions(userId: string): Promise<MedicationInteraction[]> {
    const userMeds = await this.getMedications(userId);
    const medicationNames = userMeds.map(med => med.name);
    
    const interactions = getClinicianVerificationInteractions(medicationNames);
    
    // Convert to our interaction format
    const formattedInteractions: MedicationInteraction[] = interactions.map(interaction => ({
      id: randomUUID(),
      medicationA: interaction.medicationA,
      medicationB: interaction.medicationB,
      severity: interaction.severity,
      description: interaction.description,
      recommendation: interaction.recommendation,
      clinicianVerificationRequired: interaction.clinicianVerificationRequired,
      acknowledged: false
    }));
    
    return formattedInteractions;
  }
  
  // Update medication adherence tracking
  public async updateAdherenceTracking(medicationId: string, userId: string): Promise<Medication | undefined> {
    const medication = await this.getMedication(medicationId, userId);
    if (!medication) {
      return undefined;
    }
    
    // Calculate adherence rate
    if (medication.takenHistory.length > 0) {
      const takenCount = medication.takenHistory.filter(entry => entry.taken).length;
      medication.adherenceRate = Math.round((takenCount / medication.takenHistory.length) * 100);
    } else {
      medication.adherenceRate = 0;
    }
    
    // Update streak
    medication.streak = this.calculateStreak(medication.takenHistory);
    
    // Update last taken
    const lastTakenEntry = medication.takenHistory
      .filter(entry => entry.taken)
      .sort((a, b) => b.date.getTime() - a.date.getTime())[0];
    
    if (lastTakenEntry) {
      medication.lastTaken = lastTakenEntry.date;
    }
    
    return medication;
  }
  
  // Calculate medication streak
  private calculateStreak(takenHistory: { date: Date; taken: boolean }[]): number {
    if (takenHistory.length === 0) {
      return 0;
    }
    
    // Sort by date descending
    const sortedHistory = takenHistory
      .slice()
      .sort((a, b) => b.date.getTime() - a.date.getTime());
    
    let streak = 0;
    
    // Count consecutive days of taking medication
    for (const entry of sortedHistory) {
      if (entry.taken) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  }
  
  // Get upcoming reminders (within the next hour)
  public async getUpcomingReminders(userId: string): Promise<MedicationReminder[]> {
    const now = new Date();
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
    
    const upcomingReminders: MedicationReminder[] = [];
    const activeReminders = await this.getActiveReminders(userId);
    
    for (let i = 0; i < activeReminders.length; i++) {
      const reminder = activeReminders[i];
      // Parse reminder time
      const [hours, minutes] = reminder.time.split(':').map(Number);
      const reminderTime = new Date();
      reminderTime.setHours(hours, minutes, 0, 0);
      
      // Check if reminder is within the next hour
      if (reminderTime >= now && reminderTime <= oneHourFromNow) {
        upcomingReminders.push(reminder);
      }
    }
    
    return upcomingReminders;
  }
}

// Export a singleton instance of the medication service
export const medicationService = new MedicationService();