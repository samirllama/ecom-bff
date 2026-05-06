import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Dashboard from './Dashboard';
import { server } from '../test/setup';
import { rest } from 'msw';
import { mockDashboardSummary } from '../test/mocks';
import { describe, it, expect, vi } from 'vitest';

// Mock Recharts as it doesn't play well with JSDOM
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
  LineChart: () => <div data-testid="line-chart" />,
  BarChart: () => <div data-testid="bar-chart" />,
  Line: () => null,
  Bar: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
}));

const theme = createTheme();
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider theme={theme}>
    <BrowserRouter>{children}</BrowserRouter>
  </ThemeProvider>
);

describe('Dashboard Page', () => {
  it('renders loading state and then data', async () => {
    const mockData = mockDashboardSummary({
      totalProducts: 123,
      totalOrders: 45,
    });

    server.use(
      rest.get('/api/dashboard/summary', (req, res, ctx) => {
        return res(ctx.json(mockData));
      })
    );

    render(<Dashboard />, { wrapper });

    // Check for skeletons
    expect(document.querySelector('.MuiSkeleton-root')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('123')).toBeInTheDocument();
      expect(screen.getByText('45')).toBeInTheDocument();
    });

    expect(screen.getByText('Total Products')).toBeInTheDocument();
    expect(screen.getByText('Total Orders')).toBeInTheDocument();
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
  });

  it('renders error state', async () => {
    server.use(
      rest.get('/api/dashboard/summary', (req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    render(<Dashboard />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText(/Error: Failed to fetch dashboard data/i)).toBeInTheDocument();
    });
  });
});
