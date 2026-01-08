import { useRef, useEffect, useLayoutEffect, useCallback } from 'react';
import { useEffectEvent } from './useEffectEvent';

export function useBatchedBuffer<T>(
  intervalMs: number,
  onBatch: (items: T[]) => void
) {
  const pendingRef = useRef<T[]>([]);

  // Wrap onBatch to prevent timer restarts when callback changes
  const onFlush = useEffectEvent(onBatch);

  const addItem = useCallback((item: T) => {
    pendingRef.current.push(item);
    console.log(`[BatchBuffer] Item added. Buffer size: ${pendingRef.current.length}`);
  }, []);

  useEffect(() => {
    // If interval is 0 or negative, use useLayoutEffect for immediate flush (test mode)
    if (intervalMs <= 0) {
      const flushImmediate = () => {
        const batch = pendingRef.current;
        if (batch.length === 0) return;

        pendingRef.current = [];
        console.log(`[BatchBuffer] Flushing ${batch.length} items to state (immediate)`);
        onFlush(batch);
      };

      // Flush immediately after state commits
      useLayoutEffect(flushImmediate);

      return () => {};
    }

    const timer = setInterval(() => {
      const batch = pendingRef.current;
      if (batch.length === 0) return;

      pendingRef.current = [];
      console.log(`[BatchBuffer] Flushing ${batch.length} items to state`);
      onFlush(batch);
    }, intervalMs);

    return () => clearInterval(timer);
  }, [intervalMs]); // onFlush excluded from deps

  const clear = () => {
    pendingRef.current = [];
  };

  return { addItem, clear };
}
