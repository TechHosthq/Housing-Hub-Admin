import { useMutation } from '@tanstack/react-query';
import authService from '@/services/authService';
import type { User } from "@/types/auth";
import { useAuthStore } from '@/store/useAuthStore';
import { RequestOtpRequest, VerifyOtpRequest } from '@/types/auth';

export const useAuth = () => {
    const setAuth = useAuthStore((state) => state.setAuth);
    const clearAuth = useAuthStore((state) => state.clearAuth);

    const requestOtpMutation = useMutation({
        mutationFn: (data: RequestOtpRequest) => authService.requestOtp(data),
    });

    const verifyOtpMutation = useMutation({
        mutationFn: (data: VerifyOtpRequest) => authService.verifyOtp(data),
        onSuccess: (response) => {
            // Admin API returns a flat response: { token, email, firstName, lastName, ... }
            // (not the wrapped ApiResponse<AuthData> shape)
            const token = response?.token;
            if (token) {
                // The admin API returns the user flat alongside the tokens rather
                // than nested, so the rest of the object *is* the user.
                const { token: _tok, refreshToken, ...user } = response;
                setAuth(user as User, token, refreshToken);
            }
        },
    });

    const logout = () => {
        clearAuth();
    };

    return {
        user: useAuthStore((state) => state.user),
        isAuthenticated: useAuthStore((state) => state.isAuthenticated),
        requestOtp: requestOtpMutation.mutate,
        isRequestingOtp: requestOtpMutation.isPending,
        requestOtpError: requestOtpMutation.error,
        requestOtpSuccess: requestOtpMutation.isSuccess,

        verifyOtp: verifyOtpMutation.mutate,
        isVerifyingOtp: verifyOtpMutation.isPending,
        verifyOtpError: verifyOtpMutation.error,

        logout,
    };
};
