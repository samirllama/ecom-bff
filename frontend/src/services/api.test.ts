import { apiService } from './api';
import { server } from '../test/setup';
import { rest } from 'msw';
import { mockProduct, mockDashboardSummary } from '../test/mocks';
import { describe, it, expect } from 'vitest';

describe('ApiService', () => {
  it('getDashboardSummary calls correct endpoint', async () => {
    const mockData = mockDashboardSummary();
    server.use(
      rest.get('/api/dashboard/summary', (req, res, ctx) => {
        return res(ctx.json(mockData));
      })
    );

    const data = await apiService.getDashboardSummary();
    expect(data).toEqual(mockData);
  });

  it('getProducts calls correct endpoint with filters', async () => {
    const mockData = { products: [mockProduct()], total: 1 };
    let capturedParams: Record<string, string> = {};

    server.use(
      rest.get('/api/products', (req, res, ctx) => {
        capturedParams = Object.fromEntries(req.url.searchParams);
        return res(ctx.json(mockData));
      })
    );

    const data = await apiService.getProducts({ category: 'Electronics', page: 2 });
    expect(data).toEqual(mockData);
    expect(capturedParams).toEqual({ category: 'Electronics', page: '2' });
  });

  it('getProductById calls correct endpoint', async () => {
    const product = mockProduct({ id: '123' });
    server.use(
      rest.get('/api/products/123', (req, res, ctx) => {
        return res(ctx.json(product));
      })
    );

    const data = await apiService.getProductById('123');
    expect(data).toEqual(product);
  });
});
