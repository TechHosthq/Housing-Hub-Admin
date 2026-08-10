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
    },

    /**
     * Ends the session server-side by revoking the refresh token.
     *
     * Signing out previously only cleared local state, leaving the refresh token valid
     * for its full 30-day life — a real exposure on a shared or unattended machine.
     *
     * Never throws: the client discards its state regardless, and a network failure
     * must not trap an admin on a screen they've asked to leave.
     */
    logout: async (refreshToken: string | null, allSessions = false): Promise<void> => {
        if (!refreshToken) return;
        try {
            await apiClient.post('/api/AdminAuth/logout', { refreshToken, allSessions });
        } catch {
            // Intentionally swallowed — see above.
        }
    }
};

export default authService;
