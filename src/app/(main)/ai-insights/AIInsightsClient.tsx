"use client";

import type { ClassAiInsight, DialogueInsight, Learner, LearnerRiskPrediction } from "@/lib/types";
import { DialogueDistributionCharts } from "@/components/insights/DialogueDistributionCharts";
import { ProvenanceBadge } from "@/components/ai/ProvenanceBadge";
import { RunAiAnalysisButton } from "@/components/ai/RunAiAnalysisButton";
import { getDataProvenance } from "@/lib/ai/provenance";
import { demoAlert } from "@/lib/utils";

export function AIInsightsClient({
  insights,
  dialogue,
  sampleLearner,
  sampleDialogue,
  sampleRisk,
  usingGeneratedJson,
}: {
  insights: ClassAiInsight[];
  dialogue: DialogueInsight[];
  sampleLearner?: Learner;
  sampleDialogue: DialogueInsight | null;
  sampleRisk: LearnerRiskPrediction | null;
  usingGeneratedJson: boolean;
}) {
  const teacherSamples = dialogue.filter((d) => d.teacherFeedbackSuggestion).slice(0, 4);

  const sampleProv = sampleLearner
    ? getDataProvenance("ai_result", {
        usingGeneratedJson,
        hasLearnerDemo: false,
        isHeuristic: Boolean(sampleDialogue),
      })
    : null;

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">AI insights</p>
        <h1 className="mt-1 text-3xl font-semibold text-slate-900">Class-level analytics</h1>
        <p className="mt-2 text-sm text-slate-600">
          Transparent narratives and dialogue-derived distributions. Confidence labels describe prototype certainty —
          AI-assisted insight for teacher reflection only.
        </p>
      </div>

      {sampleLearner && sampleProv ? (
        <section className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-[var(--shadow)]">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-semibold text-slate-900">Run AI analysis (sample learner)</h2>
            <ProvenanceBadge kind={sampleProv} />
          </div>
          <p className="mt-1 text-xs text-[var(--muted)]">
            First learner in the current dashboard list: <strong>{sampleLearner.id}</strong>. Uses dialogueInsights.json /
            learnerRiskPredictions.json when rows exist.
          </p>
          <div className="mt-4">
            <RunAiAnalysisButton
              learner={sampleLearner}
              dialogue={sampleDialogue}
              risk={sampleRisk}
              log={null}
              usingGeneratedJson={usingGeneratedJson}
            />
          </div>
        </section>
      ) : null}

      <div className="rounded-2xl border border-amber-100 bg-amber-50/90 p-4 text-sm text-amber-950 shadow-sm">
        <strong>Heuristic labels.</strong> Dialogue labels are proof-of-concept outputs from public corpora — not
        validated ground truth. Do not treat distributions as clinical or definitive learner categories.
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">Distributions (dialogueInsights.json)</h2>
        <DialogueDistributionCharts dialogue={dialogue} />
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">Class narratives (aiInsights.json)</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {insights.map((insight) => (
            <article
              key={insight.id}
              className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-[var(--shadow)] transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-sm font-semibold text-slate-900">{insight.title}</h3>
                <span className="shrink-0 rounded-full bg-slate-50 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-slate-600 ring-1 ring-slate-100">
                  {insight.confidence}
                </span>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-slate-700">{insight.body}</p>
            </article>
          ))}
        </div>
      </section>

      {teacherSamples.length ? (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-900">Teacher-facing suggestion samples</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {teacherSamples.map((d) => (
              <article
                key={d.conversationId}
                className="rounded-2xl border border-indigo-100 bg-white p-4 shadow-[var(--shadow)]"
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                  Learner {d.learnerId}
                </p>
                <p className="mt-2 text-sm text-slate-800">{d.teacherFeedbackSuggestion}</p>
                <p className="mt-2 text-[11px] text-[var(--muted)]">
                  Prototype confidence: {d.confidence} · dialogueInsights.json
                </p>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={() => demoAlert("Export bundled in Reports.")}
          className="inline-flex min-h-[48px] items-center justify-center rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
        >
          Open export workflow
        </button>
        <button
          type="button"
          onClick={() => demoAlert("Feedback draft — connect LMS integration later.")}
          className="inline-flex min-h-[48px] items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 shadow-sm transition hover:border-slate-300"
        >
          Draft feedback (prototype)
        </button>
      </div>
    </div>
  );
}
