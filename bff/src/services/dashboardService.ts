import {
    DashboardSummary,
    RecentOrder,
    TopProduct,
    RevenueData,
    Product,
    Order,
} from '@shared/dashboard';
import { ProductService } from './productService';
import { OrderService } from './orderService';
import { UserService } from './userService';
import { logger } from '../utils/logger';

export class DashboardService {
    private productService: ProductService;
    private orderService: OrderService;
    private userService: UserService;

    constructor() {
        this.productService = new ProductService();
        this.orderService = new OrderService();
        this.userService = new UserService();
    }

    async getDashboardSummary(): Promise<DashboardSummary> {
        // Fire all independent calls in parallel – including top products.
        const results = await Promise.allSettled([
            this.productService.getProductCount(),
            this.orderService.getOrders(),
            this.userService.getActiveUserCount(),
            this.orderService.getRecentOrders(5),
            this.orderService.getRevenueData(30),
            this.productService.getTopProducts(5),
        ]);

        // Helper: if fulfilled, return value; otherwise log a warning and return fallback.
        const unwrap = <T>(
            result: PromiseSettledResult<T>,
            fallback: T,
            name: string
        ): T => {
            if (result.status === 'fulfilled') return result.value;
            logger.warn(`Failed to fetch ${name}:`, result.reason);
            return fallback;
        };

        const productCount = unwrap(results[0], 0, 'product count');
        const allOrdersResponse = unwrap(
            results[1],
            { orders: [], total: 0, page: 1, totalPages: 1 },
            'all orders'
        );
        const activeUsers = unwrap(results[2], 0, 'active users');
        const recentOrders = unwrap(results[3], [] as Order[], 'recent orders');
        const revenueData = unwrap(results[4], [] as any[], 'revenue data');
        const topProducts = unwrap(results[5], [] as Product[], 'top products');

        // Compute revenue from the (possibly empty) order list
        const allOrders = allOrdersResponse.orders;
        const totalRevenue = allOrders.reduce(
            (sum: number, order: Order) => sum + order.totalAmount,
            0
        );

        // Build health map for the frontend
        const sources: Record<string, 'ok' | 'error'> = {
            productCount: results[0].status === 'fulfilled' ? 'ok' : 'error',
            allOrders: results[1].status === 'fulfilled' ? 'ok' : 'error',
            activeUsers: results[2].status === 'fulfilled' ? 'ok' : 'error',
            recentOrders: results[3].status === 'fulfilled' ? 'ok' : 'error',
            revenueData: results[4].status === 'fulfilled' ? 'ok' : 'error',
            topProducts: results[5].status === 'fulfilled' ? 'ok' : 'error',
        };

        try {
            const revenueChart = this.formatRevenueData(revenueData);

            return {
                totalProducts: productCount,
                totalOrders: allOrders.length,
                totalRevenue,
                activeUsers,
                recentOrders: recentOrders.map((order) =>
                    this.formatRecentOrder(order)
                ),
                topProducts: topProducts.map((product) =>
                    this.formatTopProduct(product)
                ),
                revenueChart,
                sources,
            };
        } catch (error) {
            // Log and re‑throw the original error – preserves the stack trace
            logger.error('Unexpected error formatting dashboard data:', error);
            throw error;
        }
    }

    private formatRecentOrder(order: Order): RecentOrder {
        return {
            id: order.id,
            customerName: order.customerName,
            amount: order.totalAmount,
            status: order.status,
            date: order.createdAt,
        };
    }

    private formatTopProduct(product: Product): TopProduct {
        return {
            id: product.id,
            name: product.name,
            sales: product.salesCount ?? 0,
            revenue: product.revenue ?? 0,
            image: product.image ?? '',
        };
    }

    private formatRevenueData(data: any[]): RevenueData[] {
        return data.map((item) => ({
            date: new Date(item.date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
            }),
            revenue: item.revenue || 0,
            orders: item.orderCount || 0,
        }));
    }
}
