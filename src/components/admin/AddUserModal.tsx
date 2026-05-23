"use client";

import { X } from "lucide-react";
import { useState } from "react";

interface AddUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (user: any) => void;
}

export default function AddUserModal({ isOpen, onClose, onAdd }: AddUserModalProps) {
    const [formData, setFormData] = useState({
        firstName: "Priscian",
        lastName: "Priscian",
        email: "Priscian",
        phone: "Priscian",
        role: "Renter"
    });

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAdd({
            ...formData,
            id: Date.now(),
            status: "Active"
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
                    <h2 className="text-[32px] font-bold text-[#1A1A1A] font-montserrat tracking-tight">
                        Add New User
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
                        <label className="text-[14px] font-medium text-gray-400">Phone Number</label>
                        <input
                            type="text"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="w-full px-6 py-4 bg-white border border-gray-100 rounded-[20px] text-[15px] font-medium text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500/50 transition-all"
                        />
                    </div>

                    <div className="flex flex-col gap-3">
                        <label className="text-[14px] font-medium text-gray-400">Role</label>
                        <div className="relative">
                            <select
                                value={formData.role}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                className="w-full px-6 py-4 bg-white border border-gray-100 rounded-[20px] text-[15px] font-medium text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500/50 transition-all appearance-none cursor-pointer"
                            >
                                <option value="Renter">Renter</option>
                                <option value="Owner">Owner</option>
                                <option value="Staff">Staff</option>
                                <option value="Admin">Admin</option>
                            </select>
                            <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
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
                            className="px-10 py-4 bg-[#002B7F] text-white rounded-[20px] font-bold text-[16px] hover:bg-opacity-90 transition-all shadow-lg shadow-blue-900/10"
                        >
                            Add User
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
