import {
  futureThingLinkFields,
  researchMappings,
  researchPipelineSteps,
} from "@/lib/data/researchMappings";
import { ModelInfoCard } from "@/components/dashboard/ModelInfoCard";
import {
  FutureThingLinkSection,
  ResearchPipelineDiagram,
} from "@/components/research/ResearchPipeline";
import { ResearchMappingTable } from "@/components/research/ResearchMappingTable";

export default function ResearchPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-white to-indigo-50/50 p-6 shadow-[var(--shadow)]">
        <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">UEF + ThingLink research narrative</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">Public dataset proof-of-concept → future integration</h1>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-700">
          This meeting build shows how open learning traces can populate the same dashboard surfaces we want for immersive,
          hotspot-rich scenarios. It is a <strong>public dataset prototype</strong>: not validated on real ThingLink data
          yet, not a substitute for educator judgement, and not an automatic grading decision.
        </p>
      </div>

      <div className="rounded-2xl border border-indigo-100 bg-white p-5 shadow-[var(--shadow)]">
        <p className="text-sm font-semibold text-slate-900">AI objective</p>
        <p className="mt-2 text-sm leading-relaxed text-slate-700">
          The AI objective is to transform learner interaction traces and reflection responses into teacher-facing
          competence indicators. The prototype detects learner-risk signals, reflection quality, reasoning depth, possible
          learning difficulty, and suggests teacher feedback. The teacher remains responsible for interpretation.
        </p>
      </div>

      <ModelInfoCard />

      <ResearchPipelineDiagram steps={researchPipelineSteps} />

      <div className="rounded-2xl border border-amber-100 bg-amber-50/90 p-5 text-sm text-amber-950 shadow-sm">
        <p className="font-semibold text-amber-900">Limitations (research honesty)</p>
        <ul className="mt-3 list-disc space-y-2 pl-5 leading-relaxed">
          <li>Public datasets are not ThingLink telemetry; mappings are conceptual.</li>
          <li>Dialogue labels are heuristic proof-of-concept outputs — not validated ground truth.</li>
          <li>OULAD and dialogue learners are synthetically mapped for demo purposes only.</li>
          <li>Real validation requires anonymised ThingLink exports and governance review.</li>
        </ul>
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-[var(--shadow)]">
        <h2 className="text-sm font-semibold text-slate-900">Dataset transfer logic</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-700">
          The table below links open-field semantics to future ThingLink-style exports. A production path would replace
          generated JSON with governed, anonymised scenario logs while preserving these dashboard concepts.
        </p>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-slate-900">Mapping table</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">
          OULAD + Education dialogue → immersive, hotspot-aware analytics (illustrative).
        </p>
        <div className="mt-4 overflow-x-auto md:overflow-visible">
          <ResearchMappingTable rows={researchMappings} />
        </div>
      </div>

      <FutureThingLinkSection fields={futureThingLinkFields} />
    </div>
  );
}
