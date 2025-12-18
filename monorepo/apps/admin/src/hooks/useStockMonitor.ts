import { useDeferredValue, useMemo, useRef } from "react";
import { useDataBuffer } from "./useDataBuffer";
import { useServerSentEvents } from "./useServerSentEvents";
import { config } from "@/config";

const url = config.sseEndpoint;

export const useStockMonitor = (isPaused: boolean) => {
  const { chartData, addDataPoint, clearBuffer } = useDataBuffer();

  // 1. Always receive data
  // We pass addDataPoint directly. It continues to update 'chartData'
  // in the background even if the UI is "paused".
  const { status, error, reconnect, disconnect, retryCount } =
    useServerSentEvents(url, addDataPoint);

  // 2. Manage the "Frozen" state for the UI
  // We use a Ref to store the snapshot of data exactly when the user hits pause.
  const pausedDataRef = useRef(chartData);

  const displayData = useMemo(() => {
    if (isPaused) {
      // Return the snapshot we captured when it was first paused
      return pausedDataRef.current;
    }
    // When not paused, update the ref and return the live data
    pausedDataRef.current = chartData;
    return chartData;
  }, [isPaused, chartData]);

  // 3. Defer the result
  // This ensures that when the user "Unpauses", React doesn't hang
  // trying to render the massive jump in data all at once.
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
