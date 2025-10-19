import fs from "fs";
import path from "path";

// Ensure logs directory exists
const logsDir = path.join(process.cwd(), "logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Log levels
type LogLevel = "error" | "warn" | "info" | "debug";

// Log entry interface
interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  meta?: any;
  stack?: string;
}

class Logger {
  private logToFile: boolean;
  private logFilePath: string;

  constructor(logToFile: boolean = true) {
    this.logToFile = logToFile;
    this.logFilePath = path.join(logsDir, "app.log");
  }

  private formatLogEntry(level: LogLevel, message: string, meta?: any, stack?: string): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...(meta && { meta }),
      ...(stack && { stack })
    };
  }

  private writeLog(entry: LogEntry): void {
    const logMessage = JSON.stringify(entry) + "\n";
    
    // Write to console
    console.log(`[${entry.timestamp}] ${entry.level.toUpperCase()}: ${entry.message}`);
    if (entry.meta) {
      console.log("Meta:", entry.meta);
    }
    if (entry.stack) {
      console.log("Stack:", entry.stack);
    }

    // Write to file if enabled
    if (this.logToFile) {
      fs.appendFileSync(this.logFilePath, logMessage);
    }
  }

  public error(message: string, meta?: any, stack?: string): void {
    const entry = this.formatLogEntry("error", message, meta, stack);
    this.writeLog(entry);
  }

  public warn(message: string, meta?: any): void {
    const entry = this.formatLogEntry("warn", message, meta);
    this.writeLog(entry);
  }

  public info(message: string, meta?: any): void {
    const entry = this.formatLogEntry("info", message, meta);
    this.writeLog(entry);
  }

  public debug(message: string, meta?: any): void {
    // Only log debug messages in development
    if (process.env.NODE_ENV === "development") {
      const entry = this.formatLogEntry("debug", message, meta);
      this.writeLog(entry);
    }
  }

  // API request logging
  public logRequest(method: string, url: string, statusCode: number, duration: number, meta?: any): void {
    const message = `${method} ${url} ${statusCode} in ${duration}ms`;
    const entry = this.formatLogEntry("info", message, meta);
    this.writeLog(entry);
  }

  // API error logging
  public logApiError(method: string, url: string, statusCode: number, error: any): void {
    const message = `${method} ${url} failed with status ${statusCode}`;
    const meta = {
      error: error.message,
      ...(error.details && { details: error.details })
    };
    const stack = error.stack;
    this.error(message, meta, stack);
  }
}

// Export singleton instance
export const logger = new Logger();