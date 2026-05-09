export function DateRangeSelector() {
  return (
    <select
      aria-label="Date range"
      className="w-full rounded-xl border border-dashed border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-800"
      defaultValue="may-2025"
    >
      <option value="may-2025">May 1 – May 31, 2025</option>
      <option value="last-30">Last 30 days</option>
      <option value="spring">Spring cohort</option>
    </select>
  );
}
