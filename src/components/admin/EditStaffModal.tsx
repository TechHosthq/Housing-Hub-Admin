"use client";

import { X } from "lucide-react";
import { useState, useEffect } from "react";

interface EditStaffModalProps {
    isOpen: boolean;
    onClose: () => void;
    staff: any;
    onSave: (staff: any) => void;
}

export default function EditStaffModal({ isOpen, onClose, staff, onSave }: EditStaffModalProps) {
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        role: "Inspectior",
        status: "Active"
    });

    useEffect(() => {
        if (staff) {
            setFormData({
                firstName: staff.firstName || "",
                lastName: staff.lastName || "",
                email: staff.email || "",
                phone: staff.phone || "+234 801 234 5678",
                role: staff.role || "Inspectior",
                status: staff.status || "Active"
            });
        }
    }, [staff]);

    if (!isOpen || !staff) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            ...staff,
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
                        Edit Staff Info
                    </h2>
                    <button
                        onClick={onClose}
                        className="absolute right-10 top-10 p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-8 text-left">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="flex flex-col gap-3">
                            <label className="text-[14px] font-medium text-gray-400 font-montserrat">First Name</label>
                            <input
                                type="text"
                                value={formData.firstName}
                                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                className="w-full px-6 py-4 bg-white border border-gray-100 rounded-[20px] text-[15px] font-medium text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500/50 transition-all font-montserrat"
                            />
                        </div>
                        <div className="flex flex-col gap-3">
                            <label className="text-[14px] font-medium text-gray-400 font-montserrat">Last Name</label>
                            <input
                                type="text"
                                value={formData.lastName}
                                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                className="w-full px-6 py-4 bg-white border border-gray-100 rounded-[20px] text-[15px] font-medium text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500/50 transition-all font-montserrat"
                            />
                        </div>

                        <div className="flex flex-col gap-3">
                            <label className="text-[14px] font-medium text-gray-400 font-montserrat">Phone Number</label>
                            <input
                                type="text"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="w-full px-6 py-4 bg-white border border-gray-100 rounded-[20px] text-[15px] font-medium text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500/50 transition-all font-montserrat"
                            />
                        </div>

                        <div className="flex flex-col gap-3">
                            <label className="text-[14px] font-medium text-gray-400 font-montserrat">Email Address</label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full px-6 py-4 bg-white border border-gray-100 rounded-[20px] text-[15px] font-medium text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500/50 transition-all font-montserrat"
                            />
                        </div>

                        <div className="flex flex-col gap-3">
                            <label className="text-[14px] font-medium text-gray-400 font-montserrat">Role</label>
                            <div className="relative">
                                <select
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    className="w-full px-6 py-4 bg-white border border-gray-100 rounded-[20px] text-[15px] font-medium text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500/50 appearance-none cursor-pointer pr-12 font-montserrat"
                                >
                                    <option value="Inspectior">Inspectior</option>
                                    <option value="Manager">Manager</option>
                                    <option value="Support">Support</option>
                                </select>
                                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                    <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
                                        <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3">
                            <label className="text-[14px] font-medium text-gray-400 font-montserrat">Status</label>
                            <div className="flex items-center gap-4 py-3">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, status: formData.status === "Active" ? "Inactive" : "Active" })}
                                    className={`relative w-14 h-7 rounded-full transition-colors duration-300 ${formData.status === "Active" ? "bg-[#0095FF]" : "bg-gray-200"}`}
                                >
                                    <div className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform duration-300 ${formData.status === "Active" ? "translate-x-7" : ""}`} />
                                </button>
                                <span className="text-[15px] font-medium text-[#1A1A1A] font-montserrat">{formData.status}</span>
                            </div>
                        </div>
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
                            className="px-12 py-4 bg-[#002B7F] text-white rounded-[20px] font-bold text-[16px] hover:bg-opacity-90 transition-all shadow-lg shadow-blue-900/10 font-montserrat"
                        >
                            Save
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
