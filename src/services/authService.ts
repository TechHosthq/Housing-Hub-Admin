import apiClient from './apiClient';
import {
    RequestOtpRequest,
    RequestOtpResponse,
    VerifyOtpRequest,
    VerifyOtpResponse,
    RefreshTokenRequest,
    RefreshTokenResponse
} from '@/types/auth';

const authService = {
    requestOtp: async (data: RequestOtpRequest): Promise<RequestOtpResponse> => {
        const response = await apiClient.post('/api/AdminAuth/otp/request', data);
        return response.data;
    },

    verifyOtp: async (data: VerifyOtpRequest): Promise<VerifyOtpResponse> => {
        const response = await apiClient.post('/api/AdminAuth/otp/verify', data);
        return response.data;
    },

    /**
     * Exchanges a refresh token for a new access token + rotated refresh token.
     * Called by apiClient's response interceptor on a 401, not directly by UI code.
     */
    refreshToken: async (data: RefreshTokenRequest): Promise<RefreshTokenResponse> => {
        const response = await apiClient.post('/api/AdminAuth/refresh-token', data);
        return response.data;
    }
};

export default authService;
