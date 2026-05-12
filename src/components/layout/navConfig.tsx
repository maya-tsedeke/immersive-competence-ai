import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Brain,
  Database,
  FileText,
  GraduationCap,
  LayoutDashboard,
  Layers,
  Map,
  Settings,
  Users,
  Workflow,
} from "lucide-react";

/** Primary app destinations — shared by desktop sidebar and mobile drawer. */
export const MAIN_NAV_ITEMS: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/ai-workflow", label: "AI Workflow", icon: Workflow },
  { href: "/preview", label: "Learner scenario", icon: GraduationCap },
  { href: "/modules", label: "Learning Modules", icon: Layers },
  { href: "/scenarios", label: "Scenario Analytics", icon: Shapes },
  { href: "/learners", label: "Learners", icon: Users },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/ai-insights", label: "AI Insights", icon: Brain },
  { href: "/datasets", label: "Datasets", icon: Database },
  { href: "/reports", label: "Reports", icon: FileText },
  { href: "/research", label: "Research Mapping", icon: Map },
  { href: "/settings", label: "Settings", icon: Settings },
];
