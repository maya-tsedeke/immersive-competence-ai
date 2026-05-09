import type { Learner } from "@/lib/types";
import { StatusBadge } from "@/components/learners/StatusBadge";

export function LearnerDetailHeader({ learner }: { learner: Learner }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-[var(--shadow)]">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Learner profile</p>
          <h1 className="mt-1 text-2xl font-semibold text-slate-900">
            {learner.id} <span className="text-base font-normal text-[var(--muted)]">pseudonymous</span>
          </h1>
          <div className="mt-3 flex flex-wrap gap-2">
            <StatusBadge status={learner.displayStatus ?? learner.status} />
            {learner.completedAt ? (
              <span className="rounded-full bg-slate-50 px-2.5 py-0.5 text-xs font-medium text-slate-700 ring-1 ring-slate-100">
                Completed {learner.completedAt}
              </span>
            ) : null}
            {typeof learner.riskScore === "number" ? (
              <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-900 ring-1 ring-amber-100">
                Risk score (prototype) {learner.riskScore.toFixed(2)}
              </span>
            ) : null}
          </div>
        </div>
        <div className="grid w-full max-w-lg grid-cols-2 gap-3 text-sm md:text-right">
          <div className="rounded-xl bg-slate-50 p-3 ring-1 ring-slate-100">
            <p className="text-[var(--muted)]">Competence score</p>
            <p className="text-xl font-semibold text-slate-900">{learner.score}%</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-3 ring-1 ring-slate-100">
            <p className="text-[var(--muted)]">Time spent</p>
            <p className="text-xl font-semibold text-slate-900">
              {learner.timeSpentMin ? `${learner.timeSpentMin} min` : "—"}
            </p>
          </div>
          <div className="col-span-2 rounded-xl bg-slate-50 p-3 ring-1 ring-slate-100 md:col-span-2">
            <p className="text-[var(--muted)]">Engagement · Reflection</p>
            <p className="text-lg font-semibold text-slate-900">
              {learner.engagement} · {learner.reflection}
            </p>
          </div>
        </div>
      </div>
      <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-400"
          style={{ width: `${learner.score}%` }}
        />
      </div>
    </div>
  );
}
