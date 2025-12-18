import React from 'react';
import { render, screen } from '@testing-library/react';
import { RealTimeChart } from '@/components/RealTimeChart';
import { ChartDataPoint } from '@/types';
import { vi } from 'vitest';

// Mock recharts components
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => (
    <div data-testid="responsive-container">
      {children}
    </div>
  ),
  AreaChart: ({ children, data }: any) => (
    <div data-testid="area-chart">
      {children}
    </div>
  ),
  Area: () => <div data-testid="area" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  ReferenceLine: () => <div data-testid="reference-line" />,
  Tooltip: () => <div data-testid="tooltip" />,
}));

describe('RealTimeChart', () => {
  const mockData: ChartDataPoint[] = [
    { timestamp: '2024-01-01T12:00:00Z', displayTime: '12:00:00', price: 45.5 },
  ];

  it('should render chart with data', () => {
    render(<RealTimeChart data={mockData} threshold={50} />);
    expect(screen.getByTestId('area-chart')).toBeInTheDocument();
  });

  it('should show waiting state when no data', () => {
    render(<RealTimeChart data={[]} threshold={50} />);
    expect(screen.getByText('Waiting for data stream...')).toBeInTheDocument();
  });
});
