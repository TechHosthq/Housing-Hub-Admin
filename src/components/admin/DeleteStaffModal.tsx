"use client";

interface DeleteStaffModalProps {
    isOpen: boolean;
    onClose: () => void;
    onDelete: () => void;
}

export default function DeleteStaffModal({ isOpen, onClose, onDelete }: DeleteStaffModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white w-full max-w-[500px] rounded-[32px] p-10 shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col items-center text-center gap-6">
                <h2 className="text-[32px] font-bold text-[#1A1A1A] font-montserrat tracking-tight">
                    Delete this Staff?
                </h2>

                <p className="text-[16px] text-gray-500 font-medium font-montserrat">
                    This action cannot be undone.
                </p>

                <div className="flex items-center w-full gap-4 mt-4">
                    <button
                        onClick={onClose}
                        className="flex-1 py-4 border border-[#0095FF] text-[#0095FF] rounded-full font-bold text-[16px] hover:bg-blue-50 transition-all font-montserrat"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => {
                            onDelete();
                            onClose();
                        }}
                        className="flex-1 py-4 bg-[#FF3B30] text-white rounded-full font-bold text-[16px] hover:bg-opacity-90 transition-all shadow-lg shadow-red-900/10 font-montserrat"
                    >
                        Delete Staff
                    </button>
                </div>
            </div>
        </div>
    );
}
