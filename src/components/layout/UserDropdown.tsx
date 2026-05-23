import { User, MessageCircle, Settings, RefreshCw, LogOut } from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";

interface UserDropdownProps {
    isOpen: boolean;
    onClose: () => void;
    currentRole: "Customer" | "Owner";
    onSwitchRole: () => void;
}

export default function UserDropdown({ isOpen, onClose, currentRole, onSwitchRole }: UserDropdownProps) {
    const clearAuth = useAuthStore((state) => state.clearAuth);
    const router = useRouter();

    if (!isOpen) return null;

    const handleLogout = () => {
        clearAuth();
        onClose();
        router.push("/login");
    };

    const menuItems = [
        { label: "Profile Info", icon: User, href: "/profile" },
        { label: "Message", icon: MessageCircle, href: "/messages" },
        { label: "Settings", icon: Settings, href: "/settings" }
    ];

    return (
        <>
            {/* Backdrop for closing when clicking outside */}
            <div
                className="fixed inset-0 z-40"
                onClick={onClose}
            />

            <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.08)] border border-gray-100 py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="flex flex-col">
                    {/* Switch Account - Pixel Perfect Header */}
                    <button
                        onClick={() => {
                            onSwitchRole();
                            onClose();
                        }}
                        className="flex items-center gap-4 px-6 py-3.5 hover:bg-gray-50 transition-colors group border-b border-gray-50 mb-1"
                    >
                        <div className="w-8 h-8 rounded-full bg-[#E9F3FF] flex items-center justify-center text-primary-dark group-hover:bg-primary-dark group-hover:text-white transition-all">
                            <RefreshCw size={16} className="group-hover:rotate-180 transition-transform duration-500" />
                        </div>
                        <div className="flex flex-col items-start">
                            <span className="text-[13px] font-black text-[#1A1A1A] group-hover:text-primary-dark transition-colors">
                                Switch Account
                            </span>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                                To {currentRole === "Customer" ? "Owner" : "Customer"}
                            </span>
                        </div>
                    </button>

                    {menuItems.map((item) => (
                        <Link
                            key={item.label}
                            href={item.href}
                            onClick={onClose}
                            className="flex items-center gap-4 px-6 py-3.5 hover:bg-gray-50 transition-colors group"
                        >
                            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:text-primary-dark transition-colors">
                                <item.icon size={18} />
                            </div>
                            <span className="text-[14px] font-bold text-[#1A1A1A] group-hover:text-primary-dark transition-colors">
                                {item.label}
                            </span>
                        </Link>
                    ))}

                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-4 px-6 py-3.5 hover:bg-red-50 transition-colors group mt-1"
                    >
                        <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-red-500 group-hover:bg-red-500 group-hover:text-white transition-all">
                            <LogOut size={18} />
                        </div>
                        <span className="text-[14px] font-bold text-red-500 transition-colors">
                            Logout
                        </span>
                    </button>
                </div>
            </div>
        </>
    );
}
