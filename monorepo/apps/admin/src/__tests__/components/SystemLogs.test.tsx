import { render, screen } from '@testing-library/react';
import { SystemLogs } from '@/components/SystemLogs';
import { ConnectionStatus } from '@/types';
import { vi } from 'vitest';

// Mock the config module
vi.mock('@/config', () => {
  const config = {
    sseEndpoint: 'http://localhost:3000/stocks/subscribe',
    maxReconnectAttempts: 5,
  };
  return {
    config,
    ...config,
  };
});

describe('SystemLogs', () => {
  const baseProps = {
    connectionStatus: 'connected' as ConnectionStatus,
  };

  it('should display error message when present', () => {
    const error = 'Connection failed';
    render(<SystemLogs {...baseProps} error={error} />);

    expect(screen.getByText('Connection failed')).toBeInTheDocument();
  });

  it('should display reconnect attempts when reconnecting', () => {
    render(
      <SystemLogs
        {...baseProps}
        connectionStatus="reconnecting"
        reconnectionAttempts={3}
      />
    );

    // In the new UI design, the text format is "State changed to RECONNECTING (Attempt 3)"
    expect(screen.getByText(/RECONNECTING/)).toBeInTheDocument();
    expect(screen.getByText(/Attempt 3/)).toBeInTheDocument();
  });
});
