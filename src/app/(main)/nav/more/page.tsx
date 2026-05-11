import Link from "next/link";
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
  Layers,
  Database,
  BookOpen,
} from "lucide-react";

const links = [
  { href: "/learners", label: "Learners", icon: Users },
  { href: "/modules", label: "Learning Modules", icon: Layers },
  { href: "/datasets", label: "Datasets", icon: Database },
  { href: "/reports", label: "Reports", icon: FileText },
  { href: "/research", label: "Research Mapping", icon: Map },
  { href: "/ai-insights", label: "AI Insights", icon: Brain },
  { href: "/scenarios", label: "Scenario Analytics", icon: Shapes },
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/preview", label: "Mobile Learner Demo", icon: BookOpen },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/ai-workflow", label: "AI Workflow", icon: Workflow },
];

export default function MobileMoreNavPage() {
  return (
    <div className="mx-auto max-w-lg space-y-4 pb-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">More</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">All destinations</h1>
        <p className="mt-2 text-sm text-slate-600">
          Full navigation for small screens. Primary tabs remain on the bottom bar.
        </p>
      </div>
      <ul className="grid gap-2">
        {links.map(({ href, label, icon: Icon }) => (
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
