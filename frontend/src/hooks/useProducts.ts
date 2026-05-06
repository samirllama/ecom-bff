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

    const fetchProducts = useCallback(async () => {
        try {
            setLoading(true);
            const response = await apiService.getProducts(options);
            // Assuming response structure is { products: Product[], total: number }
            // If the BFF returns just an array, we might need to adjust this.
            // Based on apiService.getProducts, it returns 'data'.
            if (Array.isArray(response)) {
                setProducts(response);
                setTotal(response.length);
            } else {
                setProducts(response.products || []);
                setTotal(response.total || 0);
            }
            setError(null);
        } catch (err) {
            setError('Failed to fetch products');
            console.error('Products fetch error:', err);
        } finally {
            setLoading(false);
        }
    }, [options.category, options.page, options.limit]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    return { products, total, loading, error, refetch: fetchProducts };
};
