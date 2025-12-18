// SSE Data from backend
export interface StockData {
  symbol: string;
  price: number;
  timestamp: string;
}

// Processed data point for chart consumption
export interface ChartDataPoint {
  timestamp: string;
  displayTime: string;
  price: number;
}

// Connection states
export type ConnectionStatus =
  | 'connecting'
  | 'connected'
  | 'disconnected'
  | 'error'
  | 'reconnecting';

// Application state
export interface AppState {
  connectionStatus: ConnectionStatus;
  isPaused: boolean;
  threshold: number;
  reconnectionAttempts: number;
  lastPacketTime?: string;
  bufferSize: number;
  connectionCount?: number;
}

// System log entry
export interface SystemLog {
  timestamp: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
}

// Re-export configuration types for convenience
export type { AppConfig } from '@/config';

