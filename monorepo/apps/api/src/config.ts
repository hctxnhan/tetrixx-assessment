import { log } from "@repo/logger";

export interface ProductionConfig {
  cors: {
    origin: string | string[];
    credentials: boolean;
  };
  logging: {
    level: "error" | "warn" | "info" | "debug";
  };
  sse: {
    keepAlive: boolean;
    maxConnections: number;
  };
}

export class Config {
  private static instance: Config;
  private config: ProductionConfig;

  private constructor() {
    this.config = this.loadConfig();
  }

  public static getInstance(): Config {
    if (!Config.instance) {
      Config.instance = new Config();
    }
    return Config.instance;
  }

  private loadConfig(): ProductionConfig {
    const nodeEnv = process.env.NODE_ENV || "development";

    log(`Loading configuration for environment: ${nodeEnv}`);

    const defaultConfig: ProductionConfig = {
      cors: {
        origin: "*", // Allow all origins in development
        credentials: false,
      },
      logging: {
        level: nodeEnv === "production" ? "warn" : "debug",
      },
      sse: {
        keepAlive: true,
        maxConnections: 1000, // Reasonable limit for production
      },
    };

    // Override with environment variables if provided
    const config: ProductionConfig = {
      ...defaultConfig,
      cors: {
        origin: process.env.CORS_ORIGIN || defaultConfig.cors.origin,
        credentials: process.env.CORS_CREDENTIALS === "true",
      },
      logging: {
        level:
          (process.env.LOG_LEVEL as ProductionConfig["logging"]["level"]) ||
          defaultConfig.logging.level,
      },
      sse: {
        keepAlive: process.env.SSE_KEEP_ALIVE !== "false",
        maxConnections: parseInt(process.env.SSE_MAX_CONNECTIONS || "1000", 10),
      },
    };

    log("Configuration loaded successfully");
    return config;
  }

  public getConfig(): ProductionConfig {
    return this.config;
  }

  public isProduction(): boolean {
    return process.env.NODE_ENV === "production";
  }
}

export const config = Config.getInstance();
