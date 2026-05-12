"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  Circle,
  Cpu,
  Smartphone,
  UsersRound,
} from "lucide-react";
import { RunAiAnalysisButton } from "@/components/ai/RunAiAnalysisButton";
import { TeacherDecisionCard } from "@/components/ai/TeacherDecisionCard";
import { AddLearnerActivityButton } from "@/components/learners/AddLearnerActivityModal";
import {
  DEMO_LEARNERS_CHANGE_EVENT,
  getActivePreviewLearnerId,
  listDemoLearnerRecords,
  setActivePreviewLearnerId,
} from "@/lib/learnerDemo/demoLearnersStore";
import { demoLearnerRowFromStore } from "@/lib/learnerDemo/mergeCohort";
import { readLearnerDemoState } from "@/lib/learnerDemo/storage";
import type { Learner } from "@/lib/types";
import {
  WORKFLOW_CHANGE_EVENT,
  getLearnerWorkflowState,
} from "@/lib/workflow/teacherWorkflowStorage";
import { cn } from "@/lib/utils";

const STEPS = [
  "Learner explores scenario",
  "Learner submits activity",
  "AI analyzes evidence",
  "AI detects learning signals",
  "Teacher reviews result",
  "Teacher takes action",
] as const;

type RoleTab = "learner" | "teacher" | "ai";

function StepIcon({ done }: { done: boolean }) {
  return done ? (
    <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" aria-hidden />
  ) : (
    <Circle className="h-5 w-5 shrink-0 text-slate-300" aria-hidden />
  );
}

function stubWorkflowLearner(id: string): Learner {
  return {
    id,
    score: 0,
    engagement: "Low",
    reflection: "Low",
    status: "Needs feedback",
    displayStatus: "Needs feedback",
    isLocalDemo: true,
    scenarioTitle: "Learning Environment Demo",
    demoProgressPct: 0,
  };
}

export function AiWorkflowClient({ usingGeneratedJson }: { usingGeneratedJson: boolean }) {
  const [role, setRole] = useState<RoleTab>("teacher");
  const [activeId, setActiveId] = useState(() =>
    typeof window === "undefined" ? "Demo-001" : getActivePreviewLearnerId(),
  );
  const [, bump] = useState(0);

  const refresh = useCallback(() => {
    bump((n) => n + 1);
    if (typeof window !== "undefined") setActiveId(getActivePreviewLearnerId());
  }, []);

  useEffect(() => {
    refresh();
    const t = window.setInterval(refresh, 1200);
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

  const demoList = listDemoLearnerRecords();
  const workflowLearner = demoLearnerRowFromStore(activeId) ?? stubWorkflowLearner(activeId);
  const demo = readLearnerDemoState(activeId);
  const wf = getLearnerWorkflowState(activeId);

  const traceHotspot = Boolean(demo?.events?.some((e) => e.eventType === "hotspot_click"));
  const submittedOk = Boolean(demo?.submittedAt);
  const aiComplete = Boolean(wf.aiAnalysisComplete && wf.aiResultBundle);
  const teacherDone = Boolean(wf.teacherDecision);

  const teacherSuggestion =
    wf.aiResultBundle?.suggestedTeacherAction ??
    "Ask the learner to compare two possible actions and explain which one better fits the learning evidence.";

  const stepDone = useMemo(
    () => [
      traceHotspot || submittedOk,
      submittedOk,
      submittedOk && aiComplete,
      aiComplete,
      aiComplete,
      teacherDone,
    ],
    [traceHotspot, submittedOk, aiComplete, teacherDone],
  );

  return (
    <div className="mx-auto max-w-4xl min-w-0 space-y-8 overflow-x-hidden pb-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
            Learning environment prototype
          </p>
          <h1 className="mt-1 text-3xl font-semibold text-slate-900">AI Learning Workflow</h1>
          <p className="mt-2 text-sm text-slate-600">
            Follow how learner actions become AI-assisted teacher insights — learner evidence, analysis, review, and
            recorded decision. Select a demo learner to run the pipeline end-to-end.
          </p>
        </div>
        <AddLearnerActivityButton className="shrink-0" />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <label className="block text-xs font-bold uppercase tracking-wide text-[var(--muted)]">Workflow learner</label>
        <select
          value={activeId}
          onChange={(e) => {
            const v = e.target.value;
            setActivePreviewLearnerId(v);
            setActiveId(v);
            refresh();
          }}
          className="mt-2 min-h-[48px] w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-sm font-semibold text-slate-900"
        >
          {demoList.length ? (
            demoList.map((r) => (
              <option key={r.id} value={r.id}>
                {r.id} — {r.scenarioTitle}
              </option>
            ))
          ) : (
            <option value={activeId}>{activeId} (create a demo learner first)</option>
          )}
        </select>
        <p className="mt-2 text-xs text-slate-500">
          Session active learner is stored for the mobile preview; changing it here updates analysis targets.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
        {(
          [
            { id: "learner" as const, label: "Learner", icon: Smartphone },
            { id: "teacher" as const, label: "Teacher", icon: UsersRound },
            { id: "ai" as const, label: "AI system", icon: Bot },
          ] as const
        ).map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setRole(t.id)}
            className={cn(
              "inline-flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-xl px-3 text-sm font-semibold transition sm:flex-none sm:px-4",
              role === t.id ? "bg-indigo-600 text-white shadow-sm" : "bg-slate-50 text-slate-800 hover:bg-slate-100",
            )}
          >
            <t.icon className="h-4 w-4" aria-hidden />
            {t.label}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4 text-sm text-indigo-950">
        {role === "learner" ? (
          <p>
            <strong>You explore</strong> the scenario, capture evidence (hotspot, decision, justification, reflection),
            and submit so the teacher queue receives a trace.
          </p>
        ) : role === "teacher" ? (
          <p>
            <strong>You run AI analysis</strong> when ready, read detected signals with confidence and evidence, then
            decide and save a teacher action for each learner.
          </p>
        ) : (
          <p>
            <strong>The AI pipeline</strong> merges learner-demo traces with optional generated JSON (dialogue + risk
            models) or mock fallbacks, then surfaces explainable outputs — never a final grade.
          </p>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-[var(--shadow)]">
          <p className="text-sm font-semibold text-slate-900">Workflow stepper</p>
          <ol className="mt-4 space-y-3">
            {STEPS.map((label, i) => (
              <li key={label} className="flex items-start gap-3 text-sm">
                <StepIcon done={stepDone[i]} />
                <span className={cn(stepDone[i] ? "text-slate-900" : "text-slate-500")}>
                  {i + 1}. {label}
                </span>
              </li>
            ))}
          </ol>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-[var(--shadow)]">
          <p className="text-sm font-semibold text-slate-900">Workflow simulation</p>
          <p className="mt-1 text-xs text-[var(--muted)]">
            Jump to the part of the demo you want to show — each step updates live state in this browser.
          </p>
          <div className="mt-4 flex flex-col gap-2">
            <Link
              href={`/preview?learner=${encodeURIComponent(activeId)}`}
              className="inline-flex min-h-[48px] items-center justify-center rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Start learner activity
            </Link>
            <Link
              href={`/preview?learner=${encodeURIComponent(activeId)}`}
              className="inline-flex min-h-[48px] items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-900 hover:bg-slate-50"
            >
              Complete learner scenario
            </Link>
            <Link
              href={`/learners/${activeId}`}
              className="inline-flex min-h-[48px] items-center justify-center rounded-xl border border-indigo-200 bg-indigo-50 px-4 text-sm font-semibold text-indigo-950 hover:bg-indigo-100"
            >
              Open learner detail
            </Link>
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById("workflow-ai-panel");
                el?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              className="inline-flex min-h-[48px] items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-900 hover:bg-slate-50"
            >
              Review AI result (below)
            </button>
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById("workflow-teacher-panel");
                el?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              className="inline-flex min-h-[48px] items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-900 hover:bg-slate-50"
            >
              Save teacher decision
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-[var(--shadow)]">
        <p className="text-sm font-semibold text-slate-900">Current state</p>
        <p className="mt-1 font-mono text-xs text-slate-600">{activeId}</p>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <div className="rounded-xl bg-slate-50 px-3 py-2">
            <dt className="text-xs font-bold uppercase text-[var(--muted)]">Learner status</dt>
            <dd className="font-medium text-slate-900">
              {!submittedOk ? "Not submitted" : "Evidence submitted (local)"}
            </dd>
          </div>
          <div className="rounded-xl bg-slate-50 px-3 py-2">
            <dt className="text-xs font-bold uppercase text-[var(--muted)]">Evidence collected</dt>
            <dd className="font-medium text-slate-900">
              {submittedOk ? `${demo?.events?.length ?? 0} events · reflection on device` : "—"}
            </dd>
          </div>
          <div className="rounded-xl bg-slate-50 px-3 py-2">
            <dt className="text-xs font-bold uppercase text-[var(--muted)]">AI status</dt>
            <dd className="font-medium text-slate-900">{aiComplete ? "Result generated" : "Not run / pending"}</dd>
          </div>
          <div className="rounded-xl bg-slate-50 px-3 py-2">
            <dt className="text-xs font-bold uppercase text-[var(--muted)]">Teacher review</dt>
            <dd className="font-medium text-slate-900">
              {teacherDone ? "Decision saved locally" : "Pending teacher action"}
            </dd>
          </div>
        </dl>
      </div>

      <div id="workflow-ai-panel" className="scroll-mt-24 space-y-4">
        <div className="flex items-center gap-2 text-slate-900">
          <Cpu className="h-5 w-5 text-indigo-600" aria-hidden />
          <h2 className="text-lg font-semibold">AI detected result</h2>
        </div>
        {!submittedOk ? (
          <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            Submit learner evidence from the scenario first — then run analysis to see feedback need, prototype
            confidence, reflection quality, reasoning depth, competence evidence, and suggested teacher action.
          </p>
        ) : (
          <RunAiAnalysisButton
            learner={workflowLearner}
            dialogue={null}
            risk={null}
            log={null}
            usingGeneratedJson={usingGeneratedJson}
            initialBundle={wf.aiResultBundle ?? null}
            onComplete={() => refresh()}
          />
        )}
      </div>

      <div id="workflow-teacher-panel" className="scroll-mt-24">
        <TeacherDecisionCard learnerId={activeId} suggestedActionFallback={teacherSuggestion} />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-700">
        <p className="font-semibold text-slate-900">What does each actor do?</p>
        <ul className="mt-3 list-disc space-y-2 pl-5">
          <li>
            <strong>Learner</strong> — produces observable evidence (clicks, choices, text).
          </li>
          <li>
            <strong>AI system</strong> — fuses demo trace + JSON models (or mock) into explainable signals with prototype
            confidence.
          </li>
          <li>
            <strong>Teacher</strong> — runs analysis when appropriate, interprets results, decides follow-up, records the
            decision.
          </li>
        </ul>
        <Link href="/dashboard" className="mt-4 inline-flex items-center gap-2 font-semibold text-indigo-700 underline">
          Teacher dashboard
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>
    </div>
  );
}
