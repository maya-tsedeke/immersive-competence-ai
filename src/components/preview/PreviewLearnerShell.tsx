/** Wraps mobile preview routes with learner-facing title and instructions. */
export function PreviewLearnerShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-lg px-3 pb-2 pt-1 md:px-4">
      <h1 className="text-center text-base font-bold leading-snug text-white sm:text-lg">
        Learner Scenario: Workplace Safety Simulation
      </h1>
      <div className="mt-3 rounded-2xl border border-white/15 bg-white/5 p-4 text-sm text-slate-200 shadow-lg ring-1 ring-white/10">
        <p className="font-semibold text-white">Public dataset prototype</p>
        <p className="mt-2 leading-relaxed">
          This mobile learner activity generates{" "}
          <strong className="text-white">interaction evidence</strong> for teacher AI analysis. Complete the steps so a
          teacher can run “Run AI Analysis” on your trace in the dashboard.
        </p>
      </div>
      {children}
    </div>
  );
}
