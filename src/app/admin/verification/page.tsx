"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { AlertTriangle, Building2, FileCheck2, Home, Loader2, ShieldCheck } from "lucide-react";
import Pagination from "@/components/admin/Pagination";
import { useVerification } from "@/hooks/useVerification";
import {
    CASE_STATUS_LABELS,
    SUBJECT_TYPE_LABELS,
    VerificationCaseStatus,
    VerificationSubjectType,
} from "@/types/verification";

const ITEMS_PER_PAGE = 20;

const TABS: { label: string; subjectType?: VerificationSubjectType }[] = [
    { label: "All" },
    { label: "Business", subjectType: VerificationSubjectType.Business },
    { label: "Property title", subjectType: VerificationSubjectType.Property },
];

/**
 * How long a case has been waiting, in words.
 *
 * Shown instead of a raw submission date because the number that matters to a
 * reviewer is the wait, not the timestamp — and a queue where things quietly age
 * is how applicants get lost.
 */
function waitingFor(submittedAt: string | null): { label: string; overdue: boolean } {
    if (!submittedAt) return { label: "—", overdue: false };

    const days = Math.floor((Date.now() - new Date(submittedAt).getTime()) / 86_400_000);

    if (days === 0) return { label: "Today", overdue: false };
    if (days === 1) return { label: "1 day", overdue: false };

    // Three working days is the point at which an applicant starts assuming they
    // have been forgotten. Flag it rather than leaving it to be noticed.
    return { label: `${days} days`, overdue: days >= 3 };
}

export default function AdminVerificationQueuePage() {
    const { useQueueList } = useVerification();

    const [activeTab, setActiveTab] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);

    const tab = TABS[activeTab];

    const { data: response, isLoading } = useQueueList({
        pageNumber: currentPage,
        pageSize: ITEMS_PER_PAGE,
        subjectType: tab.subjectType,
    });

    const cases = response?.data?.items ?? [];
    const totalCount = response?.data?.totalCount ?? 0;
    const totalPages = response?.data?.totalPages ?? 1;

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-[26px] font-black text-[#1A1A1A] dark:text-gray-100 font-montserrat mb-1">
                    Verification queue
                </h1>
                <p className="text-[13px] font-medium text-gray-400 dark:text-gray-500">
                    Business and property submissions awaiting a decision, oldest first.
                </p>
            </div>

            <div className="flex items-center gap-2 mb-6 border-b border-gray-100 dark:border-gray-800">
                {TABS.map((item, index) => (
                    <button
                        key={item.label}
                        type="button"
                        onClick={() => { setActiveTab(index); setCurrentPage(1); }}
                        className={`px-4 py-3 text-[13px] font-bold transition-colors border-b-2 -mb-px ${
                            index === activeTab
                                ? "border-[#0095FF] text-[#0095FF]"
                                : "border-transparent text-gray-400 hover:text-gray-600"
                        }`}
                    >
                        {item.label}
                    </button>
                ))}
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center py-24">
                    <Loader2 className="animate-spin text-[#0095FF]" size={28} />
                </div>
            ) : cases.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                    <ShieldCheck className="text-emerald-500 mb-4" size={40} />
                    <p className="text-[15px] font-bold text-[#1A1A1A] dark:text-gray-100 mb-1">
                        Nothing waiting
                    </p>
                    <p className="text-[13px] text-gray-400 dark:text-gray-500">
                        Every submission has been decided.
                    </p>
                </div>
            ) : (
                <>
                    <div className="overflow-x-auto rounded-[18px] border border-gray-100 dark:border-gray-800">
                        <table className="w-full min-w-[820px]">
                            <thead className="bg-gray-50 dark:bg-gray-900/50">
                                <tr className="text-left text-[11px] font-bold uppercase tracking-wide text-gray-400">
                                    <th className="px-5 py-4">Subject</th>
                                    <th className="px-5 py-4">Type</th>
                                    <th className="px-5 py-4">Submitted by</th>
                                    <th className="px-5 py-4">Documents</th>
                                    <th className="px-5 py-4">Waiting</th>
                                    <th className="px-5 py-4">Status</th>
                                    <th className="px-5 py-4" />
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {cases.map((item) => {
                                    const wait = waitingFor(item.submittedAt);
                                    const isProperty = item.subjectType === VerificationSubjectType.Property;

                                    return (
                                        <tr key={item.id} className="hover:bg-gray-50/60 dark:hover:bg-gray-900/40 transition-colors">
                                            <td className="px-5 py-4">
                                                <span className="flex items-center gap-2 text-[13px] font-bold text-[#1A1A1A] dark:text-gray-100">
                                                    {isProperty
                                                        ? <Home size={15} className="text-gray-400 shrink-0" />
                                                        : <Building2 size={15} className="text-gray-400 shrink-0" />}
                                                    <span className="truncate max-w-[240px]">
                                                        {item.subjectLabel ?? "—"}
                                                    </span>
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 text-[13px] text-gray-500 dark:text-gray-400">
                                                {SUBJECT_TYPE_LABELS[item.subjectType]}
                                            </td>
                                            <td className="px-5 py-4 text-[13px] text-gray-500 dark:text-gray-400">
                                                {item.submittedByName ?? "—"}
                                            </td>
                                            <td className="px-5 py-4 text-[13px] text-gray-500 dark:text-gray-400">
                                                {item.documentCount}
                                            </td>
                                            <td className="px-5 py-4">
                                                <span
                                                    className={`inline-flex items-center gap-1 text-[13px] font-semibold ${
                                                        wait.overdue ? "text-amber-600" : "text-gray-500 dark:text-gray-400"
                                                    }`}
                                                    title={item.submittedAt
                                                        ? format(new Date(item.submittedAt), "d MMM yyyy, HH:mm")
                                                        : undefined}
                                                >
                                                    {wait.overdue && <AlertTriangle size={13} />}
                                                    {wait.label}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span
                                                    className={`inline-block rounded-full px-2.5 py-1 text-[11px] font-bold ${
                                                        item.status === VerificationCaseStatus.UnderReview
                                                            ? "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400"
                                                            : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300"
                                                    }`}
                                                >
                                                    {CASE_STATUS_LABELS[item.status]}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 text-right">
                                                <Link
                                                    href={`/admin/verification/${item.id}`}
                                                    className="inline-flex items-center gap-1.5 rounded-full bg-[#0B2545] px-4 py-2 text-[12px] font-bold text-white hover:bg-[#071A33] transition-colors"
                                                >
                                                    <FileCheck2 size={13} />
                                                    Review
                                                </Link>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {totalPages > 1 && (
                        <div className="mt-6">
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                totalCount={totalCount}
                                itemsPerPage={ITEMS_PER_PAGE}
                                onPageChange={setCurrentPage}
                            />
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
