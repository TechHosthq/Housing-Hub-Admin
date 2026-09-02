import { useQuery } from '@tanstack/react-query';
import paymentService from '@/services/paymentService';
import { PaymentStatus } from '@/types/payment';

/**
 * How often the flagged count is refreshed.
 *
 * A flagged payment means somebody has paid and received nothing, so the cost of
 * finding out late is borne by a customer rather than by us. A minute is often
 * enough that an admin with the dashboard open notices without being asked to
 * refresh, and rare enough to be a single indexed query.
 */
const FLAGGED_COUNT_REFRESH_MS = 60_000;

export const usePayment = () => {
    const usePaymentList = (params: {
        pageNumber?: number;
        pageSize?: number;
        status?: PaymentStatus;
    } = {}) => useQuery({
        queryKey: ['admin-payments', params],
        queryFn: () => paymentService.getAll(params),
    });

    const useFlaggedPayments = () => useQuery({
        queryKey: ['admin-payments-flagged'],
        queryFn: () => paymentService.getFlagged(),
    });

    const useFlaggedCount = () => useQuery({
        queryKey: ['admin-payments-flagged-count'],
        queryFn: () => paymentService.getFlaggedCount(),
        refetchInterval: FLAGGED_COUNT_REFRESH_MS,
    });

    const usePaymentByReference = (reference: string | null) => useQuery({
        queryKey: ['admin-payment', reference],
        queryFn: () => paymentService.getByReference(reference!),
        enabled: !!reference,
    });

    return {
        usePaymentList,
        useFlaggedPayments,
        useFlaggedCount,
        usePaymentByReference,
    };
};
