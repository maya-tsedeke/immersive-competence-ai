import type { ReportSummary } from "@/lib/types";

export function ReportPreviewCard({ report }: { report: ReportSummary }) {
  return (
    <div className="space-y-5 rounded-2xl border border-[var(--border)] bg-white p-6 shadow-[var(--shadow)]">
      <header>
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
          {report.title}
        </p>
        <h2 className="mt-1 text-2xl font-semibold text-slate-900">{report.scenarioName}</h2>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Learners included: <span className="font-semibold text-slate-900">{report.learnerCount}</span>
        </p>
      </header>
      <section>
        <h3 className="text-sm font-semibold text-slate-900">Class-level summary</h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-700">{report.classSummary}</p>
      </section>
      <section>
        <h3 className="text-sm font-semibold text-slate-900">At-risk learners</h3>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
          {report.atRiskLearners.map((id) => (
            <li key={id}>{id}</li>
          ))}
        </ul>
      </section>
      <section>
        <h3 className="text-sm font-semibold text-slate-900">Common misconceptions</h3>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
          {report.misconceptions.map((m) => (
            <li key={m}>{m}</li>
          ))}
        </ul>
      </section>
      <section>
        <h3 className="text-sm font-semibold text-slate-900">Recommended teaching actions</h3>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
          {report.recommendedActions.map((a) => (
            <li key={a}>{a}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
