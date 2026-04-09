import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.salesforce.com https://*.salesforce-scrt.com https://*.trailblaze.my.site.com https://*.trailblaze.my.salesforce.com",
              "connect-src 'self' https://*.salesforce.com https://*.salesforce-scrt.com https://*.trailblaze.my.site.com https://*.trailblaze.my.salesforce.com wss://*.salesforce-scrt.com",
              "frame-src 'self' https://*.salesforce.com https://*.trailblaze.my.site.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://*.salesforce.com https://*.trailblaze.my.site.com",
              "font-src 'self' https://fonts.gstatic.com https://*.salesforce.com https://*.trailblaze.my.site.com",
              "img-src 'self' data: https://*.salesforce.com https://*.trailblaze.my.site.com",
              "worker-src 'self' blob:",
            ].join('; '),
          },
        ],
      },
    ]
  },
};

export default nextConfig;
