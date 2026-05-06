import { renderHook, waitFor } from '@testing-library/react';
import { useProducts } from './useProducts';
import { server } from '../test/setup';
import { rest } from 'msw';
import { mockProduct } from '../test/mocks';
import { describe, it, expect } from 'vitest';

describe('useProducts', () => {
  it('should fetch and return products list', async () => {
    const mockProducts = [mockProduct({ id: '1' }), mockProduct({ id: '2' })];
    server.use(
      rest.get('/api/products', (req, res, ctx) => {
        return res(
          ctx.json({
            products: mockProducts,
            total: 2,
          })
        );
      })
    );

    const { result } = renderHook(() => useProducts());

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.products).toEqual(mockProducts);
    expect(result.current.total).toBe(2);
    expect(result.current.error).toBe(null);
  });

  it('should pass pagination parameters to the API', async () => {
    let capturedParams: Record<string, string> = {};
    server.use(
      rest.get('/api/products', (req, res, ctx) => {
        capturedParams = Object.fromEntries(req.url.searchParams);
        return res(ctx.json({ products: [], total: 0 }));
      })
    );

    renderHook(() => useProducts({ page: 2, limit: 10, category: 'Electronics' }));

    await waitFor(() => {
      expect(capturedParams).toEqual({
        page: '2',
        limit: '10',
        category: 'Electronics',
      });
    });
  });

  it('should handle fetch errors', async () => {
    server.use(
      rest.get('/api/products', (req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    const { result } = renderHook(() => useProducts());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.products).toEqual([]);
    expect(result.current.error).toBe('Failed to fetch products');
  });
});
