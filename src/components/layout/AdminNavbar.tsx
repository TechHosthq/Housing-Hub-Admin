"use client";

import Link from "next/link";
import Image from "next/image";
import { Bell, ChevronDown, LayoutDashboard, Building2, Users, ClipboardList, MessageSquare } from "lucide-react";
import { useState } from "react";
import { usePathname } from "next/navigation";
import UserDropdown from "./UserDropdown";

export default function AdminNavbar() {
    const pathname = usePathname();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const isActive = (path: string) => pathname === path || pathname.startsWith(`${path}/`);

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white px-6 md:px-8 py-3.5 flex items-center justify-between border-b border-gray-100">
            <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
                {/* Logo */}
                <Link href="/admin" className="flex items-center">
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
                        href="/admin"
                        className={`${isActive("/admin") && pathname === "/admin" ? "text-[#0095FF]" : "text-[#1A1A1A]"} font-medium text-[14px] hover:text-[#0095FF] transition-colors`}
                    >
                        Dashboard
                    </Link>
                    <Link
                        href="/admin/customers"
                        className={`${isActive("/admin/customers") ? "text-[#0095FF]" : "text-[#1A1A1A]"} font-medium text-[14px] hover:text-[#0095FF] transition-colors`}
                    >
                        Customer
                    </Link>
                    <Link
                        href="/admin/owners"
                        className={`${isActive("/admin/owners") ? "text-[#0095FF]" : "text-[#1A1A1A]"} font-medium text-[14px] hover:text-[#0095FF] transition-colors`}
                    >
                        Owner
                    </Link>
                    <Link
                        href="/admin/properties"
                        className={`${isActive("/admin/properties") ? "text-[#0095FF]" : "text-[#1A1A1A]"} font-medium text-[14px] hover:text-[#0095FF] transition-colors`}
                    >
                        Property
                    </Link>
                    <Link
                        href="/admin/settings"
                        className={`${isActive("/admin/settings") ? "text-[#0095FF]" : "text-[#1A1A1A]"} font-medium text-[14px] hover:text-[#0095FF] transition-colors`}
                    >
                        Setting
                    </Link>
                </div>

                {/* Right Side: Profile */}
                <div className="flex items-center gap-3">
                    <div
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="flex items-center gap-2 cursor-pointer group"
                    >
                        <div className="w-10 h-10 rounded-full bg-[#002B7F] flex items-center justify-center text-white font-black text-[14px] uppercase">
                            AD
                        </div>
                        <span className="text-[14px] font-medium text-[#1A1A1A]">Admin</span>
                        <ChevronDown
                            size={16}
                            className={`text-[#1A1A1A] transition-all duration-300 ${isDropdownOpen ? "rotate-180" : ""}`}
                        />
                    </div>

                    {isDropdownOpen && (
                        <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-lg py-2 z-50">
                            <Link
                                href="/logout"
                                className="block px-4 py-2 text-[14px] text-red-600 hover:bg-gray-50 flex items-center gap-2"
                            >
                                Log out
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}
