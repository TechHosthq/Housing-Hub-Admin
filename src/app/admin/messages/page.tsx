"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import AdminMessageList from "@/components/admin/AdminMessageList";

function MessagesContent() {
    const searchParams = useSearchParams();
    const newRecipientId = searchParams.get("recipientId");

    const [isChatting, setIsChatting] = useState(!!newRecipientId);
    const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);

    // Deep-linked from e.g. a property page's "Message Owner" button.
    useEffect(() => {
        if (newRecipientId) setIsChatting(true);
    }, [newRecipientId]);

    const handleThreadSelect = (id: string) => {
        setSelectedThreadId(id);
        setIsChatting(true);
    };

    const handleBack = () => {
        setIsChatting(false);
        setSelectedThreadId(null);
    };

    return (
        <div className="flex flex-col gap-8 pb-12">
            {isChatting && (
                <button
                    onClick={handleBack}
                    className="flex items-center gap-2 text-[#0095FF] font-bold text-[14px] hover:opacity-80 transition-opacity w-fit"
                >
                    ← Back to conversations
                </button>
            )}

            <h1 className="text-[28px] font-bold text-[#1A1A1A] font-montserrat tracking-tight">
                Messages
            </h1>

            <div className="flex gap-8 items-start">
                <AdminMessageList
                    viewMode={isChatting ? "chat" : "list"}
                    selectedId={selectedThreadId}
                    onThreadSelect={handleThreadSelect}
                    newRecipientId={selectedThreadId ? null : newRecipientId}
                />
            </div>
        </div>
    );
}

export default function AdminMessagesPage() {
    return (
        <Suspense fallback={null}>
            <MessagesContent />
        </Suspense>
    );
}
