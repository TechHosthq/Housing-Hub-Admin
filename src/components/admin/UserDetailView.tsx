"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Ban, RefreshCw, MessageSquare, User as UserIcon, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { Customer } from "@/types/customer";

interface UserDetailViewProps {
    customer: Customer;
    kycType: "customer" | "owner";
    onSuspend: () => void;
    isSuspending: boolean;
    onReactivate: () => void;
    isReactivating: boolean;
}

export default function UserDetailView({ customer, kycType, onSuspend, isSuspending, onReactivate, isReactivating }: UserDetailViewProps) {
    const router = useRouter();

    const isActive = customer.isActive !== false;
    const status = customer.isKycVerified
        ? "Verified"
        : customer.kycPending
            ? "Pending KYC"
            : "Unverified";

    const joined = customer.dateJoined || customer.dateCreated;

    return (
        <div className="flex flex-col gap-8 pb-12">
            <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-[#0095FF] font-bold text-[16px] hover:opacity-80 transition-opacity w-fit"
            >
                ← Back
            </button>

            {/* Header Card */}
            <div className="bg-white border border-gray-100 rounded-[20px] p-8 shadow-sm flex flex-col sm:flex-row items-center gap-6">
                <div className="w-[120px] h-[120px] rounded-full bg-gray-100 relative overflow-hidden flex-shrink-0 flex items-center justify-center">
                    {customer.profileImageUrl ? (
                        <Image src={customer.profileImageUrl} alt={`${customer.firstName} ${customer.lastName}`} fill className="object-cover" />
                    ) : (
                        <UserIcon size={48} className="text-gray-300" strokeWidth={1.5} />
                    )}
                </div>
                <div className="flex flex-col gap-2 flex-1 text-center sm:text-left">
                    <div className="flex items-center justify-center sm:justify-start gap-3 flex-wrap">
                        <h1 className="text-[24px] font-black text-[#1A1A1A] font-montserrat tracking-tight leading-none">
                            {customer.firstName} {customer.lastName}
                        </h1>
                        <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider ${status === "Verified" ? "bg-[#E8F9F1] text-[#00C853]"
                            : status === "Pending KYC" ? "bg-[#FFF9E9] text-[#FFA800]"
                                : "bg-gray-100 text-gray-400"
                            }`}>
                            {status === "Verified" && <CheckCircle2 size={12} strokeWidth={3} />}
                            {status === "Pending KYC" && <AlertCircle size={12} strokeWidth={3} />}
                            {status}
                        </span>
                        {!isActive && (
                            <span className="flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-black uppercase bg-red-50 text-red-400">
                                <Ban size={12} /> Suspended
                            </span>
                        )}
                    </div>
                    <p className="text-[15px] font-medium text-gray-500">{customer.email} &bull; {customer.phoneNumber}</p>
                    <p className="text-[13px] font-medium text-gray-400">
                        Joined {joined ? format(new Date(joined), "MMM dd, yyyy") : "N/A"}
                    </p>
                </div>
            </div>

            {/* KYC Details */}
            <div className="bg-white border border-gray-100 rounded-[20px] p-8 shadow-sm flex flex-col gap-6">
                <h3 className="text-[20px] font-bold text-[#1A1A1A] font-montserrat">KYC Details</h3>
                <div className="flex flex-col gap-5">
                    <div className="flex justify-between items-start pb-4 border-b border-gray-50">
                        <span className="text-[12px] font-black text-[#B3B3B3] uppercase tracking-wider">National ID Number</span>
                        <span className="text-[14px] font-bold text-[#1A1A1A]">{customer.nationalIdNumber || "N/A"}</span>
                    </div>
                    <div className="flex justify-between items-start pb-4 border-b border-gray-50">
                        <span className="text-[12px] font-black text-[#B3B3B3] uppercase tracking-wider">KYC Submitted</span>
                        <span className="text-[14px] font-bold text-[#1A1A1A]">
                            {customer.kycSubmittedAt ? format(new Date(customer.kycSubmittedAt), "MMM dd, yyyy") : "Not submitted"}
                        </span>
                    </div>
                    {customer.kycRejectionReason && (
                        <div className="flex justify-between items-start pb-4 border-b border-gray-50">
                            <span className="text-[12px] font-black text-[#B3B3B3] uppercase tracking-wider">Rejection Reason</span>
                            <span className="text-[14px] font-bold text-red-500 text-right max-w-[60%]">{customer.kycRejectionReason}</span>
                        </div>
                    )}
                    {customer.idDocumentUrl && (
                        <div className="flex flex-col gap-3">
                            <span className="text-[12px] font-black text-[#B3B3B3] uppercase tracking-wider">ID Document</span>
                            <a href={customer.idDocumentUrl} target="_blank" rel="noopener noreferrer" className="block w-full max-w-[320px]">
                                <div className="relative w-full h-[200px] rounded-[16px] overflow-hidden border border-gray-100 bg-gray-50">
                                    <Image src={customer.idDocumentUrl} alt="ID Document" fill className="object-cover" />
                                </div>
                            </a>
                        </div>
                    )}
                </div>
            </div>

            {/* Additional Info */}
            {(customer.jobTitle || customer.companyName || customer.industry || customer.address) && (
                <div className="bg-white border border-gray-100 rounded-[20px] p-8 shadow-sm flex flex-col gap-6">
                    <h3 className="text-[20px] font-bold text-[#1A1A1A] font-montserrat">Additional Information</h3>
                    <div className="flex flex-col gap-5">
                        {customer.jobTitle && (
                            <div className="flex justify-between items-start pb-4 border-b border-gray-50">
                                <span className="text-[12px] font-black text-[#B3B3B3] uppercase tracking-wider">Job Title</span>
                                <span className="text-[14px] font-bold text-[#1A1A1A]">{customer.jobTitle}</span>
                            </div>
                        )}
                        {customer.companyName && (
                            <div className="flex justify-between items-start pb-4 border-b border-gray-50">
                                <span className="text-[12px] font-black text-[#B3B3B3] uppercase tracking-wider">Company</span>
                                <span className="text-[14px] font-bold text-[#1A1A1A]">{customer.companyName}</span>
                            </div>
                        )}
                        {customer.industry && (
                            <div className="flex justify-between items-start pb-4 border-b border-gray-50">
                                <span className="text-[12px] font-black text-[#B3B3B3] uppercase tracking-wider">Industry</span>
                                <span className="text-[14px] font-bold text-[#1A1A1A]">{customer.industry}</span>
                            </div>
                        )}
                        {customer.address && (
                            <div className="flex justify-between items-start">
                                <span className="text-[12px] font-black text-[#B3B3B3] uppercase tracking-wider">Address</span>
                                <span className="text-[14px] font-bold text-[#1A1A1A] text-right max-w-[60%]">
                                    {[customer.address.street, customer.address.city, customer.address.state, customer.address.country].filter(Boolean).join(", ") || "N/A"}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
                <Link
                    href={`/admin/messages?recipientId=${customer.id}&recipientName=${encodeURIComponent(`${customer.firstName} ${customer.lastName}`)}`}
                    className="flex-1 py-5 border-2 border-gray-200 text-[#1A1A1A] rounded-[16px] font-bold text-[16px] hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                >
                    <MessageSquare size={20} />
                    Message
                </Link>

                {customer.kycPending && (
                    <Link
                        href={`/admin/kyc-review/${customer.id}?type=${kycType}`}
                        className="flex-1 py-5 bg-[#0095FF] text-white rounded-[16px] font-bold text-[16px] hover:bg-opacity-90 transition-all flex items-center justify-center gap-2"
                    >
                        Review KYC
                    </Link>
                )}

                {isActive ? (
                    <button
                        onClick={onSuspend}
                        disabled={isSuspending}
                        className="flex-1 py-5 border-2 border-[#FF3B30] text-[#FF3B30] rounded-[16px] font-bold text-[16px] hover:bg-red-50 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {isSuspending ? <Loader2 className="animate-spin" size={20} /> : <Ban size={20} />}
                        Suspend
                    </button>
                ) : (
                    <button
                        onClick={onReactivate}
                        disabled={isReactivating}
                        className="flex-1 py-5 border-2 border-green-500 text-green-600 rounded-[16px] font-bold text-[16px] hover:bg-green-50 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {isReactivating ? <Loader2 className="animate-spin" size={20} /> : <RefreshCw size={20} />}
                        Reactivate
                    </button>
                )}
            </div>
        </div>
    );
}
