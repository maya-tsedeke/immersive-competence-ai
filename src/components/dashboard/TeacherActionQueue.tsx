"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Brain, ClipboardCheck, FileSearch, Loader2, Send, UserRound } from "lucide-react";
import type { LearnerStatus } from "@/lib/types";
import { DEMO_MOBILE_LEARNER_ID } from "@/lib/learnerDemo/constants";
import { readLearnerDemoState } from "@/lib/learnerDemo/storage";
import { WORKFLOW_CHANGE_EVENT, getLearnerWorkflowState } from "@/lib/workflow/teacherWorkflowStorage";
import { cn } from "@/lib/utils";

export type TeacherQueueLearner = { id: string; displayStatus?: LearnerStatus };

function summarizeDemo() {
  const d = readLearnerDemoState();
  const submitted = Boolean(d?.submittedAt);
  const wf = getLearnerWorkflowState(DEMO_MOBILE_LEARNER_ID);
  const aiDone = wf.aiAnalysisComplete;
  const teacherDone = Boolean(wf.teacherDecision);
  let lane: "submitted" | "ai_pending" | "review_pending" | "feedback_sent" | "idle" = "idle";
  if (!submitted) lane = "idle";
  else if (!aiDone) lane = "ai_pending";
  else if (!teacherDone) lane = "review_pending";
  else lane = "feedback_sent";
  return { submitted, aiDone, teacherDone, lane, wf };
}

export function TeacherActionQueue({ cohort }: { cohort: TeacherQueueLearner[] }) {
  const [, bump] = useState(0);
  const refresh = useCallback(() => bump((n) => n + 1), []);

  useEffect(() => {
    const t = window.setInterval(refresh, 1500);
    const h = () => refresh();
    window.addEventListener(WORKFLOW_CHANGE_EVENT, h);
    window.addEventListener("storage", h);
    return () => {
      window.clearInterval(t);
      window.removeEventListener(WORKFLOW_CHANGE_EVENT, h);
      window.removeEventListener("storage", h);
    };
  }, [refresh]);

  const demo = summarizeDemo();

  const submittedCount = demo.submitted ? 1 : 0;
  const aiPending = demo.submitted && !demo.aiDone ? 1 : 0;
  const reviewPending = demo.submitted && demo.aiDone && !demo.teacherDone ? 1 : 0;
  const feedbackSent = demo.teacherDone ? 1 : 0;

  const cards = [
    {
      title: "Submitted learner activity",
      value: submittedCount,
      detail: "Evidence saved from mobile scenario (this browser)",
      icon: FileSearch,
      tone: "border-sky-200 bg-sky-50/80",
    },
    {
      title: "AI analysis pending",
      value: aiPending,
      detail: "Run AI analysis on learner detail or workflow",
      icon: Loader2,
      tone: "border-amber-200 bg-amber-50/80",
    },
    {
      title: "Teacher review pending",
      value: reviewPending,
      detail: "AI result ready — teacher decision needed",
      icon: ClipboardCheck,
      tone: "border-violet-200 bg-violet-50/80",
    },
    {
      title: "Feedback sent",
      value: feedbackSent,
      detail: "Teacher decision saved locally",
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
            Learner activity → AI detection → teacher decision → action. This panel tracks the{" "}
            <strong>mobile scenario learner</strong> stored in your browser.
          </p>
        </div>
        <Link
          href="/ai-workflow"
          className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-indigo-700 underline"
        >
          <Brain className="h-3.5 w-3.5" aria-hidden />
          AI workflow
        </Link>
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
        <p className="text-xs font-bold uppercase tracking-wide text-[var(--muted)]">Demo learner row</p>
        <div className="mt-3 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-start gap-2">
            <UserRound className="mt-0.5 h-4 w-4 shrink-0 text-slate-600" aria-hidden />
            <div className="min-w-0">
              <p className="font-mono text-sm font-semibold text-slate-900">{DEMO_MOBILE_LEARNER_ID}</p>
              <p className="text-xs text-slate-600">
                {demo.lane === "idle"
                  ? "No submission in this browser yet — complete the mobile scenario first."
                  : `Lane: ${demo.lane.replace(/_/g, " ")} · AI: ${demo.aiDone ? "complete" : "pending"} · Teacher: ${demo.teacherDone ? "decision saved" : "pending"}`}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/preview"
              className="inline-flex min-h-[40px] items-center justify-center rounded-lg bg-white px-3 text-xs font-semibold text-slate-800 ring-1 ring-slate-200 hover:bg-slate-50"
            >
              View evidence
            </Link>
            <Link
              href={`/learners/${DEMO_MOBILE_LEARNER_ID}`}
              className="inline-flex min-h-[40px] items-center justify-center rounded-lg bg-indigo-600 px-3 text-xs font-semibold text-white hover:bg-indigo-700"
            >
              Run AI analysis
            </Link>
            <Link
              href={`/learners/${DEMO_MOBILE_LEARNER_ID}`}
              className="inline-flex min-h-[40px] items-center justify-center rounded-lg bg-white px-3 text-xs font-semibold text-slate-800 ring-1 ring-slate-200 hover:bg-slate-50"
            >
              Review AI result
            </Link>
            <Link
              href={`/learners/${DEMO_MOBILE_LEARNER_ID}`}
              className="inline-flex min-h-[40px] items-center justify-center rounded-lg bg-white px-3 text-xs font-semibold text-slate-800 ring-1 ring-slate-200 hover:bg-slate-50"
            >
              Decide action
            </Link>
            <Link
              href={`/learners/${DEMO_MOBILE_LEARNER_ID}`}
              className="inline-flex min-h-[40px] items-center justify-center rounded-lg bg-white px-3 text-xs font-semibold text-slate-800 ring-1 ring-slate-200 hover:bg-slate-50"
            >
              Send feedback
            </Link>
          </div>
        </div>
        <p className="mt-3 text-[11px] leading-relaxed text-slate-500">
          Cohort list has <strong>{cohort.length}</strong> learner rows for analytics. Threshold-mapped statuses (Strong /
          Needs feedback / At risk) come from riskScore when predictions exist. The interactive queue above is scoped
          to the demo learner so reviewers can see the full click-through workflow.
        </p>
      </div>
    </div>
  );
}
