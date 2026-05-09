export function TeacherRecommendationCard({ items }: { items: string[] }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-[var(--shadow)]">
      <p className="text-sm font-semibold text-slate-900">Recommended teacher actions</p>
      <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-slate-700">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
