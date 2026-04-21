import type { NextConfig } from "next";

// Content-Security-Policy directives for MamaTrack
const ContentSecurityPolicy = [
  // Default: restrict to self
  "default-src 'self'",
  // Scripts: self only, no eval allowed. unsafe-inline needed for Next.js inline scripts
  "script-src 'self' 'unsafe-inline'",
  // Styles: unsafe-inline required for Framer Motion and next-themes
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  // Images: self, data URIs, Supabase storage, blob for PWA icons
  "img-src 'self' data: blob: https://*.supabase.co https://*.supabase.in",
  // Fonts: self and Google Fonts CDN
  "font-src 'self' https://fonts.gstatic.com",
  // API connections: self and Supabase
  "connect-src 'self' https://*.supabase.co https://*.supabase.in wss://*.supabase.co",
  // Workers: self (service worker)
  "worker-src 'self'",
  // Manifest for PWA
  "manifest-src 'self'",
  // Disallow embedding in frames
  "frame-ancestors 'none'",
  // Form submissions to self only
  "form-action 'self'",
  // Base URI restriction
  "base-uri 'self'",
].join("; ");

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
      {
        protocol: "https",
        hostname: "*.supabase.in",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/service-worker.js",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, must-revalidate, no-cache",
          },
          {
            key: "CDN-Cache-Control",
            value: "no-store",
          },
          {
            key: "Vercel-CDN-Cache-Control",
            value: "no-store",
          },
        ],
      },
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: ContentSecurityPolicy,
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
