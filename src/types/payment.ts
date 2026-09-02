/**
 * Types mirroring the payment DTOs in HousingHub.Service.
 *
 * Enum values are the persisted integers from HousingHub.Model.Enums.Payment and
 * must match exactly. A mismatch would not fail anywhere — it would mislabel a
 * payment's state in a queue whose whole purpose is telling states apart.
 */

import { ApiResponse, PaginatedResult } from './verification';

export enum PaymentPurpose {
    IdentityVerification = 1,
    BusinessVerification = 2,
    PropertyVerification = 3,
}

export enum PaymentStatus {
    Pending = 1,
    Successful = 2,
    Failed = 3,
    Abandoned = 4,
    /**
     * The gateway confirmed a payment that does not match what was asked for.
     *
     * The only state here that needs a person. Money may have moved while nothing
     * was handed over, so it is neither a success nor a failure and must not be
     * grouped with either.
     */
    Flagged = 5,
    /** A refund has been asked of the provider and not yet confirmed. */
    RefundPending = 6,
    /**
     * The provider confirmed the money went back.
     *
     * No longer a settled payment — a refunded verification fee stops satisfying
     * the submission gate, which is why this is a status rather than a flag.
     */
    Refunded = 7,
}

export const PAYMENT_STATUS_LABELS: Record<number, string> = {
    [PaymentStatus.Pending]: 'Pending',
    [PaymentStatus.Successful]: 'Paid',
    [PaymentStatus.Failed]: 'Failed',
    [PaymentStatus.Abandoned]: 'Abandoned',
    [PaymentStatus.Flagged]: 'Needs checking',
    [PaymentStatus.RefundPending]: 'Refund in progress',
    [PaymentStatus.Refunded]: 'Refunded',
};

export const PAYMENT_PURPOSE_LABELS: Record<number, string> = {
    [PaymentPurpose.IdentityVerification]: 'Identity',
    [PaymentPurpose.BusinessVerification]: 'Business verification',
    [PaymentPurpose.PropertyVerification]: 'Property title verification',
};

export interface AdminPayment {
    id: string;
    reference: string;
    purpose: PaymentPurpose;
    subjectId: string | null;
    /** Kobo, not naira. Convert only at the point of display — see utils/money. */
    amountKobo: number;
    purposeFeeKobo: number;
    identityFeeKobo: number;
    includesIdentityVerification: boolean;
    currency: string;
    status: PaymentStatus;
    provider: string | null;
    providerReference: string | null;
    channel: string | null;
    paidAt: string | null;
    dateCreated: string;
    customerId: string;
    customerName: string | null;
    customerEmail: string | null;
    failureReason: string | null;
    /** Why this needs a person. Set only on a flagged payment. */
    flagNote: string | null;

    /** Why the money was sent back. */
    refundReason: string | null;
    /** Which admin asked for it. */
    refundedByAdminId: string | null;
    refundRequestedAt: string | null;
    refundedAt: string | null;
    /**
     * What actually went back, in kobo.
     *
     * Not necessarily amountKobo. A flagged payment is flagged because the
     * confirmed amount differed from the amount asked for, and the refund follows
     * what arrived.
     */
    refundAmountKobo: number | null;
    providerRefundReference: string | null;
}

export type AdminPaymentResponse = ApiResponse<AdminPayment>;
export type AdminPaymentsResponse = ApiResponse<AdminPayment[]>;
export type PaginatedAdminPaymentsResponse = ApiResponse<PaginatedResult<AdminPayment>>;
export type FlaggedCountResponse = ApiResponse<number>;
