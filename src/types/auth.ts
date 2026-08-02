export interface User {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string | null;
    phoneNumber: string | null;
    customerType: number;
    dateCreated: string;
    role?: string;
}

export interface ApiResponse<T> {
    isSuccessful: boolean;
    data: T;
    message: string | null;
    errors: {
        propertyMessage: string | null;
        errorMessage: string | null;
    }[] | null;
}

export interface PaginatedResponse<T> {
    items: T[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
}

// Admin API returns a flat response (not wrapped in ApiResponse)
export interface AdminLoginData {
    token: string;
    email: string | null;
    firstName: string | null;
    lastName: string | null;
    id?: string | null;
    refreshToken?: string | null;
}

export interface RequestOtpRequest {
    email: string | null;
}

export type RequestOtpResponse = { message: string };

export interface VerifyOtpRequest {
    email: string | null;
    code: string | null;
}

export type VerifyOtpResponse = AdminLoginData;

export interface RefreshTokenRequest {
    refreshToken: string;
}

// Admin API returns a flat response (not wrapped in ApiResponse)
export type RefreshTokenResponse = AdminLoginData;
