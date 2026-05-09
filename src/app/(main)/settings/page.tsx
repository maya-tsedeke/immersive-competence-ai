export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Settings</p>
        <h1 className="mt-1 text-3xl font-semibold text-slate-900">Workspace preferences</h1>
        <p className="mt-2 text-sm text-slate-600">
          Authentication and live data connectors are out of scope for this research build.
        </p>
      </div>
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-[var(--shadow)]">
        Future iterations can include institution branding, roster sync, and ThingLink API keys. For now,
        the prototype ships with static mock data only.
      </div>
    </div>
  );
}
