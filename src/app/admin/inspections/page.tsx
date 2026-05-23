"use client";

import { useState } from "react";
import { Search, Calendar, Clock, CheckCircle, XCircle, Ban, Loader2 } from "lucide-react";
import { useInspection } from "@/hooks/useInspection";
import Pagination from "@/components/admin/Pagination";
import { format } from "date-fns";
import { InspectionStatus } from "@/types/inspection";
import SuccessModal from "@/components/admin/SuccessModal";

const statusLabels: Record<InspectionStatus, string> = {
    [InspectionStatus.Pending]: "Pending",
    [InspectionStatus.Confirmed]: "Confirmed",
    [InspectionStatus.Completed]: "Completed",
    [InspectionStatus.Cancelled]: "Cancelled",
    [InspectionStatus.Declined]: "Declined",
    [InspectionStatus.RescheduleRequested]: "Reschedule Requested",
};

const statusColors: Record<InspectionStatus, string> = {
    [InspectionStatus.Pending]: "bg-orange-50 text-orange-600",
    [InspectionStatus.Confirmed]: "bg-blue-50 text-[#0095FF]",
    [InspectionStatus.Completed]: "bg-green-50 text-green-600",
    [InspectionStatus.Cancelled]: "bg-red-50 text-red-500",
    [InspectionStatus.Declined]: "bg-red-50 text-red-500",
    [InspectionStatus.RescheduleRequested]: "bg-purple-50 text-purple-600",
};

export default function AdminInspectionsPage() {
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [pageNumber, setPageNumber] = useState(1);
    const [successModal, setSuccessModal] = useState({ isOpen: false, title: "", message: "" });

    const {
        useAllInspections,
        confirmInspection, isConfirming,
        declineInspection, isDeclining,
        cancelInspection, isCancelling,
    } = useInspection();

    const { data: inspectionsResponse, isLoading } = useAllInspections({
        pageNumber,
        pageSize: 20,
        status: statusFilter === "all" ? undefined : parseInt(statusFilter),
    });

    const allInspections = inspectionsResponse?.data?.items ?? [];
    const totalPages = inspectionsResponse?.data?.totalPages ?? 1;
    const totalCount = inspectionsResponse?.data?.totalCount ?? 0;

    // Client-side search filter on property name / inspection ID
    const inspections = debouncedSearch
        ? allInspections.filter(i =>
            i.propertyName?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
            i.inspectionId?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
            i.customerName?.toLowerCase().includes(debouncedSearch.toLowerCase())
          )
        : allInspections;

    const handleConfirm = (id: string) => {
        confirmInspection(id, {
            onSuccess: () => setSuccessModal({ isOpen: true, title: "Inspection Confirmed", message: "The inspection has been confirmed." }),
        });
    };

    const handleDecline = (id: string) => {
        declineInspection({ id }, {
            onSuccess: () => setSuccessModal({ isOpen: true, title: "Inspection Declined", message: "The inspection has been declined." }),
        });
    };

    const handleCancel = (id: string) => {
        cancelInspection(id, {
            onSuccess: () => setSuccessModal({ isOpen: true, title: "Inspection Cancelled", message: "The inspection has been cancelled." }),
        });
    };

    return (
        <div className="flex flex-col gap-8">
            <SuccessModal
                isOpen={successModal.isOpen}
                onClose={() => setSuccessModal(prev => ({ ...prev, isOpen: false }))}
                title={successModal.title}
                message={successModal.message}
            />

            <div>
                <h1 className="text-[28px] font-black text-[#1A1A1A] font-montserrat mb-1">Inspection Management</h1>
                <p className="text-gray-500 font-medium">Monitor and manage all property inspections.</p>
            </div>

            {/* Filters & Search */}
            <div className="bg-white p-4 rounded-[20px] border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search by property, customer or inspection ID..."
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-xl text-[14px] focus:ring-2 focus:ring-[#0095FF]/20 transition-all outline-none"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        onKeyDown={e => {
                            if (e.key === "Enter") {
                                setDebouncedSearch(search);
                                setPageNumber(1);
                            }
                        }}
                    />
                </div>
                <select
                    className="w-full md:w-48 py-3 px-4 bg-gray-50 border-none rounded-xl text-[14px] focus:ring-2 focus:ring-[#0095FF]/20 transition-all outline-none font-bold text-gray-600"
                    value={statusFilter}
                    onChange={e => { setStatusFilter(e.target.value); setPageNumber(1); }}
                >
                    <option value="all">All Status</option>
                    {Object.entries(statusLabels).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                    ))}
                </select>
            </div>

            {/* Inspections Table */}
            <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm overflow-hidden">
                {isLoading ? (
                    <div className="flex justify-center py-16">
                        <Loader2 className="animate-spin text-[#002B7F] w-12 h-12" />
                    </div>
                ) : inspections.length === 0 ? (
                    <div className="py-16 text-center text-gray-400 font-bold">
                        No inspections found.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100">
                                    <th className="px-8 py-5 text-[13px] font-black text-gray-500 uppercase tracking-wider">Property & Customer</th>
                                    <th className="px-6 py-5 text-[13px] font-black text-gray-500 uppercase tracking-wider">Schedule</th>
                                    <th className="px-6 py-5 text-[13px] font-black text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-8 py-5 text-[13px] font-black text-gray-500 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {inspections.map(inspection => (
                                    <tr key={inspection.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-8 py-5">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-[#1A1A1A] group-hover:text-[#0095FF] transition-colors">
                                                    {inspection.propertyName ?? "Property Inspection"}
                                                </span>
                                                <span className="text-[12px] text-gray-400 font-medium mt-0.5">
                                                    {inspection.customerName ?? "Customer"} &bull; {inspection.propertyAddress ?? ""}
                                                </span>
                                                <span className="text-[11px] text-[#0095FF] font-black uppercase tracking-wider mt-1">
                                                    {inspection.inspectionId ?? inspection.id?.slice(0, 8).toUpperCase()}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2 text-[13px] font-bold text-gray-700">
                                                    <Calendar size={14} className="text-gray-400" />
                                                    {inspection.scheduledDate ? format(new Date(inspection.scheduledDate), "MMM dd, yyyy") : "N/A"}
                                                </div>
                                                <div className="flex items-center gap-2 text-[12px] text-gray-400 font-medium">
                                                    <Clock size={14} />
                                                    {typeof inspection.scheduledTime === "string" ? inspection.scheduledTime.slice(0, 5) : "N/A"}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${statusColors[inspection.status] ?? "bg-gray-100 text-gray-500"}`}>
                                                {statusLabels[inspection.status] ?? "Unknown"}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center justify-end gap-2">
                                                {inspection.status === InspectionStatus.Pending && (
                                                    <>
                                                        <button
                                                            onClick={() => handleConfirm(inspection.id)}
                                                            disabled={isConfirming}
                                                            title="Confirm"
                                                            className="p-2 rounded-lg bg-blue-50 text-[#0095FF] hover:bg-blue-100 transition-colors disabled:opacity-50"
                                                        >
                                                            <CheckCircle size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDecline(inspection.id)}
                                                            disabled={isDeclining}
                                                            title="Decline"
                                                            className="p-2 rounded-lg bg-orange-50 text-orange-500 hover:bg-orange-100 transition-colors disabled:opacity-50"
                                                        >
                                                            <XCircle size={16} />
                                                        </button>
                                                    </>
                                                )}
                                                {(inspection.status === InspectionStatus.Pending || inspection.status === InspectionStatus.Confirmed) && (
                                                    <button
                                                        onClick={() => handleCancel(inspection.id)}
                                                        disabled={isCancelling}
                                                        title="Cancel"
                                                        className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors disabled:opacity-50"
                                                    >
                                                        <Ban size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <Pagination
                        currentPage={pageNumber}
                        totalPages={totalPages}
                        totalCount={totalCount}
                        onPageChange={setPageNumber}
                        itemsPerPage={20}
                    />
                )}
            </div>
        </div>
    );
}
