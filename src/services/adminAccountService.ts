import apiClient from './apiClient';
import { ApiResponse } from '@/types/auth';

export interface AdminProfile {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string | null;
    dateCreated: string;
    isActive: boolean;
}

export interface StaffMember {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string | null;
    dateCreated: string;
    isActive: boolean;
}

export const adminAccountService = {
    getProfile: async (): Promise<AdminProfile> => {
        const response = await apiClient.get('/api/AdminAccount/profile');
        return response.data;
    },

    updateProfile: async (data: { firstName: string | null; lastName: string | null }): Promise<ApiResponse<boolean>> => {
        const response = await apiClient.put('/api/AdminAccount/profile', data);
        return response.data;
    },

    changePassword: async (data: { currentPassword: string | null; newPassword: string | null }): Promise<ApiResponse<boolean>> => {
        const response = await apiClient.put('/api/AdminAccount/password', data);
        return response.data;
    },

    getStaff: async (): Promise<StaffMember[]> => {
        const response = await apiClient.get('/api/AdminAccount/staff');
        return response.data;
    },

    createStaff: async (data: { 
        firstName: string | null; 
        lastName: string | null; 
        email: string | null; 
        password: string | null; 
    }): Promise<ApiResponse<StaffMember>> => {
        const response = await apiClient.post('/api/AdminAuth/create', data);
        return response.data;
    },

    deactivateStaff: async (id: string): Promise<ApiResponse<boolean>> => {
        const response = await apiClient.put(`/api/AdminAccount/staff/${id}/deactivate`);
        return response.data;
    },

    reactivateStaff: async (id: string): Promise<ApiResponse<boolean>> => {
        const response = await apiClient.put(`/api/AdminAccount/staff/${id}/reactivate`);
        return response.data;
    }
};

export default adminAccountService;
