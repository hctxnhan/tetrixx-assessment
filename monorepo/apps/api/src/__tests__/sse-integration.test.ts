import { describe, it, expect, beforeAll, afterAll } from "@jest/globals";
import { createServer } from "../server";
import { sseService } from "../sse-service";
import { Server } from "http";

// Polyfill EventSource for Node.js testing environment
// eslint-disable-next-line @typescript-eslint/no-require-imports
const EventSourceLib = require("eventsource");

interface MockEventSource {
  new (url: string): {
    onmessage: ((event: { data: string }) => void) | null;
    onerror: ((event: Error) => void) | null;
    close: () => void;
  };
}

const EventSource = (EventSourceLib.EventSource || EventSourceLib) as unknown as MockEventSource["prototype"]["constructor"];

describe("SSE Integration Tests", () => {
  let serverUrl: string;
  let server: Server;

  beforeAll(async () => {
    // Create a test server
    const app = createServer();

    // Listen on an available port
    await new Promise<void>((resolve) => {
      server = app.listen(0, () => {
        const port = (server.address() as { port: number })?.port;
        serverUrl = `http://localhost:${port}`;
        resolve();
      });
    });
  });

  afterAll(async () => {
    // Clean up SSE service
    sseService.shutdown();
    // Close the server
    if (server) {
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
  });

  describe("Multiple concurrent connections", () => {
    it("should handle 10 concurrent connections receiving identical data", async () => {
      const connectionCount = 10;
      const connections: InstanceType<MockEventSource>[] = [];
      const receivedData: Map<number, { symbol: string; price: number; timestamp: string }[]> = new Map();

      // Create multiple connections
      for (let i = 0; i < connectionCount; i++) {
        const eventSource = new EventSource(`${serverUrl}/stocks/subscribe`);
        connections.push(eventSource);
        receivedData.set(i, []);

        eventSource.onmessage = (event: { data: string }) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type !== 'connected') {
              receivedData.get(i)?.push(data);
            }
          } catch {
            // Ignore parsing errors for connection events
          }
        };

        eventSource.onerror = (error: Error) => {
          // Log errors but don't fail the test
          console.error(`EventSource error for connection ${i}:`, error);
        };
      }

      // Wait for data to be received
      await new Promise(resolve => setTimeout(resolve, 200));

      // Verify all connections received data
      for (let i = 0; i < connectionCount; i++) {
        const data = receivedData.get(i) || [];
        expect(data.length).toBeGreaterThan(0);
        expect(data[0]).toHaveProperty('symbol', 'USD');
        expect(data[0]).toHaveProperty('price');
        expect(data[0]).toHaveProperty('timestamp');
      }

      // Verify data consistency across connections (within a small time window)
      if (receivedData.get(0) && receivedData.get(1)) {
        const firstConnData = receivedData.get(0)![0];
        const secondConnData = receivedData.get(1)![0];

        // Prices should be very close (identical for the same time window)
        expect(Math.abs(firstConnData.price - secondConnData.price)).toBeLessThan(0.01);
      }

      // Close all connections
      connections.forEach(conn => conn.close());
    }, 10000);

    it("should handle connection cleanup properly", async () => {
      const eventSource = new EventSource(`${serverUrl}/stocks/subscribe`);

      let messageReceived = false;
      eventSource.onmessage = () => {
        messageReceived = true;
      };

      // Wait for initial connection
      await new Promise(resolve => setTimeout(resolve, 100));
      expect(messageReceived).toBe(true);

      // Close connection
      eventSource.close();

      // Wait a bit to ensure cleanup
      await new Promise(resolve => setTimeout(resolve, 50));

      // Create a new connection to verify cleanup worked
      const newEventSource = new EventSource(`${serverUrl}/stocks/subscribe`);
      let newMessageReceived = false;

      newEventSource.onmessage = () => {
        newMessageReceived = true;
      };

      await new Promise(resolve => setTimeout(resolve, 100));
      expect(newMessageReceived).toBe(true);

      newEventSource.close();
    });
  });

  describe("SSE data stream consumption", () => {
    it("should receive properly formatted SSE messages", async () => {
      const eventSource = new EventSource(`${serverUrl}/stocks/subscribe`);
      const messages: string[] = [];

      eventSource.onmessage = (event: { data: string }) => {
        messages.push(event.data);
      };

      // Wait for multiple messages
      await new Promise(resolve => setTimeout(resolve, 200));

      expect(messages.length).toBeGreaterThan(0);

      // Check connection message
      expect(messages[0]).toBe('{"type":"connected"}');

      // Check stock data messages
      const stockMessages = messages.slice(1);
      if (stockMessages.length > 0) {
        const stockData = JSON.parse(stockMessages[0]);
        expect(stockData).toHaveProperty('symbol', 'USD');
        expect(stockData).toHaveProperty('price');
        expect(stockData).toHaveProperty('timestamp');

        // Verify price format
        expect(typeof stockData.price).toBe('number');
        expect(stockData.price).toBe(Math.round(stockData.price * 100) / 100);

        // Verify timestamp format (ISO 8601)
        expect(new Date(stockData.timestamp).toISOString()).toBe(stockData.timestamp);
      }

      eventSource.close();
    });

    it("should maintain approximately 50ms emission interval", async () => {
      const eventSource = new EventSource(`${serverUrl}/stocks/subscribe`);
      const timestamps: number[] = [];

      eventSource.onmessage = (event: { data: string }) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type !== 'connected') {
            timestamps.push(Date.now());
          }
        } catch {
          // Ignore parsing errors
        }
      };

      // Wait for several emissions
      await new Promise(resolve => setTimeout(resolve, 300));

      eventSource.close();

      // Calculate intervals between consecutive messages
      if (timestamps.length >= 3) {
        const intervals: number[] = [];
        for (let i = 1; i < timestamps.length; i++) {
          intervals.push(timestamps[i] - timestamps[i - 1]);
        }

        // Average interval should be close to 50ms (allowing for some variance)
        const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
        expect(avgInterval).toBeGreaterThan(30); // Lower bound
        expect(avgInterval).toBeLessThan(100); // Upper bound
      }
    });
  });

  describe("Error scenarios", () => {
    it("should handle client disconnect gracefully", async () => {
      const eventSource1 = new EventSource(`${serverUrl}/stocks/subscribe`);
      const eventSource2 = new EventSource(`${serverUrl}/stocks/subscribe`);

      let messages1 = 0;
      let messages2 = 0;

      eventSource1.onmessage = () => {
        messages1++;
      };
      eventSource2.onmessage = () => {
        messages2++;
      };

      // Wait for initial messages
      await new Promise(resolve => setTimeout(resolve, 100));

      // Close first connection abruptly
      eventSource1.close();

      // Wait and ensure second connection still works
      const initialMessages2 = messages2;
      await new Promise(resolve => setTimeout(resolve, 150));

      expect(messages2).toBeGreaterThan(initialMessages2);
      expect(messages1).toBeGreaterThan(0);

      eventSource2.close();
    });

    it("should handle malformed requests gracefully", async () => {
      // Test with invalid endpoint
      const response = await fetch(`${serverUrl}/stocks/invalid`, {
        method: 'GET',
      });

      expect(response.status).toBe(404);
    });

    it("should handle server error recovery", async () => {
      // Create a connection
      const eventSource = new EventSource(`${serverUrl}/stocks/subscribe`);
      let messageCount = 0;

      eventSource.onmessage = () => {
        messageCount++;
      };

      eventSource.onerror = (error: Error) => {
        console.error('Expected error during stress test:', error);
      };

      // Wait for some messages
      await new Promise(resolve => setTimeout(resolve, 100));
      expect(messageCount).toBeGreaterThan(0);

      // Close and reconnect to test recovery
      eventSource.close();

      // Brief pause
      await new Promise(resolve => setTimeout(resolve, 50));

      // Create new connection
      const newEventSource = new EventSource(`${serverUrl}/stocks/subscribe`);
      let newMessageCount = 0;

      newEventSource.onmessage = () => {
        newMessageCount++;
      };

      await new Promise(resolve => setTimeout(resolve, 100));
      expect(newMessageCount).toBeGreaterThan(0);

      newEventSource.close();
    });
  });

  describe("Performance verification", () => {
    it("should handle memory efficiently with multiple connections", async () => {
      const connectionCount = 5;
      const connections: InstanceType<MockEventSource>[] = [];

      // Get initial memory usage
      const initialMemory = process.memoryUsage().heapUsed;

      // Create multiple connections
      for (let i = 0; i < connectionCount; i++) {
        const eventSource = new EventSource(`${serverUrl}/stocks/subscribe`);
        connections.push(eventSource);

        // Each connection should receive messages
        eventSource.onmessage = (event: { data: string }) => {
          // Simulate minimal processing
          try {
            JSON.parse(event.data);
          } catch {
            // Ignore
          }
        };
      }

      // Wait for messages to be processed
      await new Promise(resolve => setTimeout(resolve, 200));

      // Check memory usage (allowing for reasonable growth)
      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;

      // Memory increase should be reasonable (less than 10MB for this test)
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);

      // Close all connections
      connections.forEach(conn => conn.close());
    }, 8000);
  });
});