import { createServer } from "../server";
import { Server } from "http";
import { sseService } from "../sse-service";

describe("SSE Endpoint Tests", () => {
  let server: Server;
  let baseUrl: string;

  beforeEach(() => {
    const app = createServer();
    server = app.listen(0); // Use random available port
    const address = server.address();
    const port = address && typeof address === "object" ? address.port : 0;
    baseUrl = `http://localhost:${port}`;
  });

  afterEach(() => {
    if (server) {
      server.close();
    }
    sseService.shutdown();
  });

  it("should establish SSE connection with proper headers", async () => {
    const response = await fetch(`${baseUrl}/stocks/subscribe`, {
      method: "GET",
      headers: {
        "Accept": "text/event-stream",
        "Cache-Control": "no-cache",
      },
    });

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe("text/event-stream");
    expect(response.headers.get("Cache-Control")).toBe("no-cache");
    expect(response.headers.get("Connection")).toContain("keep-alive");
    expect(response.headers.get("Access-Control-Allow-Origin")).toBe("*");

    response.body?.cancel();
  });

  it("should send initial connection message", async () => {
    const response = await fetch(`${baseUrl}/stocks/subscribe`, {
      method: "GET",
      headers: {
        "Accept": "text/event-stream",
      },
    });

    if (!response.body) {
      throw new Error("Response body is null");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    // Read first chunk
    const { value, done } = await reader.read();
    expect(done).toBe(false);

    const chunk = decoder.decode(value);
    expect(chunk).toContain('data: {"type":"connected"}');

    reader.cancel();
  });

  it("should include SSE status in health check endpoint", async () => {
    const response = await fetch(`${baseUrl}/status`);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty("ok", true);
    expect(data).toHaveProperty("sseActive");
    expect(typeof data.sseActive).toBe("boolean");
  });

  it("should handle connection cleanup on disconnect", async () => {
    const response = await fetch(`${baseUrl}/stocks/subscribe`, {
      method: "GET",
      headers: {
        "Accept": "text/event-stream",
      },
    });

    expect(response.status).toBe(200);

    // Cancel the connection to simulate disconnect
    response.body?.cancel();

    // Wait a bit for cleanup
    await new Promise(resolve => setTimeout(resolve, 100));

    // Server should still be running
    const statusResponse = await fetch(`${baseUrl}/status`);
    expect(statusResponse.status).toBe(200);
  });
});