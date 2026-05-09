export function AIReasoningSummaryCard({ body }: { body: string }) {
  return (
    <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-white p-5 shadow-[var(--shadow)]">
      <p className="text-sm font-semibold text-slate-900">AI reasoning summary</p>
      <p className="mt-3 text-sm leading-relaxed text-slate-700">{body}</p>
    </div>
  );
}
