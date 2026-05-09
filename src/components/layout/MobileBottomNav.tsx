"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Brain, Home, Users, Shapes, Workflow } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/preview", label: "Scenario", icon: Shapes },
  { href: "/learners", label: "Learners", icon: Users },
  { href: "/ai-workflow", label: "Flow", icon: Workflow },
  { href: "/ai-insights", label: "AI", icon: Brain },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--border)] bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
      aria-label="Primary"
    >
      <div className="mx-auto flex max-w-lg items-center justify-between gap-1 px-2 py-2">
        {items.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-lg px-1 py-1 text-[10px] font-medium transition",
                active ? "text-[var(--accent)]" : "text-slate-500",
              )}
            >
              <Icon className="h-5 w-5" aria-hidden />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
