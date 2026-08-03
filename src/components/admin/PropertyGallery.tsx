"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X, Play } from "lucide-react";
import { PropertyFile, PropertyFileType } from "@/types/property";

interface PropertyGalleryProps {
    files: PropertyFile[];
}

export default function PropertyGallery({ files }: PropertyGalleryProps) {
    const [activeIndex, setActiveIndex] = useState(0);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    if (files.length === 0) return null;

    const nextFile = () => setActiveIndex((prev) => (prev + 1) % files.length);
    const prevFile = () => setActiveIndex((prev) => (prev - 1 + files.length) % files.length);

    const activeFile = files[activeIndex];
    const isActiveVideo = activeFile?.type === PropertyFileType.Video;

    return (
        <div className="flex flex-col gap-4">
            <div className="relative w-full aspect-video rounded-[16px] overflow-hidden bg-black">
                {isActiveVideo ? (
                    <video
                        key={activeFile.fileUrl}
                        src={activeFile.fileUrl || undefined}
                        controls
                        className="absolute inset-0 w-full h-full object-contain"
                    />
                ) : (
                    <button
                        type="button"
                        onClick={() => setIsPreviewOpen(true)}
                        className="absolute inset-0 w-full h-full cursor-zoom-in"
                    >
                        <Image src={activeFile.fileUrl || ""} alt="Property" fill sizes="800px" className="object-cover" />
                    </button>
                )}

                {files.length > 1 && (
                    <>
                        <button
                            onClick={prevFile}
                            className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 flex items-center justify-center text-[#0B2545] hover:bg-white transition-all shadow-md z-10"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <button
                            onClick={nextFile}
                            className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 flex items-center justify-center text-[#0B2545] hover:bg-white transition-all shadow-md z-10"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </>
                )}
            </div>

            {files.length > 1 && (
                <div className="flex flex-wrap gap-3">
                    {files.map((file, idx) => {
                        const isVideo = file.type === PropertyFileType.Video;
                        return (
                            <button
                                key={file.id}
                                onClick={() => setActiveIndex(idx)}
                                className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-all bg-black ${activeIndex === idx ? "border-[#0095FF]" : "border-transparent opacity-70 hover:opacity-100"
                                    }`}
                            >
                                {isVideo ? (
                                    <>
                                        <video src={file.fileUrl || undefined} muted preload="metadata" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                            <Play size={14} className="text-white" fill="white" />
                                        </div>
                                    </>
                                ) : (
                                    <Image src={file.fileUrl || ""} alt={`Thumbnail ${idx}`} fill sizes="64px" className="object-cover" />
                                )}
                            </button>
                        );
                    })}
                </div>
            )}

            {isPreviewOpen && !isActiveVideo && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4"
                    onClick={() => setIsPreviewOpen(false)}
                >
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
                    <button
                        onClick={() => setIsPreviewOpen(false)}
                        className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
                    >
                        <X size={24} />
                    </button>
                    {files.length > 1 && (
                        <>
                            <button
                                onClick={(e) => { e.stopPropagation(); prevFile(); }}
                                className="absolute left-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors z-10"
                            >
                                <ChevronLeft size={22} />
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); nextFile(); }}
                                className="absolute right-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors z-10"
                            >
                                <ChevronRight size={22} />
                            </button>
                        </>
                    )}
                    <div className="relative w-[90vw] h-[85vh]" onClick={(e) => e.stopPropagation()}>
                        <Image src={activeFile.fileUrl || ""} alt="Property preview" fill sizes="90vw" className="object-contain" />
                    </div>
                </div>
            )}
        </div>
    );
}
