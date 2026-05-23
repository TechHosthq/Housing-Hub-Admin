"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function VerifyEmailForm() {
    const searchParams = useSearchParams();
    const { verifyEmail, isVerifyingEmail } = useAuth();
    const [isVerified, setIsVerified] = useState(false);
    
    const email = searchParams.get("email");
    const token = searchParams.get("token");

    useEffect(() => {
        if (email && token) {
            verifyEmail({ email, token }, {
                onSuccess: () => setIsVerified(true)
            });
        }
    }, [email, token, verifyEmail]);

    return (
        <div className="w-full max-w-[350px] px-4 py-8 relative">
            {/* Back Button */}
            <Link
                href="/"
                className="absolute -top-12 left-4 flex items-center gap-2 text-[#6BB5FF] hover:text-primary-dark transition-colors font-semibold text-[10px]"
            >
                <ArrowLeft size={14} />
                Back
            </Link>

            <div className="text-center space-y-6 mt-20">
                <p className="text-[17px] mb-0 font-bold text-[#1A1A1A] font-montserrat">
                    {isVerified ? "Verification Successful!" : "Verify Your Email"}
                </p>

                {isVerified ? (
                    <div className="flex flex-col items-center space-y-4">
                        <CheckCircle2 size={48} className="text-green-500" />
                        <p className="text-[11px] text-gray-600 leading-relaxed max-w-[280px] mx-auto">
                            Your email has been successfully verified. You can now log in to your account.
                        </p>
                        <Link
                            href="/"
                            className="w-full bg-[#07358B] text-white py-4 rounded-full font-bold text-base hover:bg-[#052562] transition-all shadow-lg text-center"
                        >
                            Go to Login
                        </Link>
                    </div>
                ) : (
                    <>
                        <p className="text-[11px] text-gray-600 leading-relaxed max-w-[280px] mx-auto">
                            {email && token 
                                ? "Verifying your email, please wait..." 
                                : "We've sent a verification link to your email address. Please click the link to verify your account."
                            }
                        </p>

                        <div className="pt-4 space-y-4">
                            {isVerifyingEmail ? (
                                <div className="flex justify-center">
                                    <Loader2 className="animate-spin text-primary-dark" size={32} />
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    className="w-full bg-[#07358B] text-white py-4 rounded-full font-bold text-base hover:bg-[#052562] transition-all shadow-lg"
                                >
                                    Resend Link
                                </button>
                            )}

                            <Link
                                href="/"
                                className="block text-[11px] text-[#6BB5FF] hover:underline transition-all"
                            >
                                Back to Login
                            </Link>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
