import apiClient from './apiClient';
import { CustomerResponse, CustomersResponse, KycResponse, ApiResponse } from '@/types/customer';

export const ownerService = {
    getOwner: async (id: string): Promise<CustomerResponse> => {
        const response = await apiClient.get(`/api/AdminOwner/${id}`);
        return response.data;
    },

    getAllOwners: async (params: {
        pageNumber?: number;
        pageSize?: number;
        search?: string;
        isVerified?: boolean;
        isActive?: boolean;
        type?: number;
    } = {}): Promise<CustomersResponse> => {
        const response = await apiClient.get('/api/AdminOwner', {
            params: {
                PageNumber: params.pageNumber,
                PageSize: params.pageSize,
                Search: params.search,
                IsVerified: params.isVerified,
                IsActive: params.isActive,
                type: params.type
            }
        });
        return response.data;
    },

    verifyKyc: async (id: string, approve: boolean): Promise<KycResponse> => {
        const response = await apiClient.put(`/api/AdminOwner/${id}/kyc/verify?approve=${approve}`);
        return response.data;
    },

    suspendOwner: async (id: string): Promise<ApiResponse<boolean>> => {
        const response = await apiClient.put(`/api/AdminOwner/${id}/suspend`);
        return response.data;
    },

    reactivateOwner: async (id: string): Promise<ApiResponse<boolean>> => {
        const response = await apiClient.put(`/api/AdminOwner/${id}/reactivate`);
        return response.data;
    }
};

export default ownerService;
