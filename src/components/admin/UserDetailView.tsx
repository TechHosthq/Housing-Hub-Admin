"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Ban, RefreshCw, MessageSquare, User as UserIcon, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { Customer } from "@/types/customer";
import customerService from "@/services/customerService";
import DocumentPreviewModal from "@/components/ui/DocumentPreviewModal";

interface UserDetailViewProps {
    customer: Customer;
    kycType: "customer" | "owner";
    onSuspend: () => void;
    isSuspending: boolean;
    onReactivate: () => void;
    isReactivating: boolean;
    isSuperAdmin?: boolean;
    onToggleManaged?: () => void;
    isTogglingManaged?: boolean;
}

export default function UserDetailView({ customer, kycType, onSuspend, isSuspending, onReactivate, isReactivating, isSuperAdmin, onToggleManaged, isTogglingManaged }: UserDetailViewProps) {
    const router = useRouter();
    const [isDocumentPreviewOpen, setIsDocumentPreviewOpen] = useState(false);

    // KYC documents live in a private bucket, so customer.idDocumentUrl is an opaque
    // object key. Exchange it for a short-lived presigned URL only when the reviewer
    // actually opens the document — fetching on page load would waste most of the
    // link's ten-minute lifetime before anyone looks at it.
    const [documentUrl, setDocumentUrl] = useState<string | null>(null);
    const [isLoadingDocument, setIsLoadingDocument] = useState(false);
    const [documentError, setDocumentError] = useState("");

    const openDocument = async () => {
        setDocumentError("");
        setIsLoadingDocument(true);
        try {
            const response = await customerService.getKycDocumentUrl(customer.id);
            if (response.isSuccessful && response.data) {
                setDocumentUrl(response.data);
                setIsDocumentPreviewOpen(true);
            } else {
                setDocumentError(response.message || "Could not load the document.");
            }
        } catch {
            setDocumentError("Could not load the document.");
        } finally {
            setIsLoadingDocument(false);
        }
    };

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
                        {kycType === "owner" && customer.isManagedByHousingHub && (
                            <span className="flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-black uppercase bg-blue-50 text-[#0095FF]">
                                Managed
                            </span>
                        )}
                    </div>
                    <p className="text-[15px] font-medium text-gray-500">{customer.email} &bull; {customer.phoneNumber}</p>
                    <p className="text-[13px] font-medium text-gray-400">
                        Joined {joined ? format(new Date(joined), "MMM dd, yyyy") : "N/A"}
                    </p>

                    {kycType === "owner" && isSuperAdmin && (
                        <div className="flex items-center gap-3 mt-3 justify-center sm:justify-start">
                            <span className="text-[13px] font-bold text-gray-500">Managed by HousingHub</span>
                            <button
                                onClick={onToggleManaged}
                                disabled={isTogglingManaged}
                                className={`relative w-14 h-7 rounded-full transition-colors duration-300 disabled:opacity-50 ${customer.isManagedByHousingHub ? "bg-[#0B2545]" : "bg-gray-200"}`}
                            >
                                <div className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform duration-300 ${customer.isManagedByHousingHub ? "translate-x-7" : ""}`} />
                            </button>
                        </div>
                    )}
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
                            <button
                                type="button"
                                onClick={openDocument}
                                disabled={isLoadingDocument}
                                className="flex items-center gap-2 w-fit px-5 py-3 rounded-full border border-gray-200 text-[13px] font-bold text-[#0B2545] hover:bg-gray-50 transition-colors disabled:opacity-60"
                            >
                                {isLoadingDocument && <Loader2 size={15} className="animate-spin" />}
                                {isLoadingDocument ? "Preparing…" : "View ID Document"}
                            </button>
                            {documentError && (
                                <span className="text-[12px] font-bold text-red-500">{documentError}</span>
                            )}
                        </div>
                    )}

                    {isDocumentPreviewOpen && documentUrl && (
                        <DocumentPreviewModal
                            url={documentUrl}
                            onClose={() => { setIsDocumentPreviewOpen(false); setDocumentUrl(null); }}
                        />
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
