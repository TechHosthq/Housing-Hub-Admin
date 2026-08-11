import * as Sentry from '@sentry/nextjs';
import { sharedOptions } from '@/lib/sentry/options';

/**
 * Sentry for the Next.js server runtime — SSR, route handlers, server actions.
 *
 * Note this is not the .NET API; that reports separately. What lands here is
 * rendering failures and anything thrown while fetching data server-side.
 */
Sentry.init({
  ...sharedOptions,
  sampleRate: 1.0,
});
