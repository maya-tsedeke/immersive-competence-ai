import Link from "next/link";
import {
  Activity,
  BarChart3,
  Brain,
  Clock,
  MessageCircle,
  Smartphone,
  Sparkles,
  UsersRound,
} from "lucide-react";
import { CompletionDonutChart } from "@/components/dashboard/CompletionDonutChart";
import { CompetenceTrendChart } from "@/components/dashboard/CompetenceTrendChart";
import { InsightCard } from "@/components/dashboard/InsightCard";
import { KPIStatCard } from "@/components/dashboard/KPIStatCard";
import { ModelInfoCard } from "@/components/dashboard/ModelInfoCard";
import { MobileScenarioPreview } from "@/components/dashboard/MobileScenarioPreview";
import { QuickActionCard } from "@/components/dashboard/QuickActionCard";
import { RiskDistributionChart } from "@/components/dashboard/RiskDistributionChart";
import { TeacherActionQueue } from "@/components/dashboard/TeacherActionQueue";
import { RecentLearnerActivity } from "@/components/dashboard/RecentLearnerActivity";
import { AddLearnerActivityButton } from "@/components/learners/AddLearnerActivityModal";
import { ProvenanceBadge } from "@/components/ai/ProvenanceBadge";
import {
  computeDynamicKpi,
  getDialogueInsights,
  getLearners,
  getPredictionCohortCounts,
  getScenarioAnalytics,
  usingGeneratedData,
} from "@/lib/dataset";
import { getDataProvenance } from "@/lib/ai/provenance";
import type { DataProvenanceKind } from "@/lib/types";

function MiniScoreRing({ value }: { value: number }) {
  const pct = Math.min(100, Math.max(0, value));
  const c = 2 * Math.PI * 15;
  const dash = `${(pct / 100) * c} ${c}`;
  return (
    <svg viewBox="0 0 36 36" className="h-12 w-12 -rotate-90" aria-hidden>
      <circle cx="18" cy="18" r="15" fill="none" className="stroke-slate-100" strokeWidth="4" />
      <circle
        cx="18"
        cy="18"
        r="15"
        fill="none"
        className="stroke-indigo-500"
        strokeWidth="4"
        strokeDasharray={dash}
        strokeLinecap="round"
      />
    </svg>
  );
}

function AiObjectiveCard() {
  return (
    <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/90 to-white p-5 shadow-[var(--shadow)]">
      <p className="text-sm font-semibold text-slate-900">AI objective (public dataset prototype)</p>
      <p className="mt-2 text-sm leading-relaxed text-slate-700">
        The AI objective is to transform learner interaction traces and reflection responses into teacher-facing
        competence indicators. The prototype surfaces learner-risk signals, reflection quality, reasoning depth, a
        possible learning difficulty signal, and a suggested teacher action. The teacher remains responsible for
        interpretation.
      </p>
      <div className="mt-4 grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
        <div className="rounded-xl bg-white/80 p-3 ring-1 ring-indigo-100">
          <p className="text-[10px] font-bold uppercase text-indigo-800">Inputs</p>
          <ul className="mt-2 list-disc space-y-1 pl-4 text-xs leading-relaxed">
            <li>Hotspot clicks</li>
            <li>Pathway steps</li>
            <li>Response selection</li>
            <li>Written reflection</li>
            <li>Public-dataset risk features</li>
          </ul>
        </div>
        <div className="rounded-xl bg-white/80 p-3 ring-1 ring-indigo-100">
          <p className="text-[10px] font-bold uppercase text-indigo-800">Outputs</p>
          <ul className="mt-2 list-disc space-y-1 pl-4 text-xs leading-relaxed">
            <li>Risk indicator</li>
            <li>Reflection quality</li>
            <li>Reasoning depth</li>
            <li>Learning difficulty signal</li>
            <li>Suggested teacher action</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function WorkflowHelpPanel() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
      <p className="text-sm font-semibold text-slate-900">How to get AI results in this demo</p>
      <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-sm text-slate-600">
        <li>Open Mobile Learner Scenario.</li>
        <li>Tap the Hazard hotspot.</li>
        <li>Choose the safest action.</li>
        <li>Write a short justification and reflection.</li>
        <li>Submit for teacher review.</li>
        <li>Open AI Workflow or Learner Detail.</li>
        <li>Click Run AI Analysis.</li>
        <li>Review detected results, prototype confidence, evidence, and suggested teacher action.</li>
      </ol>
      <p className="mt-3 text-xs text-slate-500">
        Need the full step-by-step?{" "}
        <Link href="/ai-workflow" className="font-semibold text-indigo-700 underline">
          Open AI Workflow
        </Link>
      </p>
    </div>
  );
}

export default function DashboardPage() {
  const sa = getScenarioAnalytics();
  const learners = getLearners();
  const gen = usingGeneratedData();
  const dialogue = getDialogueInsights();
  const kpi = gen ? computeDynamicKpi(learners, dialogue) : sa.kpi;
  const preds = getPredictionCohortCounts();

  const total = learners.length || 1;
  const atRiskPct = Math.round((kpi.learnersAtRiskCount / total) * 100);

  const riskHintFullCohort =
    gen && preds.total > 0
      ? `Full prediction file: ${preds.atRisk} at risk · ${preds.needsFeedback} needs feedback · ${preds.strong} strong · sample is not the full cohort story on its own.`
      : `~${atRiskPct}% of visible dashboard rows · display sample may skew high-risk.`;

  const sampleNote =
    kpi.cohortSampleNote ??
    (gen && preds.total > 0
      ? "Display sample balanced for demo where possible; full risk output lives in learnerRiskPredictions.json."
      : undefined);

  const dialogueHint =
    dialogue.length && dialogue[0]?.confidence != null
      ? `Example row prototype confidence: ${dialogue[0].confidence}`
      : "Heuristic dialogue label when dialogueInsights.json is present";

  const exampleConfidence =
    dialogue.length && dialogue[0]?.confidence != null
      ? Math.round(Math.min(0.95, Math.max(0.35, dialogue[0].confidence)) * 100) / 100
      : null;

  const whatAiDetectedCards: Array<{
    title: string;
    body: string;
    badge: DataProvenanceKind;
    href: string;
    confidenceLine?: string;
  }> = [
    {
      title: "Learner risk indicators",
      body: `Cohort indicators: ~${preds.atRisk || kpi.learnersAtRiskCount} at-risk style signals in prediction file vs. ${kpi.learnersAtRiskCount} flagged on this dashboard slice.`,
      badge: getDataProvenance("kpi_risk", { usingGeneratedJson: gen, isHeuristic: false }),
      href: "/learners",
      confidenceLine: exampleConfidence != null ? `Example prototype confidence: ${exampleConfidence}` : undefined,
    },
    {
      title: "Reflection quality",
      body: `Dominant level: ${kpi.reflectionLabel} (dialogue heuristic when JSON present).`,
      badge: getDataProvenance("kpi_reflection", {
        usingGeneratedJson: gen,
        isHeuristic: dialogue.length > 0,
      }),
      href: "/ai-insights",
      confidenceLine: exampleConfidence != null ? `Heuristic confidence: ${exampleConfidence}` : undefined,
    },
    {
      title: "Reasoning depth",
      body: "TF-IDF / dialogue model labels when dialogueInsights.json includes reasoningDepth.",
      badge: dialogue.length ? "heuristic_label" : "mock_fallback",
      href: "/ai-insights",
      confidenceLine: exampleConfidence != null ? `Mapped with prototype confidence ${exampleConfidence}` : undefined,
    },
    {
      title: "Learning difficulty signal",
      body: "Possible difficulty justifying why an action reduces risk — from dialogue heuristics + reflection text in demo.",
      badge: "heuristic_label",
      href: "/ai-workflow",
      confidenceLine: exampleConfidence != null ? `Row confidence (example): ${exampleConfidence}` : undefined,
    },
    {
      title: "Suggested teacher action",
      body: "Rule-assisted prompt for follow-up feedback — teacher review required.",
      badge: gen ? "ml_pipeline" : "mock_fallback",
      href: "/ai-workflow",
      confidenceLine: "Status: prototype · not prescriptive",
    },
  ];

  return (
    <div className="mx-auto max-w-7xl min-w-0 space-y-8 overflow-x-hidden">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Teacher overview</p>
        <h1 className="mt-1 text-3xl font-semibold text-slate-900">Immersive competence dashboard</h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-600">
          Cohort snapshot for scenario-style learning. This is a <strong>public dataset prototype</strong> — not a live
          production ThingLink AI system. Values merge generated JSON when the ML pipeline writes{" "}
          <code className="rounded bg-slate-100 px-1 py-0.5 text-xs">src/lib/generated/</code>.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <AddLearnerActivityButton className="w-full sm:w-auto" />
        <p className="text-xs text-slate-600 sm:max-w-md">
          Add a browser-only demo learner with its own evidence, AI result, and teacher workflow.
        </p>
      </div>

      <ModelInfoCard />

      <TeacherActionQueue cohort={learners.map((l) => ({ id: l.id, displayStatus: l.displayStatus }))} />

      <div className="grid gap-4 lg:grid-cols-2">
        <RecentLearnerActivity />
        <WorkflowHelpPanel />
      </div>

      <AiObjectiveCard />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start lg:gap-6">
        <div className="space-y-6">
          <div className="grid min-w-0 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <KPIStatCard
              title="Average competence score"
              value={`${kpi.avgScorePct}%`}
              hint={
                gen
                  ? "Mean over visible learners in generated cohort"
                  : "From scenarioAnalytics.json KPI or mock layer"
              }
              hintPositive
              icon={Activity}
            >
              <MiniScoreRing value={kpi.avgScorePct} />
            </KPIStatCard>
            <KPIStatCard
              title="Learners flagged for review"
              value={String(kpi.learnersAtRiskCount)}
              subtitle="AI-assisted risk indicator, not final assessment."
              hint={
                (gen && preds.total > 0 ? "Top-risk generated sample · " : "") + riskHintFullCohort
              }
              hintPositive={false}
              icon={UsersRound}
            />
            <KPIStatCard
              title="Avg. engagement time"
              value={`${kpi.avgEngagementMin} min`}
              hint="Mapped from VLE click intensity proxy when generated"
              hintPositive
              icon={Clock}
            />
            <KPIStatCard
              title="Reflection quality"
              value={kpi.reflectionLabel}
              subtitle={
                kpi.reflectionSubtitle ??
                "Dominant reflection-quality level from dialogue prototype or mock cohort."
              }
              hint={dialogueHint}
              hintPositive
              icon={MessageCircle}
            />
          </div>

          {sampleNote ? (
            <p className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-xs text-amber-950">
              <strong>Note:</strong> {sampleNote}
            </p>
          ) : null}

          <div className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-[var(--shadow)]">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-900">What AI detected</p>
                <p className="text-xs text-[var(--muted)]">
                  Results, prototype confidence, evidence source — open a card to view evidence in context.
                </p>
              </div>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {whatAiDetectedCards.map((card) => (
                <div
                  key={card.title}
                  className="flex min-h-[160px] flex-col rounded-xl border border-slate-100 bg-slate-50/80 p-4 shadow-sm ring-1 ring-slate-100"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-slate-900">{card.title}</p>
                    <ProvenanceBadge kind={card.badge} compact />
                  </div>
                  <p className="mt-2 flex-1 text-xs leading-relaxed text-slate-600">{card.body}</p>
                  {card.confidenceLine ? (
                    <p className="mt-2 text-[11px] font-medium text-slate-700">{card.confidenceLine}</p>
                  ) : null}
                  <p className="mt-2 text-[11px] text-[var(--muted)]">
                    Evidence source shown on detail pages via provenance badges.
                  </p>
                  <Link
                    href={card.href}
                    className="mt-3 inline-flex min-h-[40px] items-center justify-center rounded-lg bg-white px-3 text-xs font-semibold text-indigo-700 ring-1 ring-slate-200 hover:bg-slate-50"
                  >
                    View evidence
                  </Link>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-3">
            <div className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-[var(--shadow)] xl:col-span-2">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">Competence trend</p>
                  <p className="text-xs text-[var(--muted)]">Class mean from scenario analytics JSON</p>
                </div>
                <span className="rounded-full bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-100">
                  Reporting window
                </span>
              </div>
              <div className="mt-4 min-h-[260px] min-w-0">
                <CompetenceTrendChart data={sa.competenceTrend} />
              </div>
            </div>

            <div className="flex min-h-0 min-w-0 flex-col rounded-2xl border border-[var(--border)] bg-white p-5 shadow-[var(--shadow)]">
              <p className="text-sm font-semibold text-slate-900">Scenario progress overview</p>
              <p className="text-xs text-[var(--muted)]">Progress mix across the cohort</p>
              <div className="mt-3 min-h-[260px] min-w-0 flex-1">
                <CompletionDonutChart data={sa.completionDonut} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-[var(--shadow)]">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-900">Learner status distribution</p>
                <p className="text-xs text-[var(--muted)]">
                  Uses threshold-mapped display status (riskScore cuts) when predictions exist.
                </p>
              </div>
            </div>
            <div className="mt-4 min-h-[240px] min-w-0">
              <RiskDistributionChart learners={learners} />
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <InsightCard
              title="Key insight"
              body={sa.keyInsight}
              href="/analytics"
              linkLabel="Open scenario workspace"
            />
            <div className="grid grid-cols-2 gap-3">
              <QuickActionCard
                title="AI Workflow"
                description="Step-by-step from learner task to teacher review."
                href="/ai-workflow"
                icon={Brain}
              />
              <QuickActionCard
                title="Learner insights"
                description="Search, filter, and open learner traces."
                href="/learners"
                icon={UsersRound}
              />
              <QuickActionCard
                title="Scenario analytics"
                description="Hotspots, pathway, and engagement."
                href="/analytics"
                icon={BarChart3}
              />
              <QuickActionCard
                title="AI summary"
                description="Class-level narratives with prototype confidence."
                href="/ai-insights"
                icon={Brain}
              />
              <QuickActionCard
                title="Reports"
                description="Competence report preview and exports."
                href="/reports"
                icon={Sparkles}
              />
              <QuickActionCard
                title="Mobile learner scenario"
                description="Generate local demo evidence for analysis."
                href="/preview"
                icon={Smartphone}
              />
              <QuickActionCard
                title="Research mapping"
                description="Public datasets → future ThingLink fields."
                href="/research"
                icon={BarChart3}
              />
            </div>
          </div>
        </div>

        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Mobile learner preview</p>
            <MobileScenarioPreview embedded />
          </div>
        </aside>
      </div>
    </div>
  );
}
