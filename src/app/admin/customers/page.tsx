"use client";

import { useState, useCallback, useEffect } from "react";
import { Search, CheckCircle2, AlertCircle, User as UserIcon, Loader2, Ban, RefreshCw } from "lucide-react";
import Link from "next/link";
import SuccessModal from "@/components/admin/SuccessModal";
import Pagination from "@/components/admin/Pagination";
import { useCustomer } from "@/hooks/useCustomer";
import { format } from "date-fns";

const TABS = [
    { label: "All", isVerified: undefined, isActive: undefined },
    { label: "Pending KYC", isVerified: false, isActive: true },
    { label: "Verified", isVerified: true, isActive: undefined },
    { label: "Blocked", isVerified: undefined, isActive: false },
];

export default function AdminCustomersPage() {
    const { useAllCustomers, suspendCustomer, isSuspendingCustomer, reactivateCustomer, isReactivatingCustomer } = useCustomer();

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
    const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
    const [successModal, setSuccessModal] = useState({ isOpen: false, title: "", message: "" });

    const tab = TABS[activeTab];
    const { data: customersResponse, isLoading } = useAllCustomers({
        pageNumber,
        pageSize: 20,
        search: debouncedSearch || undefined,
        isVerified: tab.isVerified,
        isActive: tab.isActive,
    });

    const customers = customersResponse?.data?.items ?? [];
    const apiTotalCount = customersResponse?.data?.totalCount ?? 0;
    const apiTotalPages = customersResponse?.data?.totalPages ?? 1;
    const ITEMS_PER_PAGE = 20;

    // If API provides pagination use it; otherwise fallback to client-side pagination
    const totalCount = apiTotalCount || customers.length;
    const totalPages = apiTotalPages > 1 ? apiTotalPages : Math.max(1, Math.ceil(customers.length / ITEMS_PER_PAGE));

    const paginatedCustomers = apiTotalPages > 1
        ? customers
        : customers.slice((pageNumber - 1) * ITEMS_PER_PAGE, pageNumber * ITEMS_PER_PAGE);

    const hasPagination = apiTotalPages > 1 || customers.length > ITEMS_PER_PAGE || apiTotalCount > ITEMS_PER_PAGE;

    // Ensure current page is within bounds when data changes
    useEffect(() => {
        if (pageNumber > totalPages) setPageNumber(1);
    }, [totalPages]);

    const handleSearchSubmit = () => {
        setDebouncedSearch(search);
        setPageNumber(1);
    };

    const handleTabChange = (idx: number) => {
        setActiveTab(idx);
        setPageNumber(1);
    };

    const handleSuspend = (id: string) => {
        setOpenDropdownId(null);
        suspendCustomer(id, {
            onSuccess: () => setSuccessModal({ isOpen: true, title: "Customer Suspended", message: "The customer account has been suspended." }),
        });
    };

    const handleReactivate = (id: string) => {
        setOpenDropdownId(null);
        reactivateCustomer(id, {
            onSuccess: () => setSuccessModal({ isOpen: true, title: "Customer Reactivated", message: "The customer account has been reactivated." }),
        });
    };

    return (
        <div className="flex flex-col gap-8" onClick={() => setOpenDropdownId(null)}>
            <SuccessModal
                isOpen={successModal.isOpen}
                onClose={() => setSuccessModal(prev => ({ ...prev, isOpen: false }))}
                title={successModal.title}
                message={successModal.message}
            />

            <h1 className="text-[28px] font-bold text-[#1A1A1A] font-montserrat" onClick={e => e.stopPropagation()}>
                Manage Customers
            </h1>

            {/* Search */}
            <div className="flex gap-3 w-full" onClick={e => e.stopPropagation()}>
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
                    <Search size={18} />
                    Search
                </button>
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap items-center gap-3" onClick={e => e.stopPropagation()}>
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

            {/* Pagination (top) */}
            {hasPagination && (
                <div className="w-full">
                    <Pagination
                        currentPage={pageNumber}
                        totalPages={totalPages}
                        totalCount={totalCount}
                        onPageChange={setPageNumber}
                        itemsPerPage={ITEMS_PER_PAGE}
                    />
                </div>
            )}

            {/* Customer List */}
            <div className="bg-white border border-gray-100 rounded-[20px] overflow-hidden shadow-sm flex flex-col">
                {isLoading ? (
                    <div className="py-20 flex justify-center">
                        <Loader2 className="animate-spin text-[#002B7F] w-10 h-10" />
                    </div>
                ) : customers.length === 0 ? (
                    <div className="py-20 text-center text-gray-400 font-bold">
                        No customers found matching your criteria.
                    </div>
                ) : (
                    <>
                        <div className="flex flex-col gap-4 p-6">
                            {paginatedCustomers.map(customer => {
                                const isActive = customer.isActive !== false;
                                const status = customer.isKycVerified
                                    ? "Verified"
                                    : customer.kycPending
                                    ? "Pending KYC"
                                    : "Unverified";

                                return (
                                    <div
                                        key={customer.id}
                                        className="bg-gray-50 border border-gray-100 rounded-[16px] p-6 shadow-sm hover:shadow-md transition-all group relative"
                                    >
                                        <div className="flex items-center gap-5">
                                            <div className={`w-14 h-14 rounded-full flex items-center justify-center ${isActive ? "bg-[#F2F7FF] text-gray-400" : "bg-red-50 text-red-300"}`}>
                                                <UserIcon size={28} strokeWidth={1.5} />
                                            </div>

                                            <div className="flex-1 flex flex-col gap-1.5">
                                                <div className="flex items-center gap-3">
                                                    <h3 className="text-[18px] font-bold text-[#1A1A1A] group-hover:text-[#0095FF] transition-colors">
                                                        {customer.firstName} {customer.lastName}
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
                                                            <Ban size={12} />
                                                            Suspended
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="flex items-center gap-6 text-[14px] font-medium text-gray-500">
                                                    <span>{customer.email}</span>
                                                    <span>{customer.phoneNumber}</span>
                                                </div>

                                                <div className="text-[13px] font-medium text-gray-400">
                                                    Joined {customer.dateJoined ? format(new Date(customer.dateJoined), "MMM dd, yyyy") : customer.dateCreated ? format(new Date(customer.dateCreated), "MMM dd, yyyy") : "N/A"}
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                                                {customer.kycPending && (
                                                    <Link
                                                        href={`/admin/kyc-review/${customer.id}?type=customer`}
                                                        className="px-4 py-2 text-[13px] font-bold text-[#0095FF] bg-[#E9F3FF] rounded-xl hover:bg-[#D9EAFF] transition-colors"
                                                    >
                                                        Review KYC
                                                    </Link>
                                                )}
                                                {isActive ? (
                                                    <button
                                                        onClick={() => handleSuspend(customer.id)}
                                                        disabled={isSuspendingCustomer}
                                                        className="px-4 py-2 text-[13px] font-bold text-red-500 bg-red-50 rounded-xl hover:bg-red-100 transition-colors disabled:opacity-50 flex items-center gap-1"
                                                    >
                                                        <Ban size={14} /> Suspend
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handleReactivate(customer.id)}
                                                        disabled={isReactivatingCustomer}
                                                        className="px-4 py-2 text-[13px] font-bold text-green-600 bg-green-50 rounded-xl hover:bg-green-100 transition-colors disabled:opacity-50 flex items-center gap-1"
                                                    >
                                                        <RefreshCw size={14} /> Reactivate
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        {totalPages > 1 && (
                            <Pagination
                                currentPage={pageNumber}
                                totalPages={totalPages}
                                totalCount={totalCount}
                                onPageChange={setPageNumber}
                                itemsPerPage={20}
                            />
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
