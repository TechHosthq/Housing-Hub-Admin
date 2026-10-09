import { useQuery } from '@tanstack/react-query';
import tenancyService from '@/services/tenancyService';
import { TenancyStatus } from '@/types/tenancy';

/**
 * No mutations, by design.
 *
 * There is nothing here for staff to change — see tenancyService. A hook with an
 * empty mutation surface is the honest shape of that, rather than one that offers
 * actions the API will refuse.
 */
export const useTenancy = () => {
    const useTenancyList = (params: {
        pageNumber?: number;
        pageSize?: number;
        status?: TenancyStatus;
    } = {}) => useQuery({
        queryKey: ['admin-tenancies', params],
        queryFn: () => tenancyService.getAll(params),
    });

    const useTenancyDetail = (tenancyId: string | null) => useQuery({
        queryKey: ['admin-tenancy', tenancyId],
        queryFn: () => tenancyService.getById(tenancyId!),
        enabled: !!tenancyId,
    });

    /**
     * Not a query.
     *
     * The link is short-lived and is itself the credential — caching it under a
     * query key would keep a readable URL to somebody's tenancy agreement in memory
     * long after it stopped working. Call it on click, use it, drop it.
     */
    const fetchDocumentUrl = (tenancyId: string, documentId: string, submitted: boolean) =>
        tenancyService.getDocumentUrl(tenancyId, documentId, submitted);

    return { useTenancyList, useTenancyDetail, fetchDocumentUrl };
};
