import axios from 'axios';
import { Order, OrdersResponse } from '@shared/dashboard';
import { logger } from '../utils/logger';

const ORDER_SERVICE_URL = process.env.ORDER_SERVICE_URL || 'http://localhost:3003';

export class OrderService {
    async getOrderCount(): Promise<number> {
        try {
            const response = await axios.get<{ count: number }>(`${ORDER_SERVICE_URL}/orders/count`);
            return response.data.count;
        } catch (error) {
            logger.error('Error fetching order count:', error);
            return 0;
        }
    }

    async getRecentOrders(limit: number = 5): Promise<Order[]> {
        try {
            const response = await axios.get<Order[]>(`${ORDER_SERVICE_URL}/orders/recent`, {
                params: { limit },
            });
            return response.data;
        } catch (error) {
            logger.error('Error fetching recent orders:', error);
            return [];
        }
    }

    async getRevenueData(days: number = 30): Promise<any[]> {
        try {
            const response = await axios.get<any[]>(`${ORDER_SERVICE_URL}/orders/revenue`, {
                params: { days },
            });
            return response.data;
        } catch (error) {
            logger.error('Error fetching revenue data:', error);
            return [];
        }
    }

    async getOrders(filters?: Record<string, any>): Promise<OrdersResponse> {
        try {
            const response = await axios.get<OrdersResponse>(`${ORDER_SERVICE_URL}/orders`, {
                params: filters,
            });
            return response.data;
        } catch (error) {
            logger.error('Error fetching orders:', error);
            throw error;
        }
    }

    async getOrderById(id: string): Promise<Order | null> {
        try {
            const response = await axios.get<Order>(`${ORDER_SERVICE_URL}/orders/${id}`);
            return response.data;
        } catch (error: any) {
            if (error.response?.status === 404) return null;
            logger.error(`Error fetching order ${id}:`, error);
            throw error;
        }
    }

    async updateOrderStatus(id: string, status: string): Promise<Order> {
        try {
            const response = await axios.patch<Order>(`${ORDER_SERVICE_URL}/orders/${id}/status`, { status });
            return response.data;
        } catch (error) {
            logger.error(`Error updating order ${id} status:`, error);
            throw error;
        }
    }
}
