import Link from "next/link";
import { notFound } from "next/navigation";
import { AIReasoningSummaryCard } from "@/components/learners/AIReasoningSummaryCard";
import { InteractionTimeline } from "@/components/analytics/InteractionTimeline";
import { MisconceptionCard } from "@/components/learners/MisconceptionCard";
import { RubricCard } from "@/components/learners/RubricCard";
import { TeacherRecommendationCard } from "@/components/learners/TeacherRecommendationCard";
import { LearnerDetailClientSection } from "@/components/learners/LearnerDetailClientSection";
import { getLogForLearner } from "@/lib/data/interactionLogs";
import { getRubricForLearner } from "@/lib/data/rubricScores";
import {
  getDialogueInsightForLearner,
  getInteractionLogForLearner,
  getLearnerById,
  getLearners,
  getRiskPredictionForLearner,
  getRubricForLearnerGenerated,
  usingGeneratedData,
} from "@/lib/dataset";
import { isDemoStaticLearnerId, placeholderDemoLearner } from "@/lib/learnerDemo/placeholderLearner";

/** Pre-render learner detail routes for `next build` with `output: "export"`. */
export async function generateStaticParams() {
  const learners = getLearners();
  const demo = Array.from({ length: 99 }, (_, i) => ({
    id: `Demo-${String(i + 1).padStart(3, "0")}`,
  }));
  const demoSet = new Set(demo.map((d) => d.id));
  const rest = learners.filter((l) => !demoSet.has(l.id)).map((l) => ({ id: l.id }));
  return [...demo, ...rest];
}

const b221Copy = {
  aiSummary:
    "The learner identified the main hazard but initially selected an incomplete safety response. Their reflection shows partial understanding of risk prevention, but they need support connecting observation to correct action.",
  misconception: "Confuses hazard recognition with risk control.",
  actions: [
    "Ask the learner to explain why the selected action reduces risk.",
    "Provide one example comparing hazard identification and preventive action.",
  ],
};

export default async function LearnerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const learner = getLearnerById(id) ?? (isDemoStaticLearnerId(id) ? placeholderDemoLearner(id) : undefined);
  if (!learner) notFound();

  const baseCohort = getLearners();
  const log = getInteractionLogForLearner(learner.id) ?? getLogForLearner(learner.id);
  const rubric = getRubricForLearnerGenerated(learner.id) ?? getRubricForLearner(learner.id);
  const dialogue = getDialogueInsightForLearner(learner.id);
  const risk = getRiskPredictionForLearner(learner.id);

  const aiBody =
    dialogue?.aiReasoningSummary ??
    (learner.id === "B221"
      ? b221Copy.aiSummary
      : `Prototype narrative for ${learner.id}: indicators align with ${learner.status} in the demonstration layer.`);

  const misconception =
    dialogue?.misconception ??
    (learner.id === "B221"
      ? b221Copy.misconception
      : "No persistent misconception flagged in this synthetic excerpt.");

  const factors = risk?.keyFactors?.length ? risk.keyFactors : [];
  const actions = [
    ...(risk?.teacherRecommendation ? [risk.teacherRecommendation] : []),
    ...(dialogue?.teacherFeedbackSuggestion ? [dialogue.teacherFeedbackSuggestion] : []),
    ...factors.slice(0, 4),
    ...(learner.id === "B221" ? b221Copy.actions : []),
  ];
  const uniqueActions = Array.from(new Set(actions.filter(Boolean)));

  const teacherAiSuggestion =
    dialogue?.teacherFeedbackSuggestion?.trim() ||
    risk?.teacherRecommendation?.trim() ||
    "Ask the learner to compare two possible safety actions and explain which one reduces risk more effectively.";

  const gen = usingGeneratedData();
  const interactionLog =
    log && log.events
      ? { learnerId: learner.id, events: log.events }
      : null;

  const aiDisclaimer = (
    <div className="rounded-2xl border border-indigo-100 bg-indigo-50/80 p-4 text-sm leading-relaxed text-indigo-950 shadow-sm">
      <strong>AI-assisted insight, not final assessment.</strong> Signals combine public-dataset baselines and heuristic
      dialogue labels. The teacher remains responsible for interpretation; this is not validated on live ThingLink
      telemetry.
      <span className="mt-2 block text-xs text-indigo-900/90">
        <strong>Two layers:</strong> cohort learners (e.g. <code className="rounded bg-indigo-100/80 px-1">L-…</code>)
        may show narrative text from the research JSON (OULAD-linked excerpts). The panoramic warehouse scenario is a
        separate interactive surface for local demo learners; suggested actions should be read in the learner&apos;s
        actual context.
      </span>
    </div>
  );

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-2 pb-6 sm:px-0">
      <Link
        href="/learners"
        className="inline-flex min-h-[44px] items-center text-sm font-semibold text-indigo-600 hover:underline"
      >
        ← Back to learners
      </Link>

      <LearnerDetailClientSection
        id={id}
        initialLearner={learner}
        baseCohort={baseCohort}
        dialogue={dialogue ?? null}
        risk={risk ?? null}
        log={interactionLog}
        usingGeneratedJson={gen}
        teacherSuggestionFallback={teacherAiSuggestion}
        afterHeader={aiDisclaimer}
      />

      {risk ? (
        <div className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-[var(--shadow)]">
          <p className="text-sm font-semibold text-slate-900">Risk model output</p>
          <p className="mt-1 text-xs text-[var(--muted)]">From learnerRiskPredictions.json when generated</p>
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-[var(--muted)]">Risk score</dt>
              <dd className="text-lg font-semibold text-slate-900">{risk.riskScore.toFixed(4)}</dd>
            </div>
            <div>
              <dt className="text-[var(--muted)]">Level · Outcome proxy</dt>
              <dd className="font-semibold text-slate-900">
                {risk.riskLevel} · {risk.predictedOutcome}
              </dd>
            </div>
          </dl>
          {factors.length ? (
            <div className="mt-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Key factors</p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
                {factors.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}

      {dialogue?.labelDisclaimer ? (
        <p className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-xs text-slate-600">
          {dialogue.labelDisclaimer}
        </p>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <InteractionTimeline events={log?.events ?? []} />
        <div className="space-y-4">
          <AIReasoningSummaryCard learnerId={learner.id} body={aiBody} />
          <MisconceptionCard text={misconception} />
          <p className="text-xs leading-relaxed text-slate-600">
            Recommended actions below combine model output with dialogue excerpts when present. For learners who only
            used the immersive demo, prioritise their justification, reflection, and hotspot sequence over generic
            dataset wording.
          </p>
          <TeacherRecommendationCard
            items={
              uniqueActions.length
                ? uniqueActions
                : ["Review hotspot sequence with the learner.", "Reinforce rubric cues for justification."]
            }
          />
        </div>
      </div>

      <RubricCard rows={rubric} />
    </div>
  );
}
