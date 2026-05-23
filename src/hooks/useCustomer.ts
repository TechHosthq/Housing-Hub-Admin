import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import customerService from '@/services/customerService';
import { UpdateProfileRequest, SubmitKycRequest, AddressRequest, CreateCustomerRequest } from '@/types/customer';

export const useCustomer = () => {
    const queryClient = useQueryClient();

    const useGetCustomer = (id: string | null) => useQuery({
        queryKey: ['customer', id],
        queryFn: () => customerService.getCustomer(id!),
        enabled: !!id
    });

    const useAllCustomers = (params: {
        pageNumber?: number;
        pageSize?: number;
        search?: string;
        isVerified?: boolean;
        isActive?: boolean;
    } = {}) => useQuery({
        queryKey: ['customers', params],
        queryFn: () => customerService.getAllCustomers(params)
    });

    const createCustomerMutation = useMutation({
        mutationFn: (data: CreateCustomerRequest) => customerService.createCustomer(data),
        onSuccess: (response) => {
            if (response.isSuccessful && response.data?.id) {
                queryClient.invalidateQueries({ queryKey: ['customers'] });
            }
        }
    });

    const updateProfileMutation = useMutation({
        mutationFn: (data: UpdateProfileRequest) => customerService.updateProfile(data),
        onSuccess: (response) => {
            if (response.isSuccessful) {
                queryClient.invalidateQueries({ queryKey: ['customer', response.data.id] });
                queryClient.invalidateQueries({ queryKey: ['customers'] });
            }
        }
    });

    const submitKycMutation = useMutation({
        mutationFn: (data: SubmitKycRequest) => customerService.submitKyc(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['customer'] });
        }
    });

    const uploadDocumentMutation = useMutation({
        mutationFn: (file: File) => customerService.uploadKycDocument(file)
    });

    const verifyKycMutation = useMutation({
        mutationFn: ({ id, approve }: { id: string, approve: boolean }) => customerService.verifyKyc(id, approve),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['customer', variables.id] });
            queryClient.invalidateQueries({ queryKey: ['customers'] });
        }
    });

    const suspendCustomerMutation = useMutation({
        mutationFn: (id: string) => customerService.suspendCustomer(id),
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: ['customer', id] });
            queryClient.invalidateQueries({ queryKey: ['customers'] });
        }
    });

    const reactivateCustomerMutation = useMutation({
        mutationFn: (id: string) => customerService.reactivateCustomer(id),
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: ['customer', id] });
            queryClient.invalidateQueries({ queryKey: ['customers'] });
        }
    });

    // Address Hooks
    const useMyAddress = () => useQuery({
        queryKey: ['my-address'],
        queryFn: () => customerService.getMyAddress()
    });

    const updateAddressMutation = useMutation({
        mutationFn: (data: AddressRequest) => customerService.updateAddress(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['my-address'] });
        }
    });

    return {
        useGetCustomer,
        useAllCustomers,
        createCustomer: createCustomerMutation.mutate,
        isCreatingCustomer: createCustomerMutation.isPending,
        updateProfile: updateProfileMutation.mutate,
        isUpdatingProfile: updateProfileMutation.isPending,
        submitKyc: submitKycMutation.mutate,
        isSubmittingKyc: submitKycMutation.isPending,
        uploadDocument: uploadDocumentMutation.mutateAsync,
        isUploadingDocument: uploadDocumentMutation.isPending,
        verifyKyc: verifyKycMutation.mutate,
        isVerifyingKyc: verifyKycMutation.isPending,
        suspendCustomer: suspendCustomerMutation.mutate,
        isSuspendingCustomer: suspendCustomerMutation.isPending,
        reactivateCustomer: reactivateCustomerMutation.mutate,
        isReactivatingCustomer: reactivateCustomerMutation.isPending,
        // Address exports
        useMyAddress,
        updateAddress: updateAddressMutation.mutate,
        isUpdatingAddress: updateAddressMutation.isPending,
    };
};
