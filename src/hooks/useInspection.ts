"use client";

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import inspectionService from '@/services/inspectionService';

export const useInspection = () => {
    const queryClient = useQueryClient();

    const useGetInspection = (id: string | null) => useQuery({
        queryKey: ['inspection', id],
        queryFn: () => inspectionService.getInspection(id!),
        enabled: !!id
    });

    const useAllInspections = (params: {
        pageNumber?: number;
        pageSize?: number;
        status?: number;
        date?: string;
        propertyId?: string;
        customerId?: string;
    } = {}) => useQuery({
        queryKey: ['inspections', params],
        queryFn: () => inspectionService.getAllInspections(params)
    });

    const usePropertyInspections = (propertyId: string | null, pageNumber: number = 1, pageSize: number = 20) => useQuery({
        queryKey: ['property-inspections', propertyId, pageNumber, pageSize],
        queryFn: () => inspectionService.getInspectionsByProperty(propertyId!, pageNumber, pageSize),
        enabled: !!propertyId
    });

    const confirmInspectionMutation = useMutation({
        mutationFn: (id: string) => inspectionService.confirmInspection(id),
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: ['inspection', id] });
            queryClient.invalidateQueries({ queryKey: ['inspections'] });
            queryClient.invalidateQueries({ queryKey: ['property-inspections'] });
        }
    });

    const declineInspectionMutation = useMutation({
        mutationFn: ({ id, declineNote }: { id: string; declineNote?: string }) => 
            inspectionService.declineInspection(id, declineNote),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['inspection', variables.id] });
            queryClient.invalidateQueries({ queryKey: ['inspections'] });
            queryClient.invalidateQueries({ queryKey: ['property-inspections'] });
        }
    });

    const cancelInspectionMutation = useMutation({
        mutationFn: (id: string) => inspectionService.cancelInspection(id),
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: ['inspection', id] });
            queryClient.invalidateQueries({ queryKey: ['inspections'] });
            queryClient.invalidateQueries({ queryKey: ['property-inspections'] });
        }
    });

    return {
        useGetInspection,
        useAllInspections,
        usePropertyInspections,
        confirmInspection: confirmInspectionMutation.mutate,
        isConfirming: confirmInspectionMutation.isPending,
        declineInspection: declineInspectionMutation.mutate,
        isDeclining: declineInspectionMutation.isPending,
        cancelInspection: cancelInspectionMutation.mutate,
        isCancelling: cancelInspectionMutation.isPending,
    };
};
