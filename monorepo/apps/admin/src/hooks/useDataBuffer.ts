import { useState, useCallback } from 'react';
import { StockData, ChartDataPoint } from '@/types';
import { chartDataBufferSize } from '@/config';
import { useBatchedBuffer } from './useBatchedBuffer';

const WINDOW_SIZE_MS = chartDataBufferSize * 1000;
const BATCH_UPDATE_INTERVAL_MS = 100;

export const useDataBuffer = (batchInterval: number = BATCH_UPDATE_INTERVAL_MS) => {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);

  const { addItem, clear } = useBatchedBuffer<StockData>(
    batchInterval,
    useCallback((incoming) => {
      const now = Date.now();
      const cutoff = now - WINDOW_SIZE_MS;

      const newPoints: ChartDataPoint[] = incoming.map((s) => ({
        timestamp: s.timestamp,
        price: s.price,
        displayTime: new Date(s.timestamp).toLocaleTimeString('en-US', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          timeZone: 'UTC',
        }),
      }));

      setChartData((prev) => [...prev, ...newPoints]
        .filter((p) => new Date(p.timestamp).getTime() > cutoff)
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
        .slice(-1000));
    }, [])
  );

  return {
    chartData,
    addDataPoint: addItem,
    clearBuffer: () => {
      clear();
      setChartData([]);
    },
  };
};
