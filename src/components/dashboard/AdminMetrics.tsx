"use client";

import { Clock, FileText, Search, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import dashboardService from "@/services/dashboardService";
import Link from "next/link";

interface MetricCardProps {
    label: string;
    value: string | number;
    icon: React.ElementType;
    loading?: boolean;
    href: string;
}

function MetricCard({ label, value, icon: Icon, loading, href }: MetricCardProps) {
    return (
        <Link 
            href={href} 
            className="bg-[#E9F3FF] border border-[#0095FF]/30 rounded-[12px] p-6 flex flex-col gap-2 relative overflow-hidden h-[110px] justify-center hover:bg-[#DCEBFF] hover:border-[#0095FF]/50 transition-all group cursor-pointer"
        >
            <h3 className="text-[28px] font-black text-[#1A1A1A] font-montserrat tracking-tight leading-none mb-1">
                {loading ? (
                    <Loader2 className="animate-spin text-[#0095FF]" size={24} />
                ) : (
                    value
                )}
            </h3>
            <p className="text-[14px] font-medium text-gray-500">{label}</p>
            <div className="absolute right-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#0095FF] shadow-sm group-hover:scale-105 transition-transform duration-300">
                <Icon size={20} strokeWidth={1.5} />
            </div>
        </Link>
    );
}

export default function AdminMetrics() {
    const { data: stats, isLoading } = useQuery({
        queryKey: ["dashboard-stats"],
        queryFn: () => dashboardService.getStats(),
        refetchInterval: 60_000,
    });

    const metrics = [
        {
            label: "Pending KYC",
            value: stats?.pendingKyc ?? "—",
            icon: Clock,
            href: "/admin/customers?tab=kyc",
        },
        {
            label: "Active Listings",
            value: stats?.activeListings ?? "—",
            icon: FileText,
            href: "/admin/properties",
        },
        {
            label: "Inspections Today",
            value: stats?.todaysInspections ?? "—",
            icon: Search,
            href: "/admin/inspections",
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {metrics.map((metric) => (
                <MetricCard
                    key={metric.label}
                    label={metric.label}
                    value={metric.value}
                    icon={metric.icon}
                    loading={isLoading}
                    href={metric.href}
                />
            ))}
        </div>
    );
}

