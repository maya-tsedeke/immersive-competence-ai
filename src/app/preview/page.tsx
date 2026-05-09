import { Suspense } from "react";
import { PreviewLearnerShell } from "@/components/preview/PreviewLearnerShell";
import { PreviewScenarioWithQuery } from "@/components/preview/PreviewScenarioWithQuery";

export default function PreviewPage() {
  return (
    <PreviewLearnerShell>
      <Suspense
        fallback={
          <div className="mt-4 flex min-h-[240px] items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-sm text-slate-400">
            Loading scenario…
          </div>
        }
      >
        <PreviewScenarioWithQuery />
      </Suspense>
    </PreviewLearnerShell>
  );
}
