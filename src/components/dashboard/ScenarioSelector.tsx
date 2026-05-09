import { scenarios, defaultScenarioId } from "@/lib/data/scenarios";

export function ScenarioSelector() {
  return (
    <select
      aria-label="Scenario"
      className="w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-sm font-medium text-slate-800 shadow-sm"
      defaultValue={defaultScenarioId}
    >
      {scenarios.map((s) => (
        <option key={s.id} value={s.id}>
          {s.title}
        </option>
      ))}
    </select>
  );
}
