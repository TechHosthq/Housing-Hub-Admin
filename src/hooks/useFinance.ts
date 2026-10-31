import { useQuery } from '@tanstack/react-query';
import financeService from '@/services/financeService';

/**
 * No mutations: there is nothing here to change. See financeService.
 */
export const useFinance = () => {
    const useFinanceReport = (from?: string, to?: string) => useQuery({
        queryKey: ['admin-finance-report', from ?? null, to ?? null],
        queryFn: () => financeService.getReport(from, to),
    });

    return { useFinanceReport };
};
