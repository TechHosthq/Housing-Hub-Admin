"use client";

import { useState } from "react";

interface DeletePropertyModalProps {
    isOpen: boolean;
    onClose: () => void;
    onDelete: (reason: string) => void;
}

export default function DeletePropertyModal({ isOpen, onClose, onDelete }: DeletePropertyModalProps) {
    const [reason, setReason] = useState("");
    const maxChars = 500;

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white w-full max-w-[500px] rounded-[32px] p-10 shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col items-center text-center gap-6">
                <h2 className="text-[32px] font-bold text-[#1A1A1A] font-montserrat tracking-tight">
                    Delete this Property?
                </h2>

                <p className="text-[16px] text-gray-500 font-medium font-montserrat">
                    This permanently removes the listing. This action cannot be undone. The owner will be notified by email with the reason below.
                </p>

                <div className="flex flex-col gap-2 w-full text-left">
                    <textarea
                        className="w-full min-h-[140px] p-4 bg-white border border-gray-200 rounded-xl text-[15px] font-medium text-[#1A1A1A] placeholder:text-gray-300 outline-none focus:border-[#0095FF]/50 transition-all resize-none"
                        placeholder="Reason for deletion..."
                        value={reason}
                        onChange={(e) => setReason(e.target.value.slice(0, maxChars))}
                    />
                    <span className="text-[12px] text-gray-400 font-medium text-right">
                        {reason.length}/{maxChars} Characters
                    </span>
                </div>

                <div className="flex items-center w-full gap-4">
                    <button
                        onClick={onClose}
                        className="flex-1 py-4 border border-[#0095FF] text-[#0095FF] rounded-full font-bold text-[16px] hover:bg-blue-50 transition-all font-montserrat"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => {
                            onDelete(reason);
                            onClose();
                        }}
                        disabled={!reason.trim()}
                        className="flex-1 py-4 bg-[#FF3B30] text-white rounded-full font-bold text-[16px] hover:bg-opacity-90 transition-all shadow-lg shadow-red-900/10 font-montserrat disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Delete Property
                    </button>
                </div>
            </div>
        </div>
    );
}
