"use client";

import dynamic from "next/dynamic";

export const ResearchDemoExportPanelLazy = dynamic(
  () =>
    import("@/components/research/ResearchDemoExportPanel").then((m) => ({
      default: m.ResearchDemoExportPanel,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 p-6 text-sm text-slate-600">
        Loading export / import tools…
      </div>
    ),
  },
);
