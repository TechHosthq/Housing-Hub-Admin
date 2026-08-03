"use client";

import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useOwner } from "@/hooks/useOwner";
import UserDetailView from "@/components/admin/UserDetailView";

export default function OwnerDetailPage() {
    const params = useParams();
    const id = params.id as string;

    const { useGetOwner, suspendOwner, isSuspendingOwner, reactivateOwner, isReactivatingOwner } = useOwner();
    const { data: response, isLoading } = useGetOwner(id);
    const owner = response?.data;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="animate-spin text-[#0B2545] w-12 h-12" />
            </div>
        );
    }

    if (!owner) {
        return <div className="text-center py-20 text-gray-500 font-bold">Owner not found.</div>;
    }

    return (
        <UserDetailView
            customer={owner}
            kycType="owner"
            onSuspend={() => suspendOwner(id)}
            isSuspending={isSuspendingOwner}
            onReactivate={() => reactivateOwner(id)}
            isReactivating={isReactivatingOwner}
        />
    );
}
