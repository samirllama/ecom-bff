import { DashboardSummary, RecentOrder, TopProduct, RevenueData, Product, Order } from '@shared/dashboard';
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
            // Fetch data from services in parallel using allSettled for resiliency
            const [
                productCountResult,
                allOrdersResult,
                activeUsersResult,
                recentOrdersResult,
                revenueDataResult
            ] = await Promise.allSettled([
                this.productService.getProductCount(),
                this.orderService.getOrders(),
                this.userService.getActiveUserCount(),
                this.orderService.getRecentOrders(5),
                this.orderService.getRevenueData(30),
            ]);

            // Extract values or provide defaults on failure
            const productCount = productCountResult.status === 'fulfilled' ? productCountResult.value : 0;
            const allOrdersResponse = allOrdersResult.status === 'fulfilled' ? allOrdersResult.value : { orders: [], total: 0, page: 1, totalPages: 1 };
            const activeUsers = activeUsersResult.status === 'fulfilled' ? activeUsersResult.value : 0;
            const recentOrders = recentOrdersResult.status === 'fulfilled' ? recentOrdersResult.value : [];
            const revenueData = revenueDataResult.status === 'fulfilled' ? revenueDataResult.value : [];

            if (productCountResult.status === 'rejected') logger.warn('Failed to fetch product count:', productCountResult.reason);
            if (allOrdersResult.status === 'rejected') logger.warn('Failed to fetch all orders:', allOrdersResult.reason);
            if (activeUsersResult.status === 'rejected') logger.warn('Failed to fetch active users:', activeUsersResult.reason);
            if (recentOrdersResult.status === 'rejected') logger.warn('Failed to fetch recent orders:', recentOrdersResult.reason);
            if (revenueDataResult.status === 'rejected') logger.warn('Failed to fetch revenue data:', revenueDataResult.reason);

            const allOrders = allOrdersResponse.orders;
            const totalRevenue = allOrders.reduce((sum, order) => sum + order.totalAmount, 0);
            
            // Top products is dependent on productService success, but we can try-catch it separately
            let topProducts: Product[] = [];
            try {
                topProducts = await this.productService.getTopProducts(5);
            } catch (error) {
                logger.warn('Failed to fetch top products:', error);
            }

            const revenueChart = this.formatRevenueData(revenueData);

            return {
                totalProducts: productCount,
                totalOrders: allOrders.length,
                totalRevenue,
                activeUsers,
                recentOrders: recentOrders.map(order => this.formatRecentOrder(order)),
                topProducts: topProducts.map(product => this.formatTopProduct(product)),
                revenueChart,
            };
        } catch (error) {
            logger.error('Error fetching dashboard summary:', error);
            throw new Error('Failed to fetch dashboard data');
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
            sales: (product as any).salesCount || 0, // Fallback if salesCount is not in shared Product type yet
            revenue: (product as any).revenue || 0,
            image: product.image,
        };
    }

    private formatRevenueData(data: any[]): RevenueData[] {
        return data.map(item => ({
            date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            revenue: item.revenue || 0,
            orders: item.orderCount || 0,
        }));
    }
}
