"use client";

import { use, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import {
    AlertTriangle, ArrowLeft, Check, ExternalLink, Loader2, ShieldAlert, X,
} from "lucide-react";
import { useVerification } from "@/hooks/useVerification";
import verificationService from "@/services/verificationService";
import {
    CASE_STATUS_LABELS,
    DOCUMENT_TYPE_LABELS,
    DocumentReviewContext,
    DocumentReviewStatus,
    SUBJECT_TYPE_LABELS,
    VerificationCaseStatus,
    VerificationDocument,
} from "@/types/verification";

export default function AdminVerificationCasePage(
    { params }: { params: Promise<{ id: string }> },
) {
    const { id } = use(params);

    const {
        useCase, beginReview, isBeginningReview,
        reviewDocument, isReviewingDocument,
        decideCase, isDecidingCase,
    } = useVerification();

    const { data: response, isLoading } = useCase(id);

    const [rejectingDocumentId, setRejectingDocumentId] = useState<string | null>(null);
    const [documentReason, setDocumentReason] = useState("");
    const [decisionNote, setDecisionNote] = useState("");
    const [openingDocumentId, setOpeningDocumentId] = useState<string | null>(null);

    const detail = response?.data;
    const verificationCase = detail?.case;
    const documents = detail?.documents ?? [];
    const context = detail?.reviewContext ?? [];

    const contextFor = (documentId: string): DocumentReviewContext | undefined =>
        context.find((c) => c.documentId === documentId);

    const isAwaitingDecision =
        verificationCase?.status === VerificationCaseStatus.Submitted
        || verificationCase?.status === VerificationCaseStatus.UnderReview;

    const allReviewed = documents.length > 0
        && documents.every((d) => d.status !== DocumentReviewStatus.Pending);
    const anyRejected = documents.some((d) => d.status === DocumentReviewStatus.Rejected);
    const anyNameMismatch = context.some((c) => c.shouldEscalate);

    /**
     * Opens a document in a new tab via a freshly minted, short-lived link.
     *
     * The URL is never stored in component state or rendered into an href — it is a
     * bearer credential for a title deed, and putting it in the DOM leaves it in the
     * page for anyone who later inspects it. Fetch, open, discard.
     */
    const openDocument = async (documentId: string) => {
        setOpeningDocumentId(documentId);
        try {
            const result = await verificationService.getDocumentUrl(documentId);
            if (result.isSuccessful && result.data) {
                window.open(result.data, "_blank", "noopener,noreferrer");
            }
        } finally {
            setOpeningDocumentId(null);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-32">
                <Loader2 className="animate-spin text-[#0095FF]" size={28} />
            </div>
        );
    }

    if (!verificationCase) {
        return (
            <div className="py-20 text-center">
                <p className="text-[15px] font-bold text-[#1A1A1A] dark:text-gray-100">Case not found</p>
                <Link href="/admin/verification" className="mt-4 inline-block text-[13px] font-bold text-[#0095FF]">
                    Back to queue
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-[1000px]">
            <Link
                href="/admin/verification"
                className="inline-flex items-center gap-1.5 text-[13px] font-bold text-gray-400 hover:text-gray-600 mb-6"
            >
                <ArrowLeft size={15} />
                Back to queue
            </Link>

            <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-[24px] font-black text-[#1A1A1A] dark:text-gray-100 font-montserrat mb-1">
                        {verificationCase.subjectLabel ?? "Verification case"}
                    </h1>
                    <p className="text-[13px] font-medium text-gray-400 dark:text-gray-500">
                        {SUBJECT_TYPE_LABELS[verificationCase.subjectType]}
                        {" · submitted by "}
                        {verificationCase.submittedByName ?? "—"}
                        {verificationCase.submittedAt
                            && ` · ${format(new Date(verificationCase.submittedAt), "d MMM yyyy")}`}
                    </p>
                </div>

                <span className="rounded-full bg-gray-100 dark:bg-gray-800 px-3 py-1.5 text-[12px] font-bold text-gray-600 dark:text-gray-300">
                    {CASE_STATUS_LABELS[verificationCase.status]}
                </span>
            </div>

            {/* The strongest fraud signal in the flow gets the most prominent
                treatment. A real certificate belonging to somebody else is the
                common case, and it is easy to miss if it is only a small label
                further down the page. */}
            {anyNameMismatch && (
                <div className="mb-6 flex gap-3 rounded-[16px] border border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30 p-4">
                    <ShieldAlert className="text-amber-600 shrink-0 mt-0.5" size={18} />
                    <div>
                        <p className="text-[13px] font-bold text-amber-900 dark:text-amber-300 mb-1">
                            Name on a document does not match the account holder
                        </p>
                        <p className="text-[12px] leading-relaxed text-amber-900/80 dark:text-amber-200/70">
                            This is the pattern for a genuine document submitted by someone
                            unconnected to it. Names do vary legitimately between documents, so
                            check before concluding — but if it is not explainable, decide{" "}
                            <strong>Escalate — name mismatch</strong> rather than a plain rejection.
                        </p>
                    </div>
                </div>
            )}

            {verificationCase.status === VerificationCaseStatus.Submitted && (
                <button
                    type="button"
                    onClick={() => beginReview(id)}
                    disabled={isBeginningReview}
                    className="mb-6 rounded-full bg-[#0B2545] px-5 py-2.5 text-[13px] font-bold text-white hover:bg-[#071A33] disabled:opacity-60"
                >
                    {isBeginningReview ? "Claiming…" : "Claim this case"}
                </button>
            )}

            {/* ── Documents ───────────────────────────────────────── */}

            <h2 className="text-[15px] font-black text-[#1A1A1A] dark:text-gray-100 mb-3">
                Documents ({documents.length})
            </h2>

            <div className="space-y-3 mb-10">
                {documents.map((document: VerificationDocument) => {
                    const ctx = contextFor(document.id);
                    const isRejecting = rejectingDocumentId === document.id;

                    return (
                        <div
                            key={document.id}
                            className="rounded-[16px] border border-gray-100 dark:border-gray-800 p-5"
                        >
                            <div className="flex flex-wrap items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <p className="text-[14px] font-bold text-[#1A1A1A] dark:text-gray-100">
                                        {DOCUMENT_TYPE_LABELS[document.documentType] ?? "Document"}
                                    </p>
                                    <p className="mt-0.5 text-[12px] text-gray-400 dark:text-gray-500">
                                        {document.originalFileName ?? "file"}
                                        {document.documentNumber && ` · ${document.documentNumber}`}
                                        {document.expiresAt
                                            && ` · expires ${format(new Date(document.expiresAt), "d MMM yyyy")}`}
                                    </p>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => openDocument(document.id)}
                                        disabled={openingDocumentId === document.id}
                                        className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 dark:border-gray-700 px-3.5 py-2 text-[12px] font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-60"
                                    >
                                        {openingDocumentId === document.id
                                            ? <Loader2 size={13} className="animate-spin" />
                                            : <ExternalLink size={13} />}
                                        View
                                    </button>

                                    <StatusPill status={document.status} />
                                </div>
                            </div>

                            {/* Reviewer-only signals. Never returned to the applicant —
                                telling them which check flagged them tells an
                                impersonator what to fix. */}
                            {ctx && (
                                <div className="mt-4 grid gap-2 rounded-[12px] bg-gray-50 dark:bg-gray-900/50 p-3 text-[12px]">
                                    <div className="flex flex-wrap gap-x-6 gap-y-1">
                                        <span className="text-gray-500 dark:text-gray-400">
                                            On document:{" "}
                                            <strong className="text-gray-700 dark:text-gray-200">
                                                {document.nameOnDocument ?? "not supplied"}
                                            </strong>
                                        </span>
                                        <span className="text-gray-500 dark:text-gray-400">
                                            On account:{" "}
                                            <strong className="text-gray-700 dark:text-gray-200">
                                                {ctx.nameOnAccount ?? "—"}
                                            </strong>
                                        </span>
                                        <NameMatchPill match={ctx.nameMatch} escalate={ctx.shouldEscalate} />
                                    </div>

                                    <div className="text-gray-500 dark:text-gray-400">
                                        {/* "Not checked" and "checked and failed" must never look
                                            alike — one is a gap, the other is a finding. */}
                                        {!ctx.cacLookupPerformed ? (
                                            <span>CAC lookup: <strong>not checked automatically</strong> — verify against the certificate by hand.</span>
                                        ) : ctx.cacFound ? (
                                            <span className="text-emerald-700 dark:text-emerald-400">
                                                CAC lookup: found{ctx.cacRegisteredName && ` — registered as "${ctx.cacRegisteredName}"`}
                                                {ctx.cacStatus && ` (${ctx.cacStatus})`}
                                            </span>
                                        ) : (
                                            <span className="text-amber-700 dark:text-amber-400">
                                                CAC lookup: no company found for this number. Registry data is
                                                inconsistent — confirm by hand before rejecting.
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}

                            {document.status === DocumentReviewStatus.Rejected && document.rejectionReason && (
                                <p className="mt-3 text-[12px] text-red-600 dark:text-red-400">
                                    Rejected: {document.rejectionReason}
                                </p>
                            )}

                            {isAwaitingDecision && document.status === DocumentReviewStatus.Pending && (
                                <div className="mt-4 flex flex-wrap items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => reviewDocument({ documentId: document.id, data: { approved: true } })}
                                        disabled={isReviewingDocument}
                                        className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-4 py-2 text-[12px] font-bold text-white hover:bg-emerald-700 disabled:opacity-60"
                                    >
                                        <Check size={13} /> Approve
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => { setRejectingDocumentId(document.id); setDocumentReason(""); }}
                                        disabled={isReviewingDocument}
                                        className="inline-flex items-center gap-1.5 rounded-full border border-red-200 px-4 py-2 text-[12px] font-bold text-red-600 hover:bg-red-50 disabled:opacity-60"
                                    >
                                        <X size={13} /> Reject
                                    </button>
                                </div>
                            )}

                            {isRejecting && (
                                <div className="mt-3">
                                    <textarea
                                        value={documentReason}
                                        onChange={(e) => setDocumentReason(e.target.value)}
                                        rows={2}
                                        placeholder="What does the applicant need to fix? They will see this."
                                        className="w-full rounded-[12px] border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-3 text-[13px] outline-none focus:border-[#0095FF]"
                                    />
                                    <div className="mt-2 flex gap-2">
                                        <button
                                            type="button"
                                            disabled={!documentReason.trim() || isReviewingDocument}
                                            onClick={() => {
                                                reviewDocument({
                                                    documentId: document.id,
                                                    data: { approved: false, rejectionReason: documentReason.trim() },
                                                });
                                                setRejectingDocumentId(null);
                                            }}
                                            className="rounded-full bg-red-600 px-4 py-2 text-[12px] font-bold text-white hover:bg-red-700 disabled:opacity-40"
                                        >
                                            Confirm rejection
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setRejectingDocumentId(null)}
                                            className="rounded-full px-4 py-2 text-[12px] font-bold text-gray-400 hover:text-gray-600"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* ── Case decision ───────────────────────────────────── */}

            {isAwaitingDecision && (
                <div className="rounded-[18px] border border-gray-100 dark:border-gray-800 p-6">
                    <h2 className="text-[15px] font-black text-[#1A1A1A] dark:text-gray-100 mb-1">
                        Decision
                    </h2>
                    <p className="text-[12px] text-gray-400 dark:text-gray-500 mb-4">
                        A reason is required for anything other than approval. The applicant sees it.
                    </p>

                    <textarea
                        value={decisionNote}
                        onChange={(e) => setDecisionNote(e.target.value)}
                        rows={3}
                        placeholder="Reason, if not approving."
                        className="w-full rounded-[12px] border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-3 text-[13px] outline-none focus:border-[#0095FF] mb-4"
                    />

                    {!allReviewed && (
                        <p className="mb-4 flex items-center gap-1.5 text-[12px] font-semibold text-amber-600">
                            <AlertTriangle size={13} />
                            Every document must be reviewed before the case can be approved.
                        </p>
                    )}
                    {allReviewed && anyRejected && (
                        <p className="mb-4 flex items-center gap-1.5 text-[12px] font-semibold text-amber-600">
                            <AlertTriangle size={13} />
                            A document was rejected, so this case cannot be approved.
                        </p>
                    )}

                    <div className="flex flex-wrap gap-2">
                        <button
                            type="button"
                            disabled={!allReviewed || anyRejected || isDecidingCase}
                            onClick={() => decideCase({
                                caseId: id,
                                data: { outcome: VerificationCaseStatus.Approved, note: decisionNote.trim() || null },
                            })}
                            className="rounded-full bg-emerald-600 px-5 py-2.5 text-[13px] font-bold text-white hover:bg-emerald-700 disabled:opacity-40"
                            title={!allReviewed
                                ? "Review every document first"
                                : anyRejected ? "A document was rejected" : undefined}
                        >
                            Approve case
                        </button>

                        <button
                            type="button"
                            disabled={!decisionNote.trim() || isDecidingCase}
                            onClick={() => decideCase({
                                caseId: id,
                                data: { outcome: VerificationCaseStatus.Rejected, note: decisionNote.trim() },
                            })}
                            className="rounded-full border border-red-200 px-5 py-2.5 text-[13px] font-bold text-red-600 hover:bg-red-50 disabled:opacity-40"
                        >
                            Reject case
                        </button>

                        <button
                            type="button"
                            disabled={!decisionNote.trim() || isDecidingCase}
                            onClick={() => decideCase({
                                caseId: id,
                                data: {
                                    outcome: VerificationCaseStatus.EscalatedNameMismatch,
                                    note: decisionNote.trim(),
                                },
                            })}
                            className="rounded-full border border-amber-300 px-5 py-2.5 text-[13px] font-bold text-amber-700 hover:bg-amber-50 disabled:opacity-40"
                            title="Use when the documents appear to belong to someone else"
                        >
                            Escalate — name mismatch
                        </button>
                    </div>

                    {/* The applicant is told nothing on escalation, on purpose. Worth
                        stating so a reviewer does not assume the usual email went out. */}
                    <p className="mt-4 text-[11px] leading-relaxed text-gray-400 dark:text-gray-500">
                        Approving or rejecting emails the applicant and creates an in-app
                        notification. Escalating notifies nobody — telling a suspected
                        impersonator which check caught them only teaches them what to change.
                    </p>
                </div>
            )}

            {!isAwaitingDecision && verificationCase.decisionNote && (
                <div className="rounded-[18px] border border-gray-100 dark:border-gray-800 p-6">
                    <p className="text-[12px] font-bold uppercase tracking-wide text-gray-400 mb-2">
                        Decision note
                    </p>
                    <p className="text-[13px] text-gray-700 dark:text-gray-300">
                        {verificationCase.decisionNote}
                    </p>
                </div>
            )}
        </div>
    );
}

function StatusPill({ status }: { status: DocumentReviewStatus }) {
    const styles: Record<number, string> = {
        [DocumentReviewStatus.Pending]: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300",
        [DocumentReviewStatus.Approved]: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400",
        [DocumentReviewStatus.Rejected]: "bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400",
        [DocumentReviewStatus.Expired]: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400",
    };
    const labels: Record<number, string> = {
        [DocumentReviewStatus.Pending]: "Pending",
        [DocumentReviewStatus.Approved]: "Approved",
        [DocumentReviewStatus.Rejected]: "Rejected",
        [DocumentReviewStatus.Expired]: "Expired",
    };

    return (
        <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${styles[status]}`}>
            {labels[status]}
        </span>
    );
}

function NameMatchPill({ match, escalate }: { match: string; escalate: boolean }) {
    // "Unknown" is a data gap, not a red flag — it must not look like a warning, or
    // real mismatches get lost among documents we simply could not compare.
    const tone = escalate
        ? "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300"
        : match === "Exact"
            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
            : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300";

    const label = match === "None"
        ? "No name match"
        : match === "Unknown"
            ? "Name not comparable"
            : `${match} name match`;

    return <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${tone}`}>{label}</span>;
}
