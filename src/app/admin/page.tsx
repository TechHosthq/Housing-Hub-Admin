"use client";

import { useState } from "react";
import AdminMetrics from "@/components/dashboard/AdminMetrics";
import { ChevronRight, Calendar, Clock, ChevronDown, ListFilter, Loader2, Activity } from "lucide-react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import dashboardService from "@/services/dashboardService";
import { format, formatDistanceToNow } from "date-fns";
import { InspectionStatus } from "@/types/inspection";

const STATUS_COLORS: Record<number, string> = {
    [InspectionStatus.Pending]: "bg-[#FFF9E9] text-[#FFA800]",
    [InspectionStatus.Confirmed]: "bg-[#E9F3FF] text-[#0095FF]",
    [InspectionStatus.Cancelled]: "bg-red-50 text-red-500",
    [InspectionStatus.Completed]: "bg-green-50 text-green-500",
    [InspectionStatus.Declined]: "bg-red-50 text-red-500",
    [InspectionStatus.RescheduleRequested]: "bg-purple-50 text-purple-500",
};

const STATUS_LABELS: Record<number, string> = {
    [InspectionStatus.Pending]: "Pending",
    [InspectionStatus.Confirmed]: "Confirmed",
    [InspectionStatus.Cancelled]: "Cancelled",
    [InspectionStatus.Completed]: "Completed",
    [InspectionStatus.Declined]: "Declined",
    [InspectionStatus.RescheduleRequested]: "Rescheduled",
};

export default function AdminDashboard() {
    const { data: todaysInspections, isLoading: loadingInspections } = useQuery({
        queryKey: ["dashboard-todays-inspections"],
        queryFn: () => dashboardService.getTodaysInspections(1, 50), // Fetch up to 50 for client-side pagination
        refetchInterval: 60_000,
    });

    const { data: recentActivity, isLoading: loadingActivity } = useQuery({
        queryKey: ["dashboard-activity"],
        queryFn: () => dashboardService.getRecentActivity(50), // Fetch more for client-side pagination
        refetchInterval: 60_000,
    });

    const [activityPage, setActivityPage] = useState(1);
    const activityPageSize = 5;

    const [inspectionPage, setInspectionPage] = useState(1);
    const inspectionPageSize = 5;

    const allInspections = todaysInspections?.items ?? [];
    const totalInspectionPages = Math.max(1, Math.ceil(allInspections.length / inspectionPageSize));
    const activeInspectionPage = Math.min(inspectionPage, totalInspectionPages);
    const inspectionStartIndex = (activeInspectionPage - 1) * inspectionPageSize;
    const paginatedInspections = allInspections.slice(inspectionStartIndex, inspectionStartIndex + inspectionPageSize);

    const activities = Array.isArray(recentActivity) ? recentActivity : [];

    const totalActivityPages = Math.max(1, Math.ceil(activities.length / activityPageSize));
    const activePage = Math.min(activityPage, totalActivityPages);
    const startIndex = (activePage - 1) * activityPageSize;
    const paginatedActivities = activities.slice(startIndex, startIndex + activityPageSize);

    return (
        <div className="flex flex-col gap-10">
            {/* Overview Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-[28px] font-bold text-[#1A1A1A] font-montserrat">Overview</h1>
                <div className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-100 rounded-lg shadow-sm cursor-pointer group hover:border-gray-200 transition-all">
                    <ListFilter size={18} className="text-gray-400 group-hover:text-[#0095FF] transition-colors" />
                    <span className="text-[14px] font-medium text-gray-500">Last 30 days</span>
                    <ChevronDown size={18} className="text-gray-400 group-hover:text-[#0095FF] transition-colors" />
                </div>
            </div>

            <AdminMetrics />

            {/* Today's Inspections Section */}
            <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-[24px] font-bold text-[#1A1A1A] font-montserrat">Today's Inspections</h2>
                    <Link
                        href="/admin/inspections"
                        className="text-[14px] font-bold text-[#0095FF] hover:underline"
                    >
                        View All
                    </Link>
                </div>

                {loadingInspections ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="animate-spin text-[#0095FF]" size={32} />
                    </div>
                ) : allInspections.length === 0 ? (
                    <div className="bg-white border border-gray-100 rounded-[20px] p-10 text-center text-gray-400 font-medium shadow-sm">
                        No inspections scheduled for today.
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        {paginatedInspections.map((item: any) => {
                            const statusColor = STATUS_COLORS[item.status] ?? "bg-gray-100 text-gray-500";
                            const statusLabel = STATUS_LABELS[item.status] ?? "Unknown";
                            const scheduledDate = item.scheduledDate
                                ? format(new Date(item.scheduledDate), "MMM dd, yyyy")
                                : "N/A";
                            const scheduledTime = item.scheduledTime
                                ? item.scheduledTime.slice(0, 5)
                                : "N/A";

                            return (
                                <Link
                                    key={item.id}
                                    href={`/admin/properties/inspections/${item.id}`}
                                    className="bg-white border border-gray-100 rounded-[20px] p-6 shadow-sm hover:shadow-md transition-all group cursor-pointer relative block"
                                >
                                    <div className="flex items-center gap-6">
                                        <div className="flex flex-col flex-1 gap-2">
                                            <div className="flex items-center justify-between">
                                                <h3 className="text-[18px] font-bold text-[#1A1A1A] group-hover:text-[#0095FF] transition-colors">
                                                    {item.propertyName ?? "Property"}
                                                </h3>
                                                <ChevronRight size={20} className="text-gray-300 group-hover:text-[#0095FF] transition-all" />
                                            </div>
                                            <p className="text-[14px] text-gray-400 font-medium">
                                                {item.propertyAddress ?? "—"}
                                            </p>
                                            <div className="flex items-center gap-6 text-[14px] font-bold text-[#1A1A1A]">
                                                <div className="flex items-center gap-2">
                                                    <Calendar size={16} className="text-[#0095FF]" />
                                                    {scheduledDate}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Clock size={16} className="text-[#0095FF]" />
                                                    {scheduledTime}
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-2 mt-1">
                                                <span className="text-[12px] font-bold text-gray-600">
                                                    {item.customerName ?? "Customer"} &bull; ID: {item.inspectionId ?? item.id?.slice(0, 8)}
                                                </span>
                                                <span className={`text-[11px] font-black px-3 py-1 rounded-full uppercase tracking-wider ${statusColor}`}>
                                                    {statusLabel}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}

                        {/* Today's Inspections Pagination */}
                        {totalInspectionPages > 1 && (
                            <div className="flex items-center justify-center gap-3 pt-4">
                                <button
                                    disabled={activeInspectionPage === 1}
                                    onClick={() => setInspectionPage(p => p - 1)}
                                    className="px-4 py-2 rounded-xl text-[14px] font-bold border border-gray-200 disabled:opacity-40 hover:bg-gray-50 bg-white transition-all"
                                >
                                    Previous
                                </button>
                                <span className="text-[14px] font-medium text-gray-500">
                                    Page {activeInspectionPage} of {totalInspectionPages}
                                </span>
                                <button
                                    disabled={activeInspectionPage >= totalInspectionPages}
                                    onClick={() => setInspectionPage(p => p + 1)}
                                    className="px-4 py-2 rounded-xl text-[14px] font-bold border border-gray-200 disabled:opacity-40 hover:bg-gray-50 bg-white transition-all"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Recent Activity Section */}
            <div className="flex flex-col gap-6">
                <h2 className="text-[24px] font-bold text-[#1A1A1A] font-montserrat">Recent Activity</h2>

                {loadingActivity ? (
                    <div className="flex justify-center py-8">
                        <Loader2 className="animate-spin text-[#0095FF]" size={28} />
                    </div>
                ) : activities.length === 0 ? (
                    <div className="bg-white border border-gray-100 rounded-[20px] p-10 text-center text-gray-400 font-medium shadow-sm">
                        No recent activity found.
                    </div>
                ) : (
                    <div className="bg-white border border-gray-100 rounded-[20px] overflow-hidden shadow-sm flex flex-col">
                        <div className="divide-y divide-gray-100">
                            {paginatedActivities.map((activity: any, i: number) => (
                                <div
                                    key={i}
                                    className="px-8 py-5 flex items-center gap-4 hover:bg-gray-50/50 transition-colors"
                                >
                                    <div className="w-8 h-8 rounded-full bg-[#E9F3FF] flex items-center justify-center flex-shrink-0">
                                        <Activity size={14} className="text-[#0095FF]" />
                                    </div>
                                    <div className="flex-1">
                                        <span className="text-[15px] font-bold text-[#1A1A1A]">
                                            {activity.description ?? activity.type ?? "Activity"}
                                        </span>
                                    </div>
                                    <span className="text-[13px] text-gray-400 font-medium whitespace-nowrap">
                                        {activity.occurredAt
                                            ? formatDistanceToNow(new Date(activity.occurredAt), { addSuffix: true })
                                            : ""}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Pagination Controls */}
                        {totalActivityPages > 1 && (
                            <div className="flex items-center justify-center gap-3 py-4 border-t border-gray-100 bg-gray-50/30">
                                <button
                                    disabled={activePage === 1}
                                    onClick={() => setActivityPage(p => p - 1)}
                                    className="px-4 py-2 rounded-xl text-[14px] font-bold border border-gray-200 disabled:opacity-40 hover:bg-gray-50 bg-white transition-all"
                                >
                                    Previous
                                </button>
                                <span className="text-[14px] font-medium text-gray-500">
                                    Page {activePage} of {totalActivityPages}
                                </span>
                                <button
                                    disabled={activePage >= totalActivityPages}
                                    onClick={() => setActivityPage(p => p + 1)}
                                    className="px-4 py-2 rounded-xl text-[14px] font-bold border border-gray-200 disabled:opacity-40 hover:bg-gray-50 bg-white transition-all"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
