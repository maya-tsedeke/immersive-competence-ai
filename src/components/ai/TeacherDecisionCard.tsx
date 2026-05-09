"use client";

import { useCallback, useEffect, useState } from "react";
import type { TeacherDecisionStatus } from "@/lib/types";
import { ProvenanceBadge } from "@/components/ai/ProvenanceBadge";
import {
  WORKFLOW_CHANGE_EVENT,
  getLearnerWorkflowState,
  persistTeacherDecision,
} from "@/lib/workflow/teacherWorkflowStorage";
import { syncDemoLearnerAfterTeacherDecision } from "@/lib/learnerDemo/demoTeacherSync";
import { cn } from "@/lib/utils";

const decisionLabels: Record<TeacherDecisionStatus, string> = {
  accepted_ai_suggestion: "Accepted AI suggestion (Reviewed)",
  edited_feedback: "Edited feedback (Feedback sent)",
  follow_up_required: "Follow-up required",
  resubmission_requested: "Resubmission requested",
  reviewed: "Marked as reviewed (Reviewed)",
  teacher_override: "Teacher overrode AI",
  feedback_sent: "Feedback sent",
};

export function TeacherDecisionCard({
  learnerId,
  suggestedActionFallback,
  className,
}: {
  learnerId: string;
  /** Used when no stored AI bundle yet */
  suggestedActionFallback: string;
  className?: string;
}) {
  const [note, setNote] = useState(() => getLearnerWorkflowState(learnerId).teacherDecision?.note ?? "");
  const [wf, setWf] = useState(() => getLearnerWorkflowState(learnerId));

  const refresh = useCallback(() => setWf(getLearnerWorkflowState(learnerId)), [learnerId]);

  useEffect(() => {
    refresh();
    const h = () => refresh();
    window.addEventListener(WORKFLOW_CHANGE_EVENT, h);
    return () => window.removeEventListener(WORKFLOW_CHANGE_EVENT, h);
  }, [refresh]);

  useEffect(() => {
    setNote(getLearnerWorkflowState(learnerId).teacherDecision?.note ?? "");
  }, [learnerId]);

  const aiReady = wf.aiAnalysisComplete && wf.aiResultBundle;
  const suggestion = wf.aiResultBundle?.suggestedTeacherAction ?? suggestedActionFallback;
  const decision = wf.teacherDecision;

  const save = (status: TeacherDecisionStatus) => {
    persistTeacherDecision(learnerId, status, note);
    syncDemoLearnerAfterTeacherDecision(learnerId, status);
    refresh();
  };

  return (
    <div
      className={cn(
        "rounded-2xl border border-[var(--border)] bg-white p-5 shadow-[var(--shadow)]",
        className,
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-slate-900">Teacher decision</p>
          <p className="text-xs text-[var(--muted)]">
            After AI analysis, record how you will proceed for this learner. AI-assisted insight only.
          </p>
        </div>
        {decision ? <ProvenanceBadge kind="teacher_reviewed" /> : null}
      </div>

      {!aiReady ? (
        <p className="mt-4 rounded-xl border border-amber-100 bg-amber-50 px-3 py-2 text-sm text-amber-950">
          Run <strong>AI analysis</strong> above first — then you can accept, edit, or route the learner.
        </p>
      ) : (
        <>
          <div className="mt-4 rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-800 ring-1 ring-slate-100">
            <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--muted)]">AI suggested action</p>
            <p className="mt-1 leading-relaxed">{suggestion}</p>
          </div>

          <label className="mt-4 block text-xs font-bold uppercase tracking-wide text-[var(--muted)]">
            Teacher feedback note
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-normal normal-case text-slate-900"
              placeholder="Your interpretation, planned feedback, or follow-up…"
            />
          </label>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <button
              type="button"
              disabled={!aiReady}
              onClick={() => save("accepted_ai_suggestion")}
              className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-xl bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Accept AI suggestion
            </button>
            <button
              type="button"
              disabled={!aiReady}
              onClick={() => save("edited_feedback")}
              className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Edit feedback
            </button>
            <button
              type="button"
              disabled={!aiReady}
              onClick={() => save("feedback_sent")}
              className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-xl border border-sky-200 bg-sky-50 px-3 py-2 text-sm font-semibold text-sky-950 hover:bg-sky-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Send feedback
            </button>
            <button
              type="button"
              disabled={!aiReady}
              onClick={() => save("teacher_override")}
              className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-xl border border-slate-300 bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Reject AI suggestion
            </button>
            <button
              type="button"
              disabled={!aiReady}
              onClick={() => save("follow_up_required")}
              className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-950 hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Mark learner for follow-up
            </button>
            <button
              type="button"
              disabled={!aiReady}
              onClick={() => save("resubmission_requested")}
              className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-950 hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Request learner resubmission
            </button>
            <button
              type="button"
              disabled={!aiReady}
              onClick={() => save("reviewed")}
              className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Mark as reviewed
            </button>
          </div>
        </>
      )}

      {decision ? (
        <div className="mt-4 space-y-2 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-3 text-sm text-emerald-950">
          <p className="font-semibold">Teacher decision saved</p>
          <p className="text-xs text-emerald-900/90">
            <strong>Action:</strong> {decisionLabels[decision.status]}
          </p>
          <p className="text-xs text-emerald-900/90">
            <strong>Time:</strong> {new Date(decision.decidedAt).toLocaleString()}
          </p>
          {decision.note ? (
            <p className="text-xs leading-relaxed text-emerald-900">
              <strong>Note:</strong> {decision.note}
            </p>
          ) : null}
          <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-800">
            Status: {decisionLabels[decision.status]}
          </p>
        </div>
      ) : null}
    </div>
  );
}
