// shared/dashboard.ts

export interface Order {
  id: string;
  customerName: string;
  totalAmount: number;
  status: string;
  createdAt: string;               // ISO date string
  shippingAddress?: string;        // maps to shipping_address
}

export interface OrdersResponse {
  orders: Order[];
  total: number;
  page: number;
  totalPages: number;
}

export interface Product {
  id: string;
  name: string;
  price: number;                   // DECIMAL(10,2)
  stock: number;
  category: string;
  salesCount: number;             // sales_count DEFAULT 0
  revenue: number;                // revenue DEFAULT 0
  image?: string;                 // nullable TEXT column
}

export interface ProductsResponse {
  products: Product[];
  total: number;
  page: number;
  totalPages: number;
}

export interface RecentOrder {
  id: string;
  customerName: string;
  amount: number;
  status: string;
  date: string;
}

export interface TopProduct {
  id: string;
  name: string;
  sales: number;
  revenue: number;
  image: string;                 // required in dashboard output, will default to '' if missing
}

export interface RevenueData {
  date: string;
  revenue: number;
  orders: number;
}

export interface DashboardSummary {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  activeUsers: number;
  recentOrders: RecentOrder[];
  topProducts: TopProduct[];
  revenueChart: RevenueData[];
  sources?: Record<string, 'ok' | 'error'>;
}
