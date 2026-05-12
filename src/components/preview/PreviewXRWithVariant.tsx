"use client";

import { XRScenarioViewer } from "@/components/xr/XRScenarioViewer";
import { usePreviewVariant } from "@/components/preview/usePreviewVariant";

export function PreviewXRWithVariant() {
  const variant = usePreviewVariant();
  return <XRScenarioViewer variant={variant} guidedPreview />;
}
