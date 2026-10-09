"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { ChevronRight, FileSignature, Loader2 } from "lucide-react";
import Pagination from "@/components/admin/Pagination";
import { useTenancy } from "@/hooks/useTenancy";
import {
    AdminTenancy,
    LEASE_TYPE_LABELS,
    TENANCY_STATUS_LABELS,
    TenancyStatus,
} from "@/types/tenancy";
import { formatKobo } from "@/utils/money";

const ITEMS_PER_PAGE = 20;

/**
 * Documents out first.
 *
 * It is the stage where a let actually stalls — somebody is waiting on somebody
 * else and neither may realise it. The rest are records; this one is where looking
 * changes anything.
 */
const TABS: { label: string; status?: TenancyStatus }[] = [
    { label: "Documents out", status: TenancyStatus.DocumentsRequested },
    { label: "All" },
    { label: "Tenant chosen", status: TenancyStatus.CandidateSelected },
    { label: "Awaiting payment", status: TenancyStatus.AwaitingPayment },
    { label: "Running", status: TenancyStatus.Active },
    { label: "Withdrawn", status: TenancyStatus.Withdrawn },
    { label: "Declined", status: TenancyStatus.DeclinedByCandidate },
];

const STATUS_STYLES: Record<number, string> = {
    [TenancyStatus.CandidateSelected]: "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400",
    [TenancyStatus.DocumentsRequested]: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400",
    [TenancyStatus.DocumentsAccepted]: "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400",
    [TenancyStatus.AwaitingPayment]: "bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400",
    [TenancyStatus.Active]: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400",
    [TenancyStatus.Ended]: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300",
    [TenancyStatus.Withdrawn]: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300",
    [TenancyStatus.DeclinedByCandidate]: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300",
};

export default function AdminTenanciesPage() {
    const { useTenancyList } = useTenancy();

    const [activeTab, setActiveTab] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);

    const tab = TABS[activeTab];
    const { data, isLoading } = useTenancyList({
        pageNumber: currentPage,
        pageSize: ITEMS_PER_PAGE,
        status: tab.status,
    });

    const tenancies = data?.data?.items ?? [];
    const totalCount = data?.data?.totalCount ?? 0;
    const totalPages = data?.data?.totalPages ?? 1;

    return (
        <div>
            <div className="mb-8">
                <h1 className="mb-1 font-montserrat text-[26px] font-black text-[#1A1A1A] dark:text-gray-100">
                    Tenancies
                </h1>
                <p className="text-[13px] font-medium leading-relaxed text-gray-400 dark:text-gray-500">
                    Read-only. A tenancy is an agreement between two people, so there is nothing
                    here to change — putting one right means talking to the parties, who are the
                    only ones who can.
                </p>
            </div>

            <div className="mb-6 flex items-center gap-2 overflow-x-auto border-b border-gray-100 dark:border-gray-800">
                {TABS.map((item, index) => (
                    <button
                        key={item.label}
                        type="button"
                        onClick={() => { setActiveTab(index); setCurrentPage(1); }}
                        className={`-mb-px shrink-0 border-b-2 px-4 py-3 text-[13px] font-bold transition-colors ${index === activeTab
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
            ) : tenancies.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-[18px] border border-gray-100 py-24 text-center dark:border-gray-800">
                    <FileSignature className="mb-4 text-gray-300" size={38} />
                    <p className="mb-1 text-[15px] font-bold text-[#1A1A1A] dark:text-gray-100">
                        Nothing in this view
                    </p>
                    <p className="max-w-sm text-[12px] leading-relaxed text-gray-400 dark:text-gray-500">
                        A tenancy appears once an owner has chosen somebody who completed an
                        inspection on their property.
                    </p>
                </div>
            ) : (
                <>
                    <div className="overflow-x-auto rounded-[18px] border border-gray-100 dark:border-gray-800">
                        <table className="w-full min-w-[1100px]">
                            <thead className="bg-gray-50 dark:bg-gray-900/50">
                                <tr className="text-left text-[11px] font-bold uppercase tracking-wide text-gray-400">
                                    <th className="px-5 py-4">Property</th>
                                    <th className="px-5 py-4">Owner</th>
                                    <th className="px-5 py-4">Tenant</th>
                                    <th className="px-5 py-4">Total</th>
                                    <th className="px-5 py-4">Documents</th>
                                    <th className="px-5 py-4">Status</th>
                                    <th className="px-5 py-4">Chosen</th>
                                    <th className="px-5 py-4" />
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {tenancies.map((tenancy) => (
                                    <TenancyRow key={tenancy.id} tenancy={tenancy} />
                                ))}
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

function TenancyRow({ tenancy }: { tenancy: AdminTenancy }) {
    return (
        <tr className="transition-colors hover:bg-gray-50/60 dark:hover:bg-gray-900/40">
            <td className="px-5 py-4">
                <Link
                    href={`/admin/properties/${tenancy.propertyId}`}
                    className="block max-w-[220px] truncate text-[13px] font-bold text-[#1A1A1A] hover:text-[#0095FF] dark:text-gray-100"
                >
                    {tenancy.propertyTitle || "—"}
                </Link>
                <span className="mt-0.5 block text-[11px] text-gray-400">
                    {LEASE_TYPE_LABELS[tenancy.leaseType] ?? "—"}
                </span>
            </td>

            <td className="px-5 py-4">
                <Party name={tenancy.landlordName} email={tenancy.landlordEmail} />
            </td>

            <td className="px-5 py-4">
                <Party name={tenancy.tenantName} email={tenancy.tenantEmail} />
            </td>

            <td className="px-5 py-4">
                <span className="block text-[13px] font-bold text-[#1A1A1A] dark:text-gray-100">
                    {formatKobo(tenancy.totalKobo)}
                </span>
                {/* Fees broken out, because the rent is the figure both parties quote. */}
                <span className="mt-0.5 block text-[11px] text-gray-400">
                    rent {formatKobo(tenancy.agreedRentKobo)}
                    {tenancy.feesKobo > 0 && ` + ${formatKobo(tenancy.feesKobo)} fees`}
                </span>
            </td>

            <td className="px-5 py-4">
                <DocumentProgress tenancy={tenancy} />
            </td>

            <td className="px-5 py-4">
                <span className={`inline-block rounded-full px-2.5 py-1 text-[11px] font-bold ${STATUS_STYLES[tenancy.status] ?? STATUS_STYLES[TenancyStatus.Ended]}`}>
                    {TENANCY_STATUS_LABELS[tenancy.status] ?? "—"}
                </span>
            </td>

            <td className="px-5 py-4 text-[12px] text-gray-500 dark:text-gray-400">
                {format(new Date(tenancy.selectedAt), "d MMM yyyy")}
            </td>

            <td className="px-5 py-4">
                <Link
                    href={`/admin/tenancies/${tenancy.id}`}
                    className="flex items-center gap-1 text-[12px] font-bold text-[#0095FF] hover:underline"
                >
                    Open
                    <ChevronRight size={14} />
                </Link>
            </td>
        </tr>
    );
}

function Party({ name, email }: { name: string | null; email: string | null }) {
    return (
        <>
            <span className="block text-[13px] font-bold text-[#1A1A1A] dark:text-gray-100">
                {name || "—"}
            </span>
            <span className="mt-0.5 block max-w-[200px] truncate text-[11px] text-gray-400">
                {email || "—"}
            </span>
        </>
    );
}

/**
 * Says who the hold-up is, not just how far along it is.
 *
 * "3 of 5" tells an admin nothing they can act on. "Waiting on the owner" tells
 * them who to email.
 */
function DocumentProgress({ tenancy }: { tenancy: AdminTenancy }) {
    if (tenancy.documentCount === 0) {
        return <span className="text-[12px] text-gray-400">Not sent yet</span>;
    }

    return (
        <>
            <span className="block text-[13px] font-bold text-[#1A1A1A] dark:text-gray-100">
                {tenancy.acceptedDocumentCount} of {tenancy.documentCount} accepted
            </span>
            <span className="mt-0.5 block text-[11px] text-gray-400">
                {tenancy.awaitingOwnerCount > 0
                    ? `${tenancy.awaitingOwnerCount} waiting on the owner`
                    : tenancy.awaitingTenantCount > 0
                        ? `${tenancy.awaitingTenantCount} waiting on the tenant`
                        : "nothing outstanding"}
            </span>
        </>
    );
}
