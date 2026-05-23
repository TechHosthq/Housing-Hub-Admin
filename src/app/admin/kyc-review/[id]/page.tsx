"use client";

import { ArrowLeft, User as UserIcon, FileText, CheckCircle2, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import RejectKYCModal from "@/components/admin/RejectKYCModal";
import { useCustomer } from "@/hooks/useCustomer";
import { useOwner } from "@/hooks/useOwner";
import { format } from "date-fns";

export default function KYCReviewPage() {
    const router = useRouter();
    const params = useParams();
    const searchParams = useSearchParams();
    const id = params.id as string;
    const type = searchParams.get("type") || "customer";
    const isCustomer = type === "customer";
    
    const { useGetCustomer, verifyKyc: verifyCustomerKyc, isVerifyingKyc: isVerifyingCustomerKyc } = useCustomer();
    const { useGetOwner, verifyKyc: verifyOwnerKyc, isVerifyingKyc: isVerifyingOwnerKyc } = useOwner();

    const { data: customerResponse, isLoading: isLoadingCustomer } = useGetCustomer(isCustomer ? id : null);
    const { data: ownerResponse, isLoading: isLoadingOwner } = useGetOwner(!isCustomer ? id : null);

    const isLoading = isCustomer ? isLoadingCustomer : isLoadingOwner;
    const customer = isCustomer ? customerResponse?.data : ownerResponse?.data;
    
    const verifyKyc = isCustomer ? verifyCustomerKyc : verifyOwnerKyc;
    const isVerifyingKyc = isCustomer ? isVerifyingCustomerKyc : isVerifyingOwnerKyc;
    
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [status, setStatus] = useState<"Pending" | "Verified" | "Rejected">("Pending");

    useEffect(() => {
        if (customer) {
            setStatus(customer.isKycVerified ? "Verified" : "Pending");
        }
    }, [customer]);

    const handleReject = (reason: string) => {
        verifyKyc({ id, approve: false }, {
            onSuccess: () => {
                setStatus("Rejected");
                setIsRejectModalOpen(false);
                setTimeout(() => router.back(), 1500);
            }
        });
    };

    const handleApprove = () => {
        verifyKyc({ id, approve: true }, {
            onSuccess: () => {
                setStatus("Verified");
                setTimeout(() => router.back(), 1500);
            }
        });
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="animate-spin text-primary-dark w-10 h-10" />
            </div>
        );
    }

    if (!customer) {
        return <div className="text-center py-20 text-gray-500 font-bold">{isCustomer ? "Customer" : "Owner"} not found.</div>;
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col gap-8">
            <RejectKYCModal
                isOpen={isRejectModalOpen}
                onClose={() => setIsRejectModalOpen(false)}
                onReject={handleReject}
            />
            
            <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-[#0095FF] font-bold text-[15px] hover:gap-3 transition-all w-fit"
            >
                <ArrowLeft size={20} />
                Back
            </button>

            <h1 className="text-[28px] font-bold text-[#1A1A1A] font-montserrat">KYC Review</h1>

            <div className="bg-white border border-gray-100 rounded-[20px] p-6 shadow-sm">
                <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-full bg-[#F2F7FF] flex items-center justify-center text-gray-400">
                        <UserIcon size={28} strokeWidth={1.5} />
                    </div>
                    <div className="flex flex-col gap-1">
                        <h2 className="text-[18px] font-bold text-[#1A1A1A]">{customer.firstName} {customer.lastName}</h2>
                        <div className="flex items-center gap-2 text-[14px] text-gray-400 font-medium">
                            <span>{customer.email}</span>
                            <span className="w-1 h-1 bg-gray-300 rounded-full" />
                            <span>Submitted: {customer.kycSubmittedAt ? format(new Date(customer.kycSubmittedAt), "MMM dd, yyyy") : "N/A"}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white border border-gray-100 rounded-[24px] p-8 shadow-sm flex flex-col gap-8">
                <h3 className="text-[20px] font-bold text-[#1A1A1A] font-montserrat">Personal Info</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                    <div className="flex flex-col gap-6">
                        <div className="flex flex-col gap-2">
                            <label className="text-[12px] font-black text-[#1A1A1A] uppercase tracking-wider">First Name</label>
                            <input type="text" readOnly value={customer.firstName || ""} className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-[15px] font-medium text-[#1A1A1A] outline-none" />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-[12px] font-black text-[#1A1A1A] uppercase tracking-wider">Last Name</label>
                            <input type="text" readOnly value={customer.lastName || ""} className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-[15px] font-medium text-[#1A1A1A] outline-none" />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-[12px] font-black text-[#1A1A1A] uppercase tracking-wider">Date of Birth</label>
                            <input type="text" readOnly value={customer.dateOfBirth ? format(new Date(customer.dateOfBirth), "MM/dd/yyyy") : ""} className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-[15px] font-medium text-[#1A1A1A] outline-none" />
                        </div>
                    </div>

                    <div className="flex flex-col gap-6">
                        <div className="flex flex-col gap-2">
                            <label className="text-[12px] font-black text-[#1A1A1A] uppercase tracking-wider">Job Title</label>
                            <input type="text" readOnly value={customer.jobTitle || "N/A"} className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-[15px] font-medium text-[#1A1A1A] outline-none" />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-[12px] font-black text-[#1A1A1A] uppercase tracking-wider">Company</label>
                            <input type="text" readOnly value={customer.companyName || "N/A"} className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-[15px] font-medium text-[#1A1A1A] outline-none" />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-[12px] font-black text-[#1A1A1A] uppercase tracking-wider">Industry</label>
                            <input type="text" readOnly value={customer.industry || "N/A"} className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-[15px] font-medium text-[#1A1A1A] outline-none" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white border border-gray-100 rounded-[24px] p-8 shadow-sm flex flex-col gap-8">
                <h3 className="text-[20px] font-bold text-[#1A1A1A] font-montserrat">ID Information</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                    <div className="flex flex-col gap-6">
                        <div className="flex flex-col gap-2">
                            <label className="text-[12px] font-black text-[#1A1A1A] uppercase tracking-wider">Document Number</label>
                            <input type="text" readOnly value={customer.nationalIdNumber || "N/A"} className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-[15px] font-medium text-[#1A1A1A] outline-none" />
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-[12px] font-black text-[#1A1A1A] uppercase tracking-wider">Uploaded Document</label>
                        {customer.idDocumentUrl ? (
                            <a 
                                href={customer.idDocumentUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="p-4 bg-[#E9F3FF] border border-[#0095FF]/20 rounded-xl flex items-center justify-between hover:bg-[#D9EAFF] transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-[#0095FF]">
                                        <FileText size={20} />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[14px] font-bold text-[#1A1A1A]">View ID Document</span>
                                        <span className="text-[12px] text-gray-500 font-medium">Click to open</span>
                                    </div>
                                </div>
                            </a>
                        ) : (
                            <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-400 text-sm italic">
                                No document uploaded
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-6 mt-4">
                {status === "Pending" ? (
                    <>
                        <button
                            onClick={() => setIsRejectModalOpen(true)}
                            disabled={isVerifyingKyc}
                            className="flex-1 py-4 border-2 border-red-500 text-red-500 rounded-xl font-bold text-[16px] hover:bg-red-50 transition-all disabled:opacity-50"
                        >
                            Reject
                        </button>
                        <button
                            onClick={handleApprove}
                            disabled={isVerifyingKyc}
                            className="flex-1 py-4 bg-[#002B7F] text-white rounded-xl font-bold text-[16px] hover:bg-[#001D56] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {isVerifyingKyc && <Loader2 className="animate-spin" size={20} />}
                            Approve
                        </button>
                    </>
                ) : (
                    <div className={`w-full py-4 rounded-xl font-bold text-[16px] flex items-center justify-center gap-2 transition-all ${status === "Verified" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
                        }`}>
                        {status === "Verified" ? (
                            <>
                                <CheckCircle2 size={20} />
                                KYC Approved Successfully
                            </>
                        ) : (
                            "KYC Rejected"
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
