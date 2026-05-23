import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import ownerService from '@/services/ownerService';

export const useOwner = () => {
    const queryClient = useQueryClient();

    const useGetOwner = (id: string | null) => useQuery({
        queryKey: ['owner', id],
        queryFn: () => ownerService.getOwner(id!),
        enabled: !!id
    });

    const useAllOwners = (params: {
        pageNumber?: number;
        pageSize?: number;
        search?: string;
        isVerified?: boolean;
        isActive?: boolean;
        type?: number;
    } = {}) => useQuery({
        queryKey: ['owners', params],
        queryFn: () => ownerService.getAllOwners(params)
    });

    const verifyKycMutation = useMutation({
        mutationFn: ({ id, approve }: { id: string, approve: boolean }) => ownerService.verifyKyc(id, approve),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['owner', variables.id] });
            queryClient.invalidateQueries({ queryKey: ['owners'] });
        }
    });

    const suspendOwnerMutation = useMutation({
        mutationFn: (id: string) => ownerService.suspendOwner(id),
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: ['owner', id] });
            queryClient.invalidateQueries({ queryKey: ['owners'] });
        }
    });

    const reactivateOwnerMutation = useMutation({
        mutationFn: (id: string) => ownerService.reactivateOwner(id),
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: ['owner', id] });
            queryClient.invalidateQueries({ queryKey: ['owners'] });
        }
    });

    return {
        useGetOwner,
        useAllOwners,
        verifyKyc: verifyKycMutation.mutate,
        isVerifyingKyc: verifyKycMutation.isPending,
        suspendOwner: suspendOwnerMutation.mutate,
        isSuspendingOwner: suspendOwnerMutation.isPending,
        reactivateOwner: reactivateOwnerMutation.mutate,
        isReactivatingOwner: reactivateOwnerMutation.isPending,
    };
};
