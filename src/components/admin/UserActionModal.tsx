"use client";

import { useState, useEffect } from "react";

interface UserActionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAction: (reason: string) => void;
    type: 'block' | 'unblock';
}

export default function UserActionModal({ isOpen, onClose, onAction, type }: UserActionModalProps) {
    const [reason, setReason] = useState("");
    const maxChars = 500;

    useEffect(() => {
        if (!isOpen) {
            setReason("");
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const isBlock = type === 'block';

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white w-full max-w-[500px] rounded-[32px] p-10 shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col gap-8">
                <div className="flex flex-col gap-3 text-center">
                    <h2 className="text-[32px] font-bold text-[#1A1A1A] font-montserrat">
                        {isBlock ? "Block User?" : "Unblock User?"}
                    </h2>
                    <p className="text-[16px] text-gray-500 font-medium">
                        Please provide a reason for {isBlock ? "blocking" : "unblocking"} the User.
                    </p>
                </div>

                <div className="flex flex-col gap-2">
                    <textarea
                        className="w-full min-h-[160px] p-5 bg-white border border-gray-200 rounded-[20px] text-[15px] font-medium text-[#1A1A1A] placeholder:text-gray-300 outline-none focus:border-[#0095FF]/50 transition-all resize-none shadow-sm"
                        placeholder={isBlock ? "Reason for Blocking..." : "Reason for Unblocking..."}
                        value={reason}
                        onChange={(e) => setReason(e.target.value.slice(0, maxChars))}
                    />
                    <div className="text-[12px] text-gray-400 font-bold text-right">
                        {reason.length}/{maxChars} Characters
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={onClose}
                        className="flex-1 py-4.5 bg-white border border-gray-100 rounded-full font-bold text-[16px] text-[#999999] hover:bg-gray-50 transition-all shadow-sm"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => onAction(reason)}
                        disabled={!reason.trim()}
                        className="flex-1 py-4.5 border-2 border-red-500 rounded-full font-bold text-[16px] text-red-500 hover:bg-red-50 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-sm"
                    >
                        Block
                    </button>
                </div>
            </div>
        </div>
    );
}
