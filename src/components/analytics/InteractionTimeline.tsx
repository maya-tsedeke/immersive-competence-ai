import type { TimelineEvent } from "@/lib/types";
import { cn } from "@/lib/utils";

export function InteractionTimeline({
  events,
  heading = "Interaction sequence",
  description = "Synthetic log for explainable analytics demonstration.",
}: {
  events: TimelineEvent[];
  heading?: string;
  description?: string;
}) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-[var(--shadow)]">
      <p className="text-sm font-semibold text-slate-900">{heading}</p>
      <p className="mt-1 text-xs text-[var(--muted)]">{description}</p>
      {events.length === 0 ? (
        <p className="mt-4 text-sm text-slate-600">No interaction events available for this learner.</p>
      ) : (
      <ol className="relative mt-5 space-y-4 pl-2">
        <span
          className="absolute left-[11px] top-1 bottom-1 w-px bg-slate-200"
          aria-hidden
        />
        {events.map((ev, idx) => (
          <li key={ev.id} className="relative flex gap-3 pl-8">
            <span
              className={cn(
                "absolute left-0 top-1.5 h-3 w-3 rounded-full ring-4 ring-white",
                ev.tone === "warning" && "bg-orange-500",
                ev.tone === "success" && "bg-emerald-500",
                (!ev.tone || ev.tone === "default") && "bg-indigo-500",
              )}
            />
            <div>
              <p className="text-sm font-medium text-slate-900">
                {idx + 1}. {ev.label}
              </p>
              {ev.at ? (
                <p className="text-xs text-[var(--muted)]">{ev.at}</p>
              ) : null}
            </div>
          </li>
        ))}
      </ol>
      )}
    </div>
  );
}
