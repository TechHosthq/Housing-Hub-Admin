import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import chatService from '@/services/chatService';
import { SendMessageRequest } from '@/types/chat';

export const useChat = () => {
    const queryClient = useQueryClient();

    const useConversations = () => useQuery({
        queryKey: ['conversations'],
        queryFn: chatService.getConversations
    });

    const useMessages = (conversationId: string | null, pageNumber: number = 1, pageSize: number = 20) => useQuery({
        queryKey: ['messages', conversationId, pageNumber],
        queryFn: () => chatService.getMessages(conversationId!, pageNumber, pageSize),
        enabled: !!conversationId
    });

    const sendMessageMutation = useMutation({
        mutationFn: (data: SendMessageRequest) => chatService.sendMessage(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['conversations'] });
            queryClient.invalidateQueries({ queryKey: ['messages'] });
        }
    });

    const markAsReadMutation = useMutation({
        mutationFn: (conversationId: string) => chatService.markAsRead(conversationId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['conversations'] });
        }
    });

    return {
        useConversations,
        useMessages,
        sendMessage: sendMessageMutation.mutate,
        isSendingMessage: sendMessageMutation.isPending,
        markAsRead: markAsReadMutation.mutate,
    };
};
