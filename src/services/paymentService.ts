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
 * Read-only, and that is a limit of the API rather than of this client. An
 * endpoint that let an admin mark a payment successful would be a way to grant
 * paid services with no money moving, and the row it wrote would be
 * indistinguishable from a genuine settlement. Refunds happen in Paystack's
 * dashboard, against the transaction that actually exists.
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
};

export default paymentService;
