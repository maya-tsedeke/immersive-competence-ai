"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Brain,
  FileText,
  LayoutDashboard,
  Map,
  Settings,
  Shapes,
  Users,
  Workflow,
} from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/ai-workflow", label: "AI Workflow", icon: Workflow },
  { href: "/scenarios", label: "Scenarios", icon: Shapes },
  { href: "/learners", label: "Learners", icon: Users },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/ai-insights", label: "AI Insights", icon: Brain },
  { href: "/reports", label: "Reports", icon: FileText },
  { href: "/research", label: "Research Mapping", icon: Map },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-[var(--border)] bg-white md:flex">
      <Link
        href="/"
        className="flex items-center gap-3 px-5 py-6 transition hover:bg-slate-50/80"
        title="Back to welcome"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]">
          <Shapes className="h-5 w-5" aria-hidden />
        </div>
        <div>
          <div className="text-sm font-semibold leading-tight text-slate-900">
            Immersive Competence AI
          </div>
          <div className="text-xs text-[var(--muted)]">UEF · ThingLink style</div>
        </div>
      </Link>

      <nav className="flex flex-1 flex-col gap-0.5 px-3 pb-4">
        {items.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                active
                  ? "bg-[var(--accent-soft)] text-[var(--accent)] shadow-sm"
                  : "text-slate-600 hover:bg-slate-50",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" aria-hidden />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-[var(--border)] px-4 py-4">
        <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-600 text-xs font-semibold text-white">
            UR
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-medium text-slate-900">
              Dr. UEF Researcher
            </div>
            <div className="truncate text-xs text-[var(--muted)]">Teacher view</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
