import { DashboardSummary, Product, Order, OrderStatus } from '@shared/dashboard';

export const mockProduct = (overrides?: Partial<Product>): Product => ({
  id: '1',
  name: 'Test Product',
  price: 9.99,
  stock: 10,
  category: 'Test',
  salesCount: 5,
  revenue: 49.95,
  image: '/test.jpg',
  description: 'A test product.',
  ...overrides,
});

export const mockOrder = (overrides?: Partial<Order>): Order => ({
  id: 'ord-1',
  customerName: 'John Doe',
  totalAmount: 99.99,
  status: OrderStatus.Pending,
  createdAt: new Date().toISOString(),
  shippingAddress: '123 Test St',
  ...overrides,
});

export const mockDashboardSummary = (overrides?: Partial<DashboardSummary>): DashboardSummary => ({
  totalProducts: 10,
  totalOrders: 5,
  totalRevenue: 499.95,
  activeUsers: 100,
  recentOrders: [
    {
      id: 'ord-1',
      customerName: 'John Doe',
      amount: 99.99,
      status: OrderStatus.Pending,
      date: new Date().toISOString(),
    },
  ],
  topProducts: [
    {
      id: 'prod-1',
      name: 'Test Product',
      sales: 10,
      revenue: 999.9,
      image: 'test-image.jpg',
    },
  ],
  revenueChart: [
    {
      date: '2026-05-01',
      revenue: 100,
      orders: 1,
    },
  ],
  ...overrides,
});
