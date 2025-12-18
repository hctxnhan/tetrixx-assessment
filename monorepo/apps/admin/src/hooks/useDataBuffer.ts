import { useState, useCallback } from 'react';
import { StockData, ChartDataPoint } from '@/types';
import { chartDataBufferSize } from '@/config';

const WINDOW_SIZE_MS = chartDataBufferSize * 1000; 

export const useDataBuffer = () => {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);

  const addDataPoint = useCallback((stockData: StockData) => {
    const now = new Date(stockData.timestamp).getTime();
    const cutoff = now - WINDOW_SIZE_MS;

    const newPoint: ChartDataPoint = {
      timestamp: stockData.timestamp,
      price: stockData.price,
      displayTime: new Date(stockData.timestamp).toLocaleTimeString('en-US', {
        hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit',
        timeZone: 'UTC',
      }),
    };

    setChartData((prev) => {
      // 1. Add new point to the end
      // 2. Filter everything to stay within the last 60 seconds
      // 3. Keep the array sorted by timestamp just in case of network jitter
      // 4. Limit maximum number of points to prevent memory issues
      const filtered = [...prev, newPoint]
        .filter(p => new Date(p.timestamp).getTime() > cutoff)
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

      return filtered;
    });
  }, []);

  return {
    chartData,
    addDataPoint,
    clearBuffer: () => setChartData([]),
  };
};