import type { NextConfig } from "next";

const API_ORIGIN =
  process.env.NEXT_PUBLIC_ADMIN_API_URL ??
  'https://3tgjb2crdf.execute-api.af-south-1.amazonaws.com';

const S3_ORIGIN = 'https://housinghub-files-dev.s3.af-south-1.amazonaws.com';

/**
 * Content Security Policy for the admin dashboard.
 *
 * Tighter than the consumer app: no Google Sign-In (admin auth is OTP-only) and no
 * third-party embeds. The one iframe is DocumentPreviewModal, which renders a
 * presigned S3 URL for KYC documents — hence S3 in frame-src.
 *
 * Report-Only first. Watch the console for violations, then rename the header to
 * `Content-Security-Policy` to enforce.
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
  `connect-src 'self' ${API_ORIGIN}`,
  // KYC document previews are presigned S3 URLs rendered in an iframe.
  `frame-src 'self' ${S3_ORIGIN}`,
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  "upgrade-insecure-requests",
].filter(Boolean).join('; ');

const securityHeaders = [
  { key: 'Content-Security-Policy-Report-Only', value: contentSecurityPolicy },
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
        source: '/api/proxy/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_BASE_URL}/:path*`,
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

export default nextConfig;
