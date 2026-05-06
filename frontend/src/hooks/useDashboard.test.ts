import { renderHook, waitFor } from '@testing-library/react';
import { useDashboard } from './useDashboard';
import { server } from '../test/setup';
import { rest } from 'msw';
import { mockDashboardSummary } from '../test/mocks';
import { describe, it, expect } from 'vitest';

describe('useDashboard', () => {
  it('should fetch and return dashboard data', async () => {
    const mockData = mockDashboardSummary();
    server.use(
      rest.get('/api/dashboard/summary', (req, res, ctx) => {
        return res(ctx.json(mockData));
      })
    );

    const { result } = renderHook(() => useDashboard());

    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBe(null);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual(mockData);
    expect(result.current.error).toBe(null);
  });

  it('should handle fetch errors', async () => {
    server.use(
      rest.get('/api/dashboard/summary', (req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    const { result } = renderHook(() => useDashboard());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toBe(null);
    expect(result.current.error).toBe('Failed to fetch dashboard data');
  });
});
