"use client";

import { useEffect } from "react";
import { CheckCircle2 } from "lucide-react";

interface SuccessModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    message: string;
}

export default function SuccessModal({ isOpen, onClose, title, message }: SuccessModalProps) {
    useEffect(() => {
        if (isOpen) {
            const timer = setTimeout(() => {
                onClose();
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300" />

            {/* Modal */}
            <div className="relative bg-white w-full max-w-[440px] rounded-[32px] p-12 shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col items-center text-center gap-6">
                {/* Success Icon */}
                <div className="w-20 h-20 rounded-full bg-[#E8F9F1] flex items-center justify-center text-[#00C853] mb-2">
                    <CheckCircle2 size={48} strokeWidth={2.5} />
                </div>

                <div className="flex flex-col gap-2">
                    <h2 className="text-[28px] font-bold text-[#1A1A1A] font-montserrat tracking-tight">
                        {title}
                    </h2>
                    <p className="text-[16px] text-gray-400 font-medium">
                        {message}
                    </p>
                </div>
            </div>
        </div>
    );
}
