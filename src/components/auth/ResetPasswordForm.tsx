"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useToastStore } from "@/store/useToastStore";

export default function ResetPasswordForm() {
    const { forgotPassword, isSendingForgotEmail, forgotPasswordSuccess, forgotPasswordMessage } = useAuth();
    const showSuccess = useToastStore((state) => state.showSuccess);
    const [email, setEmail] = useState("");

    // Fire success toast with the server's actual message
    useEffect(() => {
        if (forgotPasswordSuccess && forgotPasswordMessage) {
            showSuccess(forgotPasswordMessage);
        }
    }, [forgotPasswordSuccess, forgotPasswordMessage, showSuccess]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        forgotPassword({ email });
    };

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

            <div className="mt-16 space-y-6">
                <h1 className="text-[17px] font-bold text-[#1A1A1A] font-montserrat text-center">
                    Reset Password
                </h1>

                {forgotPasswordSuccess ? (
                    <div className="text-center space-y-4">
                        <div className="p-4 bg-green-50 text-green-700 rounded-2xl text-sm">
                            Reset link has been sent to your email address.
                        </div>
                        <Link href="/" className="text-[#3b82f6] hover:underline text-xs font-semibold">
                            Back to Login
                        </Link>
                    </div>
                ) : (
                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <div className="space-y-1">
                            <label className="text-[9px] font-semibold text-[#666666]">Email Address</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-5 py-3 rounded-full border border-[#E5E5E5] focus:outline-none focus:border-primary-dark transition-colors"
                                placeholder=""
                            />
                            <p className="text-[11px] text-gray-400 mt-2 leading-relaxed">
                                Enter your email address and we'll send you a link to reset your password.
                            </p>
                        </div>

                        <div className="pt-6">
                            <button
                                type="submit"
                                disabled={isSendingForgotEmail}
                                className="w-full bg-primary-dark text-white py-4 rounded-full font-bold text-base hover:bg-primary-dark/90 transition-all shadow-lg flex items-center justify-center disabled:opacity-70"
                            >
                                {isSendingForgotEmail ? <Loader2 className="animate-spin mr-2" size={20} /> : "Send Reset Link"}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
