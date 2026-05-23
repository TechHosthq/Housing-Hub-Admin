import apiClient from './apiClient';
import { 
    InspectionResponse, 
    InspectionsResponse
} from '@/types/inspection';
import { ApiResponse } from '@/types/auth';

const inspectionService = {
    getInspection: async (id: string): Promise<InspectionResponse> => {
        const response = await apiClient.get(`/api/AdminInspection/${id}`);
        return response.data;
    },

    getAllInspections: async (params: {
        pageNumber?: number;
        pageSize?: number;
        status?: number;
        date?: string;
        propertyId?: string;
        customerId?: string;
    } = {}): Promise<InspectionsResponse> => {
        const response = await apiClient.get('/api/AdminInspection', {
            params: {
                PageNumber: params.pageNumber,
                PageSize: params.pageSize,
                Status: params.status,
                Date: params.date,
                PropertyId: params.propertyId,
                CustomerId: params.customerId
            }
        });
        return response.data;
    },

    getInspectionsByProperty: async (propertyId: string, pageNumber: number = 1, pageSize: number = 20): Promise<InspectionsResponse> => {
        // Note: /api/AdminProperty/{id}/inspections returns 500 on the backend.
        // Workaround: use the AdminInspection list endpoint filtered by PropertyId,
        // which returns the same paginated data and is fully functional.
        const response = await apiClient.get('/api/AdminInspection', {
            params: {
                PageNumber: pageNumber,
                PageSize: pageSize,
                PropertyId: propertyId,
            }
        });
        return response.data;
    },

    confirmInspection: async (id: string): Promise<InspectionResponse> => {
        const response = await apiClient.put(`/api/AdminInspection/${id}/confirm`);
        return response.data;
    },

    declineInspection: async (id: string, declineNote?: string): Promise<InspectionResponse> => {
        const response = await apiClient.put(`/api/AdminInspection/${id}/decline`, null, {
            params: { declineNote }
        });
        return response.data;
    },

    cancelInspection: async (id: string): Promise<ApiResponse<boolean>> => {
        const response = await apiClient.put(`/api/AdminInspection/${id}/cancel`);
        return response.data;
    }
};

export default inspectionService;
