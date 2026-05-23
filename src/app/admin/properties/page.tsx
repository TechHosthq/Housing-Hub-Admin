"use client";

import { useState } from "react";
import { MoreVertical, ChevronDown, Loader2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useProperty } from "@/hooks/useProperty";
import { useInspection } from "@/hooks/useInspection";
import Pagination from "@/components/admin/Pagination";
import { format } from "date-fns";
import { InspectionStatus } from "@/types/inspection";

const ITEMS_PER_PAGE = 20;

const inspectionStatusLabels: Record<InspectionStatus, string> = {
    [InspectionStatus.Pending]: "Pending",
    [InspectionStatus.Confirmed]: "Confirmed",
    [InspectionStatus.Completed]: "Completed",
    [InspectionStatus.Cancelled]: "Cancelled",
    [InspectionStatus.Declined]: "Declined",
    [InspectionStatus.RescheduleRequested]: "Rescheduled",
};

const inspectionStatusColors: Record<InspectionStatus, string> = {
    [InspectionStatus.Pending]: "bg-orange-50 text-orange-600",
    [InspectionStatus.Confirmed]: "bg-blue-50 text-[#0095FF]",
    [InspectionStatus.Completed]: "bg-green-50 text-green-600",
    [InspectionStatus.Cancelled]: "bg-red-50 text-red-500",
    [InspectionStatus.Declined]: "bg-red-50 text-red-500",
    [InspectionStatus.RescheduleRequested]: "bg-purple-50 text-purple-600",
};

export default function AdminPropertiesPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("LISTED PROPERTIES");
    const [inspectionFilter, setInspectionFilter] = useState("All");
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [propertyPage, setPropertyPage] = useState(1);
    const [inspectionPage, setInspectionPage] = useState(1);

    const { useAllProperties } = useProperty();
    const { useAllInspections } = useInspection();

    const { data: propertiesResponse, isLoading: isLoadingProperties } = useAllProperties({
        pageNumber: 1,
        pageSize: 1000,
    });

    const { data: inspectionsResponse, isLoading: isLoadingInspections } = useAllInspections({
        pageNumber: 1,
        pageSize: 1000,
    });

    const properties = propertiesResponse?.data?.items ?? [];
    const allInspections = inspectionsResponse?.data?.items ?? [];

    const isInspections = activeTab === "INSPECTIONS";

    const filteredInspections = allInspections.filter(inspection =>
        inspectionFilter === "All" || inspection.status.toString() === inspectionFilter
    );

    // Calculate pagination for properties
    const propertiesTotal = properties.length;
    const propertiesTotalPages = Math.ceil(propertiesTotal / ITEMS_PER_PAGE);
    const paginatedProperties = properties.slice(
        (propertyPage - 1) * ITEMS_PER_PAGE,
        propertyPage * ITEMS_PER_PAGE
    );

    // Calculate pagination for inspections
    const inspectionsTotal = filteredInspections.length;
    const inspectionsTotalPages = Math.ceil(inspectionsTotal / ITEMS_PER_PAGE);
    const paginatedInspections = filteredInspections.slice(
        (inspectionPage - 1) * ITEMS_PER_PAGE,
        inspectionPage * ITEMS_PER_PAGE
    );

    const totalCount = allInspections.length;
    const confirmedCount = allInspections.filter(i => i.status === InspectionStatus.Confirmed).length;
    const pendingCount = allInspections.filter(i => i.status === InspectionStatus.Pending).length;
    const completedCount = allInspections.filter(i => i.status === InspectionStatus.Completed).length;

    const filters = [
        { label: `All (${totalCount})`, value: "All" },
        { label: `Confirmed (${confirmedCount})`, value: InspectionStatus.Confirmed.toString() },
        { label: `Pending (${pendingCount})`, value: InspectionStatus.Pending.toString() },
        { label: `Completed (${completedCount})`, value: InspectionStatus.Completed.toString() },
    ];

    const handleInspectionFilterChange = (value: string) => {
        setInspectionFilter(value);
        setInspectionPage(1);
    };

    return (
        <div className="flex flex-col gap-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-[28px] font-bold text-[#1A1A1A] font-montserrat tracking-tight leading-none">
                    Property Management
                </h1>

                {/* Filter Dropdown */}
                <div className="relative">
                    <button
                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                        className="flex items-center gap-4 px-6 py-3 bg-white border border-gray-100 rounded-[14px] shadow-sm hover:bg-gray-50 transition-all group"
                    >
                        <span className="text-[14px] font-medium text-gray-400">
                            {isInspections ? "All Inspections" : "All properties"}
                        </span>
                        <ChevronDown
                            size={18}
                            className={`text-gray-400 transition-transform duration-300 ${isFilterOpen ? "rotate-180" : ""}`}
                        />
                    </button>
                    {isFilterOpen && (
                        <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-lg py-2 z-10 animate-in fade-in zoom-in-95 duration-200">
                            {(isInspections ? ["All Inspections", "Confirmed", "Pending", "Completed"] : ["All properties", "Published", "Posted"]).map((option) => (
                                <button
                                    key={option}
                                    className="w-full text-left px-4 py-2.5 text-[14px] font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                                    onClick={() => {
                                        setIsFilterOpen(false);
                                        if (isInspections) {
                                            if (option === "All Inspections") setInspectionFilter("All");
                                            else if (option === "Confirmed") setInspectionFilter(InspectionStatus.Confirmed.toString());
                                            else if (option === "Pending") setInspectionFilter(InspectionStatus.Pending.toString());
                                            else if (option === "Completed") setInspectionFilter(InspectionStatus.Completed.toString());
                                        }
                                    }}
                                >
                                    {option}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Main Tabs */}
            <div className="flex bg-gray-50 p-1.5 rounded-[12px] w-fit">
                <button
                    onClick={() => setActiveTab("LISTED PROPERTIES")}
                    className={`px-12 py-3 rounded-[10px] text-[13px] font-black transition-all ${activeTab === "LISTED PROPERTIES"
                        ? "bg-white text-[#1A1A1A] shadow-sm"
                        : "text-gray-400 hover:text-gray-600"
                        }`}
                >
                    LISTED PROPERTIES ({properties.length})
                </button>
                <button
                    onClick={() => setActiveTab("INSPECTIONS")}
                    className={`px-12 py-3 rounded-[10px] text-[13px] font-black transition-all ${activeTab === "INSPECTIONS"
                        ? "bg-white text-[#1A1A1A] shadow-sm"
                        : "text-gray-400 hover:text-gray-600"
                        }`}
                >
                    INSPECTIONS ({allInspections.length})
                </button>
            </div>

            {/* Tab Content */}
            {activeTab === "LISTED PROPERTIES" ? (
                <div className="bg-white border border-gray-100 rounded-[20px] overflow-hidden shadow-sm flex flex-col">
                    {isLoadingProperties ? (
                        <div className="flex justify-center py-16">
                            <Loader2 className="animate-spin text-[#002B7F] w-12 h-12" />
                        </div>
                    ) : properties.length === 0 ? (
                        <div className="py-16 text-center text-gray-400 font-bold">
                            No properties found.
                        </div>
                    ) : (
                        <>
                            <div className="flex flex-col gap-4 p-6">
                                {paginatedProperties.map((property) => {
                                    const propertyImage = property.files?.[0]?.fileUrl || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=300";
                                    const propertyLocation = property.propertyAddress
                                        ? `${property.propertyAddress.place || ""}, ${property.propertyAddress.city || ""}, ${property.propertyAddress.state || ""}`
                                        : property.address || "Location N/A";
                                    const isPublished = property.isPublished;
                                    const formattedDate = property.datePosted || property.dateCreated 
                                        ? format(new Date(property.datePosted || property.dateCreated), "yyyy-MM-dd")
                                        : "N/A";

                                    return (
                                        <div
                                            key={property.id}
                                            onClick={() => router.push(`/admin/properties/${property.id}`)}
                                            className="bg-gray-50 border border-gray-100 rounded-[16px] p-6 flex flex-col sm:flex-row items-center gap-5 group hover:shadow-sm transition-all cursor-pointer relative"
                                        >
                                            {/* Thumbnail */}
                                            <div className="w-full sm:w-[110px] h-[110px] rounded-[12px] bg-gray-100 relative overflow-hidden flex-shrink-0">
                                                <Image
                                                    src={propertyImage}
                                                    alt={property.title || "Property"}
                                                    fill
                                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                                />
                                            </div>

                                            {/* Info */}
                                            <div className="flex flex-col gap-2 flex-1">
                                                <div className="flex items-center gap-3">
                                                    <h3 className="text-[18px] font-bold text-[#1A1A1A] group-hover:text-[#0095FF] transition-colors">
                                                        {property.title}
                                                    </h3>
                                                    <span className={`text-[11px] font-black px-3 py-1 rounded-full uppercase tracking-wider ${isPublished
                                                            ? "bg-green-50 text-green-500"
                                                            : "bg-yellow-50 text-yellow-500"
                                                        }`}>
                                                        {isPublished ? "Published" : "Posted"}
                                                    </span>
                                                </div>
                                                <p className="text-[14px] font-medium text-[#999999]">
                                                    {propertyLocation}
                                                </p>
                                                <div className="flex items-center gap-4 text-[13px]">
                                                    <span className="font-bold text-[#1A1A1A]">
                                                        Owner: <span className="text-[#999999] font-medium">{property.ownerName || "Owner"}</span>
                                                    </span>
                                                    <span className="font-bold text-[#0095FF]">
                                                        Date: <span className="text-[#999999] font-medium">{formattedDate}</span>
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                }}
                                                className="p-2 text-gray-300 hover:text-gray-600 hover:bg-white rounded-full transition-all flex-shrink-0"
                                            >
                                                <MoreVertical size={20} />
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                            {propertiesTotalPages > 1 && (
                                <Pagination
                                    currentPage={propertyPage}
                                    totalPages={propertiesTotalPages}
                                    totalCount={propertiesTotal}
                                    onPageChange={setPropertyPage}
                                    itemsPerPage={ITEMS_PER_PAGE}
                                />
                            )}
                        </>
                    )}
                </div>
            ) : (
                <div className="flex flex-col gap-8">
                    {/* Inspection Sub-filters */}
                    <div className="flex items-center gap-3">
                        {filters.map((filter) => (
                            <button
                                key={filter.value}
                                onClick={() => handleInspectionFilterChange(filter.value)}
                                className={`px-6 py-2 rounded-full text-[13px] font-bold transition-all ${inspectionFilter === filter.value
                                    ? "bg-[#002B7F] text-white"
                                    : "bg-gray-50 text-[#999999] hover:bg-gray-100"
                                    }`}
                            >
                                {filter.label}
                            </button>
                        ))}
                    </div>

                    {/* Inspection List */}
                    <div className="bg-white border border-gray-100 rounded-[20px] overflow-hidden shadow-sm flex flex-col">
                        {isLoadingInspections ? (
                            <div className="flex justify-center py-16">
                                <Loader2 className="animate-spin text-[#002B7F] w-12 h-12" />
                            </div>
                        ) : filteredInspections.length === 0 ? (
                            <div className="py-16 text-center text-gray-400 font-bold">
                                No inspections found.
                            </div>
                        ) : (
                            <>
                                <div className="flex flex-col gap-4 p-6">
                                    {paginatedInspections.map((inspection) => {
                                        const inspectionImage = "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=300";
                                        const formattedDate = inspection.scheduledDate
                                            ? format(new Date(inspection.scheduledDate), "yyyy-MM-dd")
                                            : "N/A";
                                        const statusColor = inspectionStatusColors[inspection.status] ?? "bg-gray-50 text-gray-500";
                                        const statusLabel = inspectionStatusLabels[inspection.status] ?? "Unknown";

                                        return (
                                            <div
                                                key={inspection.id}
                                                onClick={() => router.push(`/admin/inspections`)}
                                                className="bg-gray-50 border border-gray-100 rounded-[16px] p-6 flex flex-col sm:flex-row items-center gap-5 group hover:shadow-sm transition-all cursor-pointer relative"
                                            >
                                                {/* Thumbnail */}
                                                <div className="w-full sm:w-[110px] h-[110px] rounded-[12px] bg-gray-100 relative overflow-hidden flex-shrink-0">
                                                    <Image
                                                        src={inspectionImage}
                                                        alt={inspection.propertyName || "Property"}
                                                        fill
                                                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                                                    />
                                                </div>

                                                {/* Info */}
                                                <div className="flex flex-col gap-2 flex-1">
                                                    <div className="flex items-center gap-3">
                                                        <h3 className="text-[18px] font-bold text-[#1A1A1A] group-hover:text-[#0095FF] transition-colors">
                                                            {inspection.propertyName}
                                                        </h3>
                                                        <span className={`text-[11px] font-black px-3 py-1 rounded-full uppercase tracking-wider ${statusColor}`}>
                                                            {statusLabel}
                                                        </span>
                                                    </div>
                                                    <p className="text-[14px] font-medium text-[#999999]">
                                                        {inspection.propertyAddress || "Location N/A"}
                                                    </p>
                                                    <div className="flex items-center gap-4 text-[13px]">
                                                        <span className="font-bold text-[#1A1A1A]">
                                                            Renter: <span className="text-[#999999] font-medium">{inspection.customerName || "Customer"}</span>
                                                        </span>
                                                        <span className="font-bold text-[#0095FF]">
                                                            Requested: <span className="text-[#999999] font-medium">{formattedDate}</span>
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Actions */}
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                    }}
                                                    className="p-2 text-gray-300 hover:text-gray-600 hover:bg-white rounded-full transition-all flex-shrink-0"
                                                >
                                                    <MoreVertical size={20} />
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                                {inspectionsTotalPages > 1 && (
                                    <Pagination
                                        currentPage={inspectionPage}
                                        totalPages={inspectionsTotalPages}
                                        totalCount={inspectionsTotal}
                                        onPageChange={setInspectionPage}
                                        itemsPerPage={ITEMS_PER_PAGE}
                                    />
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
