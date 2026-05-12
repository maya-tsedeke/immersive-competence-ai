/** Wraps mobile preview routes with learner-facing title and instructions. */
export function PreviewLearnerShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-lg px-3 pb-2 pt-1 md:max-w-6xl md:px-6">
      <h1 className="text-center text-base font-bold leading-snug text-white sm:text-lg">
        Learner Scenario: Workplace Safety Simulation
      </h1>
      <div className="mt-3 rounded-2xl border border-white/15 bg-white/5 p-4 text-sm text-slate-200 shadow-lg ring-1 ring-white/10">
        <p className="font-semibold text-white">Public dataset prototype</p>
        <p className="mt-2 leading-relaxed">
          <strong className="text-white">Phones</strong> use the compact mobile pathway; <strong className="text-white">tablets and desktops</strong> (
          768px+) open a wider ThingLink-style layout with the same steps — Decide, Justify, and Reflect with full text
          boxes under the scene. Evidence feeds teacher AI analysis the same way.
        </p>
      </div>
      {children}
    </div>
  );
}
