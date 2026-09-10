import apiClient from './apiClient';
import {
    AdminPaymentResponse,
    AdminPaymentsResponse,
    FlaggedCountResponse,
    PaginatedAdminPaymentsResponse,
    PaymentStatus,
} from '@/types/payment';

/**
 * Payments, for staff.
 *
 * Read-only except for refunds, and that is a limit of the API rather than of this
 * client. An endpoint that let an admin mark a payment successful, unflag one or
 * edit an amount would each be a way to grant a paid service with no money moving,
 * and the row it wrote would be indistinguishable from the genuine thing.
 */
const paymentService = {
    getAll: async (params: {
        pageNumber?: number;
        pageSize?: number;
        status?: PaymentStatus;
    } = {}): Promise<PaginatedAdminPaymentsResponse> => {
        const response = await apiClient.get('/api/AdminPayment', {
            params: {
                pageNumber: params.pageNumber ?? 1,
                pageSize: params.pageSize ?? 20,
                status: params.status,
            },
        });
        return response.data;
    },

    /**
     * Payments where money may have moved and nothing was handed over.
     *
     * Reads a sparse index rather than filtering the full table, so this stays
     * cheap as successful payments accumulate.
     */
    getFlagged: async (): Promise<AdminPaymentsResponse> => {
        const response = await apiClient.get('/api/AdminPayment/flagged');
        return response.data;
    },

    getFlaggedCount: async (): Promise<FlaggedCountResponse> => {
        const response = await apiClient.get('/api/AdminPayment/flagged/count');
        return response.data;
    },

    getByReference: async (reference: string): Promise<AdminPaymentResponse> => {
        const response = await apiClient.get(`/api/AdminPayment/${reference}`);
        return response.data;
    },

    /**
     * Sends a payment back. SuperAdmin only, server-side.
     *
     * Note what is not sent: an amount. The figure refunded is whatever the provider
     * says actually arrived, which on a flagged payment is not what was asked for —
     * so an admin cannot choose it, and cannot get it wrong. A partial refund goes
     * through Paystack's own dashboard.
     */
    refund: async (reference: string, reason: string): Promise<AdminPaymentResponse> => {
        const response = await apiClient.post(`/api/AdminPayment/${reference}/refund`, { reason });
        return response.data;
    },
};

export default paymentService;
