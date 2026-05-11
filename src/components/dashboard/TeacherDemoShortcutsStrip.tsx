import Link from "next/link";
import { ArrowRight, Brain, GraduationCap, UsersRound } from "lucide-react";

/**
 * Compact teacher strip — replaces the old phone mockup. Learner 360° lives on /preview only.
 */
export function TeacherDemoShortcutsStrip() {
  const links = [
    { href: "/preview", label: "Learner 360° demo", sub: "Hotspots & evidence", icon: GraduationCap },
    { href: "/ai-workflow", label: "AI workflow", sub: "Run analysis", icon: Brain },
    { href: "/learners", label: "Learners", sub: "Review rows", icon: UsersRound },
  ] as const;

  return (
    <div className="rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950 p-5 text-white shadow-lg ring-1 ring-white/10">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-sky-300/90">Teacher workspace</p>
          <p className="mt-1 text-base font-semibold text-white">Evidence loop — without a duplicate scene preview</p>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-slate-300">
            The immersive learner experience is only on{" "}
            <Link href="/preview" className="font-semibold text-white underline decoration-sky-400/80 underline-offset-2">
              /preview
            </Link>
            . This row is for quick jumps; scenario copy lives in AI Workflow, Learners, and Reports.
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          {links.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group inline-flex min-h-[48px] min-w-[140px] flex-1 flex-col justify-center rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-left transition hover:border-sky-400/40 hover:bg-white/10 sm:min-w-[160px] sm:flex-none"
            >
              <span className="flex items-center gap-2 text-xs font-bold text-white">
                <item.icon className="h-4 w-4 shrink-0 text-sky-300" aria-hidden />
                {item.label}
                <ArrowRight className="ml-auto h-3.5 w-3.5 opacity-60 transition group-hover:translate-x-0.5 group-hover:opacity-100" />
              </span>
              <span className="mt-0.5 text-[11px] text-slate-400">{item.sub}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
