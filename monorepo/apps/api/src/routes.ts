import { Router } from "express";
import { log } from "@repo/logger";
import { sseService } from "./sse-service";
import { config } from "./config";

export const appRouter = Router();
const productionConfig = config.getConfig();

appRouter.get("/message/:name", (req, res) => {
  return res.json({ message: `hello ${req.params.name}` });
});

appRouter.get("/status", (_, res) => {
  return res.json({
    ok: true,
    sseActive: sseService.isActive(),
    connectionCount: sseService.getConnectionCount(),
    environment: process.env.NODE_ENV || "development",
  });
});

appRouter.get("/stocks/subscribe", (req, res) => {
  log("SSE connection request received");

  // Check connection limit
  if (sseService.getConnectionCount() >= productionConfig.sse.maxConnections) {
    log("Maximum connection limit reached");
    res.writeHead(503, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ error: "Server overloaded - too many connections" }));
  }

  sseService.handleConnection(req, res);
});
