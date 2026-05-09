import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

/**
 * Static export (GitHub Pages): set NEXT_STATIC_EXPORT=1 at build time.
 * Project site: https://USERNAME.github.io/REPOSITORY_NAME/
 * Set NEXT_PUBLIC_BASE_PATH=/REPOSITORY_NAME (leading slash, no trailing slash).
 */
function normalizeBasePath(raw: string | undefined): string {
  if (raw == null || !String(raw).trim()) return "";
  const s = String(raw).trim();
  const withLead = s.startsWith("/") ? s : `/${s}`;
  return withLead.replace(/\/+$/, "");
}

const isStaticExport =
  process.env.NEXT_STATIC_EXPORT === "1" || process.env.NEXT_STATIC_EXPORT === "true";

const basePath = normalizeBasePath(process.env.NEXT_PUBLIC_BASE_PATH);
const assetPrefix = basePath ? `${basePath}/` : undefined;

const withPWA = withPWAInit({
  dest: "public",
  // `output: "export"` + PWA service worker is fragile; disable PWA for static export builds.
  disable: process.env.NODE_ENV === "development" || isStaticExport,
  register: true,
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
  ...(isStaticExport
    ? {
        output: "export" as const,
        trailingSlash: true,
      }
    : {}),
  ...(basePath ? { basePath } : {}),
  ...(assetPrefix ? { assetPrefix } : {}),
  images: {
    unoptimized: isStaticExport,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
  },
};

export default withPWA(nextConfig);
