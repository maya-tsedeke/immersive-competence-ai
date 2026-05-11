"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { getModule, MODULES_CHANGE_EVENT, profileLabel, scenarioLabel } from "@/lib/modules/moduleStore";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function ModuleViewInner() {
  const sp = useSearchParams();
  const mid = sp.get("mid") ?? "";
  const [mod, setMod] = useState<ReturnType<typeof getModule>>();
  useEffect(() => {
    setMod(mid ? getModule(mid) : undefined);
  }, [mid]);
  useEffect(() => {
    const refresh = () => setMod(mid ? getModule(mid) : undefined);
    window.addEventListener(MODULES_CHANGE_EVENT, refresh);
    return () => window.removeEventListener(MODULES_CHANGE_EVENT, refresh);
  }, [mid]);

  if (!mid || !mod) {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-950">
        <p className="font-semibold">Module not found</p>
        <p className="mt-2">
          Open a module from the{" "}
          <Link href="/modules" className="font-semibold text-indigo-700 underline">
            Learning Modules
          </Link>{" "}
          list.
        </p>
      </div>
    );
  }

  const hist = mod.learningAnalyticsPreview.slice(0, 40).map((r) => ({
    id: r.learnerId.slice(-6),
    score: r.averageAssessmentScore,
    interactions: r.totalLearningInteractions,
  }));

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Link href="/modules" className="text-sm font-semibold text-indigo-600 hover:underline">
        ← All modules
      </Link>
      <header className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-[var(--shadow)]">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Module</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">{mod.title}</h1>
        <p className="mt-2 text-sm text-slate-600">
          {scenarioLabel(mod.scenarioType)} · {profileLabel(mod.datasetProfile)}
        </p>
        <p className="mt-3 text-sm leading-relaxed text-slate-700">{mod.learningObjective}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href={`/preview?learner=${encodeURIComponent("demo-mobile-learner")}`}
            className="inline-flex min-h-[44px] items-center rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white"
          >
            Open mobile learner demo
          </Link>
          <Link
            href="/learners"
            className="inline-flex min-h-[44px] items-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800"
          >
            Learners table
          </Link>
        </div>
      </header>

      <section className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-[var(--shadow)]">
        <h2 className="text-sm font-semibold text-slate-900">Synthetic cohort preview</h2>
        <p className="mt-1 text-xs text-slate-600">
          OULAD-inspired analytics + dialogue-inspired rows (research prototype — not live telemetry).
        </p>
        <div className="mt-4 h-72 w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={hist} margin={{ top: 8, right: 8, left: 0, bottom: 32 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="id" tick={{ fontSize: 10 }} interval={4} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="score" name="Avg assessment (synth)" fill="#6366f1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}

export default function ModuleViewPage() {
  return (
    <Suspense
      fallback={<div className="p-6 text-sm text-slate-500">Loading module…</div>}
    >
      <ModuleViewInner />
    </Suspense>
  );
}
