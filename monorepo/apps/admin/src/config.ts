/**
 * Application Configuration
 *
 * Optimized Vite-first approach using direct import.meta.env access
 * for better build-time optimizations and performance.
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

export const config = {
  // Endpoints
  apiBaseUrl: API_BASE.replace(/\/$/, ''),
  sseEndpoint: `${API_BASE}/stocks/subscribe`,
  stocksEndpoint: `${API_BASE}/stocks`,

  // Metadata
  appName: import.meta.env.VITE_APP_NAME || 'Stock Monitor',
  version: import.meta.env.VITE_APP_VERSION || '1.0.0',

  // Feature Flags - Boolean Conversion
  enableDebugMode: import.meta.env.VITE_DEBUG_MODE === 'true',
  enableSystemLogs: import.meta.env.VITE_ENABLE_SYSTEM_LOGS !== 'false',

  // Performance - Number Conversion
  maxReconnectAttempts: Number(import.meta.env.VITE_MAX_RECONNECT_ATTEMPTS) || 5,
  initialReconnectDelay: Number(import.meta.env.VITE_INITIAL_RECONNECT_DELAY) || 1000,
  reconnectBackoffMultiplier: Number(import.meta.env.VITE_RECONNECT_BACKOFF_MULTIPLIER) || 2,
  chartDataBufferSize: Number(import.meta.env.VITE_CHART_DATA_BUFFER_SIZE) || 60,
  renderingThrottleFps: Number(import.meta.env.VITE_RENDERING_THROTTLE_FPS) || 60,
} as const;

// Development Helper
if (config.enableDebugMode) {
  console.log('🔧 Application Configuration:', config);
}

export type AppConfig = typeof config;

// Individual exports for convenience
export const {
  sseEndpoint,
  apiBaseUrl,
  maxReconnectAttempts,
  initialReconnectDelay,
  reconnectBackoffMultiplier,
  chartDataBufferSize,
  renderingThrottleFps,
  enableDebugMode,
  enableSystemLogs
} = config;