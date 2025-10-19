import { createConnection } from 'mysql2/promise';
import { drizzle } from 'drizzle-orm/mysql2';
import * as schema from "@shared/schema";
import dotenv from 'dotenv';

dotenv.config();

// For MySQL in XAMPP, we'll use a local connection
// Default XAMPP MySQL settings: root user with no password on port 3307
const DATABASE_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3307'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'heartguard',
};

let dbInstance: ReturnType<typeof drizzle> | null = null;

export async function initDb() {
  if (!dbInstance) {
    try {
      console.log("Connecting to MySQL database...");
      const connection = await createConnection(DATABASE_CONFIG);
      dbInstance = drizzle(connection, { schema, mode: 'default' });
      console.log("Connected to MySQL database successfully!");
    } catch (error) {
      console.error("Failed to connect to MySQL database:", error);
      throw new Error("Database connection failed. Please ensure XAMPP MySQL is running.");
    }
  }
  return dbInstance;
}

// Initialize the database connection
export const db = initDb();