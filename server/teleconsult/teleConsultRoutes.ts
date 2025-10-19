import { teleConsultService } from "./teleConsultService";
import express from "express";
import { authenticateUser } from "../auth/authMiddleware";

export function setupTeleConsultRoutes(app: any) {
  // Get local cardiologists
  app.get("/api/tele-consult/doctors", authenticateUser, async (req: any, res: any) => {
    try {
      const doctors = await teleConsultService.getLocalCardiologists();
      res.status(200).json(doctors);
    } catch (error) {
      console.error("Error fetching cardiologists:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Create a tele-consult booking
  app.post("/api/tele-consult/bookings", authenticateUser, async (req: any, res: any) => {
    try {
      const userId = req.userId;
      const bookingData = req.body;
      
      // Validate required fields
      if (!bookingData.doctorName || !bookingData.doctorSpecialty || !bookingData.appointmentDate || !bookingData.appointmentTime) {
        return res.status(400).json({ message: "Doctor name, specialty, appointment date, and time are required" });
      }
      
      // Validate date format
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(bookingData.appointmentDate)) {
        return res.status(400).json({ message: "Invalid appointment date format. Expected YYYY-MM-DD" });
      }
      
      // Validate time format
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(bookingData.appointmentTime)) {
        return res.status(400).json({ message: "Invalid appointment time format. Expected HH:MM" });
      }
      
      const booking = await teleConsultService.createBooking(userId, bookingData);
      res.status(201).json(booking);
    } catch (error: any) {
      console.error("Error creating tele-consult booking:", error);
      // Provide more detailed error message
      if (error.message) {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: "Error creating tele-consult booking" });
    }
  });
  
  // Get all tele-consult bookings for a user
  app.get("/api/tele-consult/bookings", authenticateUser, async (req: any, res: any) => {
    try {
      const userId = req.userId;
      const bookings = await teleConsultService.getBookings(userId);
      res.status(200).json(bookings);
    } catch (error) {
      console.error("Error fetching tele-consult bookings:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Get a specific tele-consult booking
  app.get("/api/tele-consult/bookings/:bookingId", authenticateUser, async (req: any, res: any) => {
    try {
      const userId = req.userId;
      const bookingId = req.params.bookingId;
      
      const booking = await teleConsultService.getBookingById(userId, bookingId);
      if (!booking) {
        return res.status(404).json({ message: "Tele-consult booking not found" });
      }
      
      res.status(200).json(booking);
    } catch (error) {
      console.error("Error fetching tele-consult booking:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Update a tele-consult booking
  app.put("/api/tele-consult/bookings/:bookingId", authenticateUser, async (req: any, res: any) => {
    try {
      const userId = req.userId;
      const bookingId = req.params.bookingId;
      const bookingData = req.body;
      
      // Check if booking exists
      const existingBooking = await teleConsultService.getBookingById(userId, bookingId);
      if (!existingBooking) {
        return res.status(404).json({ message: "Tele-consult booking not found" });
      }
      
      // Validate time format if provided
      if (bookingData.appointmentTime) {
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
        if (!timeRegex.test(bookingData.appointmentTime)) {
          return res.status(400).json({ message: "Invalid appointment time format. Expected HH:MM" });
        }
      }
      
      const updatedBooking = await teleConsultService.updateBooking(userId, bookingId, bookingData);
      res.status(200).json(updatedBooking);
    } catch (error: any) {
      console.error("Error updating tele-consult booking:", error);
      // Provide more detailed error message
      if (error.message) {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: "Error updating tele-consult booking" });
    }
  });
  
  // Delete a tele-consult booking
  app.delete("/api/tele-consult/bookings/:bookingId", authenticateUser, async (req: any, res: any) => {
    try {
      const userId = req.userId;
      const bookingId = req.params.bookingId;
      
      // Check if booking exists
      const existingBooking = await teleConsultService.getBookingById(userId, bookingId);
      if (!existingBooking) {
        return res.status(404).json({ message: "Tele-consult booking not found" });
      }
      
      const result = await teleConsultService.deleteBooking(userId, bookingId);
      if (!result) {
        return res.status(404).json({ message: "Tele-consult booking not found" });
      }
      
      res.status(200).json({ message: "Tele-consult booking deleted successfully" });
    } catch (error) {
      console.error("Error deleting tele-consult booking:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Schedule a virtual visit
  app.post("/api/tele-consult/virtual-visit", authenticateUser, async (req: any, res: any) => {
    try {
      const userId = req.userId;
      const visitData = req.body;
      
      // Validate required fields
      if (!visitData.doctorName || !visitData.appointmentDate || !visitData.appointmentTime) {
        return res.status(400).json({ message: "Doctor name, appointment date, and time are required" });
      }
      
      // Validate date format
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(visitData.appointmentDate)) {
        return res.status(400).json({ message: "Invalid appointment date format. Expected YYYY-MM-DD" });
      }
      
      // Validate time format
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(visitData.appointmentTime)) {
        return res.status(400).json({ message: "Invalid appointment time format. Expected HH:MM" });
      }
      
      const visit = await teleConsultService.scheduleVirtualVisit(userId, visitData);
      res.status(201).json(visit);
    } catch (error: any) {
      console.error("Error scheduling virtual visit:", error);
      // Provide more detailed error message
      if (error.message) {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: "Error scheduling virtual visit" });
    }
  });
}