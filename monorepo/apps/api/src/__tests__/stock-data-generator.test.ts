import { StockDataGenerator, StockData } from "../stock-data-generator";

describe("StockDataGenerator", () => {
  let generator: StockDataGenerator;

  beforeEach(() => {
    generator = new StockDataGenerator();
  });

  afterEach(() => {
    generator.stop();
  });

  it("should generate data with correct format", () => {
    const receivedData: StockData[] = [];

    generator.subscribe((data) => {
      receivedData.push(data);
    });

    generator.start();

    // Wait for at least one data point
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        expect(receivedData.length).toBeGreaterThan(0);

        const data = receivedData[0];
        expect(data).toHaveProperty("symbol", "USD");
        expect(data).toHaveProperty("price");
        expect(data).toHaveProperty("timestamp");

        // Check price format
        expect(typeof data.price).toBe("number");
        expect(data.price).toBe(Math.round(data.price * 100) / 100); // 2 decimal places

        // Check timestamp format (ISO 8601)
        expect(typeof data.timestamp).toBe("string");
        const timestamp = new Date(data.timestamp);
        expect(timestamp.getTime()).not.toBeNaN();

        resolve();
      }, 100);
    });
  });

  it("should emit data at 50ms intervals", async () => {
    const timestamps: number[] = [];
    let count = 0;

    generator.subscribe(() => {
      timestamps.push(Date.now());
      count++;
      if (count >= 5) {
        generator.stop();
      }
    });

    generator.start();

    // Wait for multiple data points
    await new Promise<void>((resolve) => {
      setTimeout(() => {
        expect(count).toBeGreaterThanOrEqual(5);

        // Check intervals between consecutive emissions
        for (let i = 1; i < timestamps.length; i++) {
          const interval = timestamps[i] - timestamps[i - 1];
          // Allow some tolerance (±10ms)
          expect(interval).toBeGreaterThanOrEqual(40);
          expect(interval).toBeLessThanOrEqual(60);
        }

        resolve();
      }, 300);
    });
  });

  it("should generate price variations correctly", () => {
    const prices: number[] = [];
    let dataCount = 0;

    generator.subscribe((data) => {
      prices.push(data.price);
      dataCount++;
      if (dataCount >= 10) {
        generator.stop();
      }
    });

    generator.start();

    // Wait for multiple price points
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        try {
          if (prices.length >= 5) {
            // Check that prices vary (not all the same)
            const uniquePrices = new Set(prices);
            expect(uniquePrices.size).toBeGreaterThan(1);

            // Check that price changes are reasonable
            // The generator allows for max $5 smooth change and $50 spike
            for (let i = 1; i < prices.length; i++) {
              const change = Math.abs(prices[i] - prices[i - 1]);
              expect(change).toBeLessThanOrEqual(60); 
            }

            // Check that prices stay positive
            prices.forEach(price => {
              expect(price).toBeGreaterThan(0);
            });

            resolve();
          } else {
            reject(new Error(`Expected at least 5 prices, got ${prices.length}`));
          }
        } catch (error) {
          reject(error);
        }
      }, 1000);
    });
  });

  it("should handle multiple subscribers receiving identical data", () => {
    const subscriber1Data: StockData[] = [];
    const subscriber2Data: StockData[] = [];
    let dataCount = 0;

    generator.subscribe((data) => {
      subscriber1Data.push(data);
      dataCount++;
      if (dataCount >= 5) {
        generator.stop();
      }
    });

    generator.subscribe((data) => {
      subscriber2Data.push(data);
    });

    generator.start();

    // Wait for data
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        expect(subscriber1Data.length).toBeGreaterThan(0);
        expect(subscriber2Data.length).toBeGreaterThan(0);

        // Both subscribers should receive the same data
        expect(subscriber1Data).toEqual(subscriber2Data);

        resolve();
      }, 200);
    });
  });
});