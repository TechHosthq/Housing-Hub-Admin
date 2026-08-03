"use client";

import { Search, User, Send, Loader2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useChat } from "@/hooks/useChat";
import { useAuthStore } from "@/store/useAuthStore";
import { formatDistanceToNow } from "date-fns";

interface AdminMessageListProps {
    viewMode: "list" | "chat";
    selectedId: string | null;
    onThreadSelect: (id: string) => void;
    /** Deep-linked recipient with no existing conversation yet (e.g. "Message Owner"). */
    newRecipientId?: string | null;
    /** Recipient's display name, passed alongside newRecipientId so the header
     * doesn't have to wait for a conversation to exist before showing who this is. */
    newRecipientName?: string | null;
}

export default function AdminMessageList({ viewMode, selectedId, onThreadSelect, newRecipientId, newRecipientName }: AdminMessageListProps) {
    const { useConversations, useMessages, sendMessage, markAsRead } = useChat();
    const currentAdmin = useAuthStore((state) => state.user);
    const [searchQuery, setSearchQuery] = useState("");
    const [messageInput, setMessageInput] = useState("");
    const messagesContainerRef = useRef<HTMLDivElement>(null);

    const { data: convResponse, isLoading: isLoadingConvs } = useConversations();
    const { data: msgResponse, isLoading: isLoadingMsgs } = useMessages(selectedId);

    const conversations = convResponse?.data || [];
    const messages = msgResponse?.data?.items || [];

    useEffect(() => {
        if (selectedId) {
            markAsRead(selectedId);
        }
    }, [selectedId, markAsRead]);

    useEffect(() => {
        const container = messagesContainerRef.current;
        if (container) {
            container.scrollTop = container.scrollHeight;
        }
    }, [messages]);

    const filteredConversations = conversations.filter(conv =>
        conv.participantName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.lastMessage?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const activeChat = conversations.find(c => c.id === selectedId);
    const isNewConversation = !activeChat && !!newRecipientId;

    // Once the deep-linked recipient's conversation exists (created as a side
    // effect of sending the first message), switch over to it like any other thread.
    useEffect(() => {
        if (selectedId || !newRecipientId) return;
        const existing = conversations.find(c => c.participantId === newRecipientId);
        if (existing) onThreadSelect(existing.id);
    }, [conversations, newRecipientId, selectedId, onThreadSelect]);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        const recipientId = activeChat?.participantId ?? newRecipientId;
        if (!messageInput.trim() || !recipientId) return;

        sendMessage({
            recipientId,
            content: messageInput
        });
        setMessageInput("");
    };

    const ThreadList = () => (
        <div className={`bg-white rounded-[20px] border border-gray-100 p-6 shadow-sm h-fit min-h-[500px] ${viewMode === "chat" ? "w-[340px] hidden md:block" : "flex-1"}`}>
            <h2 className="text-[18px] font-black text-[#1A1A1A] font-montserrat mb-6 ml-2">
                Conversations
            </h2>

            <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                <input
                    type="text"
                    placeholder="Search messages..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-5 py-3 rounded-full border border-gray-100 bg-white text-[13px] font-medium text-[#1A1A1A] placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0095FF]/10 focus:border-[#0095FF]/50 transition-all"
                />
            </div>

            {isLoadingConvs ? (
                <div className="flex justify-center py-10">
                    <Loader2 className="animate-spin text-[#0B2545]" />
                </div>
            ) : filteredConversations.length === 0 ? (
                <p className="text-center text-gray-400 text-[13px] font-medium py-10">No conversations found.</p>
            ) : (
                <div className="flex flex-col gap-1">
                    {filteredConversations.map((conv) => (
                        <div
                            key={conv.id}
                            onClick={() => onThreadSelect(conv.id)}
                            className={`p-4 rounded-2xl flex items-start gap-3 cursor-pointer transition-all group relative border-l-4 ${selectedId === conv.id
                                ? "bg-blue-50/40 shadow-sm border-[#0095FF]"
                                : "border-transparent hover:bg-gray-50"
                                }`}
                        >
                            <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-gray-100 text-gray-400">
                                <User size={20} />
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start mb-0.5">
                                    <h3 className="text-[14px] font-bold text-[#1A1A1A] truncate pr-2">
                                        {conv.participantName || "Unknown User"}
                                    </h3>
                                    <span className="text-[11px] font-medium text-gray-400 shrink-0">
                                        {conv.lastMessageAt ? formatDistanceToNow(new Date(conv.lastMessageAt), { addSuffix: true }) : ""}
                                    </span>
                                </div>
                                <p className="text-[12px] font-medium text-gray-500 truncate">
                                    {conv.lastMessage}
                                </p>
                            </div>

                            {conv.unreadCount > 0 && selectedId !== conv.id && (
                                <div className="absolute top-1/2 -translate-y-1/2 right-4 w-5 h-5 bg-[#0095FF] rounded-full flex items-center justify-center text-[10px] text-white font-bold">
                                    {conv.unreadCount}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    if (viewMode === "list") {
        return <ThreadList />;
    }

    return (
        <div className="flex-1 flex gap-6 items-start h-[700px]">
            <ThreadList />

            <div className="flex-1 bg-white rounded-[20px] border border-gray-100 shadow-sm flex flex-col h-full overflow-hidden">
                {(activeChat || isNewConversation) ? (
                    <>
                        <div className="px-8 py-5 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
                            <h2 className="text-[16px] font-bold text-[#1A1A1A] font-montserrat">
                                {activeChat ? (activeChat.participantName || "Unknown User") : (newRecipientName || "New Message")}
                            </h2>
                        </div>

                        <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-8 space-y-6 bg-white">
                            {isNewConversation ? (
                                <div className="flex flex-col items-center justify-center h-full text-center">
                                    <p className="text-[13px] text-gray-400 font-medium">
                                        Send a message to start the conversation.
                                    </p>
                                </div>
                            ) : isLoadingMsgs ? (
                                <div className="flex justify-center py-20">
                                    <Loader2 className="animate-spin text-[#0B2545]" />
                                </div>
                            ) : (
                                [...messages].reverse().map((msg) => {
                                    const isOutgoing = msg.senderId === currentAdmin?.id;
                                    return (
                                        <div key={msg.id} className={`flex ${isOutgoing ? "justify-end" : "justify-start"}`}>
                                            <div className="max-w-[70%] space-y-1">
                                                <div className={`px-5 py-4 rounded-[12px] text-[13px] leading-relaxed shadow-sm ${isOutgoing
                                                    ? "bg-[#0B2545] text-white"
                                                    : "bg-white border border-gray-100 text-[#1A1A1A]"
                                                    }`}>
                                                    {msg.content}
                                                </div>
                                                <div className={`flex items-center gap-1 text-[11px] font-medium text-gray-400 ${isOutgoing ? "justify-end" : "justify-start"}`}>
                                                    {formatDistanceToNow(new Date(msg.dateCreated), { addSuffix: true })}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        <div className="p-8 bg-white border-t border-gray-100 shrink-0">
                            <form onSubmit={handleSendMessage} className="relative">
                                <input
                                    type="text"
                                    placeholder="Type your message..."
                                    value={messageInput}
                                    onChange={(e) => setMessageInput(e.target.value)}
                                    className="w-full pl-6 pr-16 py-4 rounded-xl border border-gray-100 bg-white text-[13px] font-medium text-[#1A1A1A] placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0095FF]/10 focus:border-[#0095FF]/50 transition-all"
                                />
                                <button
                                    type="submit"
                                    disabled={!messageInput.trim()}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-lg bg-[#0B2545] flex items-center justify-center text-white hover:bg-opacity-90 transition-all active:scale-95 shadow-md disabled:opacity-50"
                                >
                                    <Send size={18} />
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-white">
                        <div className="w-16 h-16 bg-[#E9F3FF] rounded-full flex items-center justify-center text-[#0095FF] mb-4">
                            <User size={28} />
                        </div>
                        <h3 className="text-[18px] font-bold text-[#1A1A1A] font-montserrat mb-2">
                            Select a conversation
                        </h3>
                        <p className="text-[13px] text-gray-400 font-medium max-w-[240px]">
                            Choose a conversation from the left to start messaging.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
