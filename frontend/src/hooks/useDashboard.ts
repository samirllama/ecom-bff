// frontend/src/hooks/useDashboard.ts
import { useState, useEffect, useCallback } from 'react';
import { DashboardSummary } from '@shared/dashboard';
import { apiService } from '../services/api';

/**
 * Hook for fetching the resilient dashboard summary.
 *
 * Returns:
 *  `data` – the full dashboard object (including `sources` health map)
 *  `loading` – true while the request is in flight
 *  `globalError` – a message if the entire fetch fails (network, BFF crash)
 *  `refetch` – manual refresh function
 *
 * Per‑widget health is available via `data?.sources` – check
 * `data.sources.productCount`, `data.sources.activeUsers`, etc.
 */
export const useDashboard = () => {
    const [data, setData] = useState<DashboardSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [globalError, setGlobalError] = useState<string | null>(null);

    const fetchDashboard = useCallback(
        async (signal?: AbortSignal) => {
            setLoading(true);

            try {
                const summary = await apiService.getDashboardSummary(signal);
                setData(summary);
                setGlobalError(null); // clear any previous global error
            } catch (err: unknown) {
                // Ignore intentional cancellations triggered by React Strict Mode or unmounts
                if (err instanceof DOMException && err.name === 'AbortError') return;
                if (err instanceof Error && err.name === 'AbortError') return;
                // Axios CanceledError (if used) also has name 'CanceledError' – handle both
                if (err && typeof err === 'object' && 'name' in err && (err.name === 'CanceledError' || err.name === 'AbortError')) return;

                console.error('Dashboard fetch error:', err);
                setGlobalError('Failed to fetch dashboard data');
            } finally {
                setLoading(false);
            }
        },
        []
    );

    useEffect(() => {
        const controller = new AbortController();
        fetchDashboard(controller.signal);

        return () => {
            controller.abort();
        };
    }, [fetchDashboard]);

    const refetch = useCallback(() => {
        return fetchDashboard(); // create a new AbortController if needed? We can omit signal for manual refetch.
    }, [fetchDashboard]);

    return { data, loading, globalError, refetch };
};
