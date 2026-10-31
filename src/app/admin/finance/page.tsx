"use client";

import { useState } from "react";
import { format } from "date-fns";
import { CircleAlert, Loader2, TrendingUp } from "lucide-react";
import { useFinance } from "@/hooks/useFinance";
import { FinanceReport } from "@/types/finance";
import { PAYMENT_PURPOSE_LABELS } from "@/types/payment";
import { formatKobo } from "@/utils/money";

/** Start of a month, as a UTC instant the API will accept. */
const monthStart = (offset: number) => {
    const now = new Date();
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + offset, 1)).toISOString();
};

const PERIODS = [
    { label: "This month", from: () => monthStart(0), to: () => undefined },
    { label: "Last month", from: () => monthStart(-1), to: () => monthStart(0) },
    { label: "Last 3 months", from: () => monthStart(-2), to: () => undefined },
    { label: "This year", from: () => new Date(Date.UTC(new Date().getUTCFullYear(), 0, 1)).toISOString(), to: () => undefined },
];

export default function AdminFinancePage() {
    const { useFinanceReport } = useFinance();

    const [period, setPeriod] = useState(0);
    const { data, isLoading } = useFinanceReport(PERIODS[period].from(), PERIODS[period].to());

    const report = data?.data;

    return (
        <div>
            <div className="mb-8">
                <h1 className="mb-1 font-montserrat text-[26px] font-black text-[#1A1A1A] dark:text-gray-100">
                    Finance
                </h1>
                <p className="text-[13px] font-medium leading-relaxed text-gray-400 dark:text-gray-500">
                    Every figure is what the payment recorded when it was charged, not what
                    today&apos;s rates would make it — so a past period does not change when a
                    rate does.
                </p>
            </div>

            <div className="mb-6 flex items-center gap-2 overflow-x-auto border-b border-gray-100 dark:border-gray-800">
                {PERIODS.map((item, index) => (
                    <button
                        key={item.label}
                        type="button"
                        onClick={() => setPeriod(index)}
                        className={`-mb-px shrink-0 border-b-2 px-4 py-3 text-[13px] font-bold transition-colors ${index === period
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
            ) : !report ? (
                <div className="rounded-[18px] border border-gray-100 p-10 text-center dark:border-gray-800">
                    <p className="text-[15px] font-bold text-[#1A1A1A] dark:text-gray-100">
                        We couldn&apos;t build that report
                    </p>
                </div>
            ) : (
                <Report report={report} />
            )}
        </div>
    );
}

function Report({ report }: { report: FinanceReport }) {
    return (
        <>
            <p className="mb-6 text-[12px] text-gray-400">
                {format(new Date(report.fromUtc), "d MMM yyyy")} to{" "}
                {format(new Date(report.toUtc), "d MMM yyyy")} · {report.settledCount} settled
                payment{report.settledCount === 1 ? "" : "s"}
            </p>

            {/*
                Net first and largest. Gross is the biggest number on this page and
                the one least likely to be ours — most of it is rent in transit —
                so the layout has to say which figure is the answer.
            */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Tile
                    label="We kept"
                    amountKobo={report.netEarnedKobo}
                    note="Commission and processing, after refunds"
                    emphasis
                />
                <Tile
                    label="Collected"
                    amountKobo={report.grossCollectedKobo}
                    note="Everything payers were charged"
                />
                <Tile
                    label="Paid to owners"
                    amountKobo={report.paidToOwnersKobo}
                    note="Split straight to their accounts — never ours"
                />
                <Tile
                    label="Refunded"
                    amountKobo={report.refundedKobo}
                    note={`${report.refundedCount} payment${report.refundedCount === 1 ? "" : "s"} sent back`}
                />
            </div>

            {report.flaggedCount > 0 && (
                <div className="mt-6 flex items-start gap-3 rounded-[16px] border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/40 dark:bg-amber-900/10">
                    <CircleAlert size={18} className="mt-0.5 shrink-0 text-amber-600" />
                    <div>
                        <p className="text-[13px] font-bold text-amber-800 dark:text-amber-300">
                            {formatKobo(report.flaggedKobo)} across {report.flaggedCount} flagged
                            payment{report.flaggedCount === 1 ? "" : "s"}
                        </p>
                        <p className="mt-0.5 text-[12px] leading-relaxed text-amber-800/80 dark:text-amber-200/80">
                            Confirmed for an amount that didn&apos;t match what was asked for, so
                            nothing was handed over. Money received against nothing — it belongs in
                            the accounts and in somebody&apos;s queue at the same time.
                        </p>
                    </div>
                </div>
            )}

            <div className="mt-8 overflow-x-auto rounded-[18px] border border-gray-100 dark:border-gray-800">
                <table className="w-full min-w-[720px]">
                    <thead className="bg-gray-50 dark:bg-gray-900/50">
                        <tr className="text-left text-[11px] font-bold uppercase tracking-wide text-gray-400">
                            <th className="px-5 py-4">What for</th>
                            <th className="px-5 py-4">Payments</th>
                            <th className="px-5 py-4">Collected</th>
                            <th className="px-5 py-4">To owners</th>
                            <th className="px-5 py-4">We kept</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {report.byPurpose.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-5 py-10 text-center text-[13px] text-gray-400">
                                    Nothing settled in this period.
                                </td>
                            </tr>
                        ) : report.byPurpose.map((line) => (
                            <tr key={line.purpose} className="transition-colors hover:bg-gray-50/60 dark:hover:bg-gray-900/40">
                                <td className="px-5 py-4 text-[13px] font-bold text-[#1A1A1A] dark:text-gray-100">
                                    {PAYMENT_PURPOSE_LABELS[line.purpose] ?? "—"}
                                </td>
                                <td className="px-5 py-4 text-[13px] text-gray-500 dark:text-gray-400">{line.count}</td>
                                <td className="px-5 py-4 text-[13px] text-gray-500 dark:text-gray-400">
                                    {formatKobo(line.grossKobo)}
                                </td>
                                <td className="px-5 py-4 text-[13px] text-gray-500 dark:text-gray-400">
                                    {line.paidToOwnersKobo > 0 ? formatKobo(line.paidToOwnersKobo) : "—"}
                                </td>
                                <td className="px-5 py-4 text-[13px] font-bold text-[#1A1A1A] dark:text-gray-100">
                                    {formatKobo(line.earnedKobo)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Not money, but it is what a failing checkout looks like from here. */}
            <p className="mt-5 text-[12px] text-gray-400">
                {report.pendingCount} started and not finished · {report.failedCount} failed or
                abandoned in this period.
            </p>
        </>
    );
}

function Tile({
    label, amountKobo, note, emphasis,
}: { label: string; amountKobo: number; note: string; emphasis?: boolean }) {
    return (
        <div
            className={`rounded-[18px] border p-6 ${emphasis
                ? "border-[#0095FF]/30 bg-[#0095FF]/5"
                : "border-gray-100 dark:border-gray-800"}`}
        >
            <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-gray-400">
                {emphasis && <TrendingUp size={13} className="text-[#0095FF]" />}
                {label}
            </p>
            <p className={`mt-2 font-montserrat font-black ${emphasis
                ? "text-[26px] text-[#0095FF]"
                : "text-[22px] text-[#1A1A1A] dark:text-gray-100"}`}
            >
                {formatKobo(amountKobo)}
            </p>
            <p className="mt-1 text-[11px] leading-relaxed text-gray-400">{note}</p>
        </div>
    );
}
