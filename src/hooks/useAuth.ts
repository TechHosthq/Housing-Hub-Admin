import { useMutation } from '@tanstack/react-query';
import authService from '@/services/authService';
import { useAuthStore } from '@/store/useAuthStore';
import { useToastStore } from '@/store/useToastStore';
import { resolveApiError } from '@/utils/errorResolver';
import { 
    LoginRequest, 
    RegisterRequest, 
    ForgotPasswordRequest, 
    ResetPasswordRequest, 
    VerifyEmailRequest,
    ChangePasswordRequest
} from '@/types/auth';

export const useAuth = () => {
    const setAuth = useAuthStore((state) => state.setAuth);
    const clearAuth = useAuthStore((state) => state.clearAuth);

    const loginMutation = useMutation({
        mutationFn: (data: LoginRequest) => authService.login(data),
        onSuccess: (response) => {
            // Admin API returns a flat response: { token, email, firstName, lastName, ... }
            // (not the wrapped ApiResponse<AuthData> shape)
            const token = response?.token;
            if (token) {
                const { token: _tok, ...user } = response;
                setAuth(user as any, token);
            }
        },
    });

    const registerMutation = useMutation({
        mutationFn: (data: RegisterRequest) => authService.register(data),
    });

    const verifyEmailMutation = useMutation({
        mutationFn: (data: VerifyEmailRequest) => authService.verifyEmail(data),
    });

    const forgotPasswordMutation = useMutation({
        mutationFn: (data: ForgotPasswordRequest) => authService.forgotPassword(data),
    });

    const resetPasswordMutation = useMutation({
        mutationFn: (data: ResetPasswordRequest) => authService.resetPassword(data),
    });

    const changePasswordMutation = useMutation({
        mutationFn: (data: ChangePasswordRequest) => authService.changePassword(data),
    });

    const logout = () => {
        clearAuth();
    };

    return {
        user: useAuthStore((state) => state.user),
        isAuthenticated: useAuthStore((state) => state.isAuthenticated),
        login: loginMutation.mutate,
        isLoggingIn: loginMutation.isPending,
        loginError: loginMutation.error,
        
        register: registerMutation.mutate,
        isRegistering: registerMutation.isPending,
        registerError: registerMutation.error,
        registerSuccess: registerMutation.isSuccess && registerMutation.data?.isSuccessful,

        verifyEmail: verifyEmailMutation.mutate,
        isVerifyingEmail: verifyEmailMutation.isPending,

        forgotPassword: forgotPasswordMutation.mutate,
        isSendingForgotEmail: forgotPasswordMutation.isPending,
        forgotPasswordSuccess: forgotPasswordMutation.isSuccess,
        forgotPasswordMessage: forgotPasswordMutation.data?.message ?? null,

        resetPassword: resetPasswordMutation.mutate,
        isResettingPassword: resetPasswordMutation.isPending,
        resetPasswordSuccess: resetPasswordMutation.isSuccess,

        changePassword: changePasswordMutation.mutate,
        isChangingPassword: changePasswordMutation.isPending,

        logout,
    };
};

export const useGoogleAuth = () => {
    const setAuth = useAuthStore((state) => state.setAuth);
    const showError = useToastStore((state) => state.showError);

    const googleAuthMutation = useMutation({
        mutationFn: (idToken: string) => authService.googleAuth({ idToken }),
        onSuccess: (response) => {
            if (response.isSuccessful && response.data.token) {
                const { token, ...user } = response.data;
                setAuth(user, token);
            }
        },
    });

    // Use mutation (not query) so we get proper error state on user-triggered fetches
    const getGoogleLoginUrlMutation = useMutation({
        mutationFn: () => authService.getGoogleLoginUrl(),
        onError: (error: any) => {
            // GET errors bypass the apiClient interceptor toast — handle explicitly
            const messages = resolveApiError(
                error?.data ? { response: error } : error
            );
            showError(messages);
        },
    });

    return {
        googleAuth: googleAuthMutation.mutate,
        isGoogleAuthing: googleAuthMutation.isPending || getGoogleLoginUrlMutation.isPending,
        getGoogleLoginUrl: getGoogleLoginUrlMutation.mutateAsync,
    };
};
