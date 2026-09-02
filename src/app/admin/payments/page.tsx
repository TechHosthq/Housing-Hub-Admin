"use client";

import { useState } from "react";
import { format } from "date-fns";
import { CircleAlert, Copy, Loader2, Receipt, ShieldCheck } from "lucide-react";
import Pagination from "@/components/admin/Pagination";
import { usePayment } from "@/hooks/usePayment";
import {
    AdminPayment,
    PAYMENT_PURPOSE_LABELS,
    PAYMENT_STATUS_LABELS,
    PaymentStatus,
} from "@/types/payment";
import { formatKobo } from "@/utils/money";

const ITEMS_PER_PAGE = 20;

/**
 * Flagged first, deliberately.
 *
 * It is the only tab where not looking costs a customer something — a flagged
 * payment means the gateway confirmed money for an amount that did not match, so
 * somebody may have paid and received nothing. Everything else here is a record;
 * this one is a task.
 */
const TABS: { label: string; status?: PaymentStatus; flaggedOnly?: boolean }[] = [
    { label: "Needs checking", flaggedOnly: true },
    { label: "All" },
    { label: "Paid", status: PaymentStatus.Successful },
    { label: "Pending", status: PaymentStatus.Pending },
    { label: "Failed", status: PaymentStatus.Failed },
];

const STATUS_STYLES: Record<number, string> = {
    [PaymentStatus.Successful]: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400",
    [PaymentStatus.Pending]: "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400",
    [PaymentStatus.Failed]: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300",
    [PaymentStatus.Abandoned]: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300",
    [PaymentStatus.Flagged]: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400",
};

export default function AdminPaymentsPage() {
    const { usePaymentList, useFlaggedPayments, useFlaggedCount } = usePayment();

    const [activeTab, setActiveTab] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);

    const tab = TABS[activeTab];

    const listQuery = usePaymentList({
        pageNumber: currentPage,
        pageSize: ITEMS_PER_PAGE,
        status: tab.status,
    });
    const flaggedQuery = useFlaggedPayments();
    const { data: flaggedCountResponse } = useFlaggedCount();

    const flaggedCount = flaggedCountResponse?.data ?? 0;

    const isLoading = tab.flaggedOnly ? flaggedQuery.isLoading : listQuery.isLoading;
    const payments: AdminPayment[] = tab.flaggedOnly
        ? flaggedQuery.data?.data ?? []
        : listQuery.data?.data?.items ?? [];
    const totalCount = tab.flaggedOnly ? payments.length : listQuery.data?.data?.totalCount ?? 0;
    const totalPages = tab.flaggedOnly ? 1 : listQuery.data?.data?.totalPages ?? 1;

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-[26px] font-black text-[#1A1A1A] dark:text-gray-100 font-montserrat mb-1">
                    Payments
                </h1>
                <p className="text-[13px] font-medium text-gray-400 dark:text-gray-500">
                    Verification fees paid to Housing Hub. Read-only — refunds are issued from the
                    Paystack dashboard.
                </p>
            </div>

            {/*
                Surfaced above the tabs rather than only inside one, because the whole
                point of this screen is that a flagged payment gets noticed. Until this
                existed, a flagged payment appeared only in a log line.
            */}
            {flaggedCount > 0 && (
                <div className="mb-6 flex items-start gap-3 rounded-[16px] border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/40 dark:bg-amber-900/10">
                    <CircleAlert size={18} className="mt-0.5 shrink-0 text-amber-600" />
                    <div>
                        <p className="text-[13px] font-bold text-amber-800 dark:text-amber-300">
                            {flaggedCount === 1
                                ? "1 payment needs checking"
                                : `${flaggedCount} payments need checking`}
                        </p>
                        <p className="mt-0.5 text-[12px] leading-relaxed text-amber-800/80 dark:text-amber-200/80">
                            The gateway confirmed an amount that didn&apos;t match what we asked for,
                            so nothing was handed over. Check the transaction in Paystack against the
                            reference below before deciding what to do.
                        </p>
                    </div>
                </div>
            )}

            <div className="mb-6 flex items-center gap-2 overflow-x-auto border-b border-gray-100 dark:border-gray-800">
                {TABS.map((item, index) => (
                    <button
                        key={item.label}
                        type="button"
                        onClick={() => { setActiveTab(index); setCurrentPage(1); }}
                        className={`-mb-px shrink-0 border-b-2 px-4 py-3 text-[13px] font-bold transition-colors ${
                            index === activeTab
                                ? "border-[#0095FF] text-[#0095FF]"
                                : "border-transparent text-gray-400 hover:text-gray-600"
                        }`}
                    >
                        {item.label}
                        {item.flaggedOnly && flaggedCount > 0 && (
                            <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-black text-amber-700 dark:bg-amber-950/50 dark:text-amber-400">
                                {flaggedCount}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center py-24">
                    <Loader2 className="animate-spin text-[#0095FF]" size={28} />
                </div>
            ) : payments.length === 0 ? (
                <EmptyState flaggedOnly={!!tab.flaggedOnly} />
            ) : (
                <>
                    <div className="overflow-x-auto rounded-[18px] border border-gray-100 dark:border-gray-800">
                        <table className="w-full min-w-[900px]">
                            <thead className="bg-gray-50 dark:bg-gray-900/50">
                                <tr className="text-left text-[11px] font-bold uppercase tracking-wide text-gray-400">
                                    <th className="px-5 py-4">Reference</th>
                                    <th className="px-5 py-4">Payer</th>
                                    <th className="px-5 py-4">For</th>
                                    <th className="px-5 py-4">Amount</th>
                                    <th className="px-5 py-4">Status</th>
                                    <th className="px-5 py-4">When</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {payments.map((payment) => (
                                    <PaymentRow key={payment.id} payment={payment} />
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {!tab.flaggedOnly && totalPages > 1 && (
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

function PaymentRow({ payment }: { payment: AdminPayment }) {
    const isFlagged = payment.status === PaymentStatus.Flagged;

    return (
        <>
            <tr className="transition-colors hover:bg-gray-50/60 dark:hover:bg-gray-900/40">
                <td className="px-5 py-4">
                    <ReferenceCell reference={payment.reference} providerReference={payment.providerReference} />
                </td>
                <td className="px-5 py-4">
                    <span className="block text-[13px] font-bold text-[#1A1A1A] dark:text-gray-100">
                        {payment.customerName || "—"}
                    </span>
                    <span className="block truncate text-[11px] text-gray-400 dark:text-gray-500">
                        {payment.customerEmail || "—"}
                    </span>
                </td>
                <td className="px-5 py-4">
                    <span className="block text-[13px] text-gray-600 dark:text-gray-300">
                        {PAYMENT_PURPOSE_LABELS[payment.purpose] ?? "—"}
                    </span>
                    {/*
                        Shown because it explains the total. An admin reading a
                        support email about "why was I charged more" needs to see
                        that the identity check was bundled in.
                    */}
                    {payment.includesIdentityVerification && (
                        <span className="block text-[11px] text-gray-400 dark:text-gray-500">
                            + identity ({formatKobo(payment.identityFeeKobo)})
                        </span>
                    )}
                </td>
                <td className="px-5 py-4 text-[13px] font-bold text-[#1A1A1A] dark:text-gray-100">
                    {formatKobo(payment.amountKobo)}
                    {payment.channel && (
                        <span className="block text-[11px] font-medium text-gray-400 dark:text-gray-500">
                            {payment.channel.replace(/_/g, " ")}
                        </span>
                    )}
                </td>
                <td className="px-5 py-4">
                    <span
                        className={`inline-block rounded-full px-2.5 py-1 text-[11px] font-bold ${
                            STATUS_STYLES[payment.status] ?? STATUS_STYLES[PaymentStatus.Failed]
                        }`}
                    >
                        {PAYMENT_STATUS_LABELS[payment.status] ?? "Unknown"}
                    </span>
                </td>
                <td className="px-5 py-4 text-[13px] text-gray-500 dark:text-gray-400">
                    {format(new Date(payment.paidAt ?? payment.dateCreated), "d MMM yyyy, HH:mm")}
                    {!payment.paidAt && (
                        <span className="block text-[11px] text-gray-400">started</span>
                    )}
                </td>
            </tr>

            {/* The reason lives on its own row so it can be read in full rather than truncated. */}
            {isFlagged && payment.flagNote && (
                <tr className="bg-amber-50/50 dark:bg-amber-900/5">
                    <td colSpan={6} className="px-5 pb-4 pt-0">
                        <p className="text-[12px] leading-relaxed text-amber-800 dark:text-amber-300">
                            <span className="font-bold">Why this is held: </span>
                            {payment.flagNote}
                        </p>
                    </td>
                </tr>
            )}

            {payment.status === PaymentStatus.Failed && payment.failureReason && (
                <tr>
                    <td colSpan={6} className="px-5 pb-4 pt-0">
                        <p className="text-[11px] text-gray-400 dark:text-gray-500">
                            {payment.failureReason}
                        </p>
                    </td>
                </tr>
            )}
        </>
    );
}

/**
 * Both references, ours and the provider's.
 *
 * Ours is what appears in our logs and in the payer's receipt; the provider's is
 * what a Paystack search accepts. Reconciling a flagged payment means looking it
 * up there, so both are one click away.
 */
function ReferenceCell({
    reference, providerReference,
}: { reference: string; providerReference: string | null }) {
    const [copied, setCopied] = useState(false);

    const copy = async () => {
        try {
            await navigator.clipboard.writeText(reference);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1500);
        } catch {
            // Clipboard access can be refused outright, and a failed copy is not
            // worth an error dialog — the text is on screen and selectable.
        }
    };

    return (
        <div>
            <button
                type="button"
                onClick={copy}
                title="Copy reference"
                className="group flex items-center gap-1.5 font-mono text-[12px] font-bold text-[#1A1A1A] hover:text-[#0095FF] dark:text-gray-100"
            >
                <span className="truncate max-w-[150px]">{reference}</span>
                <Copy size={12} className="shrink-0 text-gray-300 group-hover:text-[#0095FF]" />
            </button>
            {copied && <span className="text-[10px] font-bold text-emerald-600">Copied</span>}
            {providerReference && (
                <span className="block font-mono text-[10px] text-gray-400 dark:text-gray-500">
                    Paystack {providerReference}
                </span>
            )}
        </div>
    );
}

function EmptyState({ flaggedOnly }: { flaggedOnly: boolean }) {
    return (
        <div className="flex flex-col items-center justify-center py-24 text-center">
            {flaggedOnly ? (
                <>
                    <ShieldCheck className="mb-4 text-emerald-500" size={40} />
                    <p className="mb-1 text-[15px] font-bold text-[#1A1A1A] dark:text-gray-100">
                        Nothing needs checking
                    </p>
                    <p className="text-[13px] text-gray-400 dark:text-gray-500">
                        Every payment matched the amount it was raised for.
                    </p>
                </>
            ) : (
                <>
                    <Receipt className="mb-4 text-gray-300" size={40} />
                    <p className="mb-1 text-[15px] font-bold text-[#1A1A1A] dark:text-gray-100">
                        No payments yet
                    </p>
                    <p className="text-[13px] text-gray-400 dark:text-gray-500">
                        Nothing has been charged. Payments stay switched off until
                        Payments__Enabled is set.
                    </p>
                </>
            )}
        </div>
    );
}
