import Link from "next/link";
import {
  futureThingLinkFields,
  researchMappings,
  researchPipelineSteps,
} from "@/lib/data/researchMappings";
import {
  demoScriptSteps,
  learningEnvironmentModelTargets,
  pilotEvaluationChecklist,
  scientificAlignmentSources,
  scientificWorkPackage,
  thingLinkPilotSchemaRows,
} from "@/lib/data/learningEnvironmentResearch";
import { ModelInfoCard } from "@/components/dashboard/ModelInfoCard";
import { ResearchDemoExportPanelLazy } from "@/components/research/ResearchDemoExportPanelLazy";
import {
  DemoScriptPanel,
  FutureThingLinkSection,
  ModelTargetsSection,
  PilotSchemaSection,
  ResearchPipelineDiagram,
  ScientificAlignmentSection,
  ScientificWorkPackageSection,
} from "@/components/research/ResearchPipeline";
import { ResearchMappingTable } from "@/components/research/ResearchMappingTable";

export default function ResearchPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-white to-indigo-50/50 p-6 shadow-[var(--shadow)]">
        <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">
          UEF + ThingLink learning environment narrative
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">
          Immersive learning analytics: public baseline to pilot validation
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-700">
          This research page frames the prototype as a general immersive learning environment, not a healthcare-specific
          system. It shows how hotspot interaction, learner pathway progress, responses, and reflections can become
          teacher-reviewed competence evidence. Public datasets remain a baseline; scientific claims require anonymised
          ThingLink-style pilot data and teacher labels.
        </p>
      </div>

      <div className="rounded-2xl border border-indigo-100 bg-white p-5 shadow-[var(--shadow)]">
        <p className="text-sm font-semibold text-slate-900">AI objective</p>
        <p className="mt-2 text-sm leading-relaxed text-slate-700">
          Transform immersive interaction traces and reflection responses into explainable, teacher-facing learning
          indicators: feedback need, engagement pattern, reflection quality, reasoning depth, competence evidence level,
          and suggested teacher action. The teacher remains responsible for review, interpretation, and final decision.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[var(--shadow)]">
        <p className="text-sm font-semibold text-slate-900">ThingLink-style demo bridge</p>
        <p className="mt-2 text-sm leading-relaxed text-slate-700">
          For a live presentation, show the current learner scene beside a real ThingLink scenario or ThingLink learning
          platform example. This prototype does not require ThingLink credentials; anonymised pilot exports can be
          imported below when available.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href="/preview"
            className="inline-flex min-h-[44px] items-center rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Open learner demo
          </Link>
          <Link
            href="/ai-workflow"
            className="inline-flex min-h-[44px] items-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-900 hover:bg-slate-50"
          >
            Open AI workflow
          </Link>
          <a
            href="https://www.thinglink.com/learning"
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-[44px] items-center rounded-xl border border-indigo-200 bg-indigo-50 px-4 text-sm font-semibold text-indigo-950 hover:bg-indigo-100"
          >
            ThingLink learning platform
          </a>
        </div>
      </div>

      <DemoScriptPanel steps={demoScriptSteps} />

      <ResearchDemoExportPanelLazy />

      <ModelTargetsSection targets={learningEnvironmentModelTargets} />

      <PilotSchemaSection rows={thingLinkPilotSchemaRows} />

      <ScientificWorkPackageSection questions={scientificWorkPackage} checklist={pilotEvaluationChecklist} />

      <ScientificAlignmentSection sources={scientificAlignmentSources} />

      <ModelInfoCard />

      <ResearchPipelineDiagram steps={researchPipelineSteps} />

      <div className="rounded-2xl border border-amber-100 bg-amber-50/90 p-5 text-sm text-amber-950 shadow-sm">
        <p className="font-semibold text-amber-900">Limitations and governance</p>
        <ul className="mt-3 list-disc space-y-2 pl-5 leading-relaxed">
          <li>Public datasets are not ThingLink learning-environment telemetry; mappings are conceptual.</li>
          <li>Dialogue labels are heuristic proof-of-concept outputs, not validated ground truth.</li>
          <li>ThingLink-style pilot imports must be anonymised before they enter the prototype.</li>
          <li>AI recommendations are advisory and require teacher review or override.</li>
        </ul>
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-[var(--shadow)]">
        <h2 className="text-sm font-semibold text-slate-900">Dataset transfer logic</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-700">
          The table below links public learning analytics semantics to future ThingLink-style pilot exports. A validation
          path replaces generated JSON with governed, anonymised learning-event logs while preserving the same teacher
          review workflow.
        </p>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-slate-900">Mapping table</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">
          OULAD + Education dialogue to immersive, hotspot-aware learning analytics.
        </p>
        <div className="mt-4 overflow-x-auto md:overflow-visible">
          <ResearchMappingTable rows={researchMappings} />
        </div>
      </div>

      <FutureThingLinkSection fields={futureThingLinkFields} />
    </div>
  );
}
