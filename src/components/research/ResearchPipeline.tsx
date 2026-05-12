import type { FutureThingLinkField, LearningEnvironmentModelTarget, ResearchPipelineStep } from "@/lib/types";

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

export function DemoScriptPanel({
  steps,
}: {
  steps: Array<{ title: string; body: string }>;
}) {
  return (
    <section className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-[var(--shadow)]">
      <p className="text-sm font-semibold text-slate-900">Real demo script</p>
      <p className="mt-1 text-xs text-[var(--muted)]">
        One coherent path through learner activity, AI analysis, teacher review, and research explanation.
      </p>
      <ol className="mt-4 grid gap-3 md:grid-cols-2">
        {steps.map((step, index) => (
          <li key={step.title} className="rounded-xl border border-slate-100 bg-slate-50 p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-indigo-700">Step {index + 1}</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">{step.title}</p>
            <p className="mt-2 text-xs leading-relaxed text-slate-600">{step.body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function ModelTargetsSection({ targets }: { targets: LearningEnvironmentModelTarget[] }) {
  return (
    <section className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-[var(--shadow)]">
      <p className="text-sm font-semibold text-slate-900">Model improvement targets</p>
      <p className="mt-1 text-xs text-[var(--muted)]">
        The next model phase moves from simple risk language to learning-environment support signals.
      </p>
      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {targets.map((target) => (
          <div key={target.id} className="rounded-xl border border-slate-100 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-900">{target.label}</p>
            <p className="mt-1 text-xs leading-relaxed text-slate-600">{target.description}</p>
            <p className="mt-3 text-[10px] font-bold uppercase tracking-wide text-slate-500">Evidence inputs</p>
            <p className="mt-1 text-xs leading-relaxed text-slate-600">{target.evidenceInputs.join(", ")}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function PilotSchemaSection({ rows }: { rows: string[][] }) {
  return (
    <section className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-5 shadow-[var(--shadow)]">
      <p className="text-sm font-semibold text-slate-900">ThingLink-style pilot data schema</p>
      <p className="mt-1 text-xs text-[var(--muted)]">
        Anonymised event fields for future validation; no live ThingLink API is assumed.
      </p>
      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full divide-y divide-indigo-100 text-left text-xs">
          <thead>
            <tr className="text-slate-500">
              <th className="px-3 py-2 font-semibold">Field</th>
              <th className="px-3 py-2 font-semibold">Status</th>
              <th className="px-3 py-2 font-semibold">Purpose</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-indigo-100 bg-white/70">
            {rows.map(([field, status, purpose]) => (
              <tr key={field}>
                <td className="px-3 py-2 font-mono font-semibold text-indigo-800">{field}</td>
                <td className="px-3 py-2 text-slate-700">{status}</td>
                <td className="px-3 py-2 leading-relaxed text-slate-600">{purpose}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function ScientificWorkPackageSection({
  questions,
  checklist,
}: {
  questions: string[];
  checklist: string[];
}) {
  return (
    <section className="grid gap-4 lg:grid-cols-2">
      <div className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-[var(--shadow)]">
        <p className="text-sm font-semibold text-slate-900">Scientific work package</p>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-slate-700">
          {questions.map((q) => (
            <li key={q}>{q}</li>
          ))}
        </ul>
      </div>
      <div className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-[var(--shadow)]">
        <p className="text-sm font-semibold text-slate-900">Evaluation requirements</p>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-slate-700">
          {checklist.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function ScientificAlignmentSection({
  sources,
}: {
  sources: Array<{ title: string; body: string; href: string }>;
}) {
  return (
    <section className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-[var(--shadow)]">
      <p className="text-sm font-semibold text-slate-900">Scientific and ThingLink alignment</p>
      <p className="mt-1 text-xs text-[var(--muted)]">
        Source-backed framing for UEF + ThingLink learning-environment presentations.
      </p>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {sources.map((source) => (
          <a
            key={source.href}
            href={source.href}
            target="_blank"
            rel="noreferrer"
            className="rounded-xl border border-slate-100 bg-slate-50 p-4 transition hover:bg-white"
          >
            <p className="text-sm font-semibold text-indigo-800">{source.title}</p>
            <p className="mt-1 text-xs leading-relaxed text-slate-600">{source.body}</p>
          </a>
        ))}
      </div>
    </section>
  );
}
