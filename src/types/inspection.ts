import { ApiResponse } from "./auth";

export enum InspectionStatus {
    Pending = 0,
    Confirmed = 1,
    Cancelled = 2,
    Completed = 3,
    Declined = 4,
    RescheduleRequested = 5
}

export interface Inspection {
    id: string;
    inspectionId: string | null;
    dateCreated: string;
    dateModified: string;
    customerId: string;
    propertyId: string;
    propertyName?: string;
    propertyAddress?: string;
    customerName?: string;
    latitude?: number;
    longitude?: number;
    scheduledDate: string;
    scheduledTime: string;
    note: string | null;
    status: InspectionStatus;
    declineNote: string | null;
    rescheduledDate: string | null;
    rescheduledTime: string | null;
    rescheduleNote: string | null;
    dateRequested?: string;
}

export interface CreateInspectionRequest {
    propertyId: string;
    scheduledDate: string;
    scheduledTime: string;
    note: string | null;
    authenticatedUserId: string;
}

export interface RespondToInspectionRequest {
    inspectionId: string;
    accept: boolean;
    note: string | null;
    authenticatedUserId: string;
}

export interface RescheduleInspectionRequest {
    inspectionId: string;
    rescheduledDate: string;
    rescheduledTime: string;
    note: string | null;
    authenticatedUserId: string;
}

export interface PaginatedInspections {
    items: Inspection[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
}

export type InspectionResponse = ApiResponse<Inspection>;
export type InspectionsResponse = ApiResponse<PaginatedInspections>;
