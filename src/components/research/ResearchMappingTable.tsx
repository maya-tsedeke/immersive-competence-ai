import type { ResearchMappingRow } from "@/lib/types";

export function ResearchMappingTable({ rows }: { rows: ResearchMappingRow[] }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-[var(--shadow)]">
      <div className="grid grid-cols-1 divide-y divide-slate-100 md:grid-cols-2 md:divide-y-0 md:divide-x">
        <div className="bg-slate-50/80 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
          Public dataset field
        </div>
        <div className="bg-slate-50/80 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
          Future ThingLink field
        </div>
      </div>
      <div className="divide-y divide-slate-100">
        {rows.map((row) => (
          <div
            key={`${row.publicDatasetField}-${row.futureThingLinkField}`}
            className="grid grid-cols-1 md:grid-cols-2"
          >
            <div className="px-4 py-4 text-sm font-medium text-slate-900">
              {row.publicDatasetField}
            </div>
            <div className="px-4 py-4 text-sm text-slate-700 md:border-l md:border-slate-100">
              <p className="font-semibold text-indigo-700">{row.futureThingLinkField}</p>
              {row.note ? <p className="mt-1 text-xs text-[var(--muted)]">{row.note}</p> : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
