/**
 * Types mirroring the admin tenancy DTOs in HousingHub.Service.
 *
 * Enum values are the persisted integers from HousingHub.Model.Enums and must match
 * exactly. TenancyStatus runs from 1 for the lifecycle; terminal values sit in their
 * own band from 10 so a stage can be added later without renumbering.
 */

import { ApiResponse, PaginatedResponse } from './auth';

export enum TenancyStatus {
    CandidateSelected = 1,
    DocumentsRequested = 2,
    DocumentsAccepted = 3,
    AwaitingPayment = 4,
    Active = 5,
    Ended = 6,
    Withdrawn = 10,
    DeclinedByCandidate = 11,
}

export const TENANCY_STATUS_LABELS: Record<number, string> = {
    [TenancyStatus.CandidateSelected]: 'Tenant chosen',
    [TenancyStatus.DocumentsRequested]: 'Documents out',
    [TenancyStatus.DocumentsAccepted]: 'Documents agreed',
    [TenancyStatus.AwaitingPayment]: 'Awaiting payment',
    [TenancyStatus.Active]: 'Let running',
    [TenancyStatus.Ended]: 'Ended',
    [TenancyStatus.Withdrawn]: 'Owner withdrew',
    [TenancyStatus.DeclinedByCandidate]: 'Tenant declined',
};

/** Must match HousingHub.Model.Enums.PropertyLeaseType exactly. */
export enum PropertyLeaseType {
    Rent = 1,
    Lease = 2,
    Sale = 3,
}

export const LEASE_TYPE_LABELS: Record<number, string> = {
    [PropertyLeaseType.Rent]: 'Rent',
    [PropertyLeaseType.Lease]: 'Lease',
    [PropertyLeaseType.Sale]: 'Sale',
};

export enum TenancyDocumentMode {
    Upload = 1,
    SignInApp = 2,
    SignOffline = 3,
}

export const DOCUMENT_MODE_LABELS: Record<number, string> = {
    [TenancyDocumentMode.Upload]: 'Tenant uploads',
    [TenancyDocumentMode.SignInApp]: 'Signed in app',
    [TenancyDocumentMode.SignOffline]: 'Signed on paper',
};

export enum TenancyDocumentStatus {
    Requested = 1,
    Submitted = 2,
    Accepted = 3,
    Rejected = 4,
}

/**
 * Worded from staff's point of view — who is holding things up.
 *
 * That is the question an admin opens this screen with, and a label reading
 * "Requested" makes them work out the answer for themselves.
 */
export const DOCUMENT_STATUS_LABELS: Record<number, string> = {
    [TenancyDocumentStatus.Requested]: 'With tenant',
    [TenancyDocumentStatus.Submitted]: 'With owner',
    [TenancyDocumentStatus.Accepted]: 'Accepted',
    [TenancyDocumentStatus.Rejected]: 'Returned to tenant',
};

export interface AdminTenancy {
    id: string;
    propertyId: string;
    propertyTitle: string | null;

    landlordCustomerId: string;
    landlordName: string | null;
    landlordEmail: string | null;

    tenantCustomerId: string;
    tenantName: string | null;
    tenantEmail: string | null;

    status: TenancyStatus;
    leaseType: PropertyLeaseType;

    /** Kobo, snapshotted when the tenant was chosen — not the listing's current price. */
    agreedRentKobo: number;
    feesKobo: number;
    totalKobo: number;

    documentCount: number;
    acceptedDocumentCount: number;
    /** Asked for or sent back. The tenant has to move. */
    awaitingTenantCount: number;
    /** Submitted and unreviewed. The owner has to move. */
    awaitingOwnerCount: number;

    selectedAt: string;
    withdrawnReason: string | null;
    closedAt: string | null;
    dateCreated: string;
}

/**
 * One document with its signature trail.
 *
 * The audit fields are the point. If a tenant later denies signing, what answers it
 * is the time, the address, the device and the hash of the exact bytes signed.
 */
export interface AdminTenancyDocument {
    id: string;
    tenancyId: string;
    name: string;
    instructions: string | null;
    mode: TenancyDocumentMode;
    isAgreement: boolean;
    status: TenancyDocumentStatus;
    hasSourceFile: boolean;
    hasSubmittedFile: boolean;
    submittedAt: string | null;
    reviewedAt: string | null;
    rejectionReason: string | null;

    signedAt: string | null;
    signerIpAddress: string | null;
    signerUserAgent: string | null;
    /** SHA-256 of what the owner supplied, taken when it was stored. */
    sourceFileHash: string | null;
    /** What the signature attests to. Equal to the source hash for an untampered document. */
    signedDocumentHash: string | null;

    dateCreated: string;
}

export interface AdminTenancyFee {
    id: string;
    name: string;
    description: string;
    amountKobo: number;
}

export interface AdminTenancyDetail {
    tenancy: AdminTenancy;
    documents: AdminTenancyDocument[];
    fees: AdminTenancyFee[];
}

export type AdminTenancyDetailResponse = ApiResponse<AdminTenancyDetail>;
export type PaginatedAdminTenanciesResponse = ApiResponse<PaginatedResponse<AdminTenancy>>;
