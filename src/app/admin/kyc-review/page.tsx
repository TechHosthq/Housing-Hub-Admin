"use client";

import { useState } from "react";
import { Search, CheckCircle2, AlertCircle, User as UserIcon, Loader2, Ban } from "lucide-react";
import Link from "next/link";
import SuccessModal from "@/components/admin/SuccessModal";
import Pagination from "@/components/admin/Pagination";
import { useCustomer } from "@/hooks/useCustomer";
import { useOwner } from "@/hooks/useOwner";
import { format } from "date-fns";

const ITEMS_PER_PAGE = 20;

const TABS = [
    { label: "All", type: "all" },
    { label: "Customers", type: "customer" },
    { label: "Owners", type: "owner" },
];

export default function AdminKYCReviewPage() {
    const { useAllCustomers, verifyKyc: verifyCustomerKyc, isVerifyingKyc: isVerifyingCustomerKyc } = useCustomer();
    const { useAllOwners, verifyKyc: verifyOwnerKyc, isVerifyingKyc: isVerifyingOwnerKyc } = useOwner();

    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [activeTab, setActiveTab] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);

    const tab = TABS[activeTab];

    // Fetch customers with pending KYC
    const { data: customersResponse, isLoading: isLoadingCustomers } = useAllCustomers({
        pageNumber: 1,
        pageSize: 1000,
        isVerified: false,
        isActive: true,
    });

    // Fetch owners with pending KYC
    const { data: ownersResponse, isLoading: isLoadingOwners } = useOwner().useAllOwners({
        pageNumber: 1,
        pageSize: 1000,
        isVerified: false,
    });

    const pendingCustomers = customersResponse?.data?.items ?? [];
    const pendingOwners = ownersResponse?.data?.items ?? [];

    // Filter by search
    const filteredCustomers = debouncedSearch
        ? pendingCustomers.filter(c =>
            `${c.firstName} ${c.lastName}`.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
            c.email.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
            c.phoneNumber.toLowerCase().includes(debouncedSearch.toLowerCase())
          )
        : pendingCustomers;

    const filteredOwners = debouncedSearch
        ? pendingOwners.filter(o =>
            `${o.firstName} ${o.lastName}`.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
            o.email.toLowerCase().includes(debouncedSearch.toLowerCase())
          )
        : pendingOwners;

    // Get items based on active tab
    let allItems: any[] = [];
    if (tab.type === "all") {
        allItems = [
            ...filteredCustomers.map(c => ({ ...c, type: "customer" })),
            ...filteredOwners.map(o => ({ ...o, type: "owner" })),
        ];
    } else if (tab.type === "customer") {
        allItems = filteredCustomers.map(c => ({ ...c, type: "customer" }));
    } else if (tab.type === "owner") {
        allItems = filteredOwners.map(o => ({ ...o, type: "owner" }));
    }

    // Paginate
    const totalCount = allItems.length;
    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
    const paginatedItems = allItems.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const isLoading = isLoadingCustomers || isLoadingOwners;

    const handleSearchSubmit = () => {
        setDebouncedSearch(search);
        setCurrentPage(1);
    };

    const handleTabChange = (idx: number) => {
        setActiveTab(idx);
        setCurrentPage(1);
    };

    const handleApprove = (id: string, type: "customer" | "owner") => {
        const verifyFn = type === "customer" ? verifyCustomerKyc : verifyOwnerKyc;
        verifyFn({ id, approve: true }, {
            onSuccess: () => {
                // Refetch data
                setCurrentPage(1);
            }
        });
    };

    const [successModal, setSuccessModal] = useState({ isOpen: false, title: "", message: "" });

    return (
        <div className="flex flex-col gap-8">
            <SuccessModal
                isOpen={successModal.isOpen}
                onClose={() => setSuccessModal(prev => ({ ...prev, isOpen: false }))}
                title={successModal.title}
                message={successModal.message}
            />

            <h1 className="text-[28px] font-bold text-[#1A1A1A] font-montserrat">
                KYC Review
            </h1>

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
                    <Search size={18} />
                    Search
                </button>
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap items-center gap-3">
                {TABS.map((t, idx) => {
                    const count = t.type === "all" ? totalCount : t.type === "customer" ? filteredCustomers.length : filteredOwners.length;
                    return (
                        <button
                            key={t.label}
                            onClick={() => handleTabChange(idx)}
                            className={`px-6 py-2.5 rounded-full text-[13px] font-bold transition-all ${
                                activeTab === idx ? "bg-[#002B7F] text-white" : "bg-[#F2F2F2] text-[#999999] hover:bg-gray-200"
                            }`}
                        >
                            {t.label} {activeTab === idx && !isLoading ? `(${count})` : ""}
                        </button>
                    );
                })}
            </div>

            {/* KYC List */}
            <div className="flex flex-col gap-4 w-full">
                {isLoading ? (
                    <div className="py-20 flex justify-center">
                        <Loader2 className="animate-spin text-[#002B7F] w-10 h-10" />
                    </div>
                ) : paginatedItems.length === 0 ? (
                    <div className="py-20 text-center text-gray-400 font-bold">
                        No KYC submissions found.
                    </div>
                ) : (
                    paginatedItems.map(item => {
                        const isCustomer = item.type === "customer";
                        const name = `${item.firstName} ${item.lastName}`;
                        const email = item.email;
                        const submittedDate = item.kycSubmittedAt || item.createdAt;

                        return (
                            <div
                                key={item.id}
                                className="bg-white border border-gray-100 rounded-[20px] p-6 shadow-sm hover:shadow-md transition-all group relative"
                            >
                                <div className="flex items-center gap-5">
                                    <div className="w-14 h-14 rounded-full flex items-center justify-center bg-[#FFF9E9]">
                                        <AlertCircle size={28} className="text-[#FFA800]" strokeWidth={1.5} />
                                    </div>

                                    <div className="flex-1 flex flex-col gap-1.5">
                                        <div className="flex items-center gap-3">
                                            <h3 className="text-[18px] font-bold text-[#1A1A1A] group-hover:text-[#0095FF] transition-colors">
                                                {name}
                                            </h3>
                                            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-black uppercase tracking-wider bg-[#FFF9E9] text-[#FFA800]">
                                                <AlertCircle size={12} strokeWidth={3} />
                                                Pending Review
                                            </span>
                                            <span className="text-[11px] font-black px-3 py-1 rounded-full uppercase tracking-wider bg-gray-100 text-gray-500">
                                                {isCustomer ? "Customer" : "Owner"}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-6 text-[14px] font-medium text-gray-500">
                                            <span>{email}</span>
                                        </div>

                                        <div className="text-[13px] font-medium text-gray-400">
                                            Submitted {submittedDate ? format(new Date(submittedDate), "MMM dd, yyyy") : "N/A"}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2">
                                        <Link
                                            href={`/admin/kyc-review/${item.id}?type=${isCustomer ? "customer" : "owner"}`}
                                            className="px-6 py-2 text-[13px] font-bold text-white bg-[#0095FF] rounded-xl hover:bg-[#0075CC] transition-colors"
                                        >
                                            Review
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalCount={totalCount}
                    onPageChange={setCurrentPage}
                    itemsPerPage={ITEMS_PER_PAGE}
                />
            )}
        </div>
    );
}
