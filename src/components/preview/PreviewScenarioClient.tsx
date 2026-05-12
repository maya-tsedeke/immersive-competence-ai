"use client";

import dynamic from "next/dynamic";

const PreviewScenarioWithQuery = dynamic(
  () =>
    import("@/components/preview/PreviewScenarioWithQuery").then((m) => ({
      default: m.PreviewScenarioWithQuery,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="mt-4 flex min-h-[240px] items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-sm text-slate-400">
        Loading scenario…
      </div>
    ),
  },
);

export function PreviewScenarioClient() {
  return <PreviewScenarioWithQuery />;
}
