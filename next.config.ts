import type { NextConfig } from "next";

function getSupabaseOrigin() {
  const value = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!value) return null;

  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.origin : null;
  } catch {
    return null;
  }
}

function getContentSecurityPolicy() {
  const isDevelopment = process.env.NODE_ENV === "development";
  const supabaseOrigin = getSupabaseOrigin();
  const connectSources = [
    "'self'",
    ...(supabaseOrigin ? [supabaseOrigin] : []),
    ...(isDevelopment ? ["ws:"] : []),
  ];

  return [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline'${isDevelopment ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' blob: data: https:",
    "font-src 'self' data:",
    `connect-src ${connectSources.join(" ")}`,
    "media-src 'self' blob: data: https:",
    "worker-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join("; ");
}

const nextConfig: NextConfig = {
  agentRules: false,
  poweredByHeader: false,
  async headers() {
    const securityHeaders = [
      {
        key: "Content-Security-Policy",
        value: getContentSecurityPolicy(),
      },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      {
        key: "Permissions-Policy",
        value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
      },
      ...(process.env.NODE_ENV === "production"
        ? [
            {
              key: "Strict-Transport-Security",
              value: "max-age=31536000",
            },
          ]
        : []),
    ];

    return [
      { source: "/:path*", headers: securityHeaders },
      {
        source: "/admin/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
        ],
      },
    ];
  },
};

export default nextConfig;
