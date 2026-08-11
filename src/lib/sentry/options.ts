/**
 * Sentry options shared by the client, server and edge runtimes.
 *
 * Two constraints shape everything here, and both are easy to get wrong quietly.
 *
 * QUOTA. The free Developer plan allows 5,000 events per month across the whole
 * organisation — and four projects share it (this app, the admin dashboard, and
 * both APIs). One noisy recurring error can consume the entire month in a day,
 * after which Sentry stops accepting events and you are blind again without being
 * told. So the filtering below is deliberately aggressive: anything that is not a
 * bug in our code is dropped before it is sent, not after.
 *
 * PII. This matters more here than in the consumer app, not less. The dashboard
 * renders every customer's national ID number, their KYC documents and presigned
 * links to them — so an unscrubbed error from a customer detail page could ship
 * another person's identity documents to a third party. That is an NDPA problem,
 * not an embarrassment. `sendDefaultPii` stays false, and `beforeSend` strips the
 * places secrets actually turn up: headers, query strings, and the local variables
 * captured in a stack frame.
 */

/** Set per environment. Absent means Sentry is inert — see `enabled` below. */
export const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

/**
 * Errors that are not ours and can never be acted on.
 *
 * Browser extensions, wallet injections and antivirus shims throw inside pages
 * they did not write, and it surfaces as our error. Network aborts fire whenever
 * a user navigates mid-request, which on a listings page with images is constant.
 * None of these are bugs, and on a 5,000-event budget they are the difference
 * between a useful month and a wasted one.
 */
const IGNORED_ERRORS: (string | RegExp)[] = [
  // User navigated away, closed the tab, or lost signal mid-request.
  'AbortError',
  'Non-Error promise rejection captured',
  /Network ?Error/i,
  'Failed to fetch',
  'Load failed',
  'TypeError: cancelled',
  'The operation was aborted',

  // Next.js router aborting a navigation that was superseded. Expected.
  'NEXT_REDIRECT',
  'NEXT_NOT_FOUND',

  // Benign, fires on any page with a resize-driven layout. Chrome-only noise.
  'ResizeObserver loop limit exceeded',
  'ResizeObserver loop completed with undelivered notifications',

  // Browser extensions and injected wallets.
  /extension\//i,
  /^chrome:\/\//i,
  /^moz-extension:\/\//i,
  'top.GLOBALS',
  'conduitPage',
];

/** Stack frames originating outside our own bundle. */
const DENY_URLS: RegExp[] = [
  /extensions\//i,
  /^chrome(-extension)?:\/\//i,
  /^moz-extension:\/\//i,
  /^safari-(web-)?extension:\/\//i,
];

/** Header names that carry credentials. Compared lowercase. */
const SENSITIVE_HEADERS = new Set([
  'authorization',
  'cookie',
  'set-cookie',
  'x-worker-secret',
  'x-api-key',
]);

/**
 * Query/body keys whose values must never leave the browser.
 *
 * Matched as substrings, case-insensitively, so `refreshToken`, `id_token` and
 * `nationalIdNumber` are all caught without enumerating every spelling.
 */
const SENSITIVE_KEYS = [
  'token',
  'password',
  'secret',
  'authorization',
  'apikey',
  'api_key',
  'nationalid',
  'national_id',
  'iddocument',
  'bvn',
  'nin',
  // Presigned S3 URLs. The signature IS the credential — a link carrying one
  // grants anyone who holds it read access to a KYC document for its lifetime,
  // so it must never appear in a request URL or breadcrumb we ship offsite.
  'x-amz-',
  'signature',
];

const isSensitiveKey = (key: string): boolean => {
  const lower = key.toLowerCase();
  return SENSITIVE_KEYS.some((needle) => lower.includes(needle));
};

/** Recursively blanks sensitive values, leaving the shape intact for debugging. */
const scrub = (value: unknown, depth = 0): unknown => {
  if (depth > 6 || value === null || typeof value !== 'object') return value;

  if (Array.isArray(value)) return value.map((item) => scrub(item, depth + 1));

  const out: Record<string, unknown> = {};
  for (const [key, inner] of Object.entries(value as Record<string, unknown>)) {
    out[key] = isSensitiveKey(key) ? '[redacted]' : scrub(inner, depth + 1);
  }
  return out;
};

/**
 * Removes sensitive values from a URL's query string or fragment.
 *
 * The one that matters here is the presigned KYC document link. It is a URL that
 * grants read access to somebody's identity document for ten minutes — if it ends
 * up in an error's request URL or a breadcrumb, it has been handed to a third
 * party in a form they can actually use.
 */
const scrubUrl = (url: string): string => {
  try {
    const parsed = new URL(url, 'https://placeholder.invalid');
    let touched = false;

    for (const key of [...parsed.searchParams.keys()]) {
      if (isSensitiveKey(key)) {
        parsed.searchParams.set(key, '[redacted]');
        touched = true;
      }
    }

    if (parsed.hash && /token|secret|password/i.test(parsed.hash)) {
      parsed.hash = '#[redacted]';
      touched = true;
    }

    if (!touched) return url;
    return url.startsWith('http') ? parsed.toString() : `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return url;
  }
};

/* eslint-disable @typescript-eslint/no-explicit-any */
type SentryEvent = any;

/**
 * Last gate before an event leaves the browser. Returning null drops it.
 */
export const beforeSend = (event: SentryEvent): SentryEvent | null => {
  if (event.request) {
    if (event.request.url) event.request.url = scrubUrl(event.request.url);
    if (event.request.query_string) event.request.query_string = '[redacted]';
    if (event.request.cookies) event.request.cookies = '[redacted]';
    if (event.request.data) event.request.data = scrub(event.request.data);

    if (event.request.headers) {
      for (const name of Object.keys(event.request.headers)) {
        if (SENSITIVE_HEADERS.has(name.toLowerCase())) {
          event.request.headers[name] = '[redacted]';
        }
      }
    }
  }

  // Local variables captured in a stack frame are the least obvious leak: a
  // handler that had the password in scope will attach it here.
  for (const exception of event.exception?.values ?? []) {
    for (const frame of exception.stacktrace?.frames ?? []) {
      if (frame.vars) frame.vars = scrub(frame.vars);
    }
  }

  for (const crumb of event.breadcrumbs ?? []) {
    if (crumb.data?.url) crumb.data.url = scrubUrl(String(crumb.data.url));
    if (crumb.data) crumb.data = scrub(crumb.data);
  }

  return event;
};

/**
 * Options every runtime shares.
 *
 * `enabled` is the important one: with no DSN configured the SDK initialises and
 * does nothing, so a missing environment variable degrades to "no monitoring"
 * rather than a boot failure or a stream of transport errors in the console.
 */
export const sharedOptions = {
  dsn: SENTRY_DSN,
  enabled: Boolean(SENTRY_DSN),
  environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT ?? process.env.NODE_ENV,

  // Never attach IPs, cookies or request bodies automatically.
  sendDefaultPii: false,

  // Performance tracing is charged against a separate span quota that the free
  // plan barely covers, and we have no performance question we are trying to
  // answer yet. Errors are the whole point right now.
  tracesSampleRate: 0,

  // Breadcrumbs are what make an error diagnosable; they cost nothing extra
  // because they ride along with an event that was going to be sent anyway.
  maxBreadcrumbs: 30,

  ignoreErrors: IGNORED_ERRORS,
  denyUrls: DENY_URLS,
  beforeSend,
};
