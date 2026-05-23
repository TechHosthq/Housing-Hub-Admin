"use client";

import Link from "next/link";
import Image from "next/image";
import { Bell, ChevronDown } from "lucide-react";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import UserDropdown from "./UserDropdown";
import { useUserRole } from "@/context/UserRoleContext";
import { useNotification } from "@/hooks/useNotification";
import { useAuthStore } from "@/store/useAuthStore";

export default function DashboardNavbar() {
    const pathname = usePathname();
    const router = useRouter();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const { role, toggleRole } = useUserRole();
    const currentUser = useAuthStore((state) => state.user);
    
    const { useUnreadCount } = useNotification();
    const { data: unreadCountResponse } = useUnreadCount();
    const unreadCount = unreadCountResponse?.data || 0;

    const isActive = (path: string) => pathname === path || pathname.startsWith(`${path}/`);

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white px-6 md:px-8 py-3.5 flex items-center justify-between shadow-sm border-b border-gray-50">
            <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center">
                    <Image
                        src="/images/logo.png"
                        alt="Housing Hub Logo"
                        width={180}
                        height={45}
                        className="w-auto h-9 md:h-10 object-contain"
                        priority
                    />
                </Link>

                {/* Main Links */}
                <div className="hidden md:flex items-center gap-10">
                    <Link
                        href="/dashboard"
                        className={`${isActive("/dashboard") ? "text-[#0095FF]" : "text-[#1A1A1A]"} font-bold text-sm hover:text-[#0095FF] transition-colors`}
                    >
                        Dashboard
                    </Link>
                    {role === "Owner" && (
                        <Link
                            href="/properties"
                            className={`${isActive("/properties") ? "text-[#0095FF]" : "text-[#1A1A1A]"} font-bold text-sm hover:text-[#0095FF] transition-colors`}
                        >
                            Property
                        </Link>
                    )}
                    <Link
                        href="/inspections"
                        className={`${isActive("/inspections") ? "text-[#0095FF]" : "text-[#1A1A1A]"} font-bold text-sm hover:text-[#0095FF] transition-colors`}
                    >
                        Inspection
                    </Link>
                    <Link
                        href="/messages"
                        className={`${isActive("/messages") ? "text-[#0095FF]" : "text-[#1A1A1A]"} font-bold text-sm hover:text-[#0095FF] transition-colors`}
                    >
                        Message
                    </Link>
                </div>

                {/* Right Side: Notifications & Profile */}
                <div className="flex items-center gap-6">
                    <button 
                        onClick={() => router.push("/notifications")}
                        className="relative text-[#1A1A1A] hover:text-[#0095FF] transition-colors"
                    >
                        <Bell size={24} strokeWidth={1.5} />
                        {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full border border-white">
                                {unreadCount > 9 ? "9+" : unreadCount}
                            </span>
                        )}
                    </button>

                    <div className="relative">
                        <div
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="flex items-center gap-3 pl-6 border-l border-gray-100 cursor-pointer group"
                        >
                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                                <div className="w-full h-full bg-[#E9F3FF] flex items-center justify-center text-[#002B7F] font-black text-[14px] uppercase">
                                    {currentUser?.firstName?.[0]}{currentUser?.lastName?.[0] || "U"}
                                </div>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[14px] font-black text-[#1A1A1A]">
                                    {currentUser?.firstName} {currentUser?.lastName || "User"}
                                </span>
                                <div className="flex items-center gap-1">
                                    <span className="text-[11px] text-gray-400 font-bold transition-colors group-hover:text-[#0095FF]">{role}</span>
                                    <ChevronDown
                                        size={14}
                                        className={`text-gray-400 transition-all duration-300 group-hover:text-[#0095FF] ${isDropdownOpen ? "rotate-180" : ""}`}
                                    />
                                </div>
                            </div>
                        </div>

                        <UserDropdown
                            isOpen={isDropdownOpen}
                            onClose={() => setIsDropdownOpen(false)}
                            currentRole={role}
                            onSwitchRole={toggleRole}
                        />
                    </div>
                </div>
            </div>
        </nav>
    );
}
