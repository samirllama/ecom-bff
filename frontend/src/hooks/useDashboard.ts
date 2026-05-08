// frontend/src/hooks/useDashboard.ts
import { useState, useEffect, useCallback } from 'react';
import { DashboardSummary } from '@shared/dashboard';
import { apiService } from '../services/api';

export const useDashboard = () => {
    const [data, setData] = useState<DashboardSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchDashboard = useCallback(async (signal?: AbortSignal) => {
        try {
            setLoading(true);
            const summary = await apiService.getDashboardSummary(signal);
            setData(summary);
            setError(null);
        } catch (err: any) {
            if (err.name === 'CanceledError' || err.name === 'AbortError') {
                return;
            }
            setError('Failed to fetch dashboard data');
            console.error('Dashboard fetch error:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const controller = new AbortController();
        fetchDashboard(controller.signal);

        return () => {
            controller.abort();
        };
    }, [fetchDashboard]);

    return { data, loading, error, refetch: () => fetchDashboard() };
};
