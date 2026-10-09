"use client";

import { use, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import {
    ArrowLeft, Download, Eye, Loader2, PenLine, ShieldAlert, ShieldCheck,
} from "lucide-react";
import { useTenancy } from "@/hooks/useTenancy";
import { useToastStore } from "@/store/useToastStore";
import {
    AdminTenancy,
    AdminTenancyDocument,
    DOCUMENT_MODE_LABELS,
    DOCUMENT_STATUS_LABELS,
    LEASE_TYPE_LABELS,
    TENANCY_STATUS_LABELS,
    TenancyDocumentFile,
    TenancyDocumentStatus,
} from "@/types/tenancy";
import { formatKobo } from "@/utils/money";
import { resolveApiError } from "@/utils/errorResolver";

const DOCUMENT_STATUS_STYLES: Record<number, string> = {
    [TenancyDocumentStatus.Requested]: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300",
    [TenancyDocumentStatus.Submitted]: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400",
    [TenancyDocumentStatus.Accepted]: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400",
    [TenancyDocumentStatus.Rejected]: "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400",
};

export default function AdminTenancyDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);

    const { useTenancyDetail } = useTenancy();
    const { data, isLoading } = useTenancyDetail(id);

    const detail = data?.data;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-24">
                <Loader2 className="animate-spin text-[#0095FF]" size={28} />
            </div>
        );
    }

    if (!detail) {
        return (
            <div className="rounded-[18px] border border-gray-100 p-10 text-center dark:border-gray-800">
                <p className="text-[15px] font-bold text-[#1A1A1A] dark:text-gray-100">
                    We couldn&apos;t find that tenancy
                </p>
            </div>
        );
    }

    const { tenancy, documents, fees } = detail;

    return (
        <div>
            <Link
                href="/admin/tenancies"
                className="mb-6 flex items-center gap-2 text-[12px] font-bold text-[#0095FF] hover:underline"
            >
                <ArrowLeft size={15} />
                All tenancies
            </Link>

            <div className="mb-8">
                <h1 className="mb-1 font-montserrat text-[24px] font-black text-[#1A1A1A] dark:text-gray-100">
                    {tenancy.propertyTitle || "Untitled property"}
                </h1>
                <div className="flex flex-wrap items-center gap-3 text-[12px] text-gray-400">
                    <span className="rounded-full bg-[#0B2545] px-3 py-1 text-[11px] font-bold text-white">
                        {TENANCY_STATUS_LABELS[tenancy.status] ?? "—"}
                    </span>
                    <span>{LEASE_TYPE_LABELS[tenancy.leaseType]}</span>
                    <span>Chosen {format(new Date(tenancy.selectedAt), "d MMM yyyy")}</span>
                    {tenancy.closedAt && (
                        <span>Closed {format(new Date(tenancy.closedAt), "d MMM yyyy")}</span>
                    )}
                    <Link
                        href={`/admin/properties/${tenancy.propertyId}`}
                        className="font-bold text-[#0095FF] hover:underline"
                    >
                        View listing
                    </Link>
                </div>
            </div>

            {tenancy.withdrawnReason && (
                <div className="mb-6 rounded-[16px] border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900/40">
                    <p className="text-[11px] font-bold uppercase tracking-wide text-gray-400">
                        Reason given to the tenant
                    </p>
                    <p className="mt-1 text-[13px] leading-relaxed text-[#1A1A1A] dark:text-gray-200">
                        {tenancy.withdrawnReason}
                    </p>
                </div>
            )}

            <div className="grid gap-6 lg:grid-cols-2">
                <Parties tenancy={tenancy} />
                <Money tenancy={tenancy} fees={fees} />
            </div>

            <div className="mt-6 rounded-[18px] border border-gray-100 p-6 dark:border-gray-800">
                <h2 className="text-[15px] font-black text-[#1A1A1A] dark:text-gray-100">
                    Documents
                </h2>
                <p className="mt-1 text-[12px] text-gray-400">
                    {documents.length === 0
                        ? "The owner hasn't sent a request yet."
                        : `${tenancy.acceptedDocumentCount} of ${documents.length} accepted.`}
                </p>

                <div className="mt-5 space-y-5">
                    {documents.map((document) => (
                        <DocumentCard key={document.id} tenancyId={tenancy.id} document={document} />
                    ))}
                </div>
            </div>
        </div>
    );
}

function Parties({ tenancy }: { tenancy: AdminTenancy }) {
    return (
        <div className="rounded-[18px] border border-gray-100 p-6 dark:border-gray-800">
            <h2 className="mb-4 text-[15px] font-black text-[#1A1A1A] dark:text-gray-100">Parties</h2>

            <dl className="space-y-4">
                <div>
                    <dt className="text-[11px] font-bold uppercase tracking-wide text-gray-400">Owner</dt>
                    <dd className="mt-1">
                        <Link
                            href={`/admin/customers/${tenancy.landlordCustomerId}`}
                            className="text-[13px] font-bold text-[#1A1A1A] hover:text-[#0095FF] dark:text-gray-100"
                        >
                            {tenancy.landlordName || "—"}
                        </Link>
                        <span className="mt-0.5 block text-[12px] text-gray-400">
                            {tenancy.landlordEmail || "—"}
                        </span>
                    </dd>
                </div>

                <div>
                    <dt className="text-[11px] font-bold uppercase tracking-wide text-gray-400">Tenant</dt>
                    <dd className="mt-1">
                        <Link
                            href={`/admin/customers/${tenancy.tenantCustomerId}`}
                            className="text-[13px] font-bold text-[#1A1A1A] hover:text-[#0095FF] dark:text-gray-100"
                        >
                            {tenancy.tenantName || "—"}
                        </Link>
                        <span className="mt-0.5 block text-[12px] text-gray-400">
                            {tenancy.tenantEmail || "—"}
                        </span>
                    </dd>
                </div>
            </dl>
        </div>
    );
}

function Money({ tenancy, fees }: { tenancy: AdminTenancy; fees: { id: string; name: string; description: string; amountKobo: number }[] }) {
    return (
        <div className="rounded-[18px] border border-gray-100 p-6 dark:border-gray-800">
            <h2 className="mb-4 text-[15px] font-black text-[#1A1A1A] dark:text-gray-100">
                What the tenant was shown
            </h2>

            <dl className="space-y-3">
                <div className="flex items-start justify-between gap-6">
                    <dt className="text-[13px] font-bold text-[#1A1A1A] dark:text-gray-200">Rent</dt>
                    <dd className="shrink-0 text-[13px] font-bold text-[#1A1A1A] dark:text-gray-200">
                        {formatKobo(tenancy.agreedRentKobo)}
                    </dd>
                </div>

                {fees.map((fee) => (
                    <div key={fee.id} className="flex items-start justify-between gap-6">
                        <dt className="min-w-0">
                            <span className="block text-[13px] font-bold text-[#1A1A1A] dark:text-gray-200">
                                {fee.name}
                            </span>
                            <span className="mt-0.5 block text-[11px] leading-relaxed text-gray-400">
                                {fee.description}
                            </span>
                        </dt>
                        <dd className="shrink-0 text-[13px] font-bold text-[#1A1A1A] dark:text-gray-200">
                            {formatKobo(fee.amountKobo)}
                        </dd>
                    </div>
                ))}
            </dl>

            <div className="mt-4 flex items-center justify-between gap-6 border-t border-gray-100 pt-4 dark:border-gray-800">
                <span className="text-[13px] font-black text-[#1A1A1A] dark:text-gray-100">Total</span>
                <span className="font-montserrat text-[18px] font-black text-[#0B2545] dark:text-[#6BB5FF]">
                    {formatKobo(tenancy.totalKobo)}
                </span>
            </div>

            {/*
                The rent was captured when the tenant was chosen. Staff comparing it
                against the live listing will find them different on any listing the
                owner has since edited, and that is correct rather than a bug.
            */}
            <p className="mt-3 text-[11px] leading-relaxed text-gray-400">
                The rent was fixed when the tenant was chosen. It won&apos;t match the listing
                if the owner has edited the price since.
            </p>
        </div>
    );
}

function DocumentCard({ tenancyId, document }: { tenancyId: string; document: AdminTenancyDocument }) {
    const { fetchDocumentUrl } = useTenancy();
    const { showError } = useToastStore();
    const [opening, setOpening] = useState(false);

    /**
     * The tab is opened before the request and pointed at the URL once it arrives.
     * Opening it after the await is what a popup blocker stops — the click is no
     * longer the thing that caused it.
     */
    const open = async (file: TenancyDocumentFile) => {
        const tab = window.open("", "_blank");
        if (tab) tab.opener = null;

        setOpening(true);
        try {
            const result = await fetchDocumentUrl(tenancyId, document.id, file);

            if (result.isSuccessful && result.data) {
                if (tab) tab.location.href = result.data;
                else window.location.href = result.data;
                return;
            }

            tab?.close();
            // Most often this is a non-SuperAdmin hitting the restriction, and the
            // server says so — replacing it with something generic would leave an
            // admin thinking the file is missing.
            showError(result.message || "Could not open that document.");
        } catch (error) {
            tab?.close();
            showError(resolveApiError(error));
        } finally {
            setOpening(false);
        }
    };

    // The signature attests to the bytes that were stored. A mismatch means the
    // source changed after it was signed, which is the one thing on this screen
    // that would undermine the agreement rather than merely delay it.
    const hashesAgree = document.signedAt !== null
        && document.signedDocumentHash !== null
        && document.signedDocumentHash === document.sourceFileHash;

    return (
        <div className="rounded-[16px] border border-gray-100 p-5 dark:border-gray-800">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="text-[14px] font-bold text-[#1A1A1A] dark:text-gray-100">
                        {document.name}
                        {document.isAgreement && (
                            <span className="ml-2 rounded-full bg-[#0B2545] px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-white">
                                Agreement
                            </span>
                        )}
                    </p>
                    <p className="mt-0.5 text-[11px] text-gray-400">
                        {DOCUMENT_MODE_LABELS[document.mode]}
                        {document.submittedAt
                            && ` · submitted ${format(new Date(document.submittedAt), "d MMM yyyy, HH:mm")}`}
                        {document.reviewedAt
                            && ` · reviewed ${format(new Date(document.reviewedAt), "d MMM yyyy, HH:mm")}`}
                    </p>
                    {document.instructions && (
                        <p className="mt-1.5 text-[11px] leading-relaxed text-gray-500 dark:text-gray-400">
                            {document.instructions}
                        </p>
                    )}
                </div>

                <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold ${DOCUMENT_STATUS_STYLES[document.status]}`}>
                    {DOCUMENT_STATUS_LABELS[document.status]}
                </span>
            </div>

            {document.rejectionReason && (
                <p className="mt-3 rounded-xl bg-blue-50 px-4 py-3 text-[11px] leading-relaxed text-blue-800 dark:bg-blue-950/30 dark:text-blue-300">
                    Returned to the tenant: {document.rejectionReason}
                </p>
            )}

            {document.signedAt && (
                <div className="mt-4 rounded-xl bg-gray-50 p-4 dark:bg-gray-900/50">
                    <p className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wide text-gray-400">
                        <PenLine size={12} />
                        Signature
                    </p>

                    <dl className="mt-2.5 grid gap-2 text-[11px] sm:grid-cols-2">
                        <Field label="Signed" value={format(new Date(document.signedAt), "d MMM yyyy, HH:mm:ss")} />
                        <Field label="IP address" value={document.signerIpAddress} />
                        <Field label="Device" value={document.signerUserAgent} wide />
                    </dl>

                    <div className="mt-3 border-t border-gray-200 pt-3 dark:border-gray-800">
                        <p className={`flex items-center gap-1.5 text-[11px] font-bold ${hashesAgree ? "text-emerald-700 dark:text-emerald-400" : "text-[#FF3B30]"}`}>
                            {hashesAgree ? <ShieldCheck size={13} /> : <ShieldAlert size={13} />}
                            {hashesAgree
                                ? "The signed document matches what's stored"
                                : "The signed hash doesn't match the stored file"}
                        </p>
                        <p className="mt-1.5 break-all font-mono text-[10px] text-gray-400">
                            signed {document.signedDocumentHash ?? "—"}
                        </p>
                        <p className="mt-0.5 break-all font-mono text-[10px] text-gray-400">
                            stored {document.sourceFileHash ?? "—"}
                        </p>
                    </div>
                </div>
            )}

            {(document.hasSourceFile || document.hasSubmittedFile || document.hasSignedPdf) && (
                <div className="mt-4 flex flex-wrap items-center gap-4">
                    {document.hasSourceFile && (
                        <button
                            type="button"
                            onClick={() => open(TenancyDocumentFile.Source)}
                            disabled={opening}
                            className="flex items-center gap-1.5 text-[12px] font-bold text-[#0095FF] hover:underline disabled:opacity-40"
                        >
                            {opening ? <Loader2 size={13} className="animate-spin" /> : <Eye size={13} />}
                            What the owner sent
                        </button>
                    )}
                    {document.hasSubmittedFile && (
                        <button
                            type="button"
                            onClick={() => open(TenancyDocumentFile.Submitted)}
                            disabled={opening}
                            className="flex items-center gap-1.5 text-[12px] font-bold text-[#0095FF] hover:underline disabled:opacity-40"
                        >
                            {opening ? <Loader2 size={13} className="animate-spin" /> : <Eye size={13} />}
                            What the tenant sent
                        </button>
                    )}
                    {/*
                        The one to reach for in a dispute: the signature is on its
                        face and the certificate behind it names the time, the
                        address and the hash.
                    */}
                    {document.hasSignedPdf && (
                        <button
                            type="button"
                            onClick={() => open(TenancyDocumentFile.Signed)}
                            disabled={opening}
                            className="flex items-center gap-1.5 text-[12px] font-bold text-[#0095FF] hover:underline disabled:opacity-40"
                        >
                            {opening ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />}
                            The stamped copy
                        </button>
                    )}
                    <span className="text-[11px] text-gray-400">
                        SuperAdmin only, and each open is logged.
                    </span>
                </div>
            )}
        </div>
    );
}

function Field({ label, value, wide }: { label: string; value: string | null; wide?: boolean }) {
    return (
        <div className={wide ? "sm:col-span-2" : undefined}>
            <dt className="text-gray-400">{label}</dt>
            <dd className="mt-0.5 break-words font-medium text-[#1A1A1A] dark:text-gray-200">
                {value || "—"}
            </dd>
        </div>
    );
}
