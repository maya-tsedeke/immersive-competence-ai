"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Brain, ClipboardCheck, FileSearch, Layers, Loader2, Send, UserRound } from "lucide-react";
import type { LearnerStatus } from "@/lib/types";
import {
  DEMO_LEARNERS_CHANGE_EVENT,
  listDemoLearnerRecords,
} from "@/lib/learnerDemo/demoLearnersStore";
import { WORKFLOW_CHANGE_EVENT, getLearnerWorkflowState } from "@/lib/workflow/teacherWorkflowStorage";
import { cn } from "@/lib/utils";

export type TeacherQueueLearner = { id: string; displayStatus?: LearnerStatus };

function summarizeAllDemos() {
  const records = listDemoLearnerRecords();
  let submittedCount = 0;
  let aiPending = 0;
  let reviewPending = 0;
  let teacherClosed = 0;
  const lanes: Array<{ id: string; label: string }> = [];

  for (const r of records) {
    const last = r.attempts.length ? r.attempts[r.attempts.length - 1] : null;
    const submitted = Boolean(last?.submittedAt);
    if (submitted) submittedCount++;
    const wf = getLearnerWorkflowState(r.id);
    if (submitted && !wf.aiAnalysisComplete) aiPending++;
    if (submitted && wf.aiAnalysisComplete && !wf.teacherDecision) reviewPending++;
    if (submitted && wf.teacherDecision) teacherClosed++;

    let lane = "idle";
    if (!submitted) lane = "no submission";
    else if (!wf.aiAnalysisComplete) lane = "ai pending";
    else if (!wf.teacherDecision) lane = "review pending";
    else lane = "teacher decided";
    lanes.push({ id: r.id, label: lane });
  }

  return { records, submittedCount, aiPending, reviewPending, teacherClosed, lanes };
}

export function TeacherActionQueue({ cohort }: { cohort: TeacherQueueLearner[] }) {
  const [, bump] = useState(0);
  const refresh = useCallback(() => bump((n) => n + 1), []);

  useEffect(() => {
    const t = window.setInterval(refresh, 1500);
    const h = () => refresh();
    window.addEventListener(WORKFLOW_CHANGE_EVENT, h);
    window.addEventListener(DEMO_LEARNERS_CHANGE_EVENT, h);
    window.addEventListener("storage", h);
    return () => {
      window.clearInterval(t);
      window.removeEventListener(WORKFLOW_CHANGE_EVENT, h);
      window.removeEventListener(DEMO_LEARNERS_CHANGE_EVENT, h);
      window.removeEventListener("storage", h);
    };
  }, [refresh]);

  const demo = summarizeAllDemos();

  const cards = [
    {
      title: "Submitted learner activity",
      value: demo.submittedCount,
      detail: "Demo learners with at least one submitted attempt (this browser)",
      icon: FileSearch,
      tone: "border-sky-200 bg-sky-50/80",
    },
    {
      title: "AI analysis pending",
      value: demo.aiPending,
      detail: "Submitted — run AI analysis on learner detail or workflow",
      icon: Loader2,
      tone: "border-amber-200 bg-amber-50/80",
    },
    {
      title: "Teacher review pending",
      value: demo.reviewPending,
      detail: "AI complete — teacher decision needed",
      icon: ClipboardCheck,
      tone: "border-violet-200 bg-violet-50/80",
    },
    {
      title: "Teacher actions saved",
      value: demo.teacherClosed,
      detail: "Decisions recorded locally for submitted learners",
      icon: Send,
      tone: "border-emerald-200 bg-emerald-50/80",
    },
  ] as const;

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-[var(--shadow)]">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-900">Teacher action queue</p>
          <p className="text-xs text-[var(--muted)]">
            Learner activity → AI detection → teacher decision. Tracks all <strong>browser demo learners</strong> in
            this session.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/modules"
            className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-indigo-700 underline"
          >
            <Layers className="h-3.5 w-3.5" aria-hidden />
            Learning modules
          </Link>
          <Link
            href="/ai-workflow"
            className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-indigo-700 underline"
          >
            <Brain className="h-3.5 w-3.5" aria-hidden />
            AI workflow
          </Link>
        </div>
      </div>

      <div className="mt-4 grid min-w-0 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((c) => (
          <div key={c.title} className={cn("min-w-0 rounded-xl border p-4 shadow-sm", c.tone)}>
            <div className="flex items-center gap-2">
              <c.icon className="h-4 w-4 shrink-0 text-slate-700" aria-hidden />
              <p className="min-w-0 text-[11px] font-bold uppercase tracking-wide text-slate-800">{c.title}</p>
            </div>
            <p className="mt-2 text-2xl font-semibold tabular-nums text-slate-900">{c.value}</p>
            <p className="mt-1 break-words text-xs leading-snug text-slate-700">{c.detail}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 min-w-0 rounded-xl border border-slate-100 bg-slate-50/80 p-4">
        <p className="text-xs font-bold uppercase tracking-wide text-[var(--muted)]">Demo learner rows</p>
        <div className="mt-3 space-y-2">
          {demo.records.length ? (
            demo.records.map((r) => {
              const wf = getLearnerWorkflowState(r.id);
              const last = r.attempts.length ? r.attempts[r.attempts.length - 1] : null;
              const submitted = Boolean(last?.submittedAt);
              return (
                <div
                  key={r.id}
                  className="flex flex-col gap-3 rounded-xl border border-slate-100 bg-white p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex min-w-0 items-start gap-2">
                    <UserRound className="mt-0.5 h-4 w-4 shrink-0 text-slate-600" aria-hidden />
                    <div className="min-w-0">
                      <p className="font-mono text-sm font-semibold text-slate-900">{r.id}</p>
                      <p className="text-xs text-slate-600">
                        {!submitted
                          ? "No submission yet — open preview and start scenario."
                          : `AI: ${wf.aiAnalysisComplete ? "complete" : "pending"} · Teacher: ${wf.teacherDecision ? "saved" : "pending"}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={`/preview?${new URLSearchParams({ learner: r.id, ...(r.moduleId ? { module: r.moduleId } : {}) }).toString()}`}
                      className="inline-flex min-h-[40px] items-center justify-center rounded-lg bg-white px-3 text-xs font-semibold text-slate-800 ring-1 ring-slate-200 hover:bg-slate-50"
                    >
                      Scenario
                    </Link>
                    <Link
                      href={`/learners/${r.id}`}
                      className="inline-flex min-h-[40px] items-center justify-center rounded-lg bg-indigo-600 px-3 text-xs font-semibold text-white hover:bg-indigo-700"
                    >
                      Review / AI
                    </Link>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-sm text-slate-600">No demo learners yet — use &quot;Add New Learner Activity&quot;.</p>
          )}
        </div>
        <p className="mt-3 text-[11px] leading-relaxed text-slate-500">
          Cohort analytics list has <strong>{cohort.length}</strong> generated learner rows. Demo learners above are
          merged first on the Learners page.
        </p>
      </div>
    </div>
  );
}
