import apiClient from './apiClient';
import { 
    CustomerResponse, 
    CustomersResponse, 
    UpdateProfileRequest, 
    CreateCustomerRequest,
    SubmitKycRequest, 
    KycResponse,
    DocumentUploadResponse,
    ApiResponse,
    AddressResponse,
    AddressRequest
} from '@/types/customer';

const customerService = {
    getCustomer: async (id: string): Promise<CustomerResponse> => {
        const response = await apiClient.get(`/api/AdminCustomer/${id}`);
        return response.data;
    },

    getAllCustomers: async (params: {
        pageNumber?: number;
        pageSize?: number;
        search?: string;
        isVerified?: boolean;
        isActive?: boolean;
    } = {}): Promise<CustomersResponse> => {
        const response = await apiClient.get('/api/AdminCustomer', {
            params: {
                PageNumber: params.pageNumber,
                PageSize: params.pageSize,
                Search: params.search,
                IsVerified: params.isVerified,
                IsActive: params.isActive
            }
        });
        return response.data;
    },

    createCustomer: async (data: CreateCustomerRequest): Promise<CustomerResponse> => {
        const response = await apiClient.post('/api/AdminCustomer', data);
        return response.data;
    },

    updateProfile: async (data: UpdateProfileRequest): Promise<CustomerResponse> => {
        const response = await apiClient.put('/api/AdminCustomer/profile', data);
        return response.data;
    },

    submitKyc: async (data: SubmitKycRequest): Promise<KycResponse> => {
        const response = await apiClient.post('/api/AdminCustomer/kyc', data);
        return response.data;
    },

    uploadKycDocument: async (file: File): Promise<DocumentUploadResponse> => {
        const formData = new FormData();
        formData.append('File', file);
        const response = await apiClient.post('/api/AdminCustomer/kyc/document', formData);
        return response.data;
    },

    verifyKyc: async (id: string, approve: boolean): Promise<KycResponse> => {
        const response = await apiClient.put(`/api/AdminCustomer/${id}/kyc/verify?approve=${approve}`);
        return response.data;
    },

    suspendCustomer: async (id: string): Promise<ApiResponse<boolean>> => {
        const response = await apiClient.put(`/api/AdminCustomer/${id}/suspend`);
        return response.data;
    },

    reactivateCustomer: async (id: string): Promise<ApiResponse<boolean>> => {
        const response = await apiClient.put(`/api/AdminCustomer/${id}/reactivate`);
        return response.data;
    },

    deleteCustomer: async (id: string): Promise<ApiResponse<boolean>> => {
        const response = await apiClient.delete(`/api/AdminCustomer/${id}`);
        return response.data;
    },

    // Address Endpoints
    getMyAddress: async (): Promise<AddressResponse> => {
        const response = await apiClient.get('/api/AdminCustomerAddress/my');
        return response.data;
    },

    getAddressById: async (id: string): Promise<AddressResponse> => {
        const response = await apiClient.get(`/api/AdminCustomerAddress/${id}`);
        return response.data;
    },

    updateAddress: async (data: AddressRequest): Promise<AddressResponse> => {
        const response = await apiClient.post('/api/AdminCustomerAddress', data);
        return response.data;
    }
};

export default customerService;
