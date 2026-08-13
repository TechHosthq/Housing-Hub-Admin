/**
 * Types mirroring the verification pipeline DTOs in HousingHub.Service.
 *
 * Enum values are the persisted integers from HousingHub.Model.Enums.Verification.
 * They must match exactly — a stored 21 means Deed of Assignment forever, and a
 * mismatch here would mislabel documents in the review UI without failing anywhere.
 */

export enum VerificationSubjectType {
    Business = 1,
    Property = 2,
    Identity = 3,
}

export enum VerificationDocumentType {
    // Business
    CacCertificate = 1,
    CacStatusReport = 2,
    LasreraPermit = 3,
    EsvarbonLicence = 4,
    NiesvMembership = 5,
    TaxClearance = 6,
    ProofOfAddress = 7,
    // Property title
    CertificateOfOccupancy = 20,
    DeedOfAssignment = 21,
    GovernorsConsent = 22,
    SurveyPlan = 23,
    PurchaseReceipt = 24,
    LandRegistrySearch = 25,
    LetterOfAuthorityToLet = 26,
    // Developer / build
    PlanningPermit = 40,
    AuthorisationToBuild = 41,
    CertificateOfCompletion = 42,
    // Identity
    GovernmentIssuedId = 60,
}

export enum DocumentReviewStatus {
    Pending = 1,
    Approved = 2,
    Rejected = 3,
    Expired = 4,
}

export enum VerificationCaseStatus {
    Draft = 1,
    Submitted = 2,
    UnderReview = 3,
    Approved = 4,
    Rejected = 5,
    Expired = 6,
    EscalatedNameMismatch = 7,
}

export enum VerificationTier {
    Unverified = 0,
    IdentityVerified = 1,
    BusinessVerified = 2,
    TitleVerified = 3,
}

/** Mirrors the [Description] attributes on the backend enum. */
export const DOCUMENT_TYPE_LABELS: Record<number, string> = {
    [VerificationDocumentType.CacCertificate]: "CAC certificate of incorporation",
    [VerificationDocumentType.CacStatusReport]: "CAC status report",
    [VerificationDocumentType.LasreraPermit]: "LASRERA registration certificate",
    [VerificationDocumentType.EsvarbonLicence]: "ESVARBON registration",
    [VerificationDocumentType.NiesvMembership]: "NIESV membership certificate",
    [VerificationDocumentType.TaxClearance]: "Tax clearance certificate",
    [VerificationDocumentType.ProofOfAddress]: "Proof of business address",
    [VerificationDocumentType.CertificateOfOccupancy]: "Certificate of Occupancy",
    [VerificationDocumentType.DeedOfAssignment]: "Deed of Assignment",
    [VerificationDocumentType.GovernorsConsent]: "Governor's Consent",
    [VerificationDocumentType.SurveyPlan]: "Survey plan",
    [VerificationDocumentType.PurchaseReceipt]: "Purchase receipt",
    [VerificationDocumentType.LandRegistrySearch]: "Land registry search result",
    [VerificationDocumentType.LetterOfAuthorityToLet]: "Letter of authority to let",
    [VerificationDocumentType.PlanningPermit]: "Planning permit",
    [VerificationDocumentType.AuthorisationToBuild]: "Authorisation to build",
    [VerificationDocumentType.CertificateOfCompletion]: "Certificate of completion",
    [VerificationDocumentType.GovernmentIssuedId]: "Government-issued ID",
};

export const CASE_STATUS_LABELS: Record<number, string> = {
    [VerificationCaseStatus.Draft]: "Draft",
    [VerificationCaseStatus.Submitted]: "Awaiting review",
    [VerificationCaseStatus.UnderReview]: "Under review",
    [VerificationCaseStatus.Approved]: "Approved",
    [VerificationCaseStatus.Rejected]: "Rejected",
    [VerificationCaseStatus.Expired]: "Expired",
    [VerificationCaseStatus.EscalatedNameMismatch]: "Escalated — name mismatch",
};

export const SUBJECT_TYPE_LABELS: Record<number, string> = {
    [VerificationSubjectType.Business]: "Business",
    [VerificationSubjectType.Property]: "Property title",
    [VerificationSubjectType.Identity]: "Identity",
};

export interface VerificationCase {
    id: string;
    subjectId: string;
    subjectType: VerificationSubjectType;
    submittedByCustomerId: string;
    requestedTier: VerificationTier;
    status: VerificationCaseStatus;
    dateCreated: string;
    submittedAt: string | null;
    decidedAt: string | null;
    decisionNote: string | null;
    expiresAt: string | null;
    documentCount: number;
    /** The company or property being verified. Populated on reviewer endpoints only. */
    subjectLabel: string | null;
    submittedByName: string | null;
}

/**
 * A document as the reviewer sees it.
 *
 * Carries no URL and no storage key — the key is an S3 path to a title deed, and
 * handing it to the browser invites someone to try fetching it directly. Call the
 * document-url endpoint for a link that expires.
 */
export interface VerificationDocument {
    id: string;
    documentType: VerificationDocumentType;
    originalFileName: string | null;
    fileSizeInBytes: number;
    documentNumber: string | null;
    nameOnDocument: string | null;
    issuingAuthority: string | null;
    issuedAt: string | null;
    expiresAt: string | null;
    status: DocumentReviewStatus;
    rejectionReason: string | null;
    reviewedAt: string | null;
    autoCheckPassed: boolean | null;
    autoCheckProvider: string | null;
}

/**
 * Reviewer-only signals about a document.
 *
 * Never shown to the applicant: telling somebody their name did not match tells a
 * would-be impersonator exactly which check to defeat next time.
 */
export interface DocumentReviewContext {
    documentId: string;
    /** "Exact" | "Partial" | "None" | "Unknown" */
    nameMatch: string;
    shouldEscalate: boolean;
    nameOnAccount: string | null;
    /**
     * False means no CAC provider ran. This is NOT the same as a failed check and
     * must never render as one.
     */
    cacLookupPerformed: boolean;
    cacFound: boolean | null;
    cacRegisteredName: string | null;
    cacStatus: string | null;
}

export interface VerificationCaseDetail {
    case: VerificationCase;
    documents: VerificationDocument[];
    missingRequiredDocuments: VerificationDocumentType[];
    reviewContext: DocumentReviewContext[] | null;
}

export interface ReviewDocumentRequest {
    approved: boolean;
    rejectionReason?: string | null;
}

export interface DecideCaseRequest {
    outcome: VerificationCaseStatus;
    note?: string | null;
}

export interface ApiResponse<T> {
    data: T;
    isSuccessful: boolean;
    statusCode: string;
    message: string;
}

export interface PaginatedResult<T> {
    items: T[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
}
