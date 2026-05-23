import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import notificationService from '@/services/notificationService';
import { NotificationQueryParams } from '@/types/notification';
import { useAuthStore } from '@/store/useAuthStore';

export const useNotification = () => {
    const { isAuthenticated } = useAuthStore();
    const queryClient = useQueryClient();

    const useGetNotifications = (params: NotificationQueryParams = {}) => useQuery({
        queryKey: ['notifications', params],
        queryFn: () => notificationService.getNotifications(params),
        enabled: isAuthenticated
    });

    const useUnreadCount = () => useQuery({
        queryKey: ['notifications-unread-count'],
        queryFn: () => notificationService.getUnreadCount(),
        refetchInterval: isAuthenticated ? 30000 : false, // Refetch every 30 seconds only if authenticated
        enabled: isAuthenticated
    });

    const markAsReadMutation = useMutation({
        mutationFn: (id: string) => notificationService.markAsRead(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
            queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
        }
    });

    const markAllAsReadMutation = useMutation({
        mutationFn: () => notificationService.markAllAsRead(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
            queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
        }
    });

    return {
        useGetNotifications,
        useUnreadCount,
        markAsRead: markAsReadMutation.mutate,
        isMarkingRead: markAsReadMutation.isPending,
        markAllAsRead: markAllAsReadMutation.mutate,
        isMarkingAllRead: markAllAsReadMutation.isPending,
    };
};
