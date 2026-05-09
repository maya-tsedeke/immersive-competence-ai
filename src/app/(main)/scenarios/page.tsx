import Link from "next/link";
import { ArrowRight, BarChart3, Smartphone } from "lucide-react";
import { scenarios } from "@/lib/data/scenarios";

export default function ScenariosPage() {
  const scenario = scenarios[0];
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Scenarios</p>
        <h1 className="mt-1 text-3xl font-semibold text-slate-900">Immersive scenarios</h1>
        <p className="mt-2 text-sm text-slate-600">
          Manage scenario context for analytics. This prototype ships one exemplar experience.
        </p>
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-[var(--shadow)]">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">Active</p>
            <h2 className="mt-1 text-2xl font-semibold text-slate-900">{scenario.title}</h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
              {scenario.description}
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Link
              href="/analytics"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
            >
              Scenario analytics
              <BarChart3 className="h-4 w-4" />
            </Link>
            <Link
              href="/preview"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm transition hover:border-slate-300"
            >
              Learner preview
              <Smartphone className="h-4 w-4" />
            </Link>
          </div>
        </div>
        <div className="mt-6 rounded-xl bg-slate-50 p-4 text-sm text-slate-700 ring-1 ring-slate-100">
          <p className="font-semibold text-slate-900">Why this matters</p>
          <p className="mt-2 leading-relaxed">
            This scenario anchors all dashboard KPIs, AI summaries, and learner traces. Future versions
            can swap in exported ThingLink graphs without changing the analytics UX.
          </p>
          <Link
            href="/research"
            className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:underline"
          >
            View research mapping
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
