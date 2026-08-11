import * as Sentry from '@sentry/nextjs';
import { sharedOptions } from '@/lib/sentry/options';

/**
 * Sentry for the edge runtime (middleware and any edge route handlers).
 *
 * Nothing currently runs on the edge in this app — there is no middleware.ts —
 * but Next.js expects the file to exist when the SDK is installed, and it costs
 * nothing to have it ready for when a nonce-generating middleware arrives to
 * remove 'unsafe-inline' from the CSP.
 */
Sentry.init({
  ...sharedOptions,
  sampleRate: 1.0,
});
