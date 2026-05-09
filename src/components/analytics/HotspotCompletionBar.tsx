export function HotspotCompletionBar({
  label,
  percent,
}: {
  label: string;
  percent: number;
}) {
  return (
    <div>
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="font-medium text-slate-800">{label}</span>
        <span className="font-semibold text-slate-900">{percent}%</span>
      </div>
      <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-sky-400"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
