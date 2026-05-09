import type { LearnerStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

export function StatusBadge({ status }: { status: LearnerStatus }) {
  const styles: Record<LearnerStatus, string> = {
    Strong: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    "At risk": "bg-red-50 text-red-700 ring-red-100",
    "Needs feedback": "bg-orange-50 text-orange-800 ring-orange-100",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset",
        styles[status],
      )}
    >
      {status}
    </span>
  );
}
