"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    onPageChange: (page: number) => void;
    itemsPerPage?: number;
}

export default function Pagination({
    currentPage,
    totalPages,
    totalCount,
    onPageChange,
    itemsPerPage = 20,
}: PaginationProps) {
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalCount);

    const handlePrevious = () => {
        if (currentPage > 1) {
            onPageChange(currentPage - 1);
        }
    };

    const handleNext = () => {
        if (currentPage < totalPages) {
            onPageChange(currentPage + 1);
        }
    };

    if (totalPages <= 1) return null;

    return (
        <div className="flex items-center justify-between px-6 py-5 border-t border-gray-100 bg-gray-50/50 rounded-b-[20px]">
            <span className="text-[13px] font-bold text-gray-400">
                {totalCount} total items
            </span>
            <div className="flex items-center gap-3">
                <button
                    className="p-2 border border-gray-200 rounded-lg text-gray-400 disabled:opacity-50 hover:bg-white transition-all"
                    disabled={currentPage === 1}
                    onClick={handlePrevious}
                    title="Previous page"
                >
                    <ChevronLeft size={18} />
                </button>
                <div className="flex items-center gap-2">
                    <span className="text-[13px] font-bold text-gray-500">
                        {startItem}-{endItem} of {totalCount}
                    </span>
                </div>
                <button
                    className="p-2 border border-gray-200 rounded-lg text-gray-400 disabled:opacity-50 hover:bg-white transition-all"
                    disabled={currentPage >= totalPages}
                    onClick={handleNext}
                    title="Next page"
                >
                    <ChevronRight size={18} />
                </button>
            </div>
        </div>
    );
}
