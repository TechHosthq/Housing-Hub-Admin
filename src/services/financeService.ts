import apiClient from './apiClient';
import { FinanceReportResponse } from '@/types/finance';

/**
 * What the money did.
 *
 * Read-only, and that is a limit of the API rather than this client: a report that
 * could change the thing it reports on is not a report.
 */
const financeService = {
    /**
     * The period's totals. Both bounds are UTC; `to` is exclusive.
     *
     * Omit them for the current month, which is what a report is usually asked for.
     */
    getReport: async (from?: string, to?: string): Promise<FinanceReportResponse> => {
        const response = await apiClient.get('/api/AdminFinance/report', { params: { from, to } });
        return response.data;
    },
};

export default financeService;
