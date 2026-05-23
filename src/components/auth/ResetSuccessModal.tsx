"use client";

import { Check } from "lucide-react";
import { useEffect, useState } from "react";

interface ResetSuccessModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function ResetSuccessModal({ isOpen, onClose }: ResetSuccessModalProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
        } else {
            const timer = setTimeout(() => setIsVisible(false), 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    if (!isVisible) return null;

    return (
        <div
            className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0"
                }`}
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/10 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div
                className={`relative bg-white rounded-[32px] w-full max-w-[320px] p-10 flex flex-col items-center text-center shadow-2xl transition-transform duration-300 ${isOpen ? "scale-100" : "scale-95"
                    }`}
            >
                {/* Success Icon */}
                <div className="w-16 h-16 rounded-full bg-[#E9F3FF] flex items-center justify-center mb-6">
                    <Check className="text-primary-dark stroke-[3px]" size={32} />
                </div>

                <h2 className="text-[17px] font-bold text-[#1A1A1A] font-montserrat">
                    Password Reset Successful!
                </h2>
            </div>
        </div>
    );
}
