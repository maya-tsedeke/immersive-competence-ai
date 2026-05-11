"use client";

import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { XRScenarioViewer } from "@/components/xr/XRScenarioViewer";

/** Reads `?learner=` on the client so `/preview` can be statically exported. */
export function PreviewScenarioWithQuery() {
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
    <XRScenarioViewer variant="mobile" guidedPreview scenarioLearnerId={learnerId} scenarioModuleId={moduleId} />
  );
}
