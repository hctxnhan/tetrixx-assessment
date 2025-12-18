import { renderHook, act } from '@testing-library/react';
import { useDataBuffer } from '@/hooks/useDataBuffer';
import { StockData } from '@/types';
import { vi } from 'vitest';

// Mock the config module
vi.mock('@/config', () => {
  const config = {
    apiBaseUrl: 'http://localhost:3000',
    stocksEndpoint: 'http://localhost:3000/stocks',
    sseEndpoint: 'http://localhost:3000/stocks/subscribe',
    appName: 'Stock Monitor',
    version: '1.0.0',
    enableDebugMode: false,
    enableSystemLogs: true,
    maxReconnectAttempts: 5,
    initialReconnectDelay: 1000,
    reconnectBackoffMultiplier: 2,
    chartDataBufferSize: 60,
    renderingThrottleFps: 60,
  };
  return {
    config,
    ...config,
  };
});

describe('useDataBuffer', () => {
  const mockStockData: StockData = {
    symbol: 'USD',
    price: 45.5,
    timestamp: '2024-01-01T12:00:00Z',
  };

  it('should return empty buffer initially', () => {
    const { result } = renderHook(() => useDataBuffer());

    expect(result.current.chartData).toEqual([]);
  });

  it('should add data points to buffer via addDataPoint', () => {
    const { result } = renderHook(() => useDataBuffer());

    act(() => {
      result.current.addDataPoint(mockStockData);
    });

    expect(result.current.chartData).toHaveLength(1);
    expect(result.current.chartData[0]).toMatchObject({
      timestamp: mockStockData.timestamp,
      price: mockStockData.price,
    });
    expect(result.current.chartData[0]).toHaveProperty('displayTime');
  });

  it('should format display time correctly', () => {
    const { result } = renderHook(() => useDataBuffer());

    const dataWithKnownTime: StockData = {
      ...mockStockData,
      timestamp: '2024-01-01T14:30:25.123Z',
    };

    act(() => {
      result.current.addDataPoint(dataWithKnownTime);
    });

    expect(result.current.chartData[0].displayTime).toBe('14:30:25');
  });

  it('should maintain sliding window when buffer is full', () => {
    const { result } = renderHook(() => useDataBuffer());

    // Add more data than buffer capacity for testing
    // The buffer size is based on time, so we need to simulate timestamps
    for (let i = 0; i < 10; i++) {
      const testData: StockData = {
        ...mockStockData,
        price: 40 + i,
        // Increment seconds
        timestamp: `2024-01-01T12:00:${i.toString().padStart(2, '0')}.000Z`,
      };

      act(() => {
         result.current.addDataPoint(testData);
      });
    }

    expect(result.current.chartData).toHaveLength(10);
    
    // Now add a point that is older than cutoff (cutoff is 60s)
    // If we add a point that is "current", older points are kept unless they are > 60s old relative to "current"
    
    // Let's simulate a time progression where the new point is much later
    const futureData: StockData = {
        ...mockStockData,
        price: 100,
        timestamp: '2024-01-01T12:02:00.000Z' // 2 minutes later
    };

    act(() => {
        result.current.addDataPoint(futureData);
    });

    // All previous points (12:00:00 to 12:00:09) should be filtered out because they are older than 12:01:00
    expect(result.current.chartData).toHaveLength(1);
    expect(result.current.chartData[0].price).toBe(100);
  });

  it('should clear buffer', () => {
    const { result } = renderHook(() => useDataBuffer());

    act(() => {
      result.current.addDataPoint(mockStockData);
    });
    
    expect(result.current.chartData).toHaveLength(1);

    // Clear buffer
    act(() => {
      result.current.clearBuffer();
    });

    expect(result.current.chartData).toEqual([]);
  });

  it('should handle rapid data updates', () => {
    const { result } = renderHook(() => useDataBuffer());

    // Add 50 items within 1 second range
    const safeUpdates: StockData[] = Array.from({ length: 50 }, (_, i) => ({
        ...mockStockData,
        price: 40 + i,
        timestamp: `2024-01-01T12:00:00.${i.toString().padStart(3, '0')}Z`
    }));

    act(() => {
        safeUpdates.forEach(data => result.current.addDataPoint(data));
    });

    expect(result.current.chartData).toHaveLength(50);
  });
});
