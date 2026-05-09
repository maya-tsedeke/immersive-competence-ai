"use client";

import type { DataProvenanceKind } from "@/lib/types";
import { provenanceLabel } from "@/lib/ai/provenance";
import { cn } from "@/lib/utils";

const styles: Record<DataProvenanceKind, string> = {
  ml_pipeline: "bg-emerald-50 text-emerald-900 ring-emerald-200",
  mock_fallback: "bg-slate-100 text-slate-700 ring-slate-200",
  learner_demo: "bg-sky-50 text-sky-900 ring-sky-200",
  heuristic_label: "bg-amber-50 text-amber-900 ring-amber-200",
  teacher_reviewed: "bg-violet-50 text-violet-900 ring-violet-200",
};

export function ProvenanceBadge({
  kind,
  className,
  compact,
}: {
  kind: DataProvenanceKind;
  className?: string;
  compact?: boolean;
}) {
  return (
    <span
      title={provenanceLabel(kind)}
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ring-1",
        styles[kind],
        compact && "px-1.5 py-0",
        className,
      )}
    >
      {provenanceLabel(kind)}
    </span>
  );
}
