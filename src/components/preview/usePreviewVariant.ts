"use client";

import { useEffect, useState } from "react";
import type { XRViewerVariant } from "@/components/xr/XRScenarioViewer";

/** Learner preview: mobile UI below 768px, ThingLink-style desktop layout at md+. */
export function usePreviewVariant(): XRViewerVariant {
  const [variant, setVariant] = useState<XRViewerVariant>(() =>
    typeof window !== "undefined" && window.matchMedia("(min-width: 768px)").matches ? "desktop" : "mobile",
  );

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const apply = () => setVariant(mq.matches ? "desktop" : "mobile");
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  return variant;
}
