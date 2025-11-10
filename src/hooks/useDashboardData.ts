import { useState, useEffect, useCallback } from 'react';
import { getPoliciesBasic, invalidatePoliciesCache } from '@/data/policies';
import { getLeadsBasic, invalidateLeadsCache } from '@/data/leads';
import { getClientsBasic, invalidateClientsCache } from '@/data/clients';

interface DashboardData {
    policies: any[];
    leads: any[];
    clients: any[];
}

interface UseDashboardDataReturn {
    data: DashboardData;
    isLoading: boolean;
    error: string | null;
    refresh: () => Promise<void>;
    lastUpdated: Date | null;
}

/**
 * Hook personalizado para manejar datos del dashboard con cache inteligente
 */
export const useDashboardData = (): UseDashboardDataReturn => {
    const [data, setData] = useState<DashboardData>({
        policies: [],
        leads: [],
        clients: []
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    const fetchData = useCallback(async (forceRefresh = false) => {
        setIsLoading(true);
        setError(null);

        try {
            // Cargar datos básicos en paralelo para máximo rendimiento
            const [policiesData, leadsData, clientsData] = await Promise.all([
                getPoliciesBasic(),
                getLeadsBasic(),
                getClientsBasic()
            ]);

            setData({
                policies: policiesData,
                leads: leadsData,
                clients: clientsData
            });

            setLastUpdated(new Date());

            console.log('Dashboard data loaded successfully:', {
                policies: policiesData.length,
                leads: leadsData.length,
                clients: clientsData.length
            });

        } catch (err: any) {
            console.error('Error loading dashboard data:', err);
            setError(err.message || 'Error al cargar datos del dashboard');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const refresh = useCallback(async () => {
        // Invalidar todos los caches antes de recargar
        invalidatePoliciesCache();
        invalidateLeadsCache();
        invalidateClientsCache();

        await fetchData(true);
    }, [fetchData]);

    // Cargar datos iniciales
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return {
        data,
        isLoading,
        error,
        refresh,
        lastUpdated
    };
};
