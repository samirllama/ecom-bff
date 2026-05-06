import { DashboardSummary } from '../types/dashboard';
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
        try {
            // Fetch data from services in parallel
            const [productCount, allOrdersResponse, activeUsers, recentOrders, revenueData] =
                await Promise.all([
                    this.productService.getProductCount(),
                    this.orderService.getOrders(),        // returns { orders, total, ... }
                    this.userService.getActiveUserCount(),
                    this.orderService.getRecentOrders(5),
                    this.orderService.getRevenueData(30),
                ]);

            const allOrders = allOrdersResponse.orders; // extract the array
            const totalRevenue = allOrders.reduce((sum, order) => sum + order.totalAmount, 0);
            const topProducts = await this.productService.getTopProducts(5);
            const revenueChart = this.formatRevenueData(revenueData);

            return {
                totalProducts: productCount,
                totalOrders: allOrders.length,
                totalRevenue,
                activeUsers,
                recentOrders: recentOrders.map(this.formatRecentOrder),
                topProducts: topProducts.map(this.formatTopProduct),
                revenueChart,
            };
        } catch (error) {
            logger.error('Error fetching dashboard summary:', error);
            throw new Error('Failed to fetch dashboard data');
        }
    }

    private formatRecentOrder(order: any) {
        return {
            id: order.id,
            customerName: order.customerName,
            amount: order.totalAmount,
            status: order.status,
            date: order.createdAt,
        };
    }

    private formatTopProduct(product: any) {
        return {
            id: product.id,
            name: product.name,
            sales: product.salesCount,
            revenue: product.revenue,
            image: product.image,
        };
    }

    private formatRevenueData(data: any[]) {
        return data.map(item => ({
            date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            revenue: item.revenue,
            orders: item.orderCount,
        }));
    }
}
