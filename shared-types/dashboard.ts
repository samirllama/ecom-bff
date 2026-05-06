// ---------- Dashboard ----------
export interface DashboardSummary {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  activeUsers: number;
  recentOrders: RecentOrder[];
  topProducts: TopProduct[];
  revenueChart: RevenueData[];
}

export interface RecentOrder {
  id: string;
  customerName: string;
  amount: number;
  status: OrderStatus;
  date: string;
}

export interface TopProduct {
  id: string;
  name: string;
  sales: number;
  revenue: number;
  image: string;
}

export interface RevenueData {
  date: string;
  revenue: number;
  orders: number;
}

// ---------- Products ----------
export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  image: string;
  description: string;
}

// ---------- Orders ----------
export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderProduct {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  products: OrderProduct[];
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
  shippingAddress: string;
}
