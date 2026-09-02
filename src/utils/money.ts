/**
 * Formatting money for display.
 *
 * Amounts travel and are stored as whole kobo, so this is the only place the
 * conversion to naira happens. One function on purpose: a divide by 100 scattered
 * through components is how a figure ends up a hundred times too small on one
 * screen and right on every other.
 */

/** Kobo to naira, e.g. 500000 → "₦5,000". */
export const formatKobo = (kobo: number): string => {
    const naira = kobo / 100;
    const hasKobo = kobo % 100 !== 0;

    return `₦${naira.toLocaleString('en-NG', {
        minimumFractionDigits: hasKobo ? 2 : 0,
        maximumFractionDigits: 2,
    })}`;
};
