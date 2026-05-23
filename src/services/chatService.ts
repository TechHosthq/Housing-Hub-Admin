import apiClient from './apiClient';
import { 
    SendMessageRequest, 
    SendMessageResponse, 
    ConversationsResponse, 
    MessagesResponse, 
    MarkAsReadResponse 
} from '@/types/chat';

const chatService = {
    sendMessage: async (data: SendMessageRequest): Promise<SendMessageResponse> => {
        const response = await apiClient.post('/api/AdminChat/send', data);
        return response.data;
    },

    getConversations: async (): Promise<ConversationsResponse> => {
        const response = await apiClient.get('/api/AdminChat/conversations');
        return response.data;
    },

    getMessages: async (conversationId: string, pageNumber: number = 1, pageSize: number = 20): Promise<MessagesResponse> => {
        const response = await apiClient.get(`/api/AdminChat/conversations/${conversationId}/messages`, {
            params: { pageNumber, pageSize }
        });
        return response.data;
    },

    markAsRead: async (conversationId: string): Promise<MarkAsReadResponse> => {
        const response = await apiClient.put(`/api/AdminChat/conversations/${conversationId}/read`);
        return response.data;
    }
};

export default chatService;
