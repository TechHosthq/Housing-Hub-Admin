import axios from 'axios';
import { useToastStore } from '@/store/useToastStore';
import { resolveApiError } from '@/utils/errorResolver';
import { useAuthStore } from '@/store/useAuthStore';

const isProxyEnabled = typeof window !== 'undefined' && process.env.NEXT_PUBLIC_ENABLE_PROXY === 'true';

// Configurable per environment. This was previously a hardcoded API Gateway URL
// with no override, so a staging or local build silently pointed at the deployed
// admin API.
//
// The fallback is now local-only. In a production build an unset variable throws
// rather than defaulting to dev: this dashboard approves verification cases and
// promotes staff, and a reviewer acting on the wrong environment while believing
// they are on the right one is the worst failure this app has. `next build`
// evaluates this, so it surfaces in CI, not in front of a reviewer.
const resolveApiBaseUrl = (): string => {
    const configured = process.env.NEXT_PUBLIC_ADMIN_API_URL;
    if (configured) return configured;

    if (process.env.NODE_ENV === 'production') {
        throw new Error(
            'NEXT_PUBLIC_ADMIN_API_URL is not set. Set it on this Vercel environment — '
            + 'refusing to fall back to the dev admin API in a production build.',
        );
    }

    return 'https://3tgjb2crdf.execute-api.af-south-1.amazonaws.com/admin';
};

const API_BASE_URL = resolveApiBaseUrl();

const baseURL = isProxyEnabled ? '/api/proxy' : API_BASE_URL;
if (typeof window === 'undefined') {
    console.log('Server-side API baseURL:', baseURL);
}

const apiClient = axios.create({
    baseURL,
    headers: {
        'Content-Type': 'application/json',
    },
});

function readAuthStorage(): { token: string | null; refreshToken: string | null } {
    if (typeof window === 'undefined') return { token: null, refreshToken: null };
    try {
        const state = JSON.parse(localStorage.getItem('auth-storage') || '{}')?.state;
        return { token: state?.token ?? null, refreshToken: state?.refreshToken ?? null };
    } catch {
        return { token: null, refreshToken: null };
    }
}

// Add a request interceptor to include the auth token
apiClient.interceptors.request.use(
    (config) => {
        const { token } = readAuthStorage();

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // If we are sending FormData, let the browser/Axios set the Content-Type with boundary dynamically
        if (config.data instanceof FormData) {
            delete config.headers['Content-Type'];
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

const REFRESH_TOKEN_PATH = '/api/AdminAuth/refresh-token';

/**
 * At most one refresh-token exchange is ever in flight at a time. Refresh
 * tokens rotate on every use — a second concurrent call with the same
 * (now-stale) token would look like a replay to the backend and revoke every
 * session. Every 401 that arrives while a refresh is already running just
 * awaits that same promise instead of starting its own.
 */
let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
    if (refreshPromise) return refreshPromise;

    refreshPromise = (async () => {
        const { refreshToken } = readAuthStorage();
        if (!refreshToken) return null;

        try {
            // Plain axios, not `apiClient` — this must never itself pass back through
            // the response interceptor below, or a failed refresh would try to refresh.
            const response = await axios.post(`${baseURL}${REFRESH_TOKEN_PATH}`, { refreshToken });
            const data = response.data;
            if (!data?.token) return null;

            const { token, refreshToken: newRefreshToken, ...user } = data;
            useAuthStore.getState().setAuth(user, token, newRefreshToken);
            return token as string;
        } catch {
            return null;
        }
    })();

    try {
        return await refreshPromise;
    } finally {
        refreshPromise = null;
    }
}

// Add a response interceptor to handle errors globally
apiClient.interceptors.response.use(
    (response) => {
        // Handle logical failures from APIs that return 200 OK with isSuccessful: false
        if (response.data && response.data.isSuccessful === false) {
            const method = response.config?.method?.toUpperCase() || '';
            if (['POST', 'PUT', 'DELETE'].includes(method)) {
                // We wrap the response in an object that resolveApiError expects
                const errorMessages = resolveApiError({ response });
                useToastStore.getState().showError(errorMessages);
            }
            return Promise.reject(response);
        }
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // Handle 401 Unauthorized errors by attempting a silent refresh-and-retry —
        // but never for the refresh call itself, or a bad refresh token would loop.
        if (
            error.response?.status === 401 &&
            typeof window !== 'undefined' &&
            !originalRequest?._retriedAfterRefresh &&
            !originalRequest?.url?.includes(REFRESH_TOKEN_PATH)
        ) {
            originalRequest._retriedAfterRefresh = true;
            const newToken = await refreshAccessToken();

            if (newToken) {
                originalRequest.headers = originalRequest.headers || {};
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                return apiClient(originalRequest);
            }

            useAuthStore.getState().clearAuth();
        }

        // Display toast for POST, PUT, DELETE errors
        const method = error.config?.method?.toUpperCase() || '';
        if (['POST', 'PUT', 'DELETE'].includes(method)) {
            const errorMessages = resolveApiError(error);
            useToastStore.getState().showError(errorMessages);
        }

        return Promise.reject(error);
    }
);

export default apiClient;
