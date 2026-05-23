import { ApiResponse, PaginatedResponse } from "./auth";

export enum PropertyType {
    House = 0,
    Apartment = 1,
    Guesthouse = 2,
    Flat = 3,
    Duplex = 4
}

export enum AvailabilityStatus {
    Available = 1,
    Occupied = 2,
    Sold = 3
}

export enum PropertyLeaseType {
    Rent = 0,
    Sale = 1
}

export interface PropertyFile {
    id: string;
    dateCreated: string;
    dateModified: string;
    fileUrl: string | null;
    type: number;
    dateUploaded: string;
    propertyId: string;
}

export interface PropertyAddress {
    id: string;
    dateCreated: string;
    dateModified: string;
    place: string | null;
    city: string | null;
    state: string | null;
    country: string | null;
    postalCode: string | null;
    propertyId: string;
}

export interface PropertyDetail {
    id: string;
    dateCreated: string;
    dateModified: string;
    title: string | null;
    description: string | null;
    propertyType: PropertyType;
    price: number;
    availability: AvailabilityStatus;
    propertyLeaseType: PropertyLeaseType;
    features: number;
    contactPersonName: string | null;
    contactPersonEmail: string | null;
    contactPersonPhoneNumber: string | null;
    ownerId: string;
    addressId: string;
    latitude: number | null;
    longitude: number | null;
    viewCount: number;
    files: PropertyFile[];
    propertyAddress?: PropertyAddress;
    isPublished?: boolean;
    publishedAt?: string | null;
    ownerName?: string | null;
    address?: string | null;
    datePosted?: string;
}

export interface PropertyDashboardStats {
    totalProperties: number;
    activeListings: number;
    pendingInspections: number;
    completedInspections: number;
}

export interface CreatePropertyRequest {
    title: string;
    description: string;
    propertyType: PropertyType;
    price: number;
    availability: AvailabilityStatus;
    propertyLeaseType: PropertyLeaseType;
    features: number;
    contactPersonName: string;
    contactPersonEmail: string;
    contactPersonPhoneNumber: string;
    ownerId: string;
    place: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    files: File[];
}

export interface UpdatePropertyRequest {
    id: string;
    title: string | null;
    description: string | null;
    propertyType: PropertyType;
    price: number | null;
    availability: AvailabilityStatus;
    propertyLeaseType: PropertyLeaseType;
    features: number;
    contactPersonName: string | null;
    contactPersonEmail: string | null;
    contactPersonPhoneNumber: string | null;
    propertyAddress: {
        id: string;
        place: string | null;
        city: string | null;
        state: string | null;
        country: string | null;
        postalCode: string | null;
    };
    authenticatedUserId: string;
}

export interface PropertyQueryParams {
    pageNumber?: number;
    pageSize?: number;
    search?: string;
    features?: number;
}

export type PropertyResponse = ApiResponse<PropertyDetail>;
export type PropertiesResponse = ApiResponse<PaginatedResponse<PropertyDetail>>;
export type PropertyDashboardResponse = ApiResponse<PropertyDashboardStats>;
export type PropertyFilesResponse = ApiResponse<PropertyFile[]>;
export type PropertyAddressResponse = ApiResponse<PropertyAddress>;
