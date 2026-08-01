import apiClient from './apiClient';
import {
    RequestOtpRequest,
    RequestOtpResponse,
    VerifyOtpRequest,
    VerifyOtpResponse,
    RegisterRequest,
    RegisterResponse, 
    VerifyEmailRequest, 
    VerifyEmailResponse,
    ForgotPasswordRequest, 
    ForgotPasswordResponse,
    ResetPasswordRequest, 
    ResetPasswordResponse,
    ChangePasswordRequest,
    ChangePasswordResponse,
    GoogleAuthRequest,
    GoogleAuthResponse,
    RefreshTokenRequest,
    RefreshTokenResponse
} from '@/types/auth';

const authService = {
    register: async (data: RegisterRequest): Promise<RegisterResponse> => {
        const response = await apiClient.post('/api/AdminAuth/register', data);
        return response.data;
    },

    requestOtp: async (data: RequestOtpRequest): Promise<RequestOtpResponse> => {
        const response = await apiClient.post('/api/AdminAuth/otp/request', data);
        return response.data;
    },

    verifyOtp: async (data: VerifyOtpRequest): Promise<VerifyOtpResponse> => {
        const response = await apiClient.post('/api/AdminAuth/otp/verify', data);
        return response.data;
    },

    verifyEmail: async (data: VerifyEmailRequest): Promise<VerifyEmailResponse> => {
        const response = await apiClient.post('/api/AdminAuth/verify-email', data);
        return response.data;
    },

    forgotPassword: async (data: ForgotPasswordRequest): Promise<ForgotPasswordResponse> => {
        const response = await apiClient.post('/api/AdminAuth/forgot-password', data);
        return response.data;
    },

    resetPassword: async (data: ResetPasswordRequest): Promise<ResetPasswordResponse> => {
        const response = await apiClient.post('/api/AdminAuth/reset-password', data);
        return response.data;
    },

    changePassword: async (data: ChangePasswordRequest): Promise<ChangePasswordResponse> => {
        const response = await apiClient.post('/api/AdminAuth/change-password', data);
        return response.data;
    },

    googleAuth: async (data: GoogleAuthRequest): Promise<GoogleAuthResponse> => {
        const response = await apiClient.post('/api/AdminAuth/google', data);
        return response.data;
    },

    getGoogleLoginUrl: async (): Promise<{ url: string }> => {
        const returnUrl = `${window.location.origin}/auth/google-callback`;
        const response = await apiClient.get(`/api/AdminAuth/google-login?returnUrl=${encodeURIComponent(returnUrl)}`);
        return response.data;
    },

    handleGoogleCallback: async (code: string): Promise<GoogleAuthResponse> => {
        const response = await apiClient.get(`/api/AdminAuth/google-callback?code=${code}`);
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
