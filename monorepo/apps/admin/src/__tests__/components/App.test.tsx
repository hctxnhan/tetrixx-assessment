import { render, screen, fireEvent } from '@testing-library/react';
import App from '@/app/index';
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

// Mock the hooks to avoid network requests
vi.mock('@/hooks/useStockMonitor', () => ({
  useStockMonitor: vi.fn(() => ({
    displayData: [],
    currentValue: 0,
    status: 'disconnected',
    error: null,
    retryCount: 0,
    reconnect: vi.fn(),
    disconnect: vi.fn(),
  })),
}));

describe('App Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should handle pause/resume functionality', async () => {
    const { useStockMonitor } = await import('@/hooks/useStockMonitor');
    (useStockMonitor as any).mockReturnValue({
      displayData: [],
      currentValue: 0,
      status: 'connected',
      error: null,
      retryCount: 0,
      reconnect: vi.fn(),
      disconnect: vi.fn(),
    });

    render(<App />);

    const pauseButton = screen.getByRole('button', { name: /Pause/i }); 
    expect(pauseButton).toBeInTheDocument();
    expect(pauseButton).not.toBeDisabled();

    fireEvent.click(pauseButton);

    expect(screen.getByRole('button', { name: /Resume/i })).toBeInTheDocument();
  });

  it('should handle threshold input changes', async () => {
    const { useStockMonitor } = await import('@/hooks/useStockMonitor');
    (useStockMonitor as any).mockReturnValue({
      displayData: [],
      currentValue: 0,
      status: 'connected',
      error: null,
      retryCount: 0,
      reconnect: vi.fn(),
      disconnect: vi.fn(),
    });

    render(<App />);

    const thresholdInput = screen.getByLabelText(/Alert Threshold/i);
    expect(thresholdInput).toBeInTheDocument();

    fireEvent.change(thresholdInput, { target: { value: '80' } });

    expect(thresholdInput).toHaveValue(80);
  });

  it('should display threshold alert when exceeded', async () => {
    const { useStockMonitor } = await import('@/hooks/useStockMonitor');
    (useStockMonitor as any).mockReturnValue({
      displayData: [
        { timestamp: '2024-01-01T12:00:00Z', displayTime: '12:00:00', price: 600 }
      ],
      currentValue: 600,
      status: 'connected',
      error: null,
      retryCount: 0,
      reconnect: vi.fn(),
      disconnect: vi.fn(),
    });

    render(<App />);

    expect(screen.getByText('Threshold Exceeded')).toBeInTheDocument();
  });

  it('should disable controls when not connected', async () => {
    const { useStockMonitor } = await import('@/hooks/useStockMonitor');
    (useStockMonitor as any).mockReturnValue({
      displayData: [],
      currentValue: 0,
      status: 'connecting',
      error: null,
      retryCount: 0,
      reconnect: vi.fn(),
      disconnect: vi.fn(),
    });

    render(<App />);

    const pauseButton = screen.getByRole('button', { name: /Pause/i });
    expect(pauseButton).toBeDisabled();

    const thresholdInput = screen.getByLabelText(/Alert Threshold/i);
    expect(thresholdInput).toBeDisabled();
  });
});
