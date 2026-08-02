"use client";

import { X } from "lucide-react";
import { useState } from "react";

interface AddStaffModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (staff: { firstName: string; lastName: string; email: string; role: string }) => void;
}

const EMPTY_FORM = { firstName: "", lastName: "", email: "", role: "Admin" };

export default function AddStaffModal({ isOpen, onClose, onAdd }: AddStaffModalProps) {
    const [formData, setFormData] = useState(EMPTY_FORM);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAdd(formData);
        setFormData(EMPTY_FORM);
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
                        Add New Staff
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                <p className="text-[14px] text-gray-400 -mt-4">
                    The new staff member logs in with a one-time code sent to their email — no password to set here.
                </p>

                <form onSubmit={handleSubmit} className="flex flex-col gap-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="flex flex-col gap-3">
                            <label className="text-[14px] font-medium text-gray-400">First Name</label>
                            <input
                                type="text"
                                required
                                value={formData.firstName}
                                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                className="w-full px-6 py-4 bg-white border border-gray-100 rounded-[20px] text-[15px] font-medium text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500/50 transition-all font-montserrat"
                                placeholder="Enter first name"
                            />
                        </div>
                        <div className="flex flex-col gap-3">
                            <label className="text-[14px] font-medium text-gray-400">Last Name</label>
                            <input
                                type="text"
                                required
                                value={formData.lastName}
                                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                className="w-full px-6 py-4 bg-white border border-gray-100 rounded-[20px] text-[15px] font-medium text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500/50 transition-all font-montserrat"
                                placeholder="Enter last name"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <label className="text-[14px] font-medium text-gray-400">Email Address</label>
                        <input
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full px-6 py-4 bg-white border border-gray-100 rounded-[20px] text-[15px] font-medium text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500/50 transition-all font-montserrat"
                            placeholder="Enter email address"
                        />
                    </div>

                    <div className="flex flex-col gap-3">
                        <label className="text-[14px] font-medium text-gray-400">Role</label>
                        <select
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                            className="w-full px-6 py-4 bg-white border border-gray-100 rounded-[20px] text-[15px] font-medium text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500/50 transition-all font-montserrat"
                        >
                            <option value="Admin">Admin</option>
                            <option value="SuperAdmin">Super Admin</option>
                        </select>
                    </div>

                    <div className="flex items-center justify-end gap-4 mt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-10 py-4 border border-[#0095FF] text-[#0095FF] rounded-full font-bold text-[16px] hover:bg-blue-50 transition-all font-montserrat"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-10 py-4 bg-[#002B7F] text-white rounded-[20px] font-bold text-[16px] hover:bg-opacity-90 transition-all shadow-lg shadow-blue-900/10 font-montserrat"
                        >
                            Add Staff
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
