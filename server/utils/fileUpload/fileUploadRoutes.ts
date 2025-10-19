import { fileUploadService, FileMetadata } from "./fileUploadService";
import { authenticateUser } from "../../auth/authMiddleware";
import express from "express";
import multer from "multer";
import { randomUUID } from "crypto";
import fs from "fs/promises";

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    // Accept images and PDFs only
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images and PDFs are allowed.'));
    }
  }
});

// File upload routes
export function setupFileUploadRoutes(app: express.Application) {
  // Upload a file
  app.post("/api/files/upload", authenticateUser, upload.single('file'), async (req: any, res: any) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const userId = req.userId;
      const { originalname, buffer, mimetype } = req.file as Express.Multer.File;

      // Upload file using the service
      const fileMetadata = await fileUploadService.uploadFile(buffer, originalname, mimetype, userId);

      res.status(201).json({
        message: "File uploaded successfully",
        file: {
          id: fileMetadata.id,
          name: fileMetadata.originalName,
          type: fileMetadata.fileType,
          url: fileUploadService.getFileUrl(fileMetadata.fileName),
          size: fileMetadata.size
        }
      });
    } catch (error: any) {
      console.error("Error uploading file:", error);
      res.status(500).json({ message: error.message || "Error uploading file" });
    }
  });

  // Serve uploaded files
  app.get("/api/files/:fileName", authenticateUser, async (req: any, res: any) => {
    try {
      const { fileName } = req.params;
      
      // In a real implementation, we would verify the user has access to this file
      // For now, we'll just serve the file
      
      const filePath = fileUploadService.getFilePath(fileName);
      
      // Check if file exists
      try {
        await fs.access(filePath);
      } catch {
        return res.status(404).json({ message: "File not found" });
      }
      
      // Set appropriate content type
      const fileExtension = fileName.split('.').pop()?.toLowerCase();
      let contentType = 'application/octet-stream';
      
      if (fileExtension === 'png') {
        contentType = 'image/png';
      } else if (fileExtension === 'jpg' || fileExtension === 'jpeg') {
        contentType = 'image/jpeg';
      } else if (fileExtension === 'pdf') {
        contentType = 'application/pdf';
      }
      
      res.setHeader('Content-Type', contentType);
      res.sendFile(filePath);
    } catch (error) {
      console.error("Error serving file:", error);
      res.status(500).json({ message: "Error serving file" });
    }
  });
}