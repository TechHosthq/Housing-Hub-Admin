import apiClient from './apiClient';
import {
    ApiResponse,
    DecideCaseRequest,
    PaginatedResult,
    ReviewDocumentRequest,
    VerificationCase,
    VerificationCaseDetail,
    VerificationSubjectType,
} from '@/types/verification';

const verificationService = {
    /**
     * The review queue — cases awaiting a decision, oldest first.
     *
     * Oldest-first is the server's ordering and is deliberate: newest-first starves
     * whoever has waited longest, who is also the applicant most likely to give up.
     */
    getQueue: async (params: {
        pageNumber?: number;
        pageSize?: number;
        subjectType?: VerificationSubjectType;
    } = {}): Promise<ApiResponse<PaginatedResult<VerificationCase>>> => {
        const response = await apiClient.get('/api/AdminVerification/queue', {
            params: {
                pageNumber: params.pageNumber,
                pageSize: params.pageSize,
                subjectType: params.subjectType,
            },
        });
        return response.data;
    },

    getCase: async (caseId: string): Promise<ApiResponse<VerificationCaseDetail>> => {
        const response = await apiClient.get(`/api/AdminVerification/cases/${caseId}`);
        return response.data;
    },

    /**
     * Mints a short-lived link to view a document.
     *
     * Ten minutes, and it is a bearer credential — anyone holding the URL can read
     * the document until it expires. Never persist it, never put it in a ticket.
     */
    getDocumentUrl: async (documentId: string): Promise<ApiResponse<string>> => {
        const response = await apiClient.get(`/api/AdminVerification/documents/${documentId}/url`);
        return response.data;
    },

    /** Claims a case so two admins do not review the same submission at once. */
    beginReview: async (caseId: string): Promise<ApiResponse<boolean>> => {
        const response = await apiClient.put(`/api/AdminVerification/cases/${caseId}/begin-review`);
        return response.data;
    },

    reviewDocument: async (
        documentId: string, data: ReviewDocumentRequest,
    ): Promise<ApiResponse<boolean>> => {
        const response = await apiClient.put(`/api/AdminVerification/documents/${documentId}/review`, data);
        return response.data;
    },

    decideCase: async (caseId: string, data: DecideCaseRequest): Promise<ApiResponse<boolean>> => {
        const response = await apiClient.put(`/api/AdminVerification/cases/${caseId}/decide`, data);
        return response.data;
    },
};

export default verificationService;
