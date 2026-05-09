import type { RubricRow } from "@/lib/types";
import { cn } from "@/lib/utils";

const ratingStyle: Record<RubricRow["rating"], string> = {
  Good: "bg-emerald-50 text-emerald-800 ring-emerald-100",
  Developing: "bg-amber-50 text-amber-900 ring-amber-100",
  "Needs support": "bg-red-50 text-red-800 ring-red-100",
};

export function RubricCard({ rows }: { rows: RubricRow[] }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-[var(--shadow)]">
      <p className="text-sm font-semibold text-slate-900">Competence rubric</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {rows.map((row) => (
          <div
            key={row.criterion}
            className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-3"
          >
            <span className="text-sm font-medium text-slate-800">{row.criterion}</span>
            <span
              className={cn(
                "rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset",
                ratingStyle[row.rating],
              )}
            >
              {row.rating}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
