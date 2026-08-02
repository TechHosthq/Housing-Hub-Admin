"use client";

import { useState } from "react";

interface UnpublishPropertyModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUnpublish: (reason: string) => void;
}

export default function UnpublishPropertyModal({ isOpen, onClose, onUnpublish }: UnpublishPropertyModalProps) {
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
            <div className="relative bg-white w-full max-w-[500px] rounded-[24px] p-8 shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col gap-6">
                <div className="flex flex-col gap-2 text-center">
                    <h2 className="text-[28px] font-bold text-[#1A1A1A] font-montserrat">Unpublish Property</h2>
                    <p className="text-[15px] text-gray-500 font-medium">
                        The owner will be notified by email with the reason below.
                    </p>
                </div>

                <div className="flex flex-col gap-2">
                    <textarea
                        className="w-full min-h-[160px] p-4 bg-white border border-gray-200 rounded-xl text-[15px] font-medium text-[#1A1A1A] placeholder:text-gray-300 outline-none focus:border-[#0095FF]/50 transition-all resize-none"
                        placeholder="Reason for unpublishing..."
                        value={reason}
                        onChange={(e) => setReason(e.target.value.slice(0, maxChars))}
                    />
                    <span className="text-[12px] text-gray-400 font-medium text-right">
                        {reason.length}/{maxChars} Characters
                    </span>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={onClose}
                        className="flex-1 py-4 border border-gray-100 rounded-full font-bold text-[16px] text-gray-500 hover:bg-gray-50 transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => {
                            onUnpublish(reason);
                            onClose();
                        }}
                        disabled={!reason.trim()}
                        className="flex-1 py-4 border-2 border-[#FFA800] rounded-full font-bold text-[16px] text-[#FFA800] hover:bg-orange-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Unpublish
                    </button>
                </div>
            </div>
        </div>
    );
}
