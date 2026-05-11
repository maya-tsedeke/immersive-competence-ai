/** Wraps /preview routes: dark compact header on phones, light wide header on large screens. */
export function PreviewLearnerShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-lg px-3 pb-2 pt-1 md:px-4 lg:max-w-6xl lg:pb-6 lg:pt-2">
      <p className="hidden text-center text-xs font-medium text-slate-500 lg:block">
        Desktop layout — same learner flow; bottom tab bar is hidden; use the links above to leave the scenario.
      </p>
      <h1 className="text-center text-base font-bold leading-snug text-white sm:text-lg lg:text-2xl lg:text-slate-900">
        Learner scenario: Workplace Safety Simulation
      </h1>
      <div className="mt-3 rounded-2xl border border-white/15 bg-white/5 p-4 text-sm text-slate-200 shadow-lg ring-1 ring-white/10 lg:border-slate-200 lg:bg-white lg:text-slate-700 lg:shadow-md lg:ring-slate-100">
        <p className="font-semibold text-white lg:text-slate-900">Public dataset prototype</p>
        <p className="mt-2 leading-relaxed">
          This learner activity generates <strong className="text-white lg:text-slate-900">interaction evidence</strong>{" "}
          for teacher AI analysis. Complete the steps so a teacher can run “Run AI Analysis” on your trace in the
          dashboard.
        </p>
      </div>
      {children}
    </div>
  );
}
