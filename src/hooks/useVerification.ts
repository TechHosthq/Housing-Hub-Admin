import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import verificationService from '@/services/verificationService';
import {
    DecideCaseRequest,
    ReviewDocumentRequest,
    VerificationSubjectType,
} from '@/types/verification';

export const useVerification = () => {
    const queryClient = useQueryClient();

    const useQueueList = (params: {
        pageNumber?: number;
        pageSize?: number;
        subjectType?: VerificationSubjectType;
    } = {}) => useQuery({
        queryKey: ['verification-queue', params],
        queryFn: () => verificationService.getQueue(params),
    });

    const useCase = (caseId: string | null) => useQuery({
        queryKey: ['verification-case', caseId],
        queryFn: () => verificationService.getCase(caseId!),
        enabled: !!caseId,
    });

    const beginReviewMutation = useMutation({
        mutationFn: (caseId: string) => verificationService.beginReview(caseId),
        onSuccess: (_, caseId) => {
            queryClient.invalidateQueries({ queryKey: ['verification-case', caseId] });
            queryClient.invalidateQueries({ queryKey: ['verification-queue'] });
        },
    });

    const reviewDocumentMutation = useMutation({
        mutationFn: ({ documentId, data }: { documentId: string; data: ReviewDocumentRequest }) =>
            verificationService.reviewDocument(documentId, data),
        // Refetch the whole case rather than patching the document locally: approving
        // the last pending document is what unlocks the case decision, and that
        // depends on server state we should not try to mirror.
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['verification-case'] });
        },
    });

    const decideCaseMutation = useMutation({
        mutationFn: ({ caseId, data }: { caseId: string; data: DecideCaseRequest }) =>
            verificationService.decideCase(caseId, data),
        onSuccess: (_, { caseId }) => {
            queryClient.invalidateQueries({ queryKey: ['verification-case', caseId] });
            queryClient.invalidateQueries({ queryKey: ['verification-queue'] });
            // A decision grants or withholds a badge on the subject, so anything
            // showing customer or property verification state is now stale.
            queryClient.invalidateQueries({ queryKey: ['customers'] });
            queryClient.invalidateQueries({ queryKey: ['owners'] });
            queryClient.invalidateQueries({ queryKey: ['properties'] });
        },
    });

    return {
        useQueueList,
        useCase,
        beginReview: beginReviewMutation.mutate,
        isBeginningReview: beginReviewMutation.isPending,
        reviewDocument: reviewDocumentMutation.mutate,
        isReviewingDocument: reviewDocumentMutation.isPending,
        decideCase: decideCaseMutation.mutate,
        isDecidingCase: decideCaseMutation.isPending,
    };
};
