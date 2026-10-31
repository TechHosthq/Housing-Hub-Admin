/**
 * The money that moved through Housing Hub.
 *
 * Mirrors FinanceReportDto. Every figure is kobo, and every one of them is built
 * from what a payment recorded when it was charged — never re-priced at today's
 * rates, or last month's report would change the next time a rate did.
 */

import { ApiResponse } from './auth';
import { PaymentPurpose } from './payment';

export interface FinancePurposeLine {
    purpose: PaymentPurpose;
    count: number;
    grossKobo: number;
    paidToOwnersKobo: number;
    earnedKobo: number;
}

export interface FinanceReport {
    fromUtc: string;
    toUtc: string;
    currency: string;

    settledCount: number;
    /** Everything payers were charged. Mostly not ours. */
    grossCollectedKobo: number;
    /** Rent and owners' fees, split straight to their accounts. */
    paidToOwnersKobo: number;
    /** Our commission and the processing fee, before refunds. */
    earnedKobo: number;

    refundedKobo: number;
    refundedCount: number;
    /** What we kept. The only figure that belongs in a profit-and-loss line. */
    netEarnedKobo: number;

    flaggedCount: number;
    flaggedKobo: number;
    pendingCount: number;
    failedCount: number;

    byPurpose: FinancePurposeLine[];
}

export type FinanceReportResponse = ApiResponse<FinanceReport>;
