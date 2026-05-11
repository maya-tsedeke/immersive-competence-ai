import Link from "next/link";
import { PrototypeBadge } from "@/components/layout/PrototypeBadge";
import { usingGeneratedData } from "@/lib/dataset";
import { ArrowLeft } from "lucide-react";

export default async function PreviewLayout({ children }: { children: React.ReactNode }) {
  const usesGenerated = usingGeneratedData();

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#0b1220] lg:bg-slate-100">
      <div className="mx-auto flex max-w-lg flex-wrap items-center justify-between gap-2 px-4 py-3 text-white lg:max-w-6xl lg:text-slate-800">
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/dashboard"
            className="inline-flex min-h-[44px] items-center gap-2 text-sm font-semibold text-slate-200 hover:text-white lg:text-slate-700 lg:hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Teacher view
          </Link>
          <span className="hidden text-slate-500 sm:inline lg:text-slate-400" aria-hidden>
            ·
          </span>
          <Link
            href="/"
            className="min-h-[44px] text-sm font-semibold text-slate-300 hover:text-white lg:text-slate-600 lg:hover:text-slate-900"
          >
            Welcome
          </Link>
          <span className="hidden text-slate-500 sm:inline lg:text-slate-400" aria-hidden>
            ·
          </span>
          <Link
            href="/preview/xr"
            className="min-h-[44px] text-sm font-semibold text-indigo-300 hover:text-white lg:text-indigo-700 lg:hover:text-indigo-900"
          >
            XR
          </Link>
        </div>
        <PrototypeBadge
          usesGeneratedData={usesGenerated}
          className="border-white/20 bg-white/10 text-[10px] text-slate-100 lg:border-slate-200 lg:bg-white lg:text-slate-600"
        />
      </div>
      {children}
    </div>
  );
}
