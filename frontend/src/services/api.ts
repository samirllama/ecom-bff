import axios, { AxiosInstance, AxiosError } from 'axios';
import { DashboardSummary, Product, Order } from '@shared/dashboard';

class ApiService {
    private api: AxiosInstance;

    constructor() {
        this.api = axios.create({
            baseURL: '/api', // relative URL, works with Vite proxy in dev and Nginx proxy in prod
            timeout: 10000,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        this.setupInterceptors();
    }

    private setupInterceptors() {
        this.api.interceptors.request.use(
            (config) => {
                const token = localStorage.getItem('auth_token');
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        this.api.interceptors.response.use(
            (response) => response,
            (error: AxiosError) => {
                if (error.response?.status === 401) {
                    localStorage.removeItem('auth_token');
                    // No redirect; just clear. In a real app, you might dispatch a logout action.
                }
                return Promise.reject(error);
            }
        );
    }

    async getDashboardSummary(): Promise<DashboardSummary> {
        const { data } = await this.api.get('/dashboard/summary');
        return data;
    }

    async getProducts(filters?: { category?: string; page?: number; limit?: number }) {
        const { data } = await this.api.get('/products', { params: filters });
        return data;
    }

    async getProductById(id: string): Promise<Product> {
        const { data } = await this.api.get(`/products/${id}`);
        return data;
    }

    async createProduct(product: Omit<Product, 'id'>): Promise<Product> {
        const { data } = await this.api.post('/products', product);
        return data;
    }

    async updateProduct(id: string, product: Partial<Product>): Promise<Product> {
        const { data } = await this.api.put(`/products/${id}`, product);
        return data;
    }

    async getOrders(filters?: { status?: string; page?: number }) {
        const { data } = await this.api.get('/orders', { params: filters });
        return data;
    }

    async getOrderById(id: string): Promise<Order> {
        const { data } = await this.api.get(`/orders/${id}`);
        return data;
    }

    async updateOrderStatus(id: string, status: string): Promise<Order> {
        const { data } = await this.api.patch(`/orders/${id}/status`, { status });
        return data;
    }
}

export const apiService = new ApiService();
