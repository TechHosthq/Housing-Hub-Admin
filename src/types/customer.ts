import { ApiResponse, User, PaginatedResponse } from "./auth";
export type { ApiResponse };

export interface Address {
    id: string;
    dateCreated: string;
    dateModified: string;
    street: string | null;
    city: string | null;
    state: string | null;
    country: string | null;
    postalCode: string | null;
    customerId: string;
}

export interface Customer extends User {
    nationalIdNumber: string | null;
    idDocumentUrl: string | null;
    kycSubmittedAt: string | null;
    isKycVerified: boolean;
    jobTitle: string | null;
    companyName: string | null;
    industry: string | null;
    address: Address | null;
    dateOfBirth: string | null;
    isActive?: boolean;
    kycPending?: boolean;
    dateJoined?: string;
    pendingInspections?: number;
}

export interface UpdateProfileRequest {
    customerId: string;
    firstName: string | null;
    lastName: string | null;
    phoneNumber: string | null;
    dateOfBirth: string | null;
    jobTitle: string | null;
    companyName: string | null;
    industry: string | null;
}

export interface CreateCustomerRequest {
    firstName: string | null;
    lastName: string | null;
    email: string | null;
    phoneNumber: string | null;
    customerType: number;
    dateOfBirth: string | null;
}

export interface AddressRequest {
    street: string | null;
    city: string | null;
    state: string | null;
    country: string | null;
    postalCode: string | null;
    customerId: string;
}

export interface SubmitKycRequest {
    customerId: string;
    dateOfBirth: string | null;
    nationalIdNumber: string | null;
    idType: number;
    idDocumentUrl: string | null;
    jobTitle: string | null;
    companyName: string | null;
    industry: string | null;
}

export type CustomerResponse = ApiResponse<Customer>;
export type CustomersResponse = ApiResponse<PaginatedResponse<Customer>>;
export type KycResponse = ApiResponse<boolean>;
export type DocumentUploadResponse = ApiResponse<string | null>;
export type AddressResponse = ApiResponse<Address>;
