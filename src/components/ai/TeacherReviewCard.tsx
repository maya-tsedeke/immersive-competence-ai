"use client";

import { useState } from "react";
import { ProvenanceBadge } from "@/components/ai/ProvenanceBadge";
import { cn } from "@/lib/utils";

export function TeacherReviewCard({
  aiSuggestion,
  className,
}: {
  aiSuggestion: string;
  className?: string;
}) {
  const [notes, setNotes] = useState("");
  const [reviewed, setReviewed] = useState(false);

  return (
    <div
      className={cn(
        "rounded-2xl border border-[var(--border)] bg-white p-5 shadow-[var(--shadow)]",
        className,
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-slate-900">Teacher review</p>
          <p className="text-xs text-[var(--muted)]">Teacher review required — not an automatic grading decision.</p>
        </div>
        {reviewed ? <ProvenanceBadge kind="teacher_reviewed" /> : null}
      </div>

      <div className="mt-4 space-y-3 text-sm">
        <div className="rounded-xl bg-slate-50 px-3 py-2 text-slate-800 ring-1 ring-slate-100">
          <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--muted)]">AI suggestion</p>
          <p className="mt-1 leading-relaxed">{aiSuggestion}</p>
        </div>

        <label className="block text-xs font-bold uppercase tracking-wide text-[var(--muted)]">
          Teacher notes
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-normal text-slate-900"
            placeholder="Your interpretation and planned feedback…"
          />
        </label>

        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <button
            type="button"
            onClick={() => setReviewed(true)}
            className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            Accept AI suggestion
          </button>
          <button
            type="button"
            onClick={() => setReviewed(true)}
            className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50"
          >
            Edit and save feedback
          </button>
          <button
            type="button"
            onClick={() => setReviewed(true)}
            className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-950 hover:bg-amber-100"
          >
            Mark learner for follow-up
          </button>
        </div>

        {reviewed ? (
          <p className="rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-900">
            Teacher reviewed
          </p>
        ) : null}
      </div>
    </div>
  );
}
