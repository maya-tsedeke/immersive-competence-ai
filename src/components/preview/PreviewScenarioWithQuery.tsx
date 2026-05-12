"use client";

import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { XRScenarioViewer } from "@/components/xr/XRScenarioViewer";
import { usePreviewVariant } from "@/components/preview/usePreviewVariant";

/** Reads `?learner=` on the client so `/preview` can be statically exported. */
export function PreviewScenarioWithQuery() {
  const variant = usePreviewVariant();
  const searchParams = useSearchParams();
  const learnerId = useMemo(() => {
    const raw = searchParams.get("learner");
    const t = raw?.trim();
    return t || undefined;
  }, [searchParams]);
  const moduleId = useMemo(() => {
    const raw = searchParams.get("module");
    const t = raw?.trim();
    return t || undefined;
  }, [searchParams]);

  return (
    <XRScenarioViewer variant={variant} guidedPreview scenarioLearnerId={learnerId} scenarioModuleId={moduleId} />
  );
}
