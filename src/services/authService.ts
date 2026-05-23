import apiClient from './apiClient';
import { 
    LoginRequest, 
    LoginResponse, 
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
    GoogleAuthResponse
} from '@/types/auth';

const authService = {
    register: async (data: RegisterRequest): Promise<RegisterResponse> => {
        const response = await apiClient.post('/api/AdminAuth/register', data);
        return response.data;
    },

    login: async (data: LoginRequest): Promise<LoginResponse> => {
        const response = await apiClient.post('/api/AdminAuth/login', data);
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
    }
};

export default authService;
