/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_APP_NAME: string;
  readonly VITE_APP_VERSION: string;
  readonly VITE_DEBUG_MODE: string;
  readonly VITE_ENABLE_SYSTEM_LOGS: string;
  readonly VITE_MAX_RECONNECT_ATTEMPTS: string;
  readonly VITE_INITIAL_RECONNECT_DELAY: string;
  readonly VITE_RECONNECT_BACKOFF_MULTIPLIER: string;
  readonly VITE_CHART_DATA_BUFFER_SIZE: string;
  readonly VITE_RENDERING_THROTTLE_FPS: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}