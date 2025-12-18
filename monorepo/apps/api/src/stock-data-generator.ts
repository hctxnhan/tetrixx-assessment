import { log } from "@repo/logger";

export interface StockData {
  symbol: "USD";
  price: number;
  timestamp: string;
}

export class StockDataGenerator {
  private currentPrice: number = 500.0;
  private isRunning: boolean = false;
  private intervalId: NodeJS.Timeout | null = null;
  private listeners: Set<(data: StockData) => void> = new Set();

  constructor() {
    // Initialize with a random price around $500 (in the middle of 0-1000 range)
    this.currentPrice = 500 + (Math.random() - 0.5) * 100;
  }

  public start(): void {
    if (this.isRunning) {
      log("Stock data generator is already running");
      return;
    }

    this.isRunning = true;
    log("Starting stock data generation");

    this.intervalId = setInterval(() => {
      try {
        const data = this.generateData();
        this.broadcast(data);
      } catch (error) {
        log("Error generating stock data:", error);
      }
    }, 50); // Emit every 50ms
  }

  public stop(): void {
    if (!this.isRunning) {
      return;
    }

    this.isRunning = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    log("Stopped stock data generation");
  }

  public subscribe(listener: (data: StockData) => void): () => void {
    this.listeners.add(listener);

    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  private generateData(): StockData {
    let change: number;

    // 5% chance of spike or valley event
    if (Math.random() < 0.05) {
      // Spike or valley: larger movement
      const spikeChange = (Math.random() - 0.5) * 100; // +/- $50
      change = spikeChange;
    } else {
      // Normal smooth movement
      const maxChange = 5; // Maximum change of $5 per update for smooth movement
      change = (Math.random() - 0.5) * maxChange * 2;
    }

    this.currentPrice = Math.max(0, Math.min(1000, this.currentPrice + change)); // Keep within 0-1000 range

    // Round to 2 decimal places
    const roundedPrice = Math.round(this.currentPrice * 100) / 100;

    return {
      symbol: "USD",
      price: roundedPrice,
      timestamp: new Date().toISOString(),
    };
  }

  private broadcast(data: StockData): void {
    // Broadcast to all listeners
    for (const listener of this.listeners) {
      try {
        listener(data);
      } catch (error) {
        log("Error broadcasting to listener:", error);
      }
    }
  }

  public isActive(): boolean {
    return this.isRunning;
  }
}

// Singleton instance for the application
export const stockDataGenerator = new StockDataGenerator();