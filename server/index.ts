import express, { type Request, Response, NextFunction } from "express";
import { createServer } from "http";
import { setupRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { Server } from "http";
import { errorHandler } from "./utils/errors";
import { logger } from "./utils/logger";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
      
      // Log with enhanced logger
      logger.logRequest(req.method, path, res.statusCode, duration, capturedJsonResponse);
    }
  });

  next();
});

(async () => {
  setupRoutes(app);
  
  // Create HTTP server from Express app
  const server = createServer(app);

  // Use our enhanced error handling middleware
  app.use(errorHandler);

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5001 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5001', 10);
  
  // Handle server errors gracefully
  server.on('error', (err: Error) => {
    if (err.message.includes('EADDRINUSE')) {
      console.log(`Port ${port} is already in use. Trying port ${port + 1}...`);
      // Try the next port
      server.listen({
        port: port + 1,
        host: "127.0.0.1",
      }, () => {
        log(`serving on port ${port + 1}`);
        logger.info(`Server started on port ${port + 1}`);
      });
    } else if (err.message.includes('ENOTSUP')) {
      // Fallback to a simpler listen method for Windows compatibility
      server.listen(port, '127.0.0.1', () => {
        log(`serving on port ${port}`);
      });
    } else {
      console.error('Server error:', err);
      logger.error('Server error', { error: err.message }, err.stack);
    }
  });
  
  // Try to listen with the preferred configuration
  server.listen({
    port,
    host: "127.0.0.1", // Use IPv4 localhost
  }, () => {
    log(`serving on port ${port}`);
    logger.info(`Server started on port ${port}`);
  });
})();