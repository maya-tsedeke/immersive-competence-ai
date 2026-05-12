"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const roles = [
  { href: "/preview", label: "Learner", match: (p: string) => p.startsWith("/preview") },
  {
    href: "/dashboard",
    label: "Teacher",
    match: (p: string) =>
      p.startsWith("/dashboard") ||
      p.startsWith("/learners") ||
      p.startsWith("/ai-workflow") ||
      p.startsWith("/analytics") ||
      p.startsWith("/modules") ||
      p.startsWith("/scenarios") ||
      p.startsWith("/reports") ||
      p.startsWith("/settings") ||
      p.startsWith("/nav"),
  },
  {
    href: "/research",
    label: "Researcher",
    match: (p: string) => p.startsWith("/research") || p.startsWith("/datasets"),
  },
] as const;

export function RoleSwitch({ compact }: { compact?: boolean }) {
  const pathname = usePathname();
  return (
    <div
      className={cn(
        "flex items-center gap-0.5 rounded-xl border border-slate-200 bg-slate-50 p-1 shadow-sm",
        compact ? "max-w-full flex-nowrap overflow-x-auto" : "flex-wrap",
      )}
      role="tablist"
      aria-label="Demo role shortcuts"
    >
      {roles.map((r) => {
        const active = r.match(pathname);
        return (
          <Link
            key={r.href}
            href={r.href}
            role="tab"
            aria-selected={active}
            className={cn(
              "shrink-0 rounded-lg font-bold uppercase tracking-wide transition inline-flex items-center justify-center",
              compact
                ? "min-h-[36px] px-2 py-1.5 text-[10px]"
                : "min-h-[40px] px-3 py-2 text-[11px]",
              active ? "bg-white text-indigo-700 shadow-sm ring-1 ring-slate-200/80" : "text-slate-600 hover:bg-white/70",
            )}
          >
            {r.label}
          </Link>
        );
      })}
    </div>
  );
}
