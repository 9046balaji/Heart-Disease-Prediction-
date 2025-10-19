import { storage } from "../storage";

export interface AMAEvent {
  id: string;
  title: string;
  description: string;
  expertName: string;
  expertTitle: string;
  expertBio: string;
  scheduledDate: Date;
  scheduledTime: string; // HH:MM format
  duration: number; // in minutes
  categoryId: string;
  maxParticipants: number;
  registeredParticipants: number;
  status: "scheduled" | "live" | "completed" | "cancelled";
  createdAt: Date;
  updatedAt: Date;
}

export interface AMARegistration {
  id: string;
  amaId: string;
  userId: string;
  registeredAt: Date;
  attended: boolean;
}

export interface InsertAMAEvent {
  title: string;
  description: string;
  expertName: string;
  expertTitle: string;
  expertBio: string;
  scheduledDate: Date;
  scheduledTime: string;
  duration: number;
  categoryId: string;
  maxParticipants: number;
}

export interface InsertAMARegistration {
  amaId: string;
  userId: string;
}

export class AMAService {
  async createAMAEvent(amaData: InsertAMAEvent): Promise<AMAEvent> {
    const now = new Date();
    const amaEvent: AMAEvent = {
      id: Math.random().toString(36).substring(2, 15),
      ...amaData,
      registeredParticipants: 0,
      status: "scheduled",
      createdAt: now,
      updatedAt: now
    };
    
    // In a real implementation, this would be stored in the database
    // For now, we'll just return the object
    return amaEvent;
  }
  
  async getAMAEvents(status?: "scheduled" | "live" | "completed" | "cancelled"): Promise<AMAEvent[]> {
    // In a real implementation, this would fetch from the database
    // For now, we'll return mock data
    const mockEvents: AMAEvent[] = [
      {
        id: "1",
        title: "Heart-Healthy Cooking with Chef Maria",
        description: "Learn how to prepare delicious heart-healthy meals with our guest chef",
        expertName: "Chef Maria Rodriguez",
        expertTitle: "Certified Heart-Healthy Chef",
        expertBio: "Chef Maria has over 15 years of experience creating heart-healthy recipes for patients with cardiovascular conditions.",
        scheduledDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
        scheduledTime: "19:00",
        duration: 60,
        categoryId: "2", // Diet & Nutrition
        maxParticipants: 50,
        registeredParticipants: 24,
        status: "scheduled",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: "2",
        title: "Exercise for Heart Patients with Dr. Smith",
        description: "Safe exercise routines for patients with various heart conditions",
        expertName: "Dr. James Smith",
        expertTitle: "Cardiovascular Specialist",
        expertBio: "Dr. Smith is a board-certified cardiologist with over 20 years of experience treating heart patients.",
        scheduledDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks from now
        scheduledTime: "18:30",
        duration: 45,
        categoryId: "3", // Exercise & Fitness
        maxParticipants: 30,
        registeredParticipants: 12,
        status: "scheduled",
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    if (status) {
      return mockEvents.filter(event => event.status === status);
    }
    
    return mockEvents;
  }
  
  async getAMAEventById(id: string): Promise<AMAEvent | undefined> {
    const events = await this.getAMAEvents();
    return events.find(event => event.id === id);
  }
  
  async registerForAMA(amaId: string, userId: string): Promise<AMARegistration> {
    const amaEvent = await this.getAMAEventById(amaId);
    if (!amaEvent) {
      throw new Error("AMA event not found");
    }
    
    if (amaEvent.registeredParticipants >= amaEvent.maxParticipants) {
      throw new Error("AMA event is full");
    }
    
    const registration: AMARegistration = {
      id: Math.random().toString(36).substring(2, 15),
      amaId,
      userId,
      registeredAt: new Date(),
      attended: false
    };
    
    // In a real implementation, we would update the database
    // For now, we'll just return the registration object
    return registration;
  }
  
  async getRegistrationsForUser(userId: string): Promise<AMARegistration[]> {
    // In a real implementation, this would fetch from the database
    // For now, we'll return mock data
    return [
      {
        id: "1",
        amaId: "1",
        userId,
        registeredAt: new Date(),
        attended: false
      }
    ];
  }
  
  async getRegistrationsForAMA(amaId: string): Promise<AMARegistration[]> {
    // In a real implementation, this would fetch from the database
    // For now, we'll return mock data
    return [
      {
        id: "1",
        amaId,
        userId: "user1",
        registeredAt: new Date(),
        attended: false
      }
    ];
  }
  
  async cancelAMAEvent(amaId: string): Promise<boolean> {
    // In a real implementation, this would update the database
    // For now, we'll just return true
    return true;
  }
  
  async startAMAEvent(amaId: string): Promise<AMAEvent | undefined> {
    // In a real implementation, this would update the database
    // For now, we'll just return the event
    const event = await this.getAMAEventById(amaId);
    if (event) {
      event.status = "live";
      event.updatedAt = new Date();
    }
    return event;
  }
  
  async completeAMAEvent(amaId: string): Promise<AMAEvent | undefined> {
    // In a real implementation, this would update the database
    // For now, we'll just return the event
    const event = await this.getAMAEventById(amaId);
    if (event) {
      event.status = "completed";
      event.updatedAt = new Date();
    }
    return event;
  }
}

export const amaService = new AMAService();