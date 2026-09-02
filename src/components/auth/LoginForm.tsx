"use client";

import { useState, useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useAuthStore } from "@/store/useAuthStore";
import { useResendCooldown } from "@/hooks/useResendCooldown";
import { resolveApiError } from "@/utils/errorResolver";

const OTP_RESEND_SECONDS = 60;

export default function LoginForm() {
    const router = useRouter();
    const {
        requestOtp, isRequestingOtp, requestOtpError,
        verifyOtp, isVerifyingOtp, verifyOtpError,
    } = useAuth();
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    const [step, setStep] = useState<"email" | "code">("email");
    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");
    const [requestMessage, setRequestMessage] = useState<string | null>(null);
    const codeInputRef = useRef<HTMLInputElement>(null);

    // The server enforces the real 60s cooldown (identical response whether the
    // email exists, was throttled, or not — see the backend for why); this just
    // mirrors that fixed, known duration so the resend button disables in sync.
    const { isCoolingDown, formatted, startCooldown } = useResendCooldown(email);

    useEffect(() => {
        if (isAuthenticated) {
            router.push("/admin");
        }
    }, [isAuthenticated, router]);

    useEffect(() => {
        if (step === "code") {
            codeInputRef.current?.focus();
        }
    }, [step]);

    const handleRequestOtp = (e: React.FormEvent) => {
        e.preventDefault();
        requestOtp({ email }, {
            onSuccess: (response) => {
                setRequestMessage(response.message);
                startCooldown(OTP_RESEND_SECONDS);
                setStep("code");
            }
        });
    };

    const handleResend = () => {
        if (isCoolingDown) return;
        requestOtp({ email }, {
            onSuccess: (response) => {
                setRequestMessage(response.message);
                startCooldown(OTP_RESEND_SECONDS);
            }
        });
    };

    const handleVerifyOtp = (e: React.FormEvent) => {
        e.preventDefault();
        verifyOtp({ email, code });
    };

    const renderError = (error: unknown) => {
        if (!error) return null;
        // A thrown axios error already carries `response`; a rejected 200-with-
        // isSuccessful-false carries `data` at the top level, and resolveApiError
        // expects the axios shape either way.
        const hasTopLevelData = typeof error === "object" && error !== null && "data" in error;
        const messages = resolveApiError(hasTopLevelData ? { response: error } : error);
        return (
            <div className="p-3 text-xs text-red-500 bg-red-50 rounded-lg text-center">
                {messages.length === 1 ? messages[0] : (
                    <ul className="list-none m-0 p-0 space-y-0.5">
                        {messages.map((m: string, i: number) => <li key={i}>{m}</li>)}
                    </ul>
                )}
            </div>
        );
    };

    return (
        <div className="w-full max-w-[350px] px-4 py-8">
            <h1 className="text-[17px] font-bold text-[#1A1A1A] mb-2 text-center font-montserrat">
                Welcome Back
            </h1>
            <p className="text-[12px] text-[#666666] mb-7 text-center">
                {step === "email"
                    ? "Enter your admin email to get a login code."
                    : (requestMessage ?? `Enter the 6-digit code we sent to ${email}.`)}
            </p>

            {step === "email" ? (
                <form className="space-y-4" onSubmit={handleRequestOtp}>
                    {renderError(requestOtpError)}

                    <div className="space-y-1">
                        <label className="text-[9px] font-semibold text-[#666666]">Email</label>
                        <input
                            type="email"
                            required
                            autoFocus
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-5 py-3 rounded-full border border-[#E5E5E5] focus:outline-none focus:border-primary-dark transition-colors"
                        />
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={isRequestingOtp}
                            className="w-full bg-primary-dark text-white py-4 rounded-full font-bold text-base hover:bg-primary-dark/90 transition-all shadow-lg flex items-center justify-center disabled:opacity-70"
                        >
                            {isRequestingOtp ? <Loader2 className="animate-spin mr-2" size={20} /> : "Send Login Code"}
                        </button>
                    </div>
                </form>
            ) : (
                <form className="space-y-4" onSubmit={handleVerifyOtp}>
                    {renderError(verifyOtpError)}

                    <div className="space-y-1">
                        <label className="text-[9px] font-semibold text-[#666666]">Login Code</label>
                        <input
                            ref={codeInputRef}
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]{6}"
                            maxLength={6}
                            required
                            value={code}
                            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                            className="w-full px-5 py-3 rounded-full border border-[#E5E5E5] focus:outline-none focus:border-primary-dark transition-colors text-center tracking-[0.5em] font-bold"
                            placeholder="------"
                        />
                    </div>

                    <div className="pt-4 space-y-3">
                        <button
                            type="submit"
                            disabled={isVerifyingOtp || code.length !== 6}
                            className="w-full bg-primary-dark text-white py-4 rounded-full font-bold text-base hover:bg-primary-dark/90 transition-all shadow-lg flex items-center justify-center disabled:opacity-70"
                        >
                            {isVerifyingOtp ? <Loader2 className="animate-spin mr-2" size={20} /> : "Verify & Log In"}
                        </button>

                        <button
                            type="button"
                            onClick={handleResend}
                            disabled={isRequestingOtp || isCoolingDown}
                            className="w-full text-[12px] font-semibold text-[#666666] hover:text-primary-dark transition-colors disabled:opacity-60 disabled:hover:text-[#666666] flex items-center justify-center gap-2"
                        >
                            {isRequestingOtp && <Loader2 className="animate-spin" size={14} />}
                            {isCoolingDown ? `Resend code in ${formatted}` : "Resend code"}
                        </button>

                        <button
                            type="button"
                            onClick={() => { setStep("email"); setCode(""); setRequestMessage(null); }}
                            className="w-full text-[12px] font-semibold text-[#666666] hover:text-primary-dark transition-colors"
                        >
                            Use a different email
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}
