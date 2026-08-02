import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
