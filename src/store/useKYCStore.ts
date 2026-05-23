import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface KYCData {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    nationalIdNumber: string;
    idType: number;
    idDocumentUrl: string | null;
    jobTitle: string;
    companyName: string;
    industry: string;
}

interface KYCState {
    formData: Partial<KYCData>;
    updateFormData: (data: Partial<KYCData>) => void;
    clearFormData: () => void;
}

export const useKYCStore = create<KYCState>()(
    persist(
        (set) => ({
            formData: {},
            updateFormData: (data) => set((state) => ({ 
                formData: { ...state.formData, ...data } 
            })),
            clearFormData: () => set({ formData: {} }),
        }),
        {
            name: 'kyc-storage',
        }
    )
);
