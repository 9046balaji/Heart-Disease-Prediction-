import { storage } from "../storage";
import { TeleConsultBooking, InsertTeleConsultBooking } from "@shared/schema";

export interface TeleConsultServiceInterface {
  createBooking(userId: string, bookingData: Omit<InsertTeleConsultBooking, "userId" | "createdAt" | "updatedAt">): Promise<TeleConsultBooking>;
  getBookings(userId: string): Promise<TeleConsultBooking[]>;
  getBookingById(userId: string, bookingId: string): Promise<TeleConsultBooking | undefined>;
  updateBooking(userId: string, bookingId: string, bookingData: Partial<Omit<InsertTeleConsultBooking, "userId" | "createdAt" | "updatedAt">>): Promise<TeleConsultBooking | undefined>;
  deleteBooking(userId: string, bookingId: string): Promise<boolean>;
  getLocalCardiologists(): Promise<any[]>;
  scheduleVirtualVisit(userId: string, visitData: Omit<InsertTeleConsultBooking, "userId" | "createdAt" | "updatedAt">): Promise<TeleConsultBooking>;
}

export class TeleConsultService implements TeleConsultServiceInterface {
  async createBooking(userId: string, bookingData: Omit<InsertTeleConsultBooking, "userId" | "createdAt" | "updatedAt">): Promise<TeleConsultBooking> {
    const now = new Date();
    // Convert appointmentDate string to Date object
    const appointmentDate = new Date(bookingData.appointmentDate);
    
    const booking: InsertTeleConsultBooking = {
      userId,
      doctorName: bookingData.doctorName,
      doctorSpecialty: bookingData.doctorSpecialty,
      appointmentDate: appointmentDate,
      appointmentTime: bookingData.appointmentTime,
      status: bookingData.status || "scheduled",
      notes: bookingData.notes,
      createdAt: now,
      updatedAt: now
    };
    
    return await storage.createTeleConsultBooking(booking);
  }
  
  async scheduleVirtualVisit(userId: string, visitData: Omit<InsertTeleConsultBooking, "userId" | "createdAt" | "updatedAt">): Promise<TeleConsultBooking> {
    const now = new Date();
    // Convert appointmentDate string to Date object
    const appointmentDate = new Date(visitData.appointmentDate);
    
    const visit: InsertTeleConsultBooking = {
      userId,
      doctorName: visitData.doctorName,
      doctorSpecialty: visitData.doctorSpecialty || "Cardiologist",
      appointmentDate: appointmentDate,
      appointmentTime: visitData.appointmentTime,
      status: "scheduled",
      notes: visitData.notes || "Scheduled virtual visit",
      createdAt: now,
      updatedAt: now
    };
    
    return await storage.createTeleConsultBooking(visit);
  }
  
  async getBookings(userId: string): Promise<TeleConsultBooking[]> {
    return await storage.getTeleConsultBookings(userId);
  }
  
  async getBookingById(userId: string, bookingId: string): Promise<TeleConsultBooking | undefined> {
    return await storage.getTeleConsultBooking(bookingId, userId);
  }
  
  async updateBooking(userId: string, bookingId: string, bookingData: Partial<Omit<InsertTeleConsultBooking, "userId" | "createdAt" | "updatedAt">>): Promise<TeleConsultBooking | undefined> {
    const updateData: any = { ...bookingData, updatedAt: new Date() };
    // Convert appointmentDate string to Date object if provided
    if (bookingData.appointmentDate) {
      updateData.appointmentDate = new Date(bookingData.appointmentDate);
    }
    return await storage.updateTeleConsultBooking(bookingId, userId, updateData);
  }
  
  async deleteBooking(userId: string, bookingId: string): Promise<boolean> {
    return await storage.deleteTeleConsultBooking(bookingId, userId);
  }
  
  async getLocalCardiologists(): Promise<any[]> {
    // In a real implementation, this would fetch from a database or external API
    // For now, we'll return mock data
    return [
      {
        id: "1",
        name: "Dr. Rajesh Sharma",
        specialty: "Cardiologist",
        hospital: "Apollo Hospitals",
        address: "Plot No. 10, Financial District, Hyderabad",
        phone: "+91 40 2360 7777",
        availableDays: ["Monday", "Wednesday", "Friday"],
        rating: 4.8
      },
      {
        id: "2",
        name: "Dr. Priya Patel",
        specialty: "Interventional Cardiologist",
        hospital: "Fortis Hospital",
        address: "Sector 62, Noida",
        phone: "+91 120 475 7777",
        availableDays: ["Tuesday", "Thursday", "Saturday"],
        rating: 4.9
      },
      {
        id: "3",
        name: "Dr. Amit Kumar",
        specialty: "Pediatric Cardiologist",
        hospital: "Medanta - The Medicity",
        address: "Sector 38, Gurgaon",
        phone: "+91 124 414 1414",
        availableDays: ["Monday", "Tuesday", "Thursday"],
        rating: 4.7
      },
      {
        id: "4",
        name: "Dr. Sunita Verma",
        specialty: "Electrophysiologist",
        hospital: "Max Super Speciality Hospital",
        address: "1, 2, Press Enclave Road, Saket",
        phone: "+91 11 2651 5050",
        availableDays: ["Wednesday", "Friday", "Sunday"],
        rating: 4.6
      }
    ];
  }
}

export const teleConsultService = new TeleConsultService();