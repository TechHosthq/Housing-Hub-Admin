import axios from 'axios';
import { useToastStore } from '@/store/useToastStore';
import { resolveApiError } from '@/utils/errorResolver';
import { useAuthStore } from '@/store/useAuthStore';

const isProxyEnabled = typeof window !== 'undefined' && process.env.NEXT_PUBLIC_ENABLE_PROXY === 'true';
const API_BASE_URL = 'https://3tgjb2crdf.execute-api.af-south-1.amazonaws.com/admin';

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

// Add a request interceptor to include the auth token
apiClient.interceptors.request.use(
    (config) => {
        const token = typeof window !== 'undefined' ? (localStorage.getItem('auth-storage') 
            ? JSON.parse(localStorage.getItem('auth-storage') || '{}')?.state?.token 
            : null) : null;
        
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
    (error) => {
        // Handle 401 Unauthorized errors
        if (error.response?.status === 401) {
            if (typeof window !== 'undefined') {
                useAuthStore.getState().clearAuth();
            }
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
