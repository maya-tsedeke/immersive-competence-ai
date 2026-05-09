import type { MetadataRoute } from "next";

export const dynamic = "force-static";

function asset(path: string): string {
  const raw = process.env.NEXT_PUBLIC_BASE_PATH?.trim() || "";
  const base = raw.replace(/\/+$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  return base ? `${base}${p}` : p;
}

export default function manifest(): MetadataRoute.Manifest {
  const raw = process.env.NEXT_PUBLIC_BASE_PATH?.trim() || "";
  const base = raw.replace(/\/+$/, "");
  const startUrl = base ? `${base}/` : "/";
  const scope = startUrl;

  return {
    name: "Immersive Competence AI",
    short_name: "ICA Research",
    description:
      "UEF + ThingLink-style research prototype for AI-assisted competence analytics in immersive learning.",
    start_url: startUrl,
    scope,
    display: "standalone",
    background_color: "#f4f6fb",
    theme_color: "#6366f1",
    orientation: "portrait-primary",
    icons: [
      {
        src: asset("/icons/icon-192.svg"),
        sizes: "192x192",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: asset("/icons/icon-512.svg"),
        sizes: "512x512",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: asset("/icons/icon-maskable.svg"),
        sizes: "512x512",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
