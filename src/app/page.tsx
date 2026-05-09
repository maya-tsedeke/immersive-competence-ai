import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Brain,
  FileText,
  FlaskConical,
  GitBranch,
  LayoutDashboard,
  MessageCircle,
  Route,
  Smartphone,
  Sparkles,
  Workflow,
} from "lucide-react";
import { PrototypeBadge } from "@/components/layout/PrototypeBadge";
import { XRScenarioViewer } from "@/components/xr/XRScenarioViewer";
import { usingGeneratedData } from "@/lib/dataset";

const pipelineSteps = [
  { title: "Public datasets", detail: "OULAD-style traces & open dialogue corpora" },
  { title: "Preprocessing", detail: "Alignment, featurisation, demo learner mapping" },
  { title: "Baseline ML models", detail: "Risk & quality proxies — not live telemetry" },
  { title: "AI insights", detail: "Explainable narratives & heuristic dialogue layers" },
  { title: "Dashboard JSON", detail: "Teacher-ready bundles for this prototype" },
  { title: "Future ThingLink validation", detail: "Anonymised exports & governance review" },
];

const whyItems = [
  {
    icon: BarChart3,
    title: "Teacher-facing explainable analytics",
    body: "Cohort KPIs, trends, and honest confidence framing — built for review, not automatic decisions.",
  },
  {
    icon: Route,
    title: "Learner pathway visibility",
    body: "Observe → Decide → Justify → Reflect: see progression like an immersive scenario workspace.",
  },
  {
    icon: Brain,
    title: "AI-assisted feedback suggestions",
    body: "Prototype suggestions ground discussion; educators stay responsible for interpretation.",
  },
  {
    icon: GitBranch,
    title: "Future ThingLink scenario data integration",
    body: "A clear mapping from public baselines toward hotspot-rich, immersive telemetry when available.",
  },
];

function LandingNav({ usesGenerated }: { usesGenerated: boolean }) {
  const navLinkClass =
    "rounded-xl px-3 py-2 text-sm font-medium text-[#0c1f3a] transition hover:bg-[#0c1f3a]/5 min-h-[44px] inline-flex items-center";
  const items = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/preview", label: "Mobile Demo" },
    { href: "/research", label: "Research Mapping" },
    { href: "/reports", label: "Reports" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl supports-[backdrop-filter]:bg-white/70">
      <div className="mx-auto max-w-6xl px-4 py-3 md:px-6 md:py-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <Link href="/" className="flex min-w-0 shrink-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/25 ring-1 ring-white/20">
              <Sparkles className="h-5 w-5" aria-hidden />
            </div>
            <div className="min-w-0">
              <p className="truncate text-[11px] font-semibold uppercase tracking-[0.18em] text-indigo-600">
                University of Eastern Finland
              </p>
              <p className="truncate text-base font-bold tracking-tight text-[#0c1f3a] md:text-lg">
                Immersive Competence AI
              </p>
            </div>
          </Link>

          <nav
            aria-label="Primary"
            className="flex flex-wrap items-center justify-start gap-1 sm:justify-center lg:justify-end"
          >
            {items.map((item) => (
              <Link key={item.href} href={item.href} className={navLinkClass}>
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex w-full flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center lg:w-auto lg:justify-end">
            <PrototypeBadge usesGeneratedData={usesGenerated} className="justify-center sm:justify-start" />
            <span
              className="inline-flex w-fit max-w-full items-center rounded-full border border-indigo-100 bg-gradient-to-r from-indigo-50 to-violet-50 px-3 py-1.5 text-[10px] font-bold uppercase leading-tight tracking-wide text-indigo-900 shadow-sm"
              title="Baseline models trained on public datasets for this demonstration. Not validated on real ThingLink telemetry yet."
            >
              AI baseline model · Public dataset prototype
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}

function KpiCard({
  value,
  label,
  icon: Icon,
}: {
  value: string;
  label: string;
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
}) {
  return (
    <div className="group rounded-2xl border border-slate-200/90 bg-white p-5 shadow-[var(--shadow)] transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-200/50">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/15 to-violet-500/15 text-indigo-700 ring-1 ring-indigo-100">
          <Icon className="h-5 w-5" aria-hidden />
        </div>
        <div className="min-w-0">
          <p className="text-2xl font-bold tracking-tight text-[#0c1f3a] md:text-[1.65rem]">{value}</p>
          <p className="mt-1 text-sm leading-snug text-slate-600">{label}</p>
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const usesGenerated = usingGeneratedData();

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-gradient-to-b from-white via-[#f4f6fb] to-slate-50 text-[#0c1f3a]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[480px] bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(99,102,241,0.14),transparent)]" />
      <div className="pointer-events-none absolute right-0 top-32 h-72 w-72 rounded-full bg-violet-200/30 blur-3xl" />
      <div className="pointer-events-none absolute left-0 top-96 h-64 w-64 rounded-full bg-sky-200/25 blur-3xl" />

      <LandingNav usesGenerated={usesGenerated} />

      <main className="relative mx-auto max-w-6xl px-4 pb-20 pt-8 md:px-6 md:pb-24 md:pt-12">
        {/* Hero */}
        <section className="grid items-stretch gap-10 lg:grid-cols-[minmax(0,1.02fr)_minmax(0,0.98fr)] lg:gap-12 xl:gap-14">
          <div className="flex flex-col justify-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">UEF research prototype</p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight text-[#0c1f3a] sm:text-5xl lg:text-[2.75rem] lg:leading-[1.1]">
              Immersive Competence AI
            </h1>
            <p className="mt-4 text-lg font-semibold text-slate-800 sm:text-xl">
              AI-assisted competence analytics for immersive learning scenarios
            </p>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-600">
              <strong className="font-semibold text-[#0c1f3a]">Public dataset prototype.</strong>{" "}
              AI-assisted insight only; teacher remains responsible for interpretation; not validated on real ThingLink
              telemetry yet.
            </p>

            <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-slate-200/90 bg-white/70 p-4 shadow-sm ring-1 ring-slate-100 sm:flex-row sm:items-center">
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500 sm:w-24 sm:shrink-0">
                Pick a role
              </p>
              <div className="flex flex-1 flex-col gap-2 sm:flex-row">
                <Link
                  href="/preview"
                  className="inline-flex min-h-[48px] flex-1 items-center justify-center rounded-xl bg-[#0c1f3a] px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-[#152a4a]"
                >
                  I am a Learner
                </Link>
                <Link
                  href="/dashboard"
                  className="inline-flex min-h-[48px] flex-1 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-center text-sm font-semibold text-[#0c1f3a] transition hover:bg-slate-50"
                >
          I am a Teacher
                </Link>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link
                href="/dashboard"
                className="inline-flex min-h-[52px] flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-7 py-3.5 text-sm font-semibold text-white shadow-xl shadow-indigo-500/25 transition hover:from-indigo-700 hover:to-violet-700 hover:shadow-indigo-500/35 active:scale-[0.99] sm:flex-none sm:px-8"
              >
                <LayoutDashboard className="h-4 w-4 shrink-0" aria-hidden />
                Open Teacher Dashboard
                <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
              </Link>
              <Link
                href="/preview"
                className="inline-flex min-h-[52px] flex-1 items-center justify-center gap-2 rounded-2xl border-2 border-slate-200 bg-white px-7 py-3.5 text-sm font-semibold text-[#0c1f3a] shadow-md transition hover:border-slate-300 hover:bg-slate-50 active:scale-[0.99] sm:flex-none sm:px-8"
              >
                <Smartphone className="h-4 w-4 shrink-0" aria-hidden />
                Preview Mobile Learner Scenario
              </Link>
              <Link
                href="/research"
                className="inline-flex min-h-[52px] flex-1 items-center justify-center gap-2 rounded-2xl border border-indigo-200/80 bg-indigo-50/80 px-7 py-3.5 text-sm font-semibold text-indigo-950 shadow-sm transition hover:bg-indigo-100 active:scale-[0.99] sm:flex-none sm:px-8"
              >
                <FlaskConical className="h-4 w-4 shrink-0" aria-hidden />
                View Research Mapping
              </Link>
            </div>

            <p className="mt-5 text-xs leading-relaxed text-slate-500">
              Not validated on real ThingLink exports yet. Optional cohort data from{" "}
              <code className="rounded-md bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] text-slate-700">
                src/lib/generated
              </code>
              .
            </p>
          </div>

          {/* XR-style immersive preview (shared learner canvas) */}
          <div className="flex min-w-0 flex-col justify-center lg:pl-2">
            <XRScenarioViewer variant="hero" />
            <p className="mt-3 text-center text-[11px] text-slate-500">
              360° / XR-style learning scene · ThingLink-inspired · research demonstration only
            </p>
          </div>
        </section>

        {/* KPI preview */}
        <section className="mt-14 md:mt-20">
          <div className="mb-6 md:mb-8">
            <h2 className="text-xl font-bold text-[#0c1f3a] md:text-2xl">Dataset &amp; model scale (public baselines)</h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Illustrative scale for the OULAD + dialogue proof-of-concept referenced in the research narrative — not live
              ThingLink production counts.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard value="32,593" label="Learning analytics records" icon={BarChart3} />
            <KpiCard value="47,234" label="Educational dialogue conversations" icon={MessageCircle} />
            <KpiCard value="28" label="Publication-ready figures" icon={FileText} />
            <KpiCard value="End-to-end" label="Baseline AI models trained" icon={Workflow} />
          </div>
        </section>

        {/* Pipeline */}
        <section className="mt-14 md:mt-20" id="pipeline">
          <div className="mb-6 md:mb-8">
            <h2 className="text-xl font-bold text-[#0c1f3a] md:text-2xl">Research pipeline</h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Public datasets → preprocessing → baseline ML models → AI insights → dashboard JSON → future ThingLink
              validation
            </p>
          </div>
          <div className="rounded-3xl border border-slate-200/90 bg-white p-5 shadow-[var(--shadow)] md:p-8">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {pipelineSteps.map((step, index) => (
                <div
                  key={step.title}
                  className="relative rounded-2xl border border-slate-100 bg-gradient-to-br from-slate-50/80 to-white p-4 ring-1 ring-slate-100"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
                    {index + 1}
                  </div>
                  <p className="mt-3 text-sm font-bold text-[#0c1f3a]">{step.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-600">{step.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why */}
        <section className="mt-14 md:mt-20" id="why">
          <div className="mb-6 md:mb-8">
            <h2 className="text-xl font-bold text-[#0c1f3a] md:text-2xl">Why this matters</h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              A credible bridge from open-data baselines to immersive, hotspot-rich analytics — without overclaiming
              validation.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {whyItems.map((item) => (
              <div
                key={item.title}
                className="flex gap-4 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-[var(--shadow)] transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-700 ring-1 ring-indigo-100">
                  <item.icon className="h-6 w-6" aria-hidden />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#0c1f3a]">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Honesty strip + final CTA */}
        <section className="mt-14 md:mt-20">
          <div className="rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-50/90 via-white to-violet-50/50 p-6 shadow-[var(--shadow)] md:p-10">
            <h2 className="text-lg font-bold text-[#0c1f3a] md:text-xl">Research honesty</h2>
            <ul className="mt-4 space-y-2 text-sm leading-relaxed text-slate-700">
              <li className="flex gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500" />
                <span>
                  <strong className="text-[#0c1f3a]">Public dataset prototype</strong> — mappings are illustrative until
                  anonymised ThingLink exports are available.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500" />
                <span>
                  <strong className="text-[#0c1f3a]">Not validated on real ThingLink telemetry yet.</strong>
                </span>
              </li>
              <li className="flex gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500" />
                <span>
                  <strong className="text-[#0c1f3a]">Teacher remains responsible for interpretation</strong> — AI-assisted
                  insight supports dialogue, not replacement judgement.
                </span>
              </li>
            </ul>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link
                href="/dashboard"
                className="inline-flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-2xl bg-[#0c1f3a] px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-[#152a4a]"
              >
                Open Teacher Dashboard
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link
                href="/preview"
                className="inline-flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-2xl border-2 border-[#0c1f3a]/15 bg-white px-6 py-3 text-sm font-semibold text-[#0c1f3a] transition hover:bg-slate-50"
              >
                Mobile Demo
              </Link>
              <Link
                href="/research"
                className="inline-flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-2xl border border-indigo-200 bg-white px-6 py-3 text-sm font-semibold text-indigo-950 transition hover:bg-indigo-50"
              >
                Research Mapping
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white/80 py-8 text-center text-xs text-slate-500 backdrop-blur-sm">
        <p>Immersive Competence AI · University of Eastern Finland · ThingLink-inspired research demonstration</p>
      </footer>
    </div>
  );
}
