// frontend/src/hooks/useProducts.ts
import { useState, useEffect, useCallback } from 'react';
import { Product } from '@shared/dashboard';
import { apiService } from '../services/api';

interface UseProductsOptions {
    category?: string;
    page?: number;
    limit?: number;
}

export const useProducts = (options: UseProductsOptions = {}) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchProducts = useCallback(async (signal?: AbortSignal) => {
        try {
            setLoading(true);
            const response = await apiService.getProducts(options, signal);
            // Assuming response structure is { products: Product[], total: number }
            if (Array.isArray(response)) {
                setProducts(response);
                setTotal(response.length);
            } else {
                setProducts(response.products || []);
                setTotal(response.total || 0);
            }
            setError(null);
        } catch (err: any) {
            if (err.name === 'CanceledError' || err.name === 'AbortError') {
                return;
            }
            setError('Failed to fetch products');
            console.error('Products fetch error:', err);
        } finally {
            setLoading(false);
        }
    }, [options.category, options.page, options.limit]);

    useEffect(() => {
        const controller = new AbortController();
        fetchProducts(controller.signal);

        return () => {
            controller.abort();
        };
    }, [fetchProducts]);

    return { products, total, loading, error, refetch: () => fetchProducts() };
};
