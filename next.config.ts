import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // Apply restrictive security headers to all routes except payment and auth-related ones
        source: "/((?!api/payment|api/subscription|api/checkout-sessions|api/auth).*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://checkout.stripe.com https://www.mercadopago.com https://secure.mlstatic.com https://www.google.com https://www.gstatic.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https: http:",
              "media-src 'self' blob:",
              "connect-src 'self' https://api.stripe.com https://api.mercadopago.com https://www.google-analytics.com https://firestore.googleapis.com https://firebase.googleapis.com wss:",
              "frame-src 'self' https://js.stripe.com https://checkout.stripe.com https://www.mercadopago.com https://www.google.com",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self' https://checkout.stripe.com https://www.mercadopago.com",
              "frame-ancestors 'self'",
              "upgrade-insecure-requests"
            ].join("; ")
          },
        ],
      },
      {
        // Less restrictive headers for payment APIs to allow redirects and external integrations
        source: "/api/payment/:path*",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
      {
        // Less restrictive headers for subscription APIs
        source: "/api/subscription/:path*",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
      {
        // Less restrictive headers for checkout sessions
        source: "/api/checkout-sessions/:path*",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
      {
        // Permissive headers for auth APIs to allow authentication flows
        source: "/api/auth/:path*",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline'",
              "font-src 'self'",
              "img-src 'self' data: blob:",
              "media-src 'self' blob:",
              "connect-src 'self' https://firestore.googleapis.com https://firebase.googleapis.com",
              "frame-src 'self'",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'self'"
            ].join("; ")
          },
        ],
      },
    ];
  },
};

export default nextConfig;