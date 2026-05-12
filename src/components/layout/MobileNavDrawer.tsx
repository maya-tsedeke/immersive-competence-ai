"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { Shapes, X } from "lucide-react";
import { MAIN_NAV_ITEMS } from "@/components/layout/navConfig";
import { cn } from "@/lib/utils";

export function MobileNavDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const pathRef = useRef(pathname);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (pathRef.current !== pathname) {
      pathRef.current = pathname;
      onClose();
    }
  }, [pathname, onClose]);

  if (!open) return null;

  return (
    <div
      id="mobile-nav-drawer"
      className="fixed inset-0 z-[60] md:hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Main menu"
    >
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-[2px]"
        aria-label="Close menu"
        onClick={onClose}
      />
      <div className="absolute inset-y-0 left-0 flex w-[min(20.5rem,92vw)] max-h-[100dvh] flex-col bg-white shadow-2xl ring-1 ring-black/10">
        <div className="flex shrink-0 items-center justify-between gap-2 border-b border-[var(--border)] px-3 py-2.5">
          <Link
            href="/"
            className="flex min-w-0 items-center gap-2.5 rounded-xl py-1 pr-2 transition hover:bg-slate-50"
            onClick={onClose}
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--accent-soft)] text-[var(--accent)]">
              <Shapes className="h-4 w-4" aria-hidden />
            </div>
            <div className="min-w-0 text-left">
              <div className="truncate text-sm font-semibold leading-tight text-slate-900">Immersive Competence AI</div>
              <div className="truncate text-[11px] text-[var(--muted)]">UEF · ThingLink style</div>
            </div>
          </Link>
          <button
            type="button"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm"
            aria-label="Close menu"
            onClick={onClose}
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>

        <nav className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 py-2" aria-label="App sections">
          <ul className="flex flex-col gap-0.5 pb-[max(0.5rem,env(safe-area-inset-bottom,0px))]">
            {MAIN_NAV_ITEMS.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex min-h-[44px] items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition",
                      active
                        ? "bg-[var(--accent-soft)] text-[var(--accent)] shadow-sm"
                        : "text-slate-600 active:bg-slate-100",
                    )}
                    onClick={onClose}
                  >
                    <Icon className="h-4 w-4 shrink-0" aria-hidden />
                    <span className="leading-snug">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="shrink-0 border-t border-[var(--border)] px-3 py-2.5">
          <div className="flex items-center gap-2.5 rounded-xl bg-slate-50 px-2.5 py-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-semibold text-white">
              UR
            </div>
            <div className="min-w-0">
              <div className="truncate text-xs font-medium text-slate-900">Dr. UEF Researcher</div>
              <div className="truncate text-[10px] text-[var(--muted)]">Teacher view</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
