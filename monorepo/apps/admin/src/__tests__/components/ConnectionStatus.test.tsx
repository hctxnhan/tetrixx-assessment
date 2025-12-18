import { render, screen, fireEvent, act } from '@testing-library/react';
import { ConnectionStatus } from '@/components/ConnectionStatus';
import { vi, type Mock } from 'vitest';

// Mock fetch
global.fetch = vi.fn();

// Mock the config to use a test URL
vi.mock('@/config', () => ({
  apiBaseUrl: 'http://localhost:5001'
}));

describe('ConnectionStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch connection count when connected', async () => {
    (global.fetch as Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ connections: 3 })
    });

    await act(async () => {
      render(<ConnectionStatus status="connected" />);
    });

    // Initial fetch should happen
    expect(global.fetch).toHaveBeenCalledWith('http://localhost:5001/status');
  });

  it('should display disconnected status with reconnect button', () => {
    const onReconnect = vi.fn();
    render(<ConnectionStatus status="disconnected" onReconnect={onReconnect} />);

    expect(screen.getByText('Disconnected')).toBeInTheDocument();
    
    const reconnectButton = screen.getByRole('button', { name: /Reconnect/i });
    expect(reconnectButton).toBeInTheDocument();

    fireEvent.click(reconnectButton);
    expect(onReconnect).toHaveBeenCalled();
  });

  it('should show disconnect button when connected', async () => {
    const onDisconnect = vi.fn();
    (global.fetch as Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ connections: 3 })
    });

    await act(async () => {
      render(<ConnectionStatus status="connected" onDisconnect={onDisconnect} />);
    });

    const disconnectButton = screen.getByRole('button', { name: /Disconnect/i });
    expect(disconnectButton).toBeInTheDocument();

    fireEvent.click(disconnectButton);
    expect(onDisconnect).toHaveBeenCalled();
  });
  
  it('should handle fetch errors gracefully', async () => {
    (global.fetch as Mock).mockRejectedValueOnce(new Error('Network error'));

    await act(async () => {
      render(<ConnectionStatus status="connected" />);
    });

    // Should not throw error and still render connected state
    expect(screen.getByText('System Online')).toBeInTheDocument();
  });

  it('should display error status with reconnect button', () => {
    const onReconnect = vi.fn();
    render(<ConnectionStatus status="error" error="Test Error" onReconnect={onReconnect} />);

    expect(screen.getByText('Error')).toBeInTheDocument();
    
    // Check if error message is displayed
    expect(screen.getByText('Test Error')).toBeInTheDocument();

    const reconnectButton = screen.getByRole('button', { name: /Reconnect/i });
    expect(reconnectButton).toBeInTheDocument();

    fireEvent.click(reconnectButton);
    expect(onReconnect).toHaveBeenCalled();
  });
});
