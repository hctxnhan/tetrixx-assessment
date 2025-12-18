import { IncomingMessage, ServerResponse } from "http";
import { log } from "@repo/logger";
import { StockData, stockDataGenerator } from "./stock-data-generator";

export class SSEService {
  private static instance: SSEService;
  private connections: Set<ServerResponse> = new Set();
  private isInitialized: boolean = false;

  private constructor() {}

  public static getInstance(): SSEService {
    if (!SSEService.instance) {
      SSEService.instance = new SSEService();
    }
    return SSEService.instance;
  }

  public initialize(): void {
    if (this.isInitialized) {
      log("SSE Service is already initialized");
      return;
    }

    this.isInitialized = true;
    log("Initializing SSE Service");

    // Start the stock data generator
    stockDataGenerator.start();
  }

  public handleConnection(_req: IncomingMessage, res: ServerResponse): void {
    try {
      // Set SSE headers
      res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "Access-Control-Allow-Origin": "*",
      });

      // Send initial connection event
      res.write("data: {\"type\":\"connected\"}\n\n");

      // Add connection to tracking set
      this.connections.add(res);

      // Subscribe to stock data updates
      const unsubscribe = stockDataGenerator.subscribe((data: StockData) => {
        try {
          const message = `data: ${JSON.stringify(data)}\n\n`;
          res.write(message);
        } catch (error) {
          log("Error writing to SSE connection:", error);
          this.removeConnection(res);
        }
      });

      // Handle client disconnect
      res.on("close", () => {
        log("Client disconnected from SSE");
        this.removeConnection(res);
        unsubscribe();
      });

      // Handle connection errors
      res.on("error", (error) => {
        log("SSE connection error:", error);
        this.removeConnection(res);
        unsubscribe();
      });

      log("New SSE connection established");
    } catch (error) {
      log("Error establishing SSE connection:", error);
      res.writeHead(500);
      res.end("Internal Server Error");
    }
  }

  private removeConnection(res: ServerResponse): void {
    try {
      if (this.connections.has(res)) {
        this.connections.delete(res);

        // Try to end the response if not already ended
        if (!res.destroyed) {
          res.end();
        }
      }
    } catch (error) {
      log("Error removing SSE connection:", error);
    }
  }

  public getConnectionCount(): number {
    return this.connections.size;
  }

  public isActive(): boolean {
    return this.isInitialized && stockDataGenerator.isActive();
  }

  public shutdown(): void {
    log("Shutting down SSE Service");

    // Close all connections
    for (const connection of this.connections) {
      try {
        if (!connection.destroyed) {
          connection.end();
        }
      } catch (error) {
        log("Error closing connection during shutdown:", error);
      }
    }

    this.connections.clear();

    // Stop the stock data generator
    stockDataGenerator.stop();

    this.isInitialized = false;
  }
}

export const sseService = SSEService.getInstance();