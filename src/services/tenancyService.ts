import apiClient from './apiClient';
import { ApiResponse } from '@/types/auth';
import {
    AdminTenancyDetailResponse,
    PaginatedAdminTenanciesResponse,
    TenancyStatus,
} from '@/types/tenancy';

/**
 * Tenancies, for staff.
 *
 * Read-only, and that is a limit of the API rather than of this client. A tenancy
 * is an agreement between two people: an endpoint letting an admin accept a
 * document or change a fee would manufacture an executed agreement neither party
 * made, and — unlike a refund, which the provider can always be asked about —
 * nothing outside this system could contradict it afterwards.
 */
const tenancyService = {
    getAll: async (params: {
        pageNumber?: number;
        pageSize?: number;
        status?: TenancyStatus;
    } = {}): Promise<PaginatedAdminTenanciesResponse> => {
        const response = await apiClient.get('/api/AdminTenancy', {
            params: {
                pageNumber: params.pageNumber ?? 1,
                pageSize: params.pageSize ?? 20,
                status: params.status,
            },
        });
        return response.data;
    },

    getById: async (tenancyId: string): Promise<AdminTenancyDetailResponse> => {
        const response = await apiClient.get(`/api/AdminTenancy/${tenancyId}`);
        return response.data;
    },

    /**
     * A short-lived link to one document's file. SuperAdmin only, server-side.
     *
     * These are somebody's employment letter, their references, their signed
     * agreement. The metadata and the signature trail answer almost every question
     * staff have without this; opening the file is for a dispute, and the server
     * logs each one.
     */
    getDocumentUrl: async (
        tenancyId: string, documentId: string, submitted: boolean,
    ): Promise<ApiResponse<string>> => {
        const response = await apiClient.get(
            `/api/AdminTenancy/${tenancyId}/documents/${documentId}/url`,
            { params: { submitted } },
        );
        return response.data;
    },
};

export default tenancyService;
