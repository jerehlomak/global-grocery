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
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.salesforce.com https://*.salesforce-scrt.com https://*.trailblaze.my.site.com https://*.trailblaze.my.salesforce.com https://*.salesforce-sites.com https://*.salesforceliveagent.com https://service.force.com",
              "connect-src 'self' https://*.salesforce.com https://*.salesforce-scrt.com https://*.trailblaze.my.site.com https://*.trailblaze.my.salesforce.com wss://*.salesforce-scrt.com https://*.salesforce-sites.com https://*.salesforceliveagent.com",
              "frame-src 'self' https://*.salesforce.com https://*.trailblaze.my.site.com https://*.salesforce-sites.com https://*.salesforceliveagent.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://*.salesforce.com https://*.trailblaze.my.site.com https://*.salesforce-sites.com",
              "font-src 'self' https://fonts.gstatic.com https://*.salesforce.com https://*.trailblaze.my.site.com https://*.salesforce-sites.com",
              "img-src 'self' data: https: http: blob:",
              "worker-src 'self' blob:",
            ].join('; '),
          },
        ],
      },
    ]
  },
};

export default nextConfig;
