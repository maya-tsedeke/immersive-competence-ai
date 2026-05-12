import Link from "next/link";
import { MAIN_NAV_ITEMS } from "@/components/layout/navConfig";

export default function MobileMoreNavPage() {
  return (
    <div className="mx-auto max-w-lg space-y-4 pb-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">More</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">All destinations</h1>
        <p className="mt-2 text-sm text-slate-600">
          Same destinations as the <strong className="font-semibold text-slate-800">menu button</strong> in the top bar.
          Bottom tabs stay for one-tap jumps.
        </p>
      </div>
      <ul className="grid gap-2">
        {MAIN_NAV_ITEMS.map(({ href, label, icon: Icon }) => (
          <li key={href}>
            <Link
              href={href}
              className="flex min-h-[52px] items-center gap-3 rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-indigo-200 hover:bg-indigo-50/40"
            >
              <Icon className="h-5 w-5 shrink-0 text-indigo-600" aria-hidden />
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
