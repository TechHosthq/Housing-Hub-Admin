"use client";

import { X } from "lucide-react";
import { useState, useEffect } from "react";

interface EditUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: any;
    onSave: (user: any) => void;
}

export default function EditUserModal({ isOpen, onClose, user, onSave }: EditUserModalProps) {
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        role: "Renter",
        status: "Active"
    });

    useEffect(() => {
        if (user) {
            setFormData({
                firstName: user.firstName || "",
                lastName: user.lastName || "",
                email: user.email || "",
                phone: user.phone || "+234 801 234 5678",
                role: user.role || "Renter",
                status: user.status || "Active"
            });
        }
    }, [user]);

    if (!isOpen || !user) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            ...user,
            ...formData
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white w-full max-w-[800px] rounded-[32px] p-10 shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col gap-8">
                <div className="flex items-center justify-between">
                    <h2 className="text-[32px] font-bold text-[#1A1A1A] font-montserrat tracking-tight text-center w-full">
                        Edit User Info
                    </h2>
                    <button
                        onClick={onClose}
                        className="absolute right-10 top-10 p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                        <div className="flex flex-col gap-3">
                            <label className="text-[14px] font-medium text-gray-400">First Name</label>
                            <input
                                type="text"
                                value={formData.firstName}
                                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                className="w-full px-6 py-4 bg-white border border-gray-100 rounded-[20px] text-[15px] font-medium text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500/50 transition-all"
                            />
                        </div>
                        <div className="flex flex-col gap-3">
                            <label className="text-[14px] font-medium text-gray-400">Last Name</label>
                            <input
                                type="text"
                                value={formData.lastName}
                                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                className="w-full px-6 py-4 bg-white border border-gray-100 rounded-[20px] text-[15px] font-medium text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500/50 transition-all"
                            />
                        </div>

                        <div className="flex flex-col gap-3">
                            <label className="text-[14px] font-medium text-gray-400">Phone Number</label>
                            <input
                                type="text"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="w-full px-6 py-4 bg-white border border-gray-100 rounded-[20px] text-[15px] font-medium text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500/50 transition-all"
                            />
                        </div>

                        <div className="flex flex-col gap-3">
                            <label className="text-[14px] font-medium text-gray-400">Email Address</label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full px-6 py-4 bg-white border border-gray-100 rounded-[20px] text-[15px] font-medium text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500/50 transition-all"
                            />
                        </div>

                        <div className="flex flex-col gap-3">
                            <label className="text-[14px] font-medium text-gray-400">Role</label>
                            <div className="relative">
                                <select
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    className="w-full px-6 py-4 bg-white border border-gray-100 rounded-[20px] text-[15px] font-medium text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500/50 appearance-none cursor-pointer pr-12"
                                >
                                    <option value="Renter">Renter</option>
                                    <option value="Owner">Owner</option>
                                    <option value="Staff">Staff</option>
                                    <option value="Admin">Admin</option>
                                </select>
                                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                    <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
                                        <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3">
                            <label className="text-[14px] font-medium text-gray-400">Status</label>
                            <div className="flex items-center gap-4 py-3">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, status: formData.status === "Active" ? "Inactive" : "Active" })}
                                    className={`relative w-14 h-7 rounded-full transition-colors duration-300 ${formData.status === "Active" ? "bg-[#0095FF]" : "bg-gray-200"}`}
                                >
                                    <div className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform duration-300 ${formData.status === "Active" ? "translate-x-7" : ""}`} />
                                </button>
                                <span className="text-[15px] font-medium text-[#1A1A1A]">{formData.status}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-4 mt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-10 py-4 border border-[#0095FF] text-[#0095FF] rounded-full font-bold text-[16px] hover:bg-blue-50 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-12 py-4 bg-[#002B7F] text-white rounded-[20px] font-bold text-[16px] hover:bg-opacity-90 transition-all shadow-lg shadow-blue-900/10"
                        >
                            Save
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
