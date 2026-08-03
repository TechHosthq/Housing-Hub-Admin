"use client";

import Link from "next/link";
import { ChevronLeft, Loader2, ExternalLink } from "lucide-react";
import { useProperty } from "@/hooks/useProperty";

export default function DuplicatePropertiesPage() {
    const { useAllProperties, dismissDuplicateFlag, isDismissingDuplicateFlag } = useProperty();

    const { data: propertiesResponse, isLoading } = useAllProperties({
        pageNumber: 1,
        pageSize: 1000,
        flaggedDuplicateOnly: true,
    });

    const properties = propertiesResponse?.data?.items ?? [];

    return (
        <div className="flex flex-col gap-8">
            <Link href="/admin/properties" className="flex items-center gap-2 text-[#0095FF] font-bold text-[16px] hover:opacity-80 transition-opacity w-fit">
                <ChevronLeft size={20} /> Back
            </Link>

            <h1 className="text-[28px] font-bold text-[#1A1A1A] font-montserrat tracking-tight leading-none">
                Duplicate Listings
            </h1>
            <p className="text-[14px] font-medium text-gray-500 -mt-4">
                Listings flagged as possible duplicates when they were created. Review each one and dismiss the flag if it&apos;s a legitimate, separate listing.
            </p>

            <div className="bg-white border border-gray-100 rounded-[20px] overflow-hidden shadow-sm flex flex-col">
                {isLoading ? (
                    <div className="flex justify-center py-16">
                        <Loader2 className="animate-spin text-[#0B2545] w-12 h-12" />
                    </div>
                ) : properties.length === 0 ? (
                    <div className="py-16 text-center text-gray-400 font-bold">
                        No flagged duplicates. All clear.
                    </div>
                ) : (
                    <div className="flex flex-col gap-4 p-6">
                        {properties.map((property) => (
                            <div
                                key={property.id}
                                className="bg-gray-50 border border-gray-100 rounded-[16px] p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5"
                            >
                                <div className="flex flex-col gap-2 flex-1">
                                    <h3 className="text-[16px] font-bold text-[#1A1A1A]">
                                        {property.title}
                                    </h3>
                                    <p className="text-[14px] font-medium text-[#999999]">
                                        {property.address || "Location N/A"}
                                    </p>
                                    <p className="text-[13px] font-bold text-amber-600">
                                        Possible duplicate of: {property.possibleDuplicateOfTitle || "Unknown listing"}
                                    </p>
                                </div>

                                <div className="flex items-center gap-3 flex-shrink-0">
                                    <Link
                                        href={`/admin/properties/${property.id}`}
                                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 text-[#1A1A1A] font-bold text-[13px] hover:bg-white transition-all"
                                    >
                                        <ExternalLink size={14} /> View Property
                                    </Link>
                                    <button
                                        onClick={() => dismissDuplicateFlag(property.id)}
                                        disabled={isDismissingDuplicateFlag}
                                        className="px-5 py-2.5 rounded-xl bg-[#0B2545] text-white font-bold text-[13px] hover:bg-[#071A33] transition-all disabled:opacity-50"
                                    >
                                        Dismiss
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
