import axios from 'axios';
import { Product, ProductsResponse } from '@shared/dashboard';
import { logger } from '../utils/logger';

const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL || 'http://localhost:3002';

export class ProductService {
    async getProductCount(): Promise<number> {
        try {
            const response = await axios.get<{ count: number }>(`${PRODUCT_SERVICE_URL}/products/count`);
            return response.data.count;
        } catch (error) {
            logger.error('Error fetching product count:', error);
            return 0;
        }
    }

    async getTopProducts(limit: number = 5): Promise<Product[]> {
        try {
            const response = await axios.get<Product[]>(`${PRODUCT_SERVICE_URL}/products/top`, {
                params: { limit },
            });
            return response.data;
        } catch (error) {
            logger.error('Error fetching top products:', error);
            return [];
        }
    }

    async getProducts(filters?: Record<string, any>): Promise<ProductsResponse> {
        try {
            const response = await axios.get<ProductsResponse>(`${PRODUCT_SERVICE_URL}/products`, {
                params: filters,
            });
            return response.data;
        } catch (error) {
            logger.error('Error fetching products:', error);
            throw error;
        }
    }

    async getProductById(id: string): Promise<Product | null> {
        try {
            const response = await axios.get<Product>(`${PRODUCT_SERVICE_URL}/products/${id}`);
            return response.data;
        } catch (error: any) {
            if (error.response?.status === 404) return null;
            logger.error(`Error fetching product ${id}:`, error);
            throw error;
        }
    }

    async createProduct(product: Omit<Product, 'id'>): Promise<Product> {
        try {
            const response = await axios.post<Product>(`${PRODUCT_SERVICE_URL}/products`, product);
            return response.data;
        } catch (error) {
            logger.error('Error creating product:', error);
            throw error;
        }
    }

    async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
        try {
            const response = await axios.put<Product>(`${PRODUCT_SERVICE_URL}/products/${id}`, updates);
            return response.data;
        } catch (error) {
            logger.error(`Error updating product ${id}:`, error);
            throw error;
        }
    }
}
