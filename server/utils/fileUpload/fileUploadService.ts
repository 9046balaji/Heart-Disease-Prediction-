import { randomUUID } from "crypto";
import fs from "fs/promises";
import path from "path";

// Define file types
export type FileType = 'image' | 'document';

// Define file metadata
export interface FileMetadata {
  id: string;
  originalName: string;
  fileName: string;
  fileType: FileType;
  mimeType: string;
  size: number;
  uploadDate: Date;
  userId: string;
}

// File upload service
export class FileUploadService {
  private uploadDir: string;

  constructor() {
    this.uploadDir = path.join(process.cwd(), 'uploads');
    this.ensureUploadDirectory();
  }

  // Ensure upload directory exists
  private async ensureUploadDirectory() {
    try {
      await fs.access(this.uploadDir);
    } catch {
      await fs.mkdir(this.uploadDir, { recursive: true });
    }
  }

  // Upload a file
  async uploadFile(fileBuffer: Buffer, originalName: string, mimeType: string, userId: string): Promise<FileMetadata> {
    // Determine file type based on MIME type
    let fileType: FileType = 'document';
    if (mimeType.startsWith('image/')) {
      fileType = 'image';
    }

    // Generate unique file name
    const fileExtension = path.extname(originalName);
    const fileName = `${randomUUID()}${fileExtension}`;
    const filePath = path.join(this.uploadDir, fileName);

    // Save file to disk
    await fs.writeFile(filePath, fileBuffer);

    // Get file stats
    const stats = await fs.stat(filePath);

    // Create file metadata
    const fileMetadata: FileMetadata = {
      id: randomUUID(),
      originalName,
      fileName,
      fileType,
      mimeType,
      size: stats.size,
      uploadDate: new Date(),
      userId
    };

    return fileMetadata;
  }

  // Get file path by file name
  getFilePath(fileName: string): string {
    return path.join(this.uploadDir, fileName);
  }

  // Get file URL (in a real app, this would be a public URL)
  getFileUrl(fileName: string): string {
    return `/api/files/${fileName}`;
  }

  // Delete a file
  async deleteFile(fileName: string): Promise<void> {
    const filePath = path.join(this.uploadDir, fileName);
    try {
      await fs.unlink(filePath);
    } catch (error) {
      console.error(`Error deleting file ${fileName}:`, error);
      throw error;
    }
  }
}

// Export singleton instance
export const fileUploadService = new FileUploadService();