"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";

export default function LogoutPage() {
    const router = useRouter();
    const clearAuth = useAuthStore((state) => state.clearAuth);

    useEffect(() => {
        clearAuth();
        router.push("/");
    }, [clearAuth, router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-white">
            <div className="w-12 h-12 border-4 border-primary-dark border-t-transparent rounded-full animate-spin"></div>
        </div>
    );
}
