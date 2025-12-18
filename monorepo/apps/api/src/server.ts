import { json, urlencoded } from "body-parser";
import express, { type Express } from "express";
import morgan from "morgan";
import cors from "cors";
import { log } from "@repo/logger";
import { sseService } from "./sse-service";
import { config } from "./config";
import { appRouter } from "./routes";

export const createServer = (): Express => {
  const app = express();
  const productionConfig = config.getConfig();

  // Configure CORS based on environment
  const corsOptions: cors.CorsOptions = {
    origin: productionConfig.cors.origin,
    credentials: productionConfig.cors.credentials,
  };

  app
    .disable("x-powered-by")
    .use(morgan(config.isProduction() ? "combined" : "dev"))
    .use(urlencoded({ extended: true }))
    .use(json())
    .use(cors(corsOptions))
    .use(appRouter);

  // Initialize SSE service when server is created
  sseService.initialize();

  return app;
};

// Graceful shutdown handler
export const setupGracefulShutdown = (server: { close: (callback: () => void) => void }): void => {
  const shutdown = (signal: string) => {
    log(`Received ${signal}, starting graceful shutdown...`);

    // Stop accepting new connections
    server.close(() => {
      log("HTTP server closed");

      // Shutdown SSE service
      sseService.shutdown();

      log("Graceful shutdown completed");
      process.exit(0);
    });

    // Force shutdown after 10 seconds
    setTimeout(() => {
      log("Forcing shutdown after timeout");
      process.exit(1);
    }, 10000);
  };

  // Handle shutdown signals
  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));

  // Handle uncaught exceptions
  process.on("uncaughtException", (error) => {
    log("Uncaught Exception:", error);
    shutdown("uncaughtException");
  });

  process.on("unhandledRejection", (reason, promise) => {
    log("Unhandled Rejection at:", promise, "reason:", reason);
    shutdown("unhandledRejection");
  });
};