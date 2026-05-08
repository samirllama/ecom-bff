import axios from 'axios';
import { Order, OrdersResponse } from '@shared/dashboard';
import { logger } from '../utils/logger';

const ORDER_SERVICE_URL = process.env.ORDER_SERVICE_URL || 'http://localhost:3003';

export class OrderService {
    async getOrderCount(): Promise<number> {
        const response = await axios.get<{ count: number }>(
            `${ORDER_SERVICE_URL}/orders/count`
        );
        return response.data.count;
    }

    async getRecentOrders(limit: number = 5): Promise<Order[]> {
        const response = await axios.get<Order[]>(
            `${ORDER_SERVICE_URL}/orders/recent`,
            { params: { limit } }
        );
        return response.data;
    }

    async getRevenueData(days: number = 30): Promise<any[]> {
        const response = await axios.get<any[]>(
            `${ORDER_SERVICE_URL}/orders/revenue`,
            { params: { days } }
        );
        return response.data;
    }

    async getOrders(filters?: Record<string, any>): Promise<OrdersResponse> {
        const response = await axios.get<OrdersResponse>(
            `${ORDER_SERVICE_URL}/orders`,
            { params: filters }
        );
        return response.data;
    }

    async getOrderById(id: string): Promise<Order | null> {
        try {
            const response = await axios.get<Order>(
                `${ORDER_SERVICE_URL}/orders/${id}`
            );
            return response.data;
        } catch (error: any) {
            if (error.response?.status === 404) return null;
            logger.error(`Error fetching order ${id}:`, error);
            throw error;
        }
    }

    async updateOrderStatus(id: string, status: string): Promise<Order> {
        const response = await axios.patch<Order>(
            `${ORDER_SERVICE_URL}/orders/${id}/status`,
            { status }
        );
        return response.data;
    }
}
