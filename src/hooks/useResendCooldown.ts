"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_PREFIX = "hh-admin:resend-otp-until:";

const storageKey = (email?: string | null) => `${STORAGE_PREFIX}${(email ?? "").toLowerCase()}`;

const readRemainingSeconds = (email?: string | null): number => {
    if (typeof window === "undefined" || !email) return 0;
    const raw = window.localStorage.getItem(storageKey(email));
    if (!raw) return 0;
    const until = Number(raw);
    if (!Number.isFinite(until)) return 0;
    return Math.max(0, Math.ceil((until - Date.now()) / 1000));
};

/**
 * Tracks the OTP-resend cooldown.
 *
 * The server enforces the real throttle (a fixed 60s minimum gap between
 * sends, identical whether or not the account exists, so the response can't
 * be used to tell the two apart). This hook doesn't read that from the
 * response — it just starts the same fixed countdown the server enforces, so:
 *  - it starts at 0 — the button is only disabled after an actual request;
 *  - it survives a refresh instead of restarting the full wait;
 *  - it can't be bypassed by reloading, because the server rejects early
 *    resends anyway (silently, with no visible difference in the response).
 */
export function useResendCooldown(email?: string | null) {
    const [remaining, setRemaining] = useState(0);

    useEffect(() => {
        // Recomputed from the stored expiry each tick, so a backgrounded tab that
        // misses intervals still shows the correct value when it resumes.
        const tick = () => setRemaining(readRemainingSeconds(email));

        const id = window.setInterval(tick, 1000);
        tick();

        return () => window.clearInterval(id);
    }, [email]);

    /** Start (or restart) the fixed-duration countdown. */
    const startCooldown = useCallback(
        (seconds: number) => {
            if (typeof window === "undefined" || !email || seconds <= 0) return;
            window.localStorage.setItem(storageKey(email), String(Date.now() + seconds * 1000));
            setRemaining(seconds);
        },
        [email]
    );

    const formatted = (() => {
        const minutes = Math.floor(remaining / 60);
        const seconds = remaining % 60;
        return `${minutes}:${seconds.toString().padStart(2, "0")}`;
    })();

    return { remaining, isCoolingDown: remaining > 0, formatted, startCooldown };
}
