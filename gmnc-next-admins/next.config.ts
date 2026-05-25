import type { NextConfig } from "next";

const apiBaseUrl = process.env.API_BASE_URL?.replace(/\/+$/, '') || '';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
      },
      {
        protocol: 'https',
        hostname: 'api.getmyneurocare.org',
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
        source: '/resource/:path*',
        destination: `${apiBaseUrl}/resource/:path*`,
      },
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
      {
        source: '/api/settings/:path*',
        destination: `${apiBaseUrl}/settings/:path*`,
      },
      {
        source: '/api/telehealth/:path*',
        destination: `${apiBaseUrl}/telehealth/:path*`,
      },
      {
        source: '/api/appointment/:path*',
        destination: `${apiBaseUrl}/schedule-appointment/:path*`,
      },
       {
        source: '/api/assessment/:path*',
        destination: `${apiBaseUrl}/assessment/:path*`,
      },
      {
        source: '/notification/:path*',
        destination: `${apiBaseUrl}/notification/:path*`,
      },
    ];
  },
};

export default nextConfig;
