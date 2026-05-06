import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Products from './Products';
import { server } from '../test/setup';
import { rest } from 'msw';
import { mockProduct } from '../test/mocks';
import { describe, it, expect, vi } from 'vitest';

// Mock DataGrid to avoid JSDOM layout issues
vi.mock('@mui/x-data-grid', () => ({
  DataGrid: (props: any) => (
    <div data-testid="datagrid">
      {props.rows.map((row: any) => (
        <div key={row.id} data-testid="row">
          {Object.values(row).join(' ')}
        </div>
      ))}
      <button onClick={() => props.onPaginationModelChange({ ...props.paginationModel, page: props.paginationModel.page + 1 })}>
        Next Page
      </button>
    </div>
  ),
}));

const theme = createTheme();
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider theme={theme}>
    <BrowserRouter>{children}</BrowserRouter>
  </ThemeProvider>
);

// DataGrid might need some special handling or mocking in JSDOM
// But let's try with the real one first.

describe('Products Page', () => {
  it('renders loading state and then product list', async () => {
    const mockProducts = [
      mockProduct({ id: '1', name: 'Product A', price: 10 }),
      mockProduct({ id: '2', name: 'Product B', price: 20 }),
    ];

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

    render(<Products />, { wrapper });

    // Verify loading skeletons
    expect(document.querySelector('.MuiSkeleton-root')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/Product A/)).toBeInTheDocument();
      expect(screen.getByText(/Product B/)).toBeInTheDocument();
    });
  });

  it('handles pagination', async () => {
    let capturedPage = '0';
    server.use(
      rest.get('/api/products', (req, res, ctx) => {
        capturedPage = req.url.searchParams.get('page') || '1';
        return res(
          ctx.json({
            products: [mockProduct({ id: 'page-' + capturedPage, name: 'Product ' + capturedPage })],
            total: 20,
          })
        );
      })
    );

    render(<Products />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText(/Product 1/)).toBeInTheDocument();
    });

    const nextButton = screen.getByRole('button', { name: /next page/i });
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(screen.getByText(/Product 2/)).toBeInTheDocument();
    });
  });

  it('renders error state', async () => {
    server.use(
      rest.get('/api/products', (req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    render(<Products />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText(/Failed to fetch products/i)).toBeInTheDocument();
    });
  });
});
