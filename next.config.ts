import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

// The admin talks to the CMS API on another origin and previews media and
// embeds from any https host, so those directives allow https: broadly.
const csp = [
  "default-src 'self'",
  // Next and the theme bootstrap use inline scripts; dev tooling needs eval.
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: https:${isDev ? " http://localhost:*" : ""}`,
  `media-src 'self' blob: https:${isDev ? " http://localhost:*" : ""}`,
  "font-src 'self' data:",
  `connect-src 'self' https:${isDev ? " ws: wss: http://localhost:*" : ""}`,
  `frame-src 'self' https:${isDev ? " http://localhost:*" : ""}`,
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  // The admin must never appear in search results.
  { key: "X-Robots-Tag", value: "noindex, nofollow" },
  // Browsers ignore HSTS over plain http, so it is only sent in production.
  ...(isDev ? [] : [{ key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" }]),
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  images: {
    qualities: [75, 90],
  },
};

export default nextConfig;
