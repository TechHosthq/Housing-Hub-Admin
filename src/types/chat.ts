import { ApiResponse } from "./auth";

export interface Message {
    id: string;
    conversationId: string;
    senderId: string;
    senderName: string | null;
    content: string | null;
    isRead: boolean;
    dateCreated: string;
}

export interface Conversation {
    id: string;
    participantId: string;
    participantName: string | null;
    lastMessage: string | null;
    lastMessageAt: string | null;
    unreadCount: number;
}

export interface PaginatedMessages {
    items: Message[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
}

export interface SendMessageRequest {
    recipientId: string;
    content: string | null;
}

export type SendMessageResponse = ApiResponse<Message>;
export type ConversationsResponse = ApiResponse<Conversation[]>;
export type MessagesResponse = ApiResponse<PaginatedMessages>;
export type MarkAsReadResponse = ApiResponse<boolean>;
