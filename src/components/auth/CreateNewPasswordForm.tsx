"use client";

import { ArrowLeft, Eye, EyeOff, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ResetSuccessModal from "./ResetSuccessModal";
import { useAuth } from "@/hooks/useAuth";

export default function CreateNewPasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { resetPassword, isResettingPassword, resetPasswordSuccess } = useAuth();
    
    const email = searchParams.get("email");
    const token = searchParams.get("token");

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        newPassword: "",
        confirmPassword: "",
    });
    const [error, setError] = useState("");

    useEffect(() => {
        if (resetPasswordSuccess) {
            setShowModal(true);
            setTimeout(() => {
                router.push("/");
            }, 3000);
        }
    }, [resetPasswordSuccess, router]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (formData.newPassword !== formData.confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (!email || !token) {
            setError("Invalid or expired reset link");
            return;
        }

        resetPassword({
            email,
            token,
            newPassword: formData.newPassword
        });
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
                    Create New Password
                </h1>

                <form className="space-y-6" onSubmit={handleSubmit}>
                    {error && (
                        <div className="p-3 text-xs text-red-500 bg-red-50 rounded-lg text-center">
                            {error}
                        </div>
                    )}

                    <div className="space-y-1">
                        <label className="text-[9px] font-semibold text-[#666666]">New Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                minLength={8}
                                value={formData.newPassword}
                                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                                className="w-full px-5 py-3 rounded-full border border-[#E5E5E5] focus:outline-none focus:border-primary-dark transition-colors"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        <p className="text-[9px] text-gray-400 mt-1">
                            Must be at least 8 characters long and include a mix of letters and numbers
                        </p>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[9px] font-semibold text-[#666666]">Confirm Password</label>
                        <div className="relative">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                required
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                className="w-full px-5 py-3 rounded-full border border-[#E5E5E5] focus:outline-none focus:border-primary-dark transition-colors"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500"
                            >
                                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={isResettingPassword}
                            className="w-full bg-primary-dark text-white py-4 rounded-full font-bold text-base hover:bg-primary-dark/90 transition-all shadow-lg flex items-center justify-center disabled:opacity-70"
                        >
                            {isResettingPassword ? <Loader2 className="animate-spin mr-2" size={20} /> : "Reset Password"}
                        </button>
                    </div>
                </form>
            </div>

            <ResetSuccessModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
            />
        </div>
    );
}
