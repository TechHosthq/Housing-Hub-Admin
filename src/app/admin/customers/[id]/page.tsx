"use client";

import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useCustomer } from "@/hooks/useCustomer";
import UserDetailView from "@/components/admin/UserDetailView";

export default function CustomerDetailPage() {
    const params = useParams();
    const id = params.id as string;

    const { useGetCustomer, suspendCustomer, isSuspendingCustomer, reactivateCustomer, isReactivatingCustomer } = useCustomer();
    const { data: response, isLoading } = useGetCustomer(id);
    const customer = response?.data;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="animate-spin text-[#0B2545] w-12 h-12" />
            </div>
        );
    }

    if (!customer) {
        return <div className="text-center py-20 text-gray-500 font-bold">Customer not found.</div>;
    }

    return (
        <UserDetailView
            customer={customer}
            kycType="customer"
            onSuspend={() => suspendCustomer(id)}
            isSuspending={isSuspendingCustomer}
            onReactivate={() => reactivateCustomer(id)}
            isReactivating={isReactivatingCustomer}
        />
    );
}
