"use client";

import { X } from "lucide-react";

interface DocumentPreviewModalProps {
    url: string | null;
    onClose: () => void;
}

const IMAGE_EXTENSION_PATTERN = /\.(jpe?g|png|gif|webp|bmp)(\?.*)?$/i;

export default function DocumentPreviewModal({ url, onClose }: DocumentPreviewModalProps) {
    if (!url) return null;

    const isImage = IMAGE_EXTENSION_PATTERN.test(url);

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            <button
                onClick={onClose}
                className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
            >
                <X size={24} />
            </button>
            <div
                className="relative w-[90vw] h-[85vh] bg-white rounded-2xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {isImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={url} alt="Document preview" className="w-full h-full object-contain bg-black" />
                ) : (
                    <iframe src={url} title="Document preview" className="w-full h-full" />
                )}
            </div>
        </div>
    );
}
