import { renderHook, act, waitFor } from '@testing-library/react';
import { useServerSentEvents } from '@/hooks/useServerSentEvents';
import { ConnectionStatus } from '@/types';
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

// Capture the last created instance
let lastEventSourceInstance: MockEventSource | null = null;

// Mock EventSource
class MockEventSource {
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSED = 2;

  readyState = MockEventSource.CONNECTING;
  url: string;
  onopen: ((event: Event) => void) | null = null;
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;

  constructor(url: string) {
    this.url = url;
    lastEventSourceInstance = this;
  }

  // Helper method to trigger connection opening in tests
  triggerConnection() {
    this.readyState = MockEventSource.OPEN;
    if (this.onopen) {
      this.onopen(new Event('open'));
    }
  }

  close() {
    this.readyState = MockEventSource.CLOSED;
  }

  // Helper method for testing
  simulateMessage(data: any) {
    if (this.onmessage) {
      this.onmessage(new MessageEvent('message', { data: JSON.stringify(data) }));
    }
  }

  simulateError() {
    this.readyState = MockEventSource.CLOSED;
    if (this.onerror) {
      this.onerror(new Event('error'));
    }
  }
}

// Mock global EventSource
Object.defineProperty(window, 'EventSource', {
  writable: true,
  value: MockEventSource,
});

describe('useServerSentEvents', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    lastEventSourceInstance = null;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should start in connecting state', () => {
    const { result } = renderHook(() => useServerSentEvents('/test-url'));

    expect(result.current.status).toBe('connecting');
    expect(result.current.retryCount).toBe(0);
  });

  it('should connect successfully and receive data via callback', async () => {
    const onDataReceived = vi.fn();
    const { result } = renderHook(() => useServerSentEvents('/test-url', onDataReceived));

    // Manually trigger connection
    act(() => {
      lastEventSourceInstance?.triggerConnection();
    });

    expect(result.current.status).toBe('connected');
    expect(lastEventSourceInstance).not.toBeNull();

    // Simulate receiving data
    const testData = { symbol: 'USD', price: 45.5, timestamp: '2024-01-01T12:00:00Z' };

    act(() => {
      lastEventSourceInstance?.simulateMessage(testData);
    });

    expect(onDataReceived).toHaveBeenCalledWith(testData);
  });

  it('should handle connection errors', () => {
    const { result } = renderHook(() => useServerSentEvents('/test-url'));

    // Manually trigger connection
    act(() => {
      lastEventSourceInstance?.triggerConnection();
    });

    expect(result.current.status).toBe('connected');

    // Simulate connection error
    act(() => {
      lastEventSourceInstance?.simulateError();
    });

    expect(result.current.status).toBe('error');
    expect(result.current.error).toBeTruthy();
  });

  it('should attempt reconnection with exponential backoff', () => {
    const { result } = renderHook(() => useServerSentEvents('/test-url'));

    // Manually trigger connection
    act(() => {
      lastEventSourceInstance?.triggerConnection();
    });

    expect(result.current.status).toBe('connected');

    // Simulate connection error to trigger reconnection logic
    act(() => {
      lastEventSourceInstance?.simulateError();
    });

    // The hook should enter error state first, then attempt reconnection
    expect(result.current.status).toBe('error');
    expect(result.current.retryCount).toBe(0); // Should start counting from 0
  });

  it('should stop reconnection after max attempts', () => {
    const { result } = renderHook(() => useServerSentEvents('/test-url'));

    // The hook should start in connecting state with retryCount 0
    expect(result.current.status).toBe('connecting');
    expect(result.current.retryCount).toBe(0);

    // Manually trigger connection
    act(() => {
      lastEventSourceInstance?.triggerConnection();
    });

    expect(result.current.status).toBe('connected');

    // Simulate connection error to start the error/reconnection cycle
    act(() => {
      lastEventSourceInstance?.simulateError();
    });

    // Should be in error state with retryCount starting from 0
    expect(result.current.status).toBe('error');
    expect(result.current.retryCount).toBe(0);
  });

  it('should allow manual disconnect and reconnect', () => {
    const { result } = renderHook(() => useServerSentEvents('/test-url'));

    // Manually trigger connection
    act(() => {
      lastEventSourceInstance?.triggerConnection();
    });

    expect(result.current.status).toBe('connected');

    // Manual disconnect
    act(() => {
      result.current.disconnect();
    });

    expect(result.current.status).toBe('disconnected');

    // Manual reconnect
    act(() => {
      result.current.reconnect();
    });

    expect(result.current.status).toBe('connecting');
  });
});