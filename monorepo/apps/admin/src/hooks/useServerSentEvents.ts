import { useReducer, useEffect, useRef, useCallback } from 'react';
import { ConnectionStatus, StockData } from '@/types';
import {
  maxReconnectAttempts,
  initialReconnectDelay,
  reconnectBackoffMultiplier
} from '@/config';

// --- State Types ---
type SSEState = {
  status: ConnectionStatus;
  error: string | null;
  retryCount: number;
  manualClose: boolean;
};

type SSEAction =
  | { type: 'START_CONNECT' }
  | { type: 'CONNECTION_ESTABLISHED' }
  | { type: 'CONNECTION_ERROR'; payload: string }
  | { type: 'RETRY' }
  | { type: 'MANUAL_DISCONNECT' }
  | { type: 'MANUAL_RECONNECT' };

const initialState: SSEState = {
  status: 'disconnected',
  error: null,
  retryCount: 0,
  manualClose: false,
};

// --- Reducer ---
function sseReducer(state: SSEState, action: SSEAction): SSEState {
  switch (action.type) {
    case 'START_CONNECT':
      return { ...state, status: 'connecting', error: null, manualClose: false };
    case 'CONNECTION_ESTABLISHED':
      return { ...state, status: 'connected', retryCount: 0, error: null };
    case 'CONNECTION_ERROR':
      return { ...state, status: 'error', error: action.payload };
    case 'RETRY':
      return { ...state, status: 'reconnecting', retryCount: state.retryCount + 1 };
    case 'MANUAL_DISCONNECT':
      return { ...state, status: 'disconnected', manualClose: true, retryCount: 0 };
    case 'MANUAL_RECONNECT':
      return { ...state, manualClose: false, retryCount: 0 };
    default:
      return state;
  }
}

/**
 * useServerSentEvents
 * @param url The endpoint for the SSE stream
 * @param onDataReceived Callback triggered for every message (bypasses React state)
 */
export const useServerSentEvents = (
  url: string, 
  onDataReceived?: (data: StockData) => void
) => {
  const [state, dispatch] = useReducer(sseReducer, initialState);
  
  const eventSourceRef = useRef<EventSource | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Stability check: memoize the callback to prevent effect re-runs
  const handleData = useRef(onDataReceived);
  useEffect(() => {
    handleData.current = onDataReceived;
  }, [onDataReceived]);

  const cleanup = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  useEffect(() => {
    // Stop if manually closed or we've hit the retry limit
    if (state.manualClose || state.retryCount >= maxReconnectAttempts) {
      if (state.retryCount >= maxReconnectAttempts) {
        dispatch({ type: 'CONNECTION_ERROR', payload: 'Maximum reconnection attempts reached.' });
      }
      return;
    }

    const connect = () => {
      cleanup();
      dispatch({ type: 'START_CONNECT' });

      const es = new EventSource(url);
      eventSourceRef.current = es;

      es.onopen = () => {
        dispatch({ type: 'CONNECTION_ESTABLISHED' });
      };

      es.onmessage = (event) => {
        try {
          const parsed: StockData = JSON.parse(event.data);
          // Directly invoke the callback. 
          // This is the "Fast Lane" that bypasses React rendering.
          handleData.current?.(parsed);
        } catch (err) {
          console.error('Failed to parse SSE message:', err);
        }
      };

      es.onerror = () => {
        cleanup();
        
        // Exponential Backoff logic
        const delay = initialReconnectDelay * Math.pow(reconnectBackoffMultiplier, state.retryCount);
        
        dispatch({ type: 'CONNECTION_ERROR', payload: 'Stream interrupted. Retrying...' });

        timeoutRef.current = setTimeout(() => {
          dispatch({ type: 'RETRY' });
        }, delay);
      };
    };

    connect();

    return cleanup;
  }, [url, state.retryCount, state.manualClose, cleanup]);

  const disconnect = useCallback(() => dispatch({ type: 'MANUAL_DISCONNECT' }), []);
  const reconnect = useCallback(() => dispatch({ type: 'MANUAL_RECONNECT' }), []);

  return {
    status: state.status,
    error: state.error,
    retryCount: state.retryCount,
    disconnect,
    reconnect,
  };
};