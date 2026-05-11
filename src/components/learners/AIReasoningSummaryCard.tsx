export function AIReasoningSummaryCard({ learnerId, body }: { learnerId?: string; body: string }) {
  return (
    <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-white p-5 shadow-[var(--shadow)]">
      <p className="text-sm font-semibold text-slate-900">AI reasoning summary</p>
      {learnerId ? (
        <p className="mt-1 text-xs font-medium text-indigo-800/90">
          About learner <span className="rounded-md bg-white/80 px-1.5 py-0.5 font-mono text-indigo-950">{learnerId}</span>
        </p>
      ) : null}
      <p className="mt-3 text-sm leading-relaxed text-slate-700">{body}</p>
    </div>
  );
}
