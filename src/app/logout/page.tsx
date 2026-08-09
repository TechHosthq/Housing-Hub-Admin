"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import authService from "@/services/authService";

export default function LogoutPage() {
    const router = useRouter();
    const clearAuth = useAuthStore((state) => state.clearAuth);

    useEffect(() => {
        // Clear local state first so the UI responds immediately, then revoke the
        // token server-side. Without the revoke, signing out left a valid 30-day
        // refresh token behind.
        const { refreshToken } = useAuthStore.getState();
        clearAuth();
        void authService.logout(refreshToken);
        router.push("/");
    }, [clearAuth, router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-white">
            <div className="w-12 h-12 border-4 border-primary-dark border-t-transparent rounded-full animate-spin"></div>
        </div>
    );
}
