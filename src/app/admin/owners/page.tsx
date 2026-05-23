"use client";

import { useState, useEffect } from "react";
import { Search, CheckCircle2, AlertCircle, Ban, User, RefreshCw, Loader2 } from "lucide-react";
import Link from "next/link";
import SuccessModal from "@/components/admin/SuccessModal";
import { useOwner } from "@/hooks/useOwner";
import { format } from "date-fns";

const TABS = [
    { label: "All", isVerified: undefined, isActive: undefined },
    { label: "Pending KYC", isVerified: false, isActive: true },
    { label: "Verified", isVerified: true, isActive: undefined },
    { label: "Blocked", isVerified: undefined, isActive: false },
];

export default function AdminOwnersPage() {
    const { useAllOwners, suspendOwner, isSuspendingOwner, reactivateOwner, isReactivatingOwner } = useOwner();

    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [activeTab, setActiveTab] = useState(0);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const params = new URLSearchParams(window.location.search);
            if (params.get("tab") === "kyc") {
                setActiveTab(1);
            }
        }
    }, []);

    const [pageNumber, setPageNumber] = useState(1);
    const [successModal, setSuccessModal] = useState({ isOpen: false, title: "", message: "" });

    const tab = TABS[activeTab];
    const { data: ownersResponse, isLoading } = useAllOwners({
        pageNumber,
        pageSize: 20,
        search: debouncedSearch || undefined,
        isVerified: tab.isVerified,
        isActive: tab.isActive,
    });

    const owners = ownersResponse?.data?.items ?? [];
    const totalCount = ownersResponse?.data?.totalCount ?? 0;
    const totalPages = ownersResponse?.data?.totalPages ?? 1;

    const handleSearchSubmit = () => {
        setDebouncedSearch(search);
        setPageNumber(1);
    };

    const handleTabChange = (idx: number) => {
        setActiveTab(idx);
        setPageNumber(1);
    };

    const handleSuspend = (id: string) => {
        suspendOwner(id, {
            onSuccess: () => setSuccessModal({ isOpen: true, title: "Owner Suspended", message: "The owner account has been suspended." }),
        });
    };

    const handleReactivate = (id: string) => {
        reactivateOwner(id, {
            onSuccess: () => setSuccessModal({ isOpen: true, title: "Owner Reactivated", message: "The owner account has been reactivated." }),
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

            <h1 className="text-[28px] font-bold text-[#1A1A1A] font-montserrat">Manage Owners</h1>

            {/* Search */}
            <div className="flex gap-3 w-full">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search by name, email or phone"
                        className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-full text-[14px] focus:ring-2 focus:ring-[#0095FF]/10 outline-none transition-all"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && handleSearchSubmit()}
                    />
                </div>
                <button
                    onClick={handleSearchSubmit}
                    className="bg-[#002B7F] text-white px-8 py-3.5 rounded-full font-bold text-[14px] hover:bg-[#001D56] transition-all flex items-center gap-2"
                >
                    <Search size={18} /> Search
                </button>
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap items-center gap-3">
                {TABS.map((t, idx) => (
                    <button
                        key={t.label}
                        onClick={() => handleTabChange(idx)}
                        className={`px-6 py-2.5 rounded-full text-[13px] font-bold transition-all ${
                            activeTab === idx ? "bg-[#002B7F] text-white" : "bg-[#F2F2F2] text-[#999999] hover:bg-gray-200"
                        }`}
                    >
                        {t.label} {activeTab === idx && !isLoading ? `(${totalCount})` : ""}
                    </button>
                ))}
            </div>

            {/* Owner List */}
            <div className="flex flex-col gap-4 w-full">
                {isLoading ? (
                    <div className="py-20 flex justify-center">
                        <Loader2 className="animate-spin text-[#002B7F] w-10 h-10" />
                    </div>
                ) : owners.length === 0 ? (
                    <div className="py-20 text-center text-gray-400 font-bold">
                        No owners found matching your criteria.
                    </div>
                ) : (
                    owners.map(owner => {
                        const isActive = owner.isActive !== false;
                        const status = owner.isKycVerified ? "Verified" : owner.kycPending ? "Pending KYC" : "Unverified";

                        return (
                            <div key={owner.id} className="bg-white border border-gray-100 rounded-[20px] p-6 shadow-sm hover:shadow-md transition-all group relative">
                                <div className="flex items-center gap-5">
                                    <div className={`w-14 h-14 rounded-full flex items-center justify-center ${isActive ? "bg-[#F2F7FF] text-gray-400" : "bg-red-50 text-red-300"}`}>
                                        <User size={28} strokeWidth={1.5} />
                                    </div>

                                    <div className="flex-1 flex flex-col gap-1.5">
                                        <div className="flex items-center gap-3">
                                            <h3 className="text-[18px] font-bold text-[#1A1A1A] group-hover:text-[#0095FF] transition-colors">
                                                {owner.firstName} {owner.lastName}
                                            </h3>
                                            <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-black uppercase tracking-wider ${
                                                status === "Verified" ? "bg-[#E8F9F1] text-[#00C853]"
                                                : status === "Pending KYC" ? "bg-[#FFF9E9] text-[#FFA800]"
                                                : "bg-gray-100 text-gray-400"
                                            }`}>
                                                {status === "Verified" && <CheckCircle2 size={12} strokeWidth={3} />}
                                                {status === "Pending KYC" && <AlertCircle size={12} strokeWidth={3} />}
                                                {status}
                                            </span>
                                            {!isActive && (
                                                <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-black uppercase bg-red-50 text-red-400">
                                                    <Ban size={12} /> Suspended
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-6 text-[14px] font-medium text-gray-500">
                                            <span>{owner.email}</span>
                                            <span>{owner.phoneNumber}</span>
                                        </div>

                                        <div className="text-[13px] font-medium text-gray-400">
                                            Joined {owner.dateJoined ? format(new Date(owner.dateJoined), "MMM dd, yyyy") : owner.dateCreated ? format(new Date(owner.dateCreated), "MMM dd, yyyy") : "N/A"}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2">
                                        {owner.kycPending && (
                                            <Link
                                                href={`/admin/kyc-review/${owner.id}?type=owner`}
                                                className="px-4 py-2 text-[13px] font-bold text-[#0095FF] bg-[#E9F3FF] rounded-xl hover:bg-[#D9EAFF] transition-colors"
                                            >
                                                Review KYC
                                            </Link>
                                        )}
                                        {isActive ? (
                                            <button
                                                onClick={() => handleSuspend(owner.id)}
                                                disabled={isSuspendingOwner}
                                                className="px-4 py-2 text-[13px] font-bold text-red-500 bg-red-50 rounded-xl hover:bg-red-100 transition-colors disabled:opacity-50 flex items-center gap-1"
                                            >
                                                <Ban size={14} /> Suspend
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleReactivate(owner.id)}
                                                disabled={isReactivatingOwner}
                                                className="px-4 py-2 text-[13px] font-bold text-green-600 bg-green-50 rounded-xl hover:bg-green-100 transition-colors disabled:opacity-50 flex items-center gap-1"
                                            >
                                                <RefreshCw size={14} /> Reactivate
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 pt-4">
                    <button disabled={pageNumber === 1} onClick={() => setPageNumber(p => p - 1)}
                        className="px-4 py-2 rounded-xl text-[14px] font-bold border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-all">
                        Previous
                    </button>
                    <span className="text-[14px] font-medium text-gray-500">Page {pageNumber} of {totalPages}</span>
                    <button disabled={pageNumber >= totalPages} onClick={() => setPageNumber(p => p + 1)}
                        className="px-4 py-2 rounded-xl text-[14px] font-bold border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-all">
                        Next
                    </button>
                </div>
            )}
        </div>
    );
}
