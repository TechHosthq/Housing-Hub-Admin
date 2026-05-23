"use client";

import Link from "next/link";
import Image from "next/image";
import { Menu, X, User, LogOut, LayoutDashboard } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useUserRole } from "@/context/UserRoleContext";

export default function Navbar() {
    const pathname = usePathname();
    const router = useRouter();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const userMenuRef = useRef<HTMLDivElement>(null);

    const user = useAuthStore((state) => state.user);
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const clearAuth = useAuthStore((state) => state.clearAuth);
    const { role: roleLabel } = useUserRole();

    const navLinks = isAuthenticated ? [
        { name: "Admin Dashboard", href: "/admin" },
    ] : [];

    // Close user dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
                setIsUserMenuOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = () => {
        clearAuth();
        setIsUserMenuOpen(false);
        setIsMenuOpen(false);
        router.push("/login");
    };

    // Derive role label from customerType (0 = Customer, 1 = Owner)
    const initials = user
        ? `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase() || "U"
        : "U";

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white px-6 md:px-8 py-3.5 shadow-sm border-b border-gray-50">
            <div className="max-w-7xl mx-auto flex items-center justify-between w-full">
                {/* Logo */}
                <div className="flex items-center">
                    <Link href="/" className="flex items-center" onClick={() => setIsMenuOpen(false)}>
                        <Image
                            src="/images/logo.png"
                            alt="Housing Hub Logo"
                            width={180}
                            height={45}
                            className="w-auto h-9 md:h-10 object-contain"
                            priority
                        />
                    </Link>
                </div>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-12 font-bold">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`${pathname === link.href ? "text-[#0095FF]" : "text-[#1A1A1A]"} hover:text-[#0095FF] transition-colors text-base`}
                        >
                            {link.name}
                        </Link>
                    ))}
                </div>

                {/* Desktop Right: Auth or User */}
                <div className="hidden md:flex items-center gap-4">
                    {isAuthenticated && user ? (
                        <div className="relative" ref={userMenuRef}>
                            <button
                                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                className="flex items-center gap-3 group"
                            >
                                <div className="w-10 h-10 rounded-full bg-[#002D6B] flex items-center justify-center text-white font-black text-[14px] shadow-md group-hover:bg-[#0095FF] transition-colors">
                                    {initials}
                                </div>
                                <div className="flex flex-col items-start leading-none">
                                    <span className="text-[13px] font-black text-[#1A1A1A]">
                                        {user.firstName} {user.lastName}
                                    </span>
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">
                                        {roleLabel}
                                    </span>
                                </div>
                            </button>

                            {/* Dropdown */}
                            {isUserMenuOpen && (
                                <div className="absolute right-0 top-[calc(100%+12px)] w-52 bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                    <Link
                                        href="/profile"
                                        onClick={() => setIsUserMenuOpen(false)}
                                        className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors group"
                                    >
                                        <User size={16} className="text-gray-400 group-hover:text-[#0095FF] transition-colors" />
                                        <span className="text-[13px] font-bold text-[#1A1A1A]">Profile</span>
                                    </Link>
                                    <Link
                                        href="/dashboard"
                                        onClick={() => setIsUserMenuOpen(false)}
                                        className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors group"
                                    >
                                        <LayoutDashboard size={16} className="text-gray-400 group-hover:text-[#0095FF] transition-colors" />
                                        <span className="text-[13px] font-bold text-[#1A1A1A]">Dashboard</span>
                                    </Link>
                                    <div className="my-1 border-t border-gray-100" />
                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-3 px-5 py-3 hover:bg-red-50 transition-colors group"
                                    >
                                        <LogOut size={16} className="text-red-400 group-hover:text-red-500 transition-colors" />
                                        <span className="text-[13px] font-bold text-red-500">Logout</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : null}
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden text-primary-dark p-2"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                    {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
                </button>

                {/* Mobile Menu Overlay */}
                {isMenuOpen && (
                    <div className="absolute top-full left-0 right-0 bg-white shadow-lg md:hidden flex flex-col p-6 gap-6 font-bold border-t border-gray-100 animate-in slide-in-from-top duration-200">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`${pathname === link.href ? "text-[#3b82f6]" : "text-[#1A1A1A]"} hover:text-primary transition-colors`}
                                onClick={() => setIsMenuOpen(false)}
                            >
                                {link.name}
                            </Link>
                        ))}

                        <div className="flex flex-col gap-4 pt-4 border-t border-gray-100">
                            {isAuthenticated && user ? (
                                <>
                                    {/* Mobile user info */}
                                    <div className="flex items-center gap-3 pb-2">
                                        <div className="w-10 h-10 rounded-full bg-[#002D6B] flex items-center justify-center text-white font-black text-[14px]">
                                            {initials}
                                        </div>
                                        <div className="flex flex-col leading-none">
                                            <span className="text-[14px] font-black text-[#1A1A1A]">
                                                {user.firstName} {user.lastName}
                                            </span>
                                            <span className="text-[11px] font-bold text-gray-400">{roleLabel}</span>
                                        </div>
                                    </div>
                                    <Link
                                        href="/profile"
                                        className="text-[#1A1A1A] font-bold text-base flex items-center gap-2"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        <User size={18} className="text-gray-400" /> Profile
                                    </Link>
                                    <Link
                                        href="/dashboard"
                                        className="text-[#1A1A1A] font-bold text-base flex items-center gap-2"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        <LayoutDashboard size={18} className="text-gray-400" /> Dashboard
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="text-red-500 font-bold text-base flex items-center gap-2 text-left"
                                    >
                                        <LogOut size={18} /> Logout
                                    </button>
                                </>
                            ) : null}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}
