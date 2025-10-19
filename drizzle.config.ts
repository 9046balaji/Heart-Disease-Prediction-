import { defineConfig } from "drizzle-kit";
import dotenv from "dotenv";

dotenv.config();

// For MySQL in XAMPP, we'll use a local connection
// You'll need to set up your MySQL connection details in .env file
const DATABASE_URL = process.env.DATABASE_URL || "mysql://root:@localhost:3307/heartguard";

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "mysql",
  dbCredentials: {
    url: DATABASE_URL,
  },
});