import { useMutation, useQuery, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { propertyService } from '@/services/propertyService';
import { 
    PropertyQueryParams, 
    CreatePropertyRequest, 
    UpdatePropertyRequest 
} from '@/types/property';

export const useProperty = () => {
    const queryClient = useQueryClient();

    const useAllProperties = (params: PropertyQueryParams = {}) => useQuery({
        queryKey: ['properties', params],
        queryFn: () => propertyService.getAllProperties(params),
    });

    const useGetProperty = (id: string | null) => useQuery({
        queryKey: ['property', id],
        queryFn: () => propertyService.getProperty(id!),
        enabled: !!id
    });

    const useMyProperties = () => useQuery({
        queryKey: ['my-properties'],
        queryFn: () => propertyService.getMyProperties(),
    });

    const useDashboardStats = () => useQuery({
        queryKey: ['property-dashboard-stats'],
        queryFn: () => propertyService.getDashboardStats(),
    });

    const useNewProperties = (count?: number) => useQuery({
        queryKey: ['new-properties', count],
        queryFn: () => propertyService.getNewProperties(count),
    });

    const useTrendingProperties = (count?: number) => useQuery({
        queryKey: ['trending-properties', count],
        queryFn: () => propertyService.getTrendingProperties(count),
    });

    const useInfiniteTrendingProperties = (pageSize: number = 20) => useInfiniteQuery({
        queryKey: ['trending-properties-infinite', pageSize],
        queryFn: ({ pageParam = 0 }) => propertyService.getTrendingProperties(pageSize, pageParam),
        initialPageParam: 0,
        getNextPageParam: (lastPage, allPages) => {
            const currentCount = allPages.length * pageSize;
            return lastPage.data && lastPage.data.length === pageSize ? currentCount : undefined;
        },
    });

    const useNearbyProperties = (lat: number, lng: number, radius: number = 10, count: number = 20, skip: number = 0) => useQuery({
        queryKey: ['nearby-properties', lat, lng, radius, count, skip],
        queryFn: () => propertyService.getNearbyProperties(lat, lng, radius, count, skip),
        enabled: !!lat && !!lng
    });

    const usePropertyAddress = (propertyId: string | null) => useQuery({
        queryKey: ['property-address', propertyId],
        queryFn: () => propertyService.getPropertyAddressByProperty(propertyId!),
        enabled: !!propertyId
    });

    const createPropertyMutation = useMutation({
        mutationFn: (data: CreatePropertyRequest) => propertyService.createProperty(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['my-properties'] });
            queryClient.invalidateQueries({ queryKey: ['properties'] });
        }
    });

    const updatePropertyMutation = useMutation({
        mutationFn: ({ id, data }: { id: string, data: UpdatePropertyRequest }) => 
            propertyService.updateProperty(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['property', variables.id] });
            queryClient.invalidateQueries({ queryKey: ['my-properties'] });
        }
    });

    const deletePropertyMutation = useMutation({
        mutationFn: (id: string) => propertyService.deleteProperty(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['my-properties'] });
            queryClient.invalidateQueries({ queryKey: ['properties'] });
        }
    });

    const publishPropertyMutation = useMutation({
        mutationFn: (id: string) => propertyService.publishProperty(id),
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: ['property', id] });
            queryClient.invalidateQueries({ queryKey: ['properties'] });
        }
    });

    const unpublishPropertyMutation = useMutation({
        mutationFn: (id: string) => propertyService.unpublishProperty(id),
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: ['property', id] });
            queryClient.invalidateQueries({ queryKey: ['properties'] });
        }
    });

    const uploadFilesMutation = useMutation({
        mutationFn: ({ id, files }: { id: string, files: File[] }) => 
            propertyService.uploadPropertyFiles(id, files),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['property', variables.id] });
        }
    });

    return {
        useAllProperties,
        useGetProperty,
        useMyProperties,
        useDashboardStats,
        useNewProperties,
        useTrendingProperties,
        useInfiniteTrendingProperties,
        useNearbyProperties,
        usePropertyAddress,
        createProperty: createPropertyMutation.mutate,
        isCreating: createPropertyMutation.isPending,
        updateProperty: updatePropertyMutation.mutate,
        isUpdating: updatePropertyMutation.isPending,
        deleteProperty: deletePropertyMutation.mutate,
        isDeleting: deletePropertyMutation.isPending,
        publishProperty: publishPropertyMutation.mutate,
        isPublishing: publishPropertyMutation.isPending,
        unpublishProperty: unpublishPropertyMutation.mutate,
        isUnpublishing: unpublishPropertyMutation.isPending,
        uploadFiles: uploadFilesMutation.mutate,
        isUploading: uploadFilesMutation.isPending,
    };
};
