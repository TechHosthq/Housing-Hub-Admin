import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

/**
 * Scheme + host + port of a URL, with any path discarded.
 *
 * This matters more than it looks. A CSP source expression may carry a path, and
 * when it does the browser matches on it — and a path that does not end in `/`
 * matches only that exact path. NEXT_PUBLIC_ADMIN_API_URL is
 * `https://<id>.execute-api.af-south-1.amazonaws.com/admin`, so feeding it to
 * connect-src verbatim permitted exactly one URL and refused every real API call
 * underneath it. Every request from the dashboard failed with (blocked:csp).
 *
 * Falls back rather than throwing: a malformed value should degrade the policy,
 * not fail the build.
 */
const toOrigin = (url: string | undefined, fallback: string): string => {
  try {
    return new URL(url ?? fallback).origin;
  } catch {
    return fallback;
  }
};

const API_ORIGIN = toOrigin(
  process.env.NEXT_PUBLIC_ADMIN_API_URL,
  'https://3tgjb2crdf.execute-api.af-south-1.amazonaws.com',
);

/**
 * Sentry's ingest endpoint, derived from the DSN.
 *
 * The CSP is enforcing, so without this the browser refuses every error report —
 * and that failure is invisible in the worst way: monitoring that looks installed,
 * reports nothing, and leaves you believing there are no errors. Derived from the
 * DSN because the ingest host encodes the org id and region.
 */
const SENTRY_ORIGIN = process.env.NEXT_PUBLIC_SENTRY_DSN
  ? toOrigin(process.env.NEXT_PUBLIC_SENTRY_DSN, '')
  : '';

const S3_ORIGIN = 'https://housinghub-files-dev.s3.af-south-1.amazonaws.com';

/**
 * Content Security Policy for the admin dashboard.
 *
 * Tighter than the consumer app: no Google Sign-In (admin auth is OTP-only) and no
 * third-party embeds. The one iframe is DocumentPreviewModal, which renders a
 * presigned S3 URL for KYC documents — hence S3 in frame-src.
 *
 * NOW ENFORCING, having shipped Report-Only first.
 *
 * SMOKE TEST BEFORE YOU TRUST IT, with the console open: sign in with an OTP,
 * load the dashboard, open a customer and preview their KYC document (the S3
 * iframe), view a property with photos. Any `Refused to ...` line is a directive
 * that needs widening.
 *
 * Known weakness: 'unsafe-inline' on script-src, needed for Next's inline
 * bootstrap. Removing it requires per-request nonces via middleware.
 */
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' ${process.env.NODE_ENV === 'development' ? "'unsafe-eval'" : ''}`,
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self' data:",
  `img-src 'self' data: blob: https://images.unsplash.com ${S3_ORIGIN}`,
  // Listing videos are reviewed here too, and would otherwise fall through to
  // default-src and refuse to play.
  `media-src 'self' blob: ${S3_ORIGIN}`,
  `connect-src 'self' ${API_ORIGIN} ${SENTRY_ORIGIN}`.trim(),
  // KYC document previews are presigned S3 URLs rendered in an iframe.
  `frame-src 'self' ${S3_ORIGIN}`,
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  "worker-src 'self' blob:",
  "upgrade-insecure-requests",
].filter(Boolean).join('; ');

const securityHeaders = [
  { key: 'Content-Security-Policy', value: contentSecurityPolicy },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
  // The admin dashboard was clickjackable — an attacker could frame it and trick a
  // signed-in admin into clicking through destructive actions.
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'geolocation=(), camera=(), microphone=(), payment=(), usb=(), interest-cohort=()',
  },
  // Admin pages show customer PII; keep them out of shared caches entirely.
  { key: 'Cache-Control', value: 'no-store, max-age=0' },
];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
  async rewrites() {
    if (process.env.NEXT_PUBLIC_ENABLE_PROXY !== 'true') {
      return [];
    }
    return [
      {
        // NEXT_PUBLIC_ADMIN_API_URL, not NEXT_PUBLIC_API_BASE_URL — the latter is
        // not set in this app, so enabling the proxy previously produced a
        // destination of literally "undefined/:path*". Uses the full value rather
        // than the origin, because the /admin path base is part of the route.
        source: '/api/proxy/:path*',
        destination: `${process.env.NEXT_PUBLIC_ADMIN_API_URL}/:path*`,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        // Property/profile photos uploaded to S3 (see S3FileStorageService.UploadFileAsync
        // for the exact URL shape: https://{bucket}.s3.{region}.amazonaws.com/{key}).
        protocol: 'https',
        hostname: 'housinghub-files-dev.s3.af-south-1.amazonaws.com',
      },
    ],
  },
};

/**
 * Sentry build-time wrapper — uploads source maps so stack traces name real files.
 * Needs SENTRY_AUTH_TOKEN / SENTRY_ORG / SENTRY_PROJECT at BUILD time (Vercel env
 * vars, not runtime). Absent locally, hence `silent`.
 */
export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,

  silent: !process.env.CI,
  widenClientFileUpload: true,
  hideSourceMaps: true,
  disableLogger: true,

  // Routes reports through our own origin so ad blockers, which block sentry.io
  // by default, do not silently drop them.
  tunnelRoute: '/monitoring',
});
