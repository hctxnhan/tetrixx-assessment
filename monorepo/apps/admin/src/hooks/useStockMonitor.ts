import { useDeferredValue, useEffect, useRef } from "react";
import { useDataBuffer } from "./useDataBuffer";
import { useServerSentEvents } from "./useServerSentEvents";
import { config } from "@/config";

const url = config.sseEndpoint;

export const useStockMonitor = (isPaused: boolean) => {
  const { chartData, addDataPoint, clearBuffer } = useDataBuffer(100);

  const { status, error, reconnect, disconnect, retryCount } =
    useServerSentEvents(url, addDataPoint);

  // Snapshot of data when paused
  const pausedDataRef = useRef(chartData);

  // Keep the snapshot fresh when unpaused
  useEffect(() => {
    if (!isPaused) {
      pausedDataRef.current = chartData;
    }
  }, [isPaused, chartData]);

  // Choose what to display based on pause state
  const displayData = isPaused ? pausedDataRef.current : chartData;

  // Defer rendering to keep UI responsive during large data updates
  const deferredDisplayData = useDeferredValue(displayData);

  const currentValue =
    chartData.length > 0 ? chartData[chartData.length - 1].price : 0;

  return {
    displayData: deferredDisplayData,
    status,
    error,
    clearBuffer,
    currentValue,
    disconnect,
    reconnect,
    retryCount,
  };
};
