"use client";

import { useState } from "react";
import { CircleAlert, Loader2, X } from "lucide-react";
import { usePayment } from "@/hooks/usePayment";
import { AdminPayment } from "@/types/payment";
import { formatKobo } from "@/utils/money";
import { resolveApiError } from "@/utils/errorResolver";

/**
 * Mirrors the server's minimum. Checked here so the reason box can say what it
 * wants before the request, and enforced there because a client-side minimum is a
 * hint rather than a rule.
 */
const MINIMUM_REASON_LENGTH = 10;

interface RefundPaymentModalProps {
    payment: AdminPayment;
    onClose: () => void;
}

/**
 * Confirms a refund, and makes the person issuing it say why.
 *
 * A modal rather than an inline button, because this is the only action in the
 * admin app that moves money and the only one that cannot be undone from here —
 * a refund reversed means asking the customer to pay again.
 */
export default function RefundPaymentModal({ payment, onClose }: RefundPaymentModalProps) {
    const { refundPayment, isRefunding } = usePayment();
    const [reason, setReason] = useState("");
    const [error, setError] = useState("");

    const isReasonUsable = reason.trim().length >= MINIMUM_REASON_LENGTH;

    const handleRefund = async () => {
        setError("");
        try {
            const result = await refundPayment({ reference: payment.reference, reason: reason.trim() });

            if (result.isSuccessful) {
                onClose();
                return;
            }

            // The server's message names the actual obstacle — the provider refused,
            // the charge is not confirmed, a refund is already in flight. Passing it
            // through beats replacing it with something generic an admin cannot act on.
            setError(result.message || "Could not refund that payment.");
        } catch (err) {
            setError(resolveApiError(err).join(" "));
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-md rounded-[22px] bg-white p-7 shadow-2xl dark:bg-gray-900">
                <div className="mb-5 flex items-start justify-between gap-4">
                    <h2 className="text-[19px] font-black text-[#1A1A1A] dark:text-gray-100 font-montserrat">
                        Refund this payment?
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isRefunding}
                        className="text-gray-300 hover:text-gray-500 disabled:opacity-40"
                        aria-label="Close"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="mb-5 rounded-[14px] bg-gray-50 p-4 dark:bg-gray-800/50">
                    <Row label="Payer" value={payment.customerName || payment.customerEmail || "—"} />
                    <Row label="Reference" value={payment.reference} mono />
                    {/*
                        The amount charged is shown rather than the amount that will
                        go back, because we do not know the latter until the provider
                        is asked — and on a flagged payment they differ. Saying
                        "we'll send back what arrived" is the honest version.
                    */}
                    <Row label="Charged" value={formatKobo(payment.amountKobo)} />
                </div>

                <p className="mb-5 text-[12px] leading-relaxed text-gray-500 dark:text-gray-400">
                    Housing Hub will send back <strong>whatever the provider confirms actually
                    arrived</strong>, which on a flagged payment is not the amount charged. The payer
                    is emailed automatically. If this was a verification fee, the request stops
                    counting as paid for.
                </p>

                <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-gray-400">
                    Why are you refunding this?
                </label>
                <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={3}
                    placeholder="e.g. Charged twice for the same verification request"
                    className="w-full rounded-xl border border-[#E5E5E5] px-4 py-3 text-[13px] placeholder:text-gray-300 focus:border-[#0B2545] focus:outline-none dark:border-gray-800 dark:bg-gray-900 dark:placeholder:text-gray-600"
                />
                <p className="mt-1.5 text-[11px] text-gray-400">
                    Recorded against the payment and sent to the payer. It is what explains this
                    money leaving, months from now.
                </p>

                {error && (
                    <div className="mt-4 flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 dark:border-red-900/40 dark:bg-red-900/10">
                        <CircleAlert size={15} className="mt-0.5 shrink-0 text-red-500" />
                        <p className="text-[12px] font-semibold text-red-600 dark:text-red-400">{error}</p>
                    </div>
                )}

                <div className="mt-6 flex items-center justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isRefunding}
                        className="text-[13px] font-bold text-gray-400 hover:text-gray-600 disabled:opacity-40"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleRefund}
                        disabled={!isReasonUsable || isRefunding}
                        className="flex items-center gap-2 rounded-full bg-[#FF3B30] px-6 py-3 text-[13px] font-bold text-white hover:bg-[#D93025] disabled:opacity-40"
                    >
                        {isRefunding && <Loader2 size={14} className="animate-spin" />}
                        {isRefunding ? "Refunding…" : "Refund"}
                    </button>
                </div>
            </div>
        </div>
    );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
    return (
        <div className="flex items-baseline justify-between gap-4 py-1">
            <span className="text-[11px] font-bold uppercase tracking-wide text-gray-400">{label}</span>
            <span
                className={`truncate text-[13px] font-bold text-[#1A1A1A] dark:text-gray-100 ${
                    mono ? "font-mono text-[12px]" : ""
                }`}
            >
                {value}
            </span>
        </div>
    );
}
