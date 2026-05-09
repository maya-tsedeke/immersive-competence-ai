import type { FutureThingLinkField, ResearchPipelineStep } from "@/lib/types";

export function ResearchPipelineDiagram({ steps }: { steps: ResearchPipelineStep[] }) {
  return (
    <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-white to-indigo-50/60 p-5 shadow-[var(--shadow)]">
      <p className="text-sm font-semibold text-slate-900">Research analytics pipeline</p>
      <p className="mt-1 text-xs text-[var(--muted)]">
        How public traces inform mock telemetry and future immersive exports.
      </p>
      <div className="mt-5 flex flex-col gap-3">
        {steps.map((step, idx) => (
          <div key={step.id} className="flex gap-3 rounded-xl bg-white/90 p-3 ring-1 ring-slate-100 shadow-sm">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--accent-soft)] text-sm font-bold text-[var(--accent)]">
              {idx + 1}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-900">{step.title}</p>
              <p className="mt-1 text-xs leading-relaxed text-slate-600">{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function FutureThingLinkSection({ fields }: { fields: FutureThingLinkField[] }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-[var(--shadow)]">
      <p className="text-sm font-semibold text-slate-900">Future ThingLink integration</p>
      <p className="mt-1 text-xs text-[var(--muted)]">
        Expected export fields when real anonymised scenario telemetry replaces mock rows.
      </p>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
        {fields.map((field) => (
          <li
            key={field.id}
            className="rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-3 ring-1 ring-slate-100"
          >
            <p className="text-sm font-semibold text-slate-900">{field.label}</p>
            <p className="mt-1 text-xs leading-relaxed text-slate-600">{field.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
