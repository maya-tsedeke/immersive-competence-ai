import Link from "next/link";
import { PrototypeBadge } from "@/components/layout/PrototypeBadge";
import { usingGeneratedData } from "@/lib/dataset";

export default function NotFound() {
  const gen = usingGeneratedData();
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--background)] px-6 py-16">
      <PrototypeBadge className="mb-6" usesGeneratedData={gen} />
      <h1 className="text-3xl font-semibold text-slate-900">Page not found</h1>
      <p className="mt-3 max-w-md text-center text-sm text-slate-600">
        That route does not exist in this research prototype. Return to the welcome page or the teacher
        dashboard.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-2xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
        >
          Welcome
        </Link>
        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 shadow-sm transition hover:border-slate-300"
        >
          Dashboard
        </Link>
      </div>
    </div>
  );
}
