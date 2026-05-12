import type { AiAnalysisBundle, DataProvenanceKind } from "@/lib/types";
import { ProvenanceBadge } from "@/components/ai/ProvenanceBadge";

export function AIEvidenceCard({
  bundle,
  provenance,
}: {
  bundle: AiAnalysisBundle;
  provenance: DataProvenanceKind;
}) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-[var(--shadow)]">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-slate-900">AI evidence &amp; method</p>
          <p className="mt-1 text-xs text-[var(--muted)]">
            Learner ID: <span className="font-mono font-semibold text-slate-800">{bundle.learnerId}</span>
          </p>
        </div>
        <ProvenanceBadge kind={provenance} />
      </div>

      <div className="mt-4 space-y-4 text-sm text-slate-700">
        <section>
          <p className="text-xs font-bold uppercase tracking-wide text-[var(--muted)]">Source (prototype)</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>OULAD learning-analytics baseline - feedback-need indicator</li>
            <li>Education Dialogue heuristic model - reflection / reasoning / difficulty text</li>
            <li>Generated dashboard JSON when present</li>
            <li>Learner scenario interaction trace or ThingLink-style pilot events</li>
          </ul>
        </section>

        <section>
          <p className="text-xs font-bold uppercase tracking-wide text-[var(--muted)]">Input evidence</p>
          <ul className="mt-2 space-y-1 rounded-xl bg-slate-50 px-3 py-2 font-mono text-xs leading-relaxed text-slate-800">
            {bundle.evidenceLines.map((line, i) => (
              <li key={i}>{line}</li>
            ))}
          </ul>
        </section>

        <section>
          <p className="text-xs font-bold uppercase tracking-wide text-[var(--muted)]">Model / method</p>
          <p className="mt-1 leading-relaxed">{bundle.methodNote}</p>
          <p className="mt-2 text-xs text-[var(--muted)]">
            Files referenced: {bundle.sourceFiles.join(" · ") || "—"}
          </p>
        </section>

        <section>
          <p className="text-xs font-bold uppercase tracking-wide text-[var(--muted)]">Outputs (AI-assisted insight)</p>
          <dl className="mt-2 grid gap-2 sm:grid-cols-2">
            <div className="rounded-lg bg-indigo-50/80 px-3 py-2">
              <dt className="text-[10px] font-bold uppercase text-indigo-800">Feedback need</dt>
              <dd className="font-semibold text-slate-900">{bundle.riskIndicator}</dd>
            </div>
            <div className="rounded-lg bg-indigo-50/80 px-3 py-2">
              <dt className="text-[10px] font-bold uppercase text-indigo-800">Reflection quality</dt>
              <dd className="font-semibold text-slate-900">{bundle.reflectionQuality}</dd>
            </div>
            <div className="rounded-lg bg-indigo-50/80 px-3 py-2">
              <dt className="text-[10px] font-bold uppercase text-indigo-800">Reasoning depth</dt>
              <dd className="font-semibold text-slate-900">{bundle.reasoningDepth}</dd>
            </div>
            <div className="rounded-lg bg-indigo-50/80 px-3 py-2">
              <dt className="text-[10px] font-bold uppercase text-indigo-800">Prototype confidence</dt>
              <dd className="font-semibold text-slate-900">{bundle.prototypeConfidence}</dd>
            </div>
          </dl>
          <p className="mt-2 text-xs text-[var(--muted)]">
            <strong className="text-slate-700">Note:</strong> Prototype confidence (0–1) estimates how much signal the
            heuristic layer had from dialogue / risk / trace / demo events. It is{" "}
            <strong className="text-slate-700">not</strong> the same number as the header competence %.
          </p>
          <p className="mt-3 text-sm">
            <strong>Detected learning difficulty:</strong> {bundle.detectedLearningDifficulty}
          </p>
          <p className="mt-2 text-sm">
            <strong>Suggested teacher action:</strong> {bundle.suggestedTeacherAction}
          </p>
        </section>

        <p className="rounded-lg border border-amber-100 bg-amber-50 px-3 py-2 text-xs text-amber-950">
          <strong>Limitation:</strong> AI-assisted insight only. Teacher review required. Public dataset prototype.
        </p>
      </div>
    </div>
  );
}
