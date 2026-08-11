import * as Sentry from '@sentry/nextjs';

/**
 * Loads the right Sentry config for whichever runtime Next.js booted.
 *
 * Next calls this once per runtime at startup. The imports are dynamic and inside
 * the branch on purpose — the edge runtime cannot load the Node config, and a
 * top-level import of either would break the other.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config');
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config');
  }
}

/**
 * Reports errors thrown while rendering on the server.
 *
 * Without this, a failure inside a server component is logged to the console of a
 * machine nobody is watching and the user simply sees a broken page.
 */
export const onRequestError = Sentry.captureRequestError;
