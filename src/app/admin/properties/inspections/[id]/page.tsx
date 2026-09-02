"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, Calendar, Clock, User, CheckCircle2, Loader2, FileText, Ban } from "lucide-react";
import Image from "next/image";
import { useInspection } from "@/hooks/useInspection";
import adminAccountService from "@/services/adminAccountService";
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

export default function InspectionDetailsPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;
    const [successModal, setSuccessModal] = useState({ isOpen: false, title: "", message: "" });
    const [isAssignPickerOpen, setIsAssignPickerOpen] = useState(false);
    const [selectedStaffId, setSelectedStaffId] = useState("");
    const [isReschedulingOpen, setIsReschedulingOpen] = useState(false);
    const [rescheduleDate, setRescheduleDate] = useState("");
    const [rescheduleTime, setRescheduleTime] = useState("");
    const [rescheduleNote, setRescheduleNote] = useState("");

    const {
        useGetInspection,
        confirmInspection, isConfirming,
        declineInspection, isDeclining,
        assignInspection, isAssigning,
        rescheduleInspection, isRescheduling,
    } = useInspection();

    const { data: inspectionResponse, isLoading, error } = useGetInspection(id);
    const { data: profile } = useQuery({
        queryKey: ["admin-profile"],
        queryFn: () => adminAccountService.getProfile(),
    });
    const isSuperAdmin = profile?.role === "SuperAdmin";

    const inspection = inspectionResponse?.data;

    const { data: staffMembers = [] } = useQuery({
        queryKey: ["admin-staff"],
        queryFn: () => adminAccountService.getStaff(),
        enabled: isSuperAdmin && !!inspection?.handedOffAt && !inspection?.assignedStaffName,
    });

    const handleAssign = () => {
        if (!id || !selectedStaffId) return;
        assignInspection({ id, staffAdminId: selectedStaffId }, {
            onSuccess: () => {
                setIsAssignPickerOpen(false);
                setSuccessModal({
                    isOpen: true,
                    title: "Staff Assigned",
                    message: "The inspection has been assigned to the selected staff member.",
                });
            },
        });
    };

    const handleReschedule = () => {
        if (!id || !rescheduleDate || !rescheduleTime) return;
        rescheduleInspection({ id, data: { rescheduledDate: rescheduleDate, rescheduledTime: `${rescheduleTime}:00`, note: rescheduleNote || null } }, {
            onSuccess: () => {
                setIsReschedulingOpen(false);
                setRescheduleDate("");
                setRescheduleTime("");
                setRescheduleNote("");
                setSuccessModal({
                    isOpen: true,
                    title: "Inspection Rescheduled",
                    message: "Both parties have been notified of the new date and time.",
                });
            },
        });
    };

    const handleConfirm = () => {
        if (!id) return;
        confirmInspection(id, {
            onSuccess: () => {
                setSuccessModal({
                    isOpen: true,
                    title: "Inspection Confirmed",
                    message: "The inspection has been successfully confirmed.",
                });
            },
        });
    };

    const handleDecline = () => {
        if (!id) return;
        declineInspection({ id }, {
            onSuccess: () => {
                setSuccessModal({
                    isOpen: true,
                    title: "Inspection Declined",
                    message: "The inspection has been successfully declined.",
                });
            },
        });
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-32 gap-4">
                <Loader2 className="animate-spin text-[#0095FF] w-12 h-12" />
                <p className="text-gray-500 font-bold">Loading inspection details...</p>
            </div>
        );
    }

    if (error || !inspection) {
        return (
            <div className="flex flex-col items-center justify-center py-32 gap-6 text-center">
                <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center text-red-500">
                    <Ban size={32} />
                </div>
                <div className="flex flex-col gap-2">
                    <h2 className="text-[22px] font-black text-[#1A1A1A] font-montserrat">Inspection Not Found</h2>
                    <p className="text-gray-400 font-medium">We couldn&apos;t retrieve the details for this inspection.</p>
                </div>
                <button
                    onClick={() => router.back()}
                    className="px-6 py-3 bg-[#0095FF] text-white rounded-full font-bold text-[14px] hover:opacity-90 transition-opacity"
                >
                    Go Back
                </button>
            </div>
        );
    }

    const scheduledDateFormatted = inspection.scheduledDate
        ? format(new Date(inspection.scheduledDate), "MMMM dd, yyyy")
        : "N/A";

    const scheduledTimeFormatted = typeof inspection.scheduledTime === "string"
        ? inspection.scheduledTime.slice(0, 5)
        : "N/A";

    const dateRequestedFormatted = inspection.dateCreated
        ? format(new Date(inspection.dateCreated), "MMMM dd, yyyy")
        : "N/A";

    const statusColor = statusColors[inspection.status] ?? "bg-gray-50 text-gray-500";
    const statusLabel = statusLabels[inspection.status] ?? "Unknown";

    return (
        <div className="flex flex-col gap-8">
            <SuccessModal
                isOpen={successModal.isOpen}
                onClose={() => {
                    setSuccessModal(prev => ({ ...prev, isOpen: false }));
                    router.refresh();
                }}
                title={successModal.title}
                message={successModal.message}
            />

            {/* Back Button */}
            <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-[#0095FF] font-bold text-[16px] hover:opacity-80 transition-opacity w-fit"
            >
                <ChevronLeft size={20} />
                Back
            </button>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-[28px] font-black text-[#1A1A1A] font-montserrat tracking-tight mb-1">
                        Inspection Details
                    </h1>
                    <p className="text-gray-500 font-medium uppercase tracking-wider text-[11px] font-mono">
                        ID: {inspection.inspectionId ?? inspection.id}
                    </p>
                </div>
            </div>

            {/* Header Card */}
            <div className="bg-white border border-gray-100 rounded-[20px] p-8 shadow-sm flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                    {/* Thumbnail */}
                    <div className="w-[120px] h-[120px] rounded-[16px] bg-gray-100 relative overflow-hidden flex-shrink-0">
                        <Image
                            src="/images/property-1.jpg"
                            alt={inspection.propertyName || "Property"}
                            fill
                            className="object-cover"
                        />
                    </div>

                    {/* Info */}
                    <div className="flex flex-col gap-2">
                        <div className="flex flex-wrap items-center gap-3">
                            <h2 className="text-[24px] font-black text-[#1A1A1A] font-montserrat tracking-tight leading-tight">
                                {inspection.propertyName ?? "Property Inspection"}
                            </h2>
                            <span className={`text-[11px] font-black px-3 py-1 rounded-full uppercase tracking-wider ${statusColor}`}>
                                {statusLabel}
                            </span>
                        </div>
                        <p className="text-[17px] font-medium text-[#999999] mb-1">
                            {inspection.propertyAddress || "Location Details N/A"}
                        </p>
                        <p className="text-[16px] font-bold text-[#1A1A1A]">
                            Renter: <span className="text-[#999999] font-medium">{inspection.customerName || "Customer"}</span>
                        </p>
                    </div>
                </div>

                {/* Assigned Staff / Context info — only relevant once the owner has handed this off */}
                {inspection.handedOffAt && (
                    <div className="flex flex-col gap-3 w-full lg:w-auto">
                        <span className="text-[12px] font-black text-[#1A1A1A] uppercase tracking-wider">
                            Assigned Staff
                        </span>
                        {inspection.assignedStaffName ? (
                            <div className="flex items-center gap-3 px-6 py-3.5 bg-[#F2F7FF] rounded-xl min-w-[280px]">
                                <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-gray-400">
                                    <User size={14} strokeWidth={2.5} stroke="#0095FF" />
                                </div>
                                <span className="text-[15px] font-bold text-[#0095FF]">
                                    {inspection.assignedStaffName}
                                </span>
                            </div>
                        ) : isSuperAdmin ? (
                            isAssignPickerOpen ? (
                                <div className="flex flex-col gap-2 min-w-[280px]">
                                    <select
                                        value={selectedStaffId}
                                        onChange={(e) => setSelectedStaffId(e.target.value)}
                                        className="px-4 py-3 rounded-xl border border-gray-200 text-[14px] font-medium text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#0095FF]/10"
                                    >
                                        <option value="">Choose a staff member</option>
                                        {staffMembers.filter((s) => s.isActive).map((s) => (
                                            <option key={s.id} value={s.id}>{s.firstName} {s.lastName}</option>
                                        ))}
                                    </select>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setIsAssignPickerOpen(false)}
                                            className="flex-1 py-2.5 rounded-full border border-gray-200 text-[13px] font-bold text-gray-500 hover:bg-gray-50 transition-all"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleAssign}
                                            disabled={!selectedStaffId || isAssigning}
                                            className="flex-1 py-2.5 rounded-full bg-[#0095FF] text-white text-[13px] font-bold hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-1"
                                        >
                                            {isAssigning && <Loader2 size={14} className="animate-spin" />}
                                            Assign
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setIsAssignPickerOpen(true)}
                                    className="flex items-center gap-3 px-6 py-3.5 bg-[#F2F7FF] rounded-xl min-w-[280px] hover:bg-[#E9F3FF] transition-all"
                                >
                                    <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-gray-400">
                                        <User size={14} strokeWidth={2.5} stroke="#0095FF" />
                                    </div>
                                    <span className="text-[15px] font-bold text-[#0095FF]">
                                        Assign a staff member
                                    </span>
                                </button>
                            )
                        ) : (
                            <div className="flex items-center gap-3 px-6 py-3.5 bg-gray-50 rounded-xl min-w-[280px]">
                                <span className="text-[14px] font-medium text-gray-400">
                                    Awaiting staff assignment
                                </span>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Info Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Date Card */}
                <div className="bg-white border border-gray-100 rounded-[20px] p-6 shadow-sm flex items-center gap-5">
                    <div className="w-[50px] h-[50px] rounded-full bg-[#F2F7FF] flex items-center justify-center text-[#0095FF] shadow-sm">
                        <Calendar size={24} />
                    </div>
                    <div className="flex flex-col gap-0.5">
                        <span className="text-[16px] font-bold text-[#1A1A1A]">Scheduled Date</span>
                        <span className="text-[14px] font-medium text-gray-400">{scheduledDateFormatted}</span>
                    </div>
                </div>

                {/* Time Card */}
                <div className="bg-white border border-gray-100 rounded-[20px] p-6 shadow-sm flex items-center gap-5">
                    <div className="w-[50px] h-[50px] rounded-full bg-[#F2F7FF] flex items-center justify-center text-[#0095FF] shadow-sm">
                        <Clock size={24} />
                    </div>
                    <div className="flex flex-col gap-0.5">
                        <span className="text-[16px] font-bold text-[#1A1A1A]">Scheduled Time</span>
                        <span className="text-[14px] font-medium text-gray-400">{scheduledTimeFormatted}</span>
                    </div>
                </div>

                {/* Request Date Card */}
                <div className="bg-white border border-gray-100 rounded-[20px] p-6 shadow-sm flex items-center gap-5">
                    <div className="w-[50px] h-[50px] rounded-full bg-[#F2F7FF] flex items-center justify-center text-[#0095FF] shadow-sm">
                        <CheckCircle2 size={24} />
                    </div>
                    <div className="flex flex-col gap-0.5">
                        <span className="text-[16px] font-bold text-[#1A1A1A]">Requested On</span>
                        <span className="text-[14px] font-medium text-gray-400">{dateRequestedFormatted}</span>
                    </div>
                </div>
            </div>

            {/* Note & Additional Info */}
            <div className="bg-white border border-gray-100 rounded-[20px] p-8 shadow-sm flex flex-col gap-4">
                <div className="flex items-center gap-2 text-[#1A1A1A]">
                    <FileText size={20} className="text-[#0095FF]" />
                    <h3 className="text-[18px] font-bold">Renter&apos;s Booking Note</h3>
                </div>
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                    <p className="text-gray-600 text-[15px] font-medium leading-relaxed italic">
                        {inspection.note ? `"${inspection.note}"` : "No special instructions or note provided by the renter."}
                    </p>
                </div>

                {inspection.declineNote && (
                    <div className="mt-4 flex flex-col gap-2">
                        <span className="text-[14px] font-bold text-red-500">Decline Reason</span>
                        <div className="bg-red-50/50 rounded-xl p-5 border border-red-100">
                            <p className="text-red-700 text-[15px] font-medium leading-relaxed italic">
                                &ldquo;{inspection.declineNote}&rdquo;
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Confirm Assignment Section (Only visible for Pending status) */}
            {inspection.status === InspectionStatus.Pending && (
                <div className="bg-white border border-gray-100 rounded-[20px] p-8 shadow-sm flex flex-col gap-6 mt-2">
                    <div>
                        <h3 className="text-[20px] font-bold text-[#1A1A1A] mb-1">
                            Process Inspection Request
                        </h3>
                        <p className="text-gray-400 font-medium text-[14px]">
                            Accept or decline this scheduled property inspection request.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <button
                            onClick={handleDecline}
                            disabled={isConfirming || isDeclining}
                            className="flex-1 py-4 border-2 border-[#FF5252] text-[#FF5252] rounded-full font-bold text-[16px] hover:bg-red-50 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isDeclining && <Loader2 size={18} className="animate-spin" />}
                            Decline Request
                        </button>
                        <button
                            onClick={handleConfirm}
                            disabled={isConfirming || isDeclining}
                            className="flex-1 py-4 border-2 border-[#0095FF] bg-[#0095FF] text-white rounded-full font-bold text-[16px] hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isConfirming && <Loader2 size={18} className="animate-spin" />}
                            Accept & Confirm
                        </button>
                    </div>
                </div>
            )}

            {/* Reschedule Section (Pending or Confirmed inspections can be rescheduled) */}
            {(inspection.status === InspectionStatus.Pending || inspection.status === InspectionStatus.Confirmed) && (
                <div className="bg-white border border-gray-100 rounded-[20px] p-8 shadow-sm flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-[20px] font-bold text-[#1A1A1A] mb-1">
                                Reschedule Inspection
                            </h3>
                            <p className="text-gray-400 font-medium text-[14px]">
                                Propose a new date and time — both the renter and owner will be notified.
                            </p>
                        </div>
                        {!isReschedulingOpen && (
                            <button
                                onClick={() => setIsReschedulingOpen(true)}
                                className="px-6 py-3 border-2 border-[#0095FF] text-[#0095FF] rounded-full font-bold text-[14px] hover:bg-blue-50 transition-all shrink-0"
                            >
                                Reschedule
                            </button>
                        )}
                    </div>

                    {isReschedulingOpen && (
                        <div className="flex flex-col gap-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <input
                                    type="date"
                                    value={rescheduleDate}
                                    onChange={(e) => setRescheduleDate(e.target.value)}
                                    className="px-4 py-3 rounded-xl border border-gray-200 text-[14px] font-medium text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#0095FF]/10"
                                />
                                <input
                                    type="time"
                                    value={rescheduleTime}
                                    onChange={(e) => setRescheduleTime(e.target.value)}
                                    className="px-4 py-3 rounded-xl border border-gray-200 text-[14px] font-medium text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#0095FF]/10"
                                />
                            </div>
                            <textarea
                                value={rescheduleNote}
                                onChange={(e) => setRescheduleNote(e.target.value)}
                                placeholder="Optional note for both parties..."
                                className="px-4 py-3 rounded-xl border border-gray-200 text-[14px] font-medium text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#0095FF]/10 resize-none h-24"
                            />
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setIsReschedulingOpen(false)}
                                    className="flex-1 py-3 rounded-full border border-gray-200 font-bold text-[14px] text-gray-500 hover:bg-gray-50 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleReschedule}
                                    disabled={!rescheduleDate || !rescheduleTime || isRescheduling}
                                    className="flex-1 py-3 rounded-full bg-[#0095FF] text-white font-bold text-[14px] hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isRescheduling && <Loader2 size={16} className="animate-spin" />}
                                    Confirm New Time
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
