import type { NextConfig } from "next";

const apiBaseUrl = process.env.API_BASE_URL?.replace(/\/+$/, '') || '';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
      },
    ],
  },
  async rewrites() {
    if (!apiBaseUrl) {
      console.warn('API_BASE_URL is not set');
      return [];
    }

    return [
      {
        source: '/assessment/:path*',
        destination: `${apiBaseUrl}/assessment/:path*`,
      },
      {
        source: '/api/admin/rbac/:path*',
        destination: `${apiBaseUrl}/admin/rbac/:path*`,
      },
      {
        source: '/api/admin/users/:path*',
        destination: `${apiBaseUrl}/admin/users/:path*`,
      },
      {
        source: '/schedule-appointment/:path*',
        destination: `${apiBaseUrl}/schedule-appointment/:path*`,
      },
    ];
  },
};

export default nextConfig;
