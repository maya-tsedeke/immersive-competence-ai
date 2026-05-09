"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import {
  BarChart3,
  BookOpen,
  ChartPie,
  Footprints,
  Glasses,
  Home,
  LayoutDashboard,
  Maximize2,
  Mic,
  PenLine,
  ScanLine,
  ShieldAlert,
  Sparkles,
  Target,
  X,
  Zap,
} from "lucide-react";
import {
  PATHWAY_STEPS,
  type PathwayStep,
  REQUIRED_HOTSPOT_ORDER,
  XR_HOTSPOTS,
  XR_PANORAMA_URL,
  XR_PANORAMA_WIDTH_MULT,
  type XRHotspotDefinition,
  type XRHotspotId,
} from "@/lib/xr/scenarioHotspots";
import { cn } from "@/lib/utils";
import { DEMO_MOBILE_LEARNER_ID } from "@/lib/learnerDemo/constants";
import type { LearnerDemoEvent } from "@/lib/learnerDemo/storage";
import { appendDemoActivity, getActivePreviewLearnerId, setActivePreviewLearnerId } from "@/lib/learnerDemo/demoLearnersStore";
import { saveLearnerDemoSubmission } from "@/lib/learnerDemo/storage";
import { analyzeAttemptFlags } from "@/lib/ai/demoScenarioAi";

export type XRViewerVariant = "hero" | "mobile" | "desktop";

export type XRPreviewTab = "mobile360" | "webxr" | "teacher";

export interface XRInteractionLogEntry {
  id: string;
  timestamp: string;
  hotspotId: string;
  hotspotLabel: string;
  step: PathwayStep;
  eventType: "hotspot_select" | "task_submit" | "immersive_toggle" | "hotspot_click" | "decision_answer";
}

const MC_OPTIONS = [
  "Clear the blocked aisle and tag the unstable pallets before moving through",
  "Proceed quickly; dim lighting is normal in warehouses",
  "Only report missing hard hats; aisle clutter is secondary",
  "No action needed if the path is partially clear",
];

const GUIDED_STEPS = [
  "Swipe or drag to look around the 360° hotspot-based learning scene.",
  "Tap a hotspot — labels show Hazard, Action, AI Hint, and Reflection.",
  "Answer the question: what is the safest action in this scene?",
  "Write your reflection and submit for teacher review.",
  "Review AI-assisted feedback (prototype only; teacher review required).",
];

function reflectionQualityLabel(reflection: string, submitted: boolean): string {
  if (!submitted) return "Pending — no submission yet";
  const len = reflection.trim().length;
  if (len > 120) return "Richer (prototype heuristic)";
  if (len > 45) return "Adequate (prototype heuristic)";
  return "Brief — prompt for evidence";
}

function riskMeta(visited: Set<XRHotspotId>, submitted: boolean): { text: string; cls: string } {
  if (!visited.has("hazard")) return { text: "Observation gap — hazard not opened", cls: "text-amber-200" };
  if (!submitted) return { text: "Incomplete — no submission recorded", cls: "text-amber-200" };
  return { text: "Demo flow completed (not a clinical score)", cls: "text-emerald-200" };
}

function newLogEntry(
  partial: Omit<XRInteractionLogEntry, "id" | "timestamp">,
): XRInteractionLogEntry {
  return {
    ...partial,
    id:
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `xr-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    timestamp: new Date().toISOString(),
  };
}

function HotspotMarker({
  hs,
  selected,
  visited,
  variant,
  pulse,
  onSelect,
}: {
  hs: XRHotspotDefinition;
  selected: boolean;
  visited: boolean;
  variant: XRViewerVariant;
  pulse?: boolean;
  onSelect: () => void;
}) {
  const HotspotIcon = hs.icon === "hazard" ? Zap : hs.icon === "action" ? BookOpen : hs.icon === "justify" ? PenLine : hs.icon === "reflect" ? Target : Sparkles;
  const size =
    variant === "hero"
      ? "h-10 w-10 min-h-[44px] min-w-[44px] text-[9px]"
      : "h-12 w-12 min-h-[48px] min-w-[48px] text-[10px]";
  return (
    <button
      type="button"
      onClick={onSelect}
      onPointerDown={(e) => e.stopPropagation()}
      className={cn(
        "absolute z-20 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full font-bold text-white shadow-xl ring-2 transition hover:scale-105 focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-300",
        hs.ringClass,
        size,
        visited && !selected && "opacity-85 ring-emerald-200",
        selected && "z-30 ring-4 ring-white",
        pulse && "ring-4 ring-amber-200 animate-[pulse_1.1s_ease-in-out_infinite]",
      )}
      style={{ left: `${hs.leftPct}%`, top: `${hs.topPct}%` }}
      aria-label={`Hotspot ${hs.label}, pathway ${hs.pathwayStep}`}
      aria-pressed={selected}
    >
      <HotspotIcon className="mb-0.5 h-3.5 w-3.5" aria-hidden />
      {hs.label}
    </button>
  );
}

function PathwayChips({ currentIndex, theme }: { currentIndex: number; theme: "light" | "dark" }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {PATHWAY_STEPS.map((step, i) => (
        <span
          key={step}
          className={cn(
            "rounded-lg px-2 py-1 text-[11px] font-semibold ring-1 transition",
            theme === "dark"
              ? i <= currentIndex
                ? "bg-white/15 text-white ring-white/25"
                : "bg-black/20 text-white/60 ring-white/10"
              : i <= currentIndex
                ? "bg-indigo-100 text-indigo-950 ring-indigo-200"
                : "bg-slate-100 text-slate-500 ring-slate-200",
          )}
        >
          {i + 1}. {step}
        </span>
      ))}
    </div>
  );
}

function InteractionTracePanel({ log, dark }: { log: XRInteractionLogEntry[]; dark: boolean }) {
  return (
    <div
      className={cn(
        "rounded-2xl border p-4",
        dark ? "border-white/10 bg-slate-900/70 text-white" : "border-[var(--border)] bg-white text-slate-900 shadow-sm",
      )}
    >
      <p className="text-sm font-semibold">Interaction log</p>
      <p className="mt-1 text-xs opacity-80">Prototype only — not real ThingLink telemetry.</p>
      <ul className="mt-3 max-h-44 space-y-2 overflow-y-auto text-xs font-mono leading-snug">
        {log.length === 0 ? <li className="opacity-60">No events yet.</li> : null}
        {[...log].reverse().map((e) => (
          <li key={e.id} className={cn("rounded-lg px-2 py-1.5", dark ? "bg-black/35" : "bg-slate-50")}>
            <span className="text-[10px] opacity-70">{new Date(e.timestamp).toLocaleTimeString()}</span> · {e.eventType} ·{" "}
            {e.hotspotLabel} · {e.step}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function XRScenarioViewer({
  variant,
  className,
  guidedPreview = false,
  scenarioLearnerId,
}: {
  variant: XRViewerVariant;
  className?: string;
  guidedPreview?: boolean;
  /** When set, evidence is stored under this learner id (demo store). */
  scenarioLearnerId?: string;
}) {
  const titleId = useId();
  const viewportRef = useRef<HTMLDivElement>(null);
  const [panPx, setPanPx] = useState(0);
  const drag = useRef<{ active: boolean; startX: number; startPan: number }>({
    active: false,
    startX: 0,
    startPan: 0,
  });

  const [selectedId, setSelectedId] = useState<XRHotspotId | null>(null);
  const [visited, setVisited] = useState<Set<XRHotspotId>>(() => new Set());
  const [pathwayIndex, setPathwayIndex] = useState(0);
  const [log, setLog] = useState<XRInteractionLogEntry[]>([]);
  const [showTask, setShowTask] = useState(false);
  const [mcChoice, setMcChoice] = useState<number | null>(null);
  const [reflection, setReflection] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [xrSupported, setXrSupported] = useState<boolean | null>(null);
  const [immersiveUi, setImmersiveUi] = useState(variant === "mobile");
  const [previewTab, setPreviewTab] = useState<XRPreviewTab>("mobile360");
  const [webXrChecked, setWebXrChecked] = useState(false);
  const [supportsImmersiveVr, setSupportsImmersiveVr] = useState(false);
  const [supportsImmersiveAr, setSupportsImmersiveAr] = useState(false);

  const guidedMobile = Boolean(guidedPreview && variant === "mobile" && previewTab === "mobile360");
  const [guidedScenarioStarted, setGuidedScenarioStarted] = useState(false);
  const [guidedStep, setGuidedStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [justification, setJustification] = useState("");
  const [demoEvents, setDemoEvents] = useState<LearnerDemoEvent[]>([]);
  const guidedStartMsRef = useRef<number | null>(null);
  const [activeLid, setActiveLid] = useState<string>(DEMO_MOBILE_LEARNER_ID);
  const [orderWarning, setOrderWarning] = useState("");
  const [justifyTapped, setJustifyTapped] = useState(false);
  const [reflectTapped, setReflectTapped] = useState(false);
  const [cssFullscreen, setCssFullscreen] = useState(false);
  const [scanHighlightId, setScanHighlightId] = useState<XRHotspotId | null>(null);

  useEffect(() => {
    const lid = scenarioLearnerId ?? getActivePreviewLearnerId();
    setActiveLid(lid);
    if (scenarioLearnerId) setActivePreviewLearnerId(scenarioLearnerId);
  }, [scenarioLearnerId]);

  useEffect(() => {
    const onFs = () => {
      if (typeof document !== "undefined" && !document.fullscreenElement) {
        setCssFullscreen(false);
      }
    };
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  const touchDrag = useRef<{ active: boolean; startX: number; startPan: number }>({
    active: false,
    startX: 0,
    startPan: 0,
  });

  const selectedHotspot = useMemo(
    () => (selectedId ? XR_HOTSPOTS.find((h) => h.id === selectedId) ?? null : null),
    [selectedId],
  );

  const appendLog = useCallback((entry: Omit<XRInteractionLogEntry, "id" | "timestamp">) => {
    setLog((prev) => [...prev.slice(-50), newLogEntry(entry)]);
  }, []);

  const pushDemoEvent = useCallback((partial: Omit<LearnerDemoEvent, "at">) => {
    const row: LearnerDemoEvent = { ...partial, at: new Date().toISOString() };
    setDemoEvents((prev) => [...prev, row]);
  }, []);

  const startGuidedScenario = useCallback(() => {
    setGuidedScenarioStarted(true);
    guidedStartMsRef.current = Date.now();
    setGuidedStep(1);
    setSubmitted(false);
    setMcChoice(null);
    setJustification("");
    setReflection("");
    setDemoEvents([]);
    setShowTask(false);
    setJustifyTapped(false);
    setReflectTapped(false);
  }, []);

  const clampPan = useCallback((next: number, width: number) => {
    const max = 0;
    const min = -(width * (XR_PANORAMA_WIDTH_MULT - 1));
    return Math.min(max, Math.max(min, next));
  }, []);

  const onPointerDownPan = (e: React.PointerEvent) => {
    if (guidedPreview && variant === "mobile" && previewTab === "webxr") return;
    drag.current = { active: true, startX: e.clientX, startPan: panPx };
    (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
  };
  const onPointerMovePan = (e: React.PointerEvent) => {
    if (!drag.current.active) return;
    const w = viewportRef.current?.clientWidth ?? 320;
    const dx = e.clientX - drag.current.startX;
    setPanPx(clampPan(drag.current.startPan + dx, w));
  };
  const endPan = (e: React.PointerEvent) => {
    drag.current.active = false;
    try {
      (e.currentTarget as HTMLDivElement).releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
  };

  const onTouchStart = (e: React.TouchEvent) => {
    if (guidedPreview && variant === "mobile" && previewTab === "webxr") return;
    if (e.touches.length !== 1) return;
    touchDrag.current = { active: true, startX: e.touches[0].clientX, startPan: panPx };
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (!touchDrag.current.active || e.touches.length !== 1) return;
    const w = viewportRef.current?.clientWidth ?? 320;
    const dx = e.touches[0].clientX - touchDrag.current.startX;
    setPanPx(clampPan(touchDrag.current.startPan + dx, w));
  };
  const onTouchEnd = () => {
    touchDrag.current.active = false;
  };

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const w = el.clientWidth;
      setPanPx((p) => clampPan(p, w));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [clampPan]);

  useEffect(() => {
    if (typeof navigator === "undefined" || !("xr" in navigator)) {
      setXrSupported(false);
      return;
    }
    const xr = (navigator as Navigator & { xr?: { isSessionSupported?: (m: string) => Promise<boolean> } }).xr;
    if (!xr?.isSessionSupported) {
      setXrSupported(false);
      return;
    }
    xr
      .isSessionSupported("immersive-vr")
      .then(setXrSupported)
      .catch(() => setXrSupported(false));
  }, []);

  const runWebXrCheck = useCallback(async () => {
    setWebXrChecked(true);
    if (typeof navigator === "undefined" || !("xr" in navigator)) {
      setSupportsImmersiveVr(false);
      setSupportsImmersiveAr(false);
      return;
    }
    const xr = (navigator as Navigator & { xr?: { isSessionSupported?: (m: string) => Promise<boolean> } }).xr;
    if (!xr?.isSessionSupported) {
      setSupportsImmersiveVr(false);
      setSupportsImmersiveAr(false);
      return;
    }
    try {
      const [vr, ar] = await Promise.all([
        xr.isSessionSupported("immersive-vr"),
        xr.isSessionSupported("immersive-ar"),
      ]);
      setSupportsImmersiveVr(vr);
      setSupportsImmersiveAr(ar);
    } catch {
      setSupportsImmersiveVr(false);
      setSupportsImmersiveAr(false);
    }
  }, []);

  const runSceneScan = useCallback(() => {
    setOrderWarning("Scanning the scene for learning hotspots…");
    const seq = REQUIRED_HOTSPOT_ORDER;
    let i = 0;
    const tick = () => {
      if (i < seq.length) {
        setScanHighlightId(seq[i]);
        i += 1;
        window.setTimeout(tick, 720);
      } else {
        setScanHighlightId(null);
        setOrderWarning("Scan complete. Start by tapping the Hazard hotspot.");
        pushDemoEvent({ eventType: "scene_scan", step: "Observe", hotspot: "scan" });
        appendDemoActivity(activeLid, `${activeLid} completed scene scan`);
        window.setTimeout(() => setOrderWarning(""), 7000);
      }
    };
    window.setTimeout(tick, 400);
  }, [activeLid, pushDemoEvent]);

  const openHotspot = (hs: XRHotspotDefinition) => {
    if (guidedMobile && guidedScenarioStarted) {
      if (hs.id === "ai-hint") {
        pushDemoEvent({ eventType: "ai_hint_viewed", step: "Justify", hotspot: "Hint" });
        appendDemoActivity(activeLid, `${activeLid} viewed hint scaffold`);
        setSelectedId(hs.id);
        setVisited((prev) => new Set(prev).add(hs.id));
        return;
      }
      if (hs.id === "action" && !visited.has("hazard")) {
        setOrderWarning("Before choosing an action, first identify the hazard.");
        window.setTimeout(() => setOrderWarning(""), 6000);
        return;
      }
      if (hs.id === "justify" && guidedStep < 3) {
        setOrderWarning("Select an action before writing justification.");
        window.setTimeout(() => setOrderWarning(""), 6000);
        return;
      }
      if (hs.id === "reflection" && guidedStep < 4) {
        setOrderWarning("Write your justification before reflection.");
        window.setTimeout(() => setOrderWarning(""), 6000);
        return;
      }
    }

    setSelectedId(hs.id);
    setVisited((prev) => new Set(prev).add(hs.id));
    setPathwayIndex((idx) => Math.max(idx, hs.pathwayIndex));
    if (guidedMobile && guidedScenarioStarted) {
      if (hs.id === "justify") setJustifyTapped(true);
      if (hs.id === "reflection") setReflectTapped(true);
    }

    const isGuidedHazardClick =
      guidedMobile && guidedScenarioStarted && guidedStep === 1 && hs.id === "hazard";
    appendLog({
      hotspotId: hs.id,
      hotspotLabel: hs.label,
      step: hs.pathwayStep,
      eventType: isGuidedHazardClick ? "hotspot_click" : "hotspot_select",
    });
    if (isGuidedHazardClick) {
      pushDemoEvent({ eventType: "hotspot_click", step: "Observe", hotspot: "Hazard" });
      appendDemoActivity(activeLid, `${activeLid} clicked Hazard`);
      setGuidedStep(2);
    }

    if (guidedMobile) {
      if (variant === "hero") {
        setShowTask(false);
      } else {
        setShowTask(false);
      }
      return;
    }

    if (variant === "hero") {
      setShowTask(false);
    } else if (hs.id === "action" || hs.id === "reflection" || hs.id === "justify") {
      setShowTask(true);
      setSubmitted(false);
    } else {
      setShowTask(false);
    }
  };

  const submitTask = () => {
    setSubmitted(true);
    appendLog({
      hotspotId: selectedId ?? "reflection",
      hotspotLabel: "task",
      step: "Reflect",
      eventType: "task_submit",
    });
  };

  const submitGuidedLearnerTask = () => {
    if (mcChoice == null || !justification.trim() || !reflection.trim()) return;
    const sel = MC_OPTIONS[mcChoice];
    const elapsedSec = guidedStartMsRef.current
      ? Math.max(1, Math.round((Date.now() - guidedStartMsRef.current) / 1000))
      : 1;
    const reflectionEvent: LearnerDemoEvent = {
      eventType: "reflection_text",
      step: "Reflect",
      text: reflection.trim(),
      at: new Date().toISOString(),
    };
    const mergedEvents = [...demoEvents, reflectionEvent];
    const flags = analyzeAttemptFlags({
      mcChoiceIndex: mcChoice,
      justification: justification.trim(),
      reflection: reflection.trim(),
      justifyTapped,
      reflectTapped,
    });
    saveLearnerDemoSubmission({
      learnerId: activeLid,
      submittedAt: new Date().toISOString(),
      events: mergedEvents,
      selectedAction: sel,
      justification: justification.trim(),
      reflection: reflection.trim(),
      timeSpentSec: elapsedSec,
      mcChoiceIndex: mcChoice,
      wrongActionChoice: flags.wrongActionChoice,
      shortJustification: flags.shortJustification,
      skippedSteps: flags.skippedSteps,
    });
    setDemoEvents(mergedEvents);
    appendLog({
      hotspotId: "guided-task",
      hotspotLabel: "task",
      step: "Reflect",
      eventType: "task_submit",
    });
    setSubmitted(true);
    setGuidedStep(5);
    appendDemoActivity(activeLid, `${activeLid} submitted reflection`);
  };

  const advanceGuidedDecide = () => {
    if (mcChoice == null) return;
    const sel = MC_OPTIONS[mcChoice];
    pushDemoEvent({ eventType: "decision_answer", step: "Decide", selectedAnswer: sel, label: sel });
    appendLog({
      hotspotId: "mc",
      hotspotLabel: sel.slice(0, 48),
      step: "Decide",
      eventType: "decision_answer",
    });
    setGuidedStep(3);
    setJustifyTapped(false);
  };

  const enterXR = async () => {
    appendLog({
      hotspotId: "xr",
      hotspotLabel: "WebXR",
      step: "Observe",
      eventType: "immersive_toggle",
    });
    if (guidedPreview) {
      if (!supportsImmersiveVr && !supportsImmersiveAr) {
        window.alert(
          "Immersive WebXR is not available here. iPhone Safari uses the Mobile 360° panning view — not a headset session. Use Mobile 360° Mode.",
        );
        return;
      }
    } else if (xrSupported !== true) {
      window.alert("WebXR is not available in this browser. Use the 360° panning view instead.");
      return;
    }
    try {
      const xr = (navigator as Navigator & { xr?: { requestSession?: (m: string) => Promise<unknown> } }).xr;
      if (!xr?.requestSession) {
        window.alert("WebXR session API not available. Use Mobile 360° Mode instead.");
        return;
      }
      const mode = guidedPreview
        ? supportsImmersiveVr
          ? "immersive-vr"
          : "immersive-ar"
        : "immersive-vr";
      await xr.requestSession(mode);
    } catch {
      window.alert(
        "Could not start WebXR (permissions, HTTPS, or device). Continue with Mobile 360° Mode — prototype only.",
      );
    }
  };

  const exitImmersiveViewport = useCallback(() => {
    setCssFullscreen(false);
    setImmersiveUi(false);
    if (typeof document !== "undefined" && document.fullscreenElement) {
      void document.exitFullscreen().catch(() => {});
    }
  }, []);

  const requestImmersiveViewport = () => {
    const el = viewportRef.current;
    appendLog({
      hotspotId: "ui",
      hotspotLabel: "Immersive UI",
      step: "Observe",
      eventType: "immersive_toggle",
    });
    if (!el?.requestFullscreen) {
      setCssFullscreen(true);
      setImmersiveUi(true);
      return;
    }
    el
      .requestFullscreen()
      .then(() => {
        setImmersiveUi(true);
        setCssFullscreen(false);
      })
      .catch(() => {
        setCssFullscreen(true);
        setImmersiveUi(true);
      });
  };

  const isHero = variant === "hero";
  const isDarkChrome = variant === "mobile" || variant === "desktop";
  const webxrOnly = Boolean(guidedPreview && variant === "mobile" && previewTab === "webxr");
  const teacherPanel = Boolean(guidedPreview && variant === "mobile" && previewTab === "teacher");
  const mobileGuidedLearner =
    Boolean(guidedPreview && variant === "mobile" && (previewTab === "mobile360" || previewTab === "teacher"));

  const viewerHeight =
    isHero
      ? "min-h-[220px] sm:min-h-[260px]"
      : variant === "desktop"
        ? "min-h-[340px] lg:min-h-[420px]"
        : "min-h-[48vh] sm:min-h-[52vh]";

  const panoramaStrip = (
    <div
      className="absolute inset-y-0 left-0 will-change-transform"
      style={{
        width: `${XR_PANORAMA_WIDTH_MULT * 100}%`,
        transform: `translateX(${panPx}px)`,
      }}
    >
      <div className="relative h-full w-full min-h-[200px]">
        <Image
          src={XR_PANORAMA_URL}
          alt="Wide panoramic warehouse for 360° workplace safety training"
          fill
          className="object-cover object-center"
          sizes="200vw"
          priority={isHero}
          unoptimized
        />
        <div
          className={cn(
            "pointer-events-none absolute inset-0 bg-gradient-to-b",
            isDarkChrome ? "from-slate-950/50 via-transparent to-slate-950/70" : "from-[#0c1f3a]/35 via-transparent to-[#0c1f3a]/45",
          )}
        />
        {XR_HOTSPOTS.map((hs) => (
          <HotspotMarker
            key={hs.id}
            hs={hs}
            selected={selectedId === hs.id}
            visited={visited.has(hs.id)}
            pulse={scanHighlightId === hs.id}
            variant={variant}
            onSelect={() => {
              if (guidedMobile && !guidedScenarioStarted) return;
              openHotspot(hs);
            }}
          />
        ))}
      </div>
    </div>
  );

  const popover =
    selectedHotspot && !isHero && !webxrOnly ? (
      <div
        className={cn(
          "z-[100] max-h-[min(50vh,24rem)] max-w-[min(100vw-1.5rem,20rem)] overflow-y-auto rounded-2xl border p-4 shadow-2xl",
          variant === "mobile"
            ? "fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom,0px))] left-1/2 top-auto -translate-x-1/2 border-slate-600 bg-slate-900/98 text-white"
            : variant === "desktop"
              ? "absolute right-4 top-4 max-h-none w-[min(100%,20rem)] max-w-xs border-slate-200 bg-white text-slate-900 shadow-xl"
              : "fixed bottom-4 left-1/2 -translate-x-1/2 border-slate-200 bg-white",
        )}
      >
        <p className="text-[10px] font-bold uppercase tracking-wide text-sky-300 sm:text-indigo-600">
          {selectedHotspot.pathwayStep}
        </p>
        <p className="mt-1 text-sm font-bold">{selectedHotspot.label} hotspot</p>
        <p className="mt-2 text-xs leading-relaxed opacity-90 sm:text-slate-600">
          {selectedHotspot.id === "hazard"
            ? "Scan the aisle for instability and blocked egress — observation anchors the scenario."
            : selectedHotspot.id === "action"
              ? "Choose the safest operational response; then use the Why? hotspot to justify it."
              : selectedHotspot.id === "justify"
                ? "Explain why your action reduces risk — causal reasoning matters for competence evidence."
                : selectedHotspot.id === "ai-hint"
                  ? "Hint (scaffold): first identify the risk, then explain how the action reduces that risk."
                  : selectedHotspot.id === "reflection"
                    ? "Summarize what you learned; teacher review interprets this evidence in context."
                    : "Continue the learning pathway."}
        </p>
        <button
          type="button"
          className="mt-3 w-full min-h-[44px] rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500"
          onClick={() => setSelectedId(null)}
        >
          Close
        </button>
      </div>
    ) : selectedHotspot && isHero ? (
      <div className="pointer-events-none absolute bottom-12 left-3 right-3 z-10 max-w-[95%] rounded-xl border border-white/30 bg-white/90 p-2 text-[11px] text-[#0c1f3a] shadow-lg backdrop-blur-sm sm:bottom-14 sm:left-4">
        <span className="font-bold text-indigo-700">{selectedHotspot.label}</span> · {selectedHotspot.pathwayStep}
      </div>
    ) : null;

  const questionBlock =
    showTask && !isHero && !submitted && !webxrOnly && !guidedMobile ? (
      <div
        className={cn(
          "mt-4 space-y-3 rounded-2xl border p-4",
          isDarkChrome ? "border-white/10 bg-slate-900/80 text-white" : "border-slate-200 bg-white",
        )}
      >
        <p className="text-sm font-semibold">What is the safest action in this scene?</p>
        <ul className="space-y-2">
          {MC_OPTIONS.map((opt, i) => (
            <li key={opt}>
              <label
                className={cn(
                  "flex cursor-pointer gap-3 rounded-xl border px-3 py-3 text-sm has-[:checked]:border-indigo-400 has-[:checked]:bg-indigo-500/20",
                  isDarkChrome ? "border-white/10 bg-black/20" : "border-slate-200 bg-slate-50 has-[:checked]:bg-indigo-50",
                )}
              >
                <input
                  type="radio"
                  name="mc"
                  checked={mcChoice === i}
                  onChange={() => setMcChoice(i)}
                  className="mt-1 h-4 w-4 shrink-0"
                />
                <span>{opt}</span>
              </label>
            </li>
          ))}
        </ul>
        <span className="block text-xs font-semibold uppercase tracking-wide text-slate-400">Reflection</span>
        <textarea
          value={reflection}
          onChange={(e) => setReflection(e.target.value)}
          rows={3}
          className={cn(
            "w-full resize-none rounded-xl border px-3 py-2 text-sm placeholder:opacity-60",
            isDarkChrome
              ? "border-white/15 bg-black/30 text-white placeholder:text-slate-500"
              : "border-slate-200 bg-white text-slate-900",
          )}
          placeholder="What would you tell a colleague about the risk?"
        />
        <button
          type="button"
          className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-semibold sm:border-slate-200 sm:bg-slate-100 sm:text-slate-900"
          aria-label="Voice note placeholder"
        >
          <Mic className="h-4 w-4 shrink-0" aria-hidden />
          Voice note (placeholder)
        </button>
        <button
          type="button"
          onClick={submitTask}
          className="w-full min-h-[48px] rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white hover:bg-emerald-500"
        >
          Submit
        </button>
      </div>
    ) : null;

  const postSubmit =
    submitted && !isHero && !webxrOnly && !guidedMobile ? (
      <div className="mt-4 rounded-2xl border border-emerald-400/40 bg-emerald-950/40 p-4 text-center text-sm font-medium text-emerald-100">
        Your response has been saved for teacher review.
      </div>
    ) : null;

  const guidedLearnerTask =
    guidedMobile && !webxrOnly && !isHero ? (
      <div className="mt-4 space-y-3">
        {orderWarning ? (
          <div className="rounded-xl border border-amber-400/50 bg-amber-950/60 px-3 py-3 text-sm text-amber-50 shadow-md">
            {orderWarning}
          </div>
        ) : null}
        {!guidedScenarioStarted ? (
          <div className="rounded-2xl border border-white/15 bg-slate-900/75 p-4 text-center text-white shadow-lg ring-1 ring-white/10">
            <p className="text-xs font-bold uppercase tracking-wide text-sky-200">Step 1 · Observe</p>
            <p className="mt-2 text-sm text-slate-200">
              Start the task, then open the <strong className="text-white">Hazard</strong> hotspot on the 360° scene.
            </p>
            <button
              type="button"
              onClick={startGuidedScenario}
              className="mt-4 w-full min-h-[48px] rounded-2xl bg-indigo-600 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-indigo-500"
            >
              Start Scenario
            </button>
          </div>
        ) : null}

        {guidedScenarioStarted && guidedStep === 1 && !submitted ? (
          <div className="rounded-2xl border border-sky-500/35 bg-slate-900/80 p-4 text-sm text-white shadow-lg ring-1 ring-sky-500/20">
            <p className="text-xs font-bold uppercase tracking-wide text-sky-200">Step 1 · Observe</p>
            <p className="mt-2 leading-relaxed text-slate-200">
              Pan the warehouse and tap the orange <strong className="text-white">Hazard</strong> hotspot to record
              observation evidence.
            </p>
          </div>
        ) : null}

        {guidedScenarioStarted && guidedStep === 2 && !submitted ? (
          <div className="space-y-3 rounded-2xl border border-white/10 bg-slate-900/85 p-4 text-white shadow-lg">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-indigo-200">Step 2 · Decide</p>
              <p className="mt-2 leading-relaxed text-slate-200">
                Tap the <strong className="text-white">Safe Action</strong> hotspot on the scene if you have not yet, then
                choose the safest response below.
              </p>
              <p className="mt-3 text-sm font-semibold">What is the safest action in this scene?</p>
            </div>
            <ul className="space-y-2">
              {MC_OPTIONS.map((opt, i) => (
                <li key={opt}>
                  <label
                    className={cn(
                      "flex cursor-pointer gap-3 rounded-xl border px-3 py-3 text-sm has-[:checked]:border-indigo-400 has-[:checked]:bg-indigo-500/15",
                      "border-white/10 bg-black/25 has-[:checked]:bg-indigo-500/10",
                    )}
                  >
                    <input
                      type="radio"
                      name="guided-mc"
                      checked={mcChoice === i}
                      onChange={() => setMcChoice(i)}
                      className="mt-1 h-4 w-4 shrink-0"
                    />
                    <span>{opt}</span>
                  </label>
                </li>
              ))}
            </ul>
            <button
              type="button"
              disabled={mcChoice == null}
              onClick={advanceGuidedDecide}
              className="w-full min-h-[48px] rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white transition enabled:hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-600"
            >
              Continue
            </button>
          </div>
        ) : null}

        {guidedScenarioStarted && guidedStep === 3 && !submitted ? (
          justifyTapped ? (
            <div className="space-y-3 rounded-2xl border border-emerald-500/25 bg-slate-900/85 p-4 text-white shadow-lg">
              <p className="text-xs font-bold uppercase tracking-wide text-emerald-200">Step 3 · Justify</p>
              <p className="text-sm text-slate-200">Why does this action reduce risk?</p>
              <textarea
                value={justification}
                onChange={(e) => setJustification(e.target.value)}
                rows={4}
                className="w-full resize-none rounded-xl border border-white/15 bg-black/30 px-3 py-2 text-sm text-white placeholder:text-slate-500"
                placeholder="Short written justification…"
              />
              <button
                type="button"
                disabled={!justification.trim()}
                onClick={() => {
                  const text = justification.trim();
                  if (!text) return;
                  pushDemoEvent({ eventType: "justification_text", step: "Justify", text });
                  setReflectTapped(false);
                  setGuidedStep(4);
                }}
                className="w-full min-h-[48px] rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white transition enabled:hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-slate-600"
              >
                Continue
              </button>
            </div>
          ) : (
            <div className="rounded-2xl border border-amber-500/30 bg-slate-900/80 p-4 text-sm text-white shadow-lg">
              <p className="text-xs font-bold uppercase tracking-wide text-amber-200">Step 3 · Justify</p>
              <p className="mt-2 leading-relaxed text-slate-200">
                Tap the <strong className="text-white">Why?</strong> hotspot on the warehouse scene to unlock the
                justification prompt.
              </p>
            </div>
          )
        ) : null}

        {guidedScenarioStarted && guidedStep === 4 && !submitted ? (
          reflectTapped ? (
            <div className="space-y-3 rounded-2xl border border-violet-500/25 bg-slate-900/85 p-4 text-white shadow-lg">
              <p className="text-xs font-bold uppercase tracking-wide text-violet-200">Step 4 · Reflect</p>
              <p className="text-sm text-slate-200">What did you learn from this scenario?</p>
              <textarea
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
                rows={4}
                className="w-full resize-none rounded-xl border border-white/15 bg-black/30 px-3 py-2 text-sm text-white placeholder:text-slate-500"
                placeholder="Reflection for your teacher…"
              />
              <button
                type="button"
                disabled={!reflection.trim()}
                onClick={submitGuidedLearnerTask}
                className="w-full min-h-[48px] rounded-xl bg-violet-600 py-3 text-sm font-semibold text-white transition enabled:hover:bg-violet-500 disabled:cursor-not-allowed disabled:bg-slate-600"
              >
                Submit for Teacher Review
              </button>
            </div>
          ) : (
            <div className="rounded-2xl border border-violet-500/30 bg-slate-900/80 p-4 text-sm text-white shadow-lg">
              <p className="text-xs font-bold uppercase tracking-wide text-violet-200">Step 4 · Reflect</p>
              <p className="mt-2 leading-relaxed text-slate-200">
                Tap the <strong className="text-white">Reflect</strong> hotspot on the scene to unlock your reflection.
              </p>
            </div>
          )
        ) : null}

        {guidedMobile && submitted ? (
          <div className="space-y-3 rounded-2xl border border-emerald-400/35 bg-emerald-950/45 p-4 text-center text-sm text-emerald-50 shadow-lg">
            <p className="font-semibold text-white">Submitted for teacher review</p>
            <p className="leading-relaxed text-emerald-100">
              Your learning activity has been submitted. Teacher AI analysis can now be generated.
            </p>
            <div className="rounded-xl border border-white/15 bg-black/25 px-3 py-3 text-left text-xs text-emerald-50/95">
              <p className="font-bold text-white">Evidence generated</p>
              <ul className="mt-2 list-disc space-y-1 pl-4">
                <li>Hazard hotspot clicked</li>
                <li>Decision answer submitted</li>
                <li>Justification written</li>
                <li>Reflection submitted</li>
              </ul>
            </div>
            <div className="flex flex-col gap-2 pt-1">
              <Link
                href="/dashboard"
                className="inline-flex min-h-[48px] items-center justify-center rounded-xl bg-white px-4 py-3 text-sm font-bold text-emerald-950 shadow-md transition hover:bg-emerald-50"
              >
                Continue as Teacher to Run AI Analysis
              </Link>
              <Link
                href="/ai-workflow"
                className="inline-flex min-h-[48px] items-center justify-center rounded-xl border border-white/30 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Open AI Learning Workflow
              </Link>
              <Link
                href={`/learners/${activeLid}`}
                className="inline-flex min-h-[48px] items-center justify-center rounded-xl border border-white/30 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                View demo learner detail
              </Link>
            </div>
            <p className="text-[11px] text-emerald-200/90">
              Public dataset prototype · AI-assisted insight · teacher review required
            </p>
          </div>
        ) : null}
      </div>
    ) : null;

  const aiPanel = (
    <div
      className={cn(
        "rounded-2xl border p-4 text-sm leading-relaxed",
        isDarkChrome
          ? "border-violet-500/30 bg-violet-950/40 text-violet-50"
          : "border-violet-100 bg-violet-50/80 text-violet-950",
      )}
    >
      <p className="text-xs font-bold uppercase tracking-wide text-violet-300 sm:text-violet-700">AI-assisted insight</p>
      <p className="mt-2">
        AI-assisted insight: The learner identified the hazard but should justify why the selected action reduces risk.{" "}
        <strong>Teacher review required.</strong> Prototype only — not a final judgement.
      </p>
    </div>
  );

  const webxrModePanel =
    webxrOnly ? (
      <div className="space-y-4 rounded-2xl border border-indigo-500/30 bg-slate-900/80 p-5 text-white shadow-xl ring-1 ring-white/10">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-indigo-300">WebXR mode</p>
          <h2 className="mt-2 text-lg font-bold">Headset / immersive sessions (supported devices only)</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-300">
            <strong>WebXR mode is available only on supported devices</strong> (typically VR/AR headset browsers — not
            iPhone Safari). For phones, use <strong>Mobile 360° Mode</strong>: the XR-style mobile learning view with
            panning and hotspots.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void runWebXrCheck()}
          className="w-full min-h-[52px] rounded-2xl bg-indigo-600 py-3 text-sm font-bold text-white shadow-lg"
        >
          Check WebXR Support
        </button>
        {webXrChecked ? (
          <div className="rounded-xl border border-white/15 bg-black/30 p-4 text-sm">
            {typeof navigator !== "undefined" && "xr" in navigator ? (
              <>
                <p>
                  <strong>immersive-vr:</strong> {supportsImmersiveVr ? "supported" : "not supported"}
                </p>
                <p className="mt-1">
                  <strong>immersive-ar:</strong> {supportsImmersiveAr ? "supported" : "not supported"}
                </p>
                {!supportsImmersiveVr && !supportsImmersiveAr ? (
                  <p className="mt-3 font-medium text-amber-200">
                    WebXR is not supported on this device/browser. Use Mobile 360° Mode instead.
                  </p>
                ) : (
                  <p className="mt-3 text-slate-300">
                    If your browser allows it, you can try an immersive session below. This remains a research prototype —{" "}
                    <strong>not real ThingLink telemetry</strong>.
                  </p>
                )}
              </>
            ) : (
              <p className="font-medium text-amber-200">
                WebXR is not supported on this device/browser. Use Mobile 360° Mode instead.
              </p>
            )}
            {supportsImmersiveVr || supportsImmersiveAr ? (
              <button
                type="button"
                onClick={() => void enterXR()}
                className="mt-4 w-full min-h-[48px] rounded-xl border border-white/30 bg-white/10 py-2.5 text-sm font-semibold"
              >
                Try immersive WebXR session (optional)
              </button>
            ) : null}
          </div>
        ) : (
          <p className="text-xs text-slate-400">Tap “Check WebXR Support” to test immersive-vr / immersive-ar.</p>
        )}
      </div>
    ) : null;

  const teacherAnalyticsSection =
    teacherPanel ? (
      <div className="space-y-3 rounded-2xl border border-emerald-500/25 bg-emerald-950/30 p-4 text-white">
        <p className="text-xs font-bold uppercase tracking-wide text-emerald-300">Teacher analytics mode</p>
        <p className="text-sm text-slate-300">
          How learner actions become dashboard-style signals (prototype mapping — not validated on ThingLink exports yet).
        </p>
        <ul className="space-y-2 text-sm">
          <li className="flex gap-2 rounded-lg bg-black/25 px-3 py-2">
            <BarChart3 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" aria-hidden />
            <span>
              <strong>Hotspot clicked:</strong> {log.filter((e) => e.eventType === "hotspot_select").length} events in this
              session
            </span>
          </li>
          <li className="flex gap-2 rounded-lg bg-black/25 px-3 py-2">
            <ChartPie className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" aria-hidden />
            <span>
              <strong>Step progress:</strong> pathway index {pathwayIndex + 1} / 4 —{" "}
              <strong>{PATHWAY_STEPS[pathwayIndex]}</strong> is the latest milestone
            </span>
          </li>
          <li className="flex gap-2 rounded-lg bg-black/25 px-3 py-2">
            <Target className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" aria-hidden />
            <span>
              <strong>Response submitted:</strong> {submitted ? "Yes — saved for teacher review" : "Not yet"}
            </span>
          </li>
          <li className="flex gap-2 rounded-lg bg-black/25 px-3 py-2">
            <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" aria-hidden />
            <span>
              <strong>Reflection quality:</strong> {reflectionQualityLabel(reflection, submitted)}
            </span>
          </li>
          <li className="flex gap-2 rounded-lg bg-black/25 px-3 py-2">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" aria-hidden />
            <span className={cn("font-medium", riskMeta(visited, submitted).cls)}>
              <strong>Risk indicator:</strong> {riskMeta(visited, submitted).text}
            </span>
          </li>
        </ul>
        <p className="text-xs text-slate-400">Teacher review required for any interpretation. AI-assisted insight only.</p>
      </div>
    ) : null;

  const guidedModeChrome =
    guidedPreview && variant === "mobile" ? (
      <div className="mb-4 space-y-4 overflow-x-hidden">
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <button
            type="button"
            onClick={() => setPreviewTab("mobile360")}
            className={cn(
              "min-h-[52px] flex-1 rounded-2xl px-4 py-3 text-sm font-bold shadow-md transition sm:flex-none",
              previewTab === "mobile360"
                ? "bg-indigo-600 text-white ring-2 ring-indigo-300"
                : "bg-white/10 text-white ring-1 ring-white/25 hover:bg-white/15",
            )}
          >
            Start Mobile 360° Learning
          </button>
          <button
            type="button"
            onClick={() => {
              setPreviewTab("webxr");
              setWebXrChecked(false);
            }}
            className={cn(
              "min-h-[52px] flex-1 rounded-2xl px-4 py-3 text-sm font-bold shadow-md transition sm:flex-none",
              previewTab === "webxr"
                ? "bg-violet-600 text-white ring-2 ring-violet-300"
                : "bg-white/10 text-white ring-1 ring-white/25 hover:bg-white/15",
            )}
          >
            Check WebXR Support
          </button>
          <button
            type="button"
            onClick={() => setPreviewTab("teacher")}
            className={cn(
              "min-h-[52px] flex-1 rounded-2xl px-4 py-3 text-sm font-bold shadow-md transition sm:flex-none",
              previewTab === "teacher"
                ? "bg-emerald-600 text-white ring-2 ring-emerald-300"
                : "bg-white/10 text-white ring-1 ring-white/25 hover:bg-white/15",
            )}
          >
            Open Teacher Analytics
          </button>
        </div>

        <div className="rounded-2xl border border-white/15 bg-white/5 p-4 ring-1 ring-white/10">
          <p className="text-xs font-bold uppercase tracking-wide text-sky-200">How to use this XR learning demo</p>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-slate-200">
            {GUIDED_STEPS.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ol>
        </div>

        <div className="rounded-2xl border border-indigo-400/30 bg-indigo-950/40 p-4 text-sm text-indigo-50">
          <p className="font-bold text-white">Quick help</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-slate-200">
            <li>Swipe the scene</li>
            <li>Tap Hazard</li>
            <li>Choose safest action</li>
            <li>Explain your reasoning</li>
            <li>Submit for teacher review</li>
          </ul>
          <p className="mt-3 text-xs text-slate-400">Prototype only — not real ThingLink telemetry.</p>
        </div>
      </div>
    ) : null;

  const viewerCard = (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl ring-1",
        isHero ? "ring-slate-200" : "ring-white/10",
        immersiveUi && variant === "mobile" && "rounded-none ring-0 sm:rounded-2xl",
        cssFullscreen && variant === "mobile" && "fixed inset-0 z-[280] max-h-[100dvh] rounded-none ring-0",
      )}
    >
      <div
        id={titleId}
        className={cn(
          "relative cursor-grab select-none overflow-hidden touch-none active:cursor-grabbing",
          viewerHeight,
        )}
        ref={viewportRef}
        onPointerDown={onPointerDownPan}
        onPointerMove={onPointerMovePan}
        onPointerUp={endPan}
        onPointerCancel={endPan}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        role="region"
        aria-labelledby={titleId}
      >
        {panoramaStrip}
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 bg-gradient-to-b from-black/50 to-transparent p-3 sm:p-4">
          <div className="pointer-events-auto flex max-w-full flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-white/90">
                {guidedPreview ? "XR-style mobile learning view" : "360° / XR-style learning scene"}
              </p>
              <p className="text-base font-bold text-white">Workplace Safety Simulation</p>
              <p className="text-[11px] text-white/80">
                {guidedPreview
                  ? "360° hotspot-based learning scene — swipe or drag to pan. Prototype only — not real ThingLink telemetry."
                  : "Drag horizontally to look around the panoramic frame (prototype)."}
              </p>
            </div>
            {!isHero ? (
              <div className="flex flex-wrap gap-2">
                {!guidedPreview && xrSupported === true ? (
                  <button
                    type="button"
                    onClick={() => void enterXR()}
                    className="min-h-[44px] rounded-xl bg-indigo-600 px-3 py-2 text-xs font-semibold text-white shadow-lg"
                  >
                    Enter XR Mode
                  </button>
                ) : null}
                {!guidedPreview && xrSupported !== true ? (
                  <span className="flex min-h-[44px] items-center rounded-xl bg-white/10 px-3 text-xs font-semibold text-white ring-1 ring-white/20">
                    360° Mobile View
                  </span>
                ) : null}
                {guidedPreview && variant === "mobile" && previewTab === "mobile360" ? (
                  <span className="flex min-h-[44px] max-w-[14rem] items-center rounded-xl bg-emerald-500/20 px-3 text-[10px] font-semibold leading-snug text-emerald-100 ring-1 ring-emerald-400/40 sm:max-w-none sm:text-xs">
                    Default: Mobile 360° on iPhone &amp; typical browsers — not headset WebXR
                  </span>
                ) : null}
                {variant === "mobile" && !webxrOnly && guidedMobile ? (
                  <button
                    type="button"
                    onClick={runSceneScan}
                    className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl bg-sky-600 px-3 py-2 text-xs font-bold text-white shadow-lg"
                  >
                    <ScanLine className="h-3.5 w-3.5" aria-hidden />
                    Scan scene
                  </button>
                ) : null}
                {variant === "mobile" && !webxrOnly ? (
                  <button
                    type="button"
                    onClick={requestImmersiveViewport}
                    className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl bg-white px-3 py-2 text-xs font-bold text-slate-900 shadow-lg"
                  >
                    <Maximize2 className="h-3.5 w-3.5" aria-hidden />
                    Full screen
                  </button>
                ) : null}
                {variant === "mobile" && !webxrOnly && (immersiveUi || cssFullscreen) ? (
                  <button
                    type="button"
                    onClick={exitImmersiveViewport}
                    className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border border-white/40 bg-black/40 px-3 py-2 text-xs font-bold text-white shadow-lg"
                  >
                    <X className="h-3.5 w-3.5" aria-hidden />
                    Exit full screen
                  </button>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
        {isHero ? popover : null}
        {isHero ? (
          <div className="pointer-events-none absolute bottom-3 left-3 right-3 z-10 max-w-[95%] sm:left-4 sm:max-w-sm">
            <div className="rounded-xl border border-indigo-100 bg-white/95 p-3 text-xs text-[#0c1f3a] shadow-lg backdrop-blur-sm ring-1 ring-slate-100">
              <p className="font-bold text-indigo-700">AI insight bubble</p>
              <p className="mt-1 text-slate-700">
                Cohort signal: observe hotspots first; justify actions with evidence in the mobile demo. Teacher review
                required — prototype only.
              </p>
            </div>
          </div>
        ) : null}
      </div>
      <div
        className={cn(
          "flex flex-col gap-2 border-t px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4",
          isHero ? "border-slate-200 bg-slate-50" : "border-white/10 bg-slate-950/90",
        )}
      >
        <p className={cn("text-[10px] font-bold uppercase tracking-wide", isHero ? "text-slate-500" : "text-sky-200/90")}>
          Learner pathway
        </p>
        <PathwayChips currentIndex={pathwayIndex} theme={isHero ? "light" : "dark"} />
      </div>
    </div>
  );

  const interactionTrace =
    variant === "desktop" ? (
      <div className="rounded-2xl border border-[var(--border)] bg-white p-4 shadow-sm">
        <p className="text-sm font-semibold text-slate-900">Interaction trace</p>
        <p className="text-xs text-[var(--muted)]">Local prototype log → maps to ThingLink-style hotspot clicks.</p>
        <ul className="mt-3 max-h-48 space-y-2 overflow-y-auto text-xs text-slate-700">
          {log.length === 0 ? <li className="text-[var(--muted)]">No interactions yet.</li> : null}
          {[...log].reverse().map((e) => (
            <li key={e.id} className="rounded-lg bg-slate-50 px-2 py-1.5 font-mono leading-snug">
              <span className="text-[10px] text-slate-500">{new Date(e.timestamp).toLocaleTimeString()}</span> ·{" "}
              {e.eventType} · {e.hotspotLabel} · {e.step}
            </li>
          ))}
        </ul>
      </div>
    ) : null;

  const analyticsPreview =
    variant === "desktop" ? (
      <div className="rounded-2xl border border-[var(--border)] bg-white p-4 shadow-sm">
        <p className="text-sm font-semibold text-slate-900">Teacher analytics preview</p>
        <p className="mt-1 text-xs text-[var(--muted)]">Session hotspot completion (this browser only).</p>
        <div className="mt-3 space-y-3">
          {XR_HOTSPOTS.map((hs) => (
            <div key={hs.id}>
              <div className="flex justify-between text-xs font-medium text-slate-800">
                <span>
                  {hs.label} → {hs.pathwayStep}
                </span>
                <span>{visited.has(hs.id) ? 100 : 0}%</span>
              </div>
              <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-sky-400 transition-all"
                  style={{ width: visited.has(hs.id) ? "100%" : "0%" }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    ) : null;

  const sidePanel =
    variant === "desktop" ? (
      <div className="flex flex-col gap-4">
        <div className="rounded-2xl border border-[var(--border)] bg-white p-4 shadow-sm">
          <p className="text-sm font-semibold text-slate-900">Selected hotspot</p>
          <p className="mt-2 text-sm text-slate-600">
            {selectedHotspot
              ? `${selectedHotspot.label} · ${selectedHotspot.pathwayStep}`
              : "Tap a hotspot in the immersive canvas."}
          </p>
        </div>
        {aiPanel}
        {interactionTrace}
        {analyticsPreview}
      </div>
    ) : null;

  const selectedHotspotPanel =
    guidedPreview && variant === "mobile" && mobileGuidedLearner && !webxrOnly ? (
      <div className="rounded-2xl border border-white/15 bg-slate-900/75 p-4 text-white shadow-lg">
        <p className="text-xs font-bold uppercase tracking-wide text-sky-200">Selected hotspot details</p>
        <p className="mt-2 text-sm font-semibold">
          {selectedHotspot
            ? `${selectedHotspot.label} → pathway: ${selectedHotspot.pathwayStep}`
            : "None — tap a labeled hotspot on the scene."}
        </p>
        <p className="mt-2 text-xs text-slate-400">
          Markers stay visible on the 360° image. Visited hotspots show a softer ring (prototype UX).
        </p>
      </div>
    ) : null;

  const mainContent = (
    <div className={cn("flex flex-col gap-4", variant === "desktop" && "lg:col-span-3")}>
      {variant === "mobile" && guidedPreview ? guidedModeChrome : null}

      {!webxrOnly ? (
        <div className={cn(variant === "desktop" && "relative")}>
          {viewerCard}
          {!isHero && variant === "desktop" ? popover : null}
        </div>
      ) : null}

      {webxrOnly ? webxrModePanel : null}

      {selectedHotspotPanel}
      {teacherAnalyticsSection}

      {!isHero && !webxrOnly ? (
        <>
          {variant !== "desktop" ? aiPanel : null}
          {questionBlock}
          {guidedLearnerTask}
          {postSubmit}
        </>
      ) : null}

      {guidedPreview && variant === "mobile" && mobileGuidedLearner ? <InteractionTracePanel log={log} dark /> : null}
    </div>
  );

  const shell = (
    <div
      className={cn(
        variant === "hero" && "rounded-3xl border border-slate-200/90 bg-white p-4 shadow-2xl ring-1 ring-slate-100 sm:p-5",
        variant === "mobile" && "w-full max-w-lg mx-auto px-2 pb-28 pt-2 text-white md:px-3",
        variant === "desktop" && "text-slate-900",
        className,
      )}
    >
      {variant === "hero" ? (
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-xs font-semibold text-slate-500">XR scenario workspace</span>
          </div>
          <Link href="/preview" className="text-xs font-bold text-indigo-600 hover:underline">
            Open learner demo →
          </Link>
        </div>
      ) : null}

      {variant === "desktop" ? (
        <div className="grid gap-6 lg:grid-cols-5">
          {mainContent}
          <div className="lg:col-span-2">{sidePanel}</div>
        </div>
      ) : (
        mainContent
      )}

      {!isHero && variant === "mobile" && !webxrOnly ? popover : null}

      {variant === "mobile" ? (
        <nav
          className="fixed bottom-0 left-0 right-0 z-50 flex items-stretch justify-around border-t border-white/10 bg-[#0b1220]/95 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] backdrop-blur-md"
          aria-label="Learner navigation"
        >
          <Link href="/" className="flex min-h-[52px] min-w-[64px] flex-col items-center justify-center gap-0.5 text-[10px] font-semibold text-slate-300 hover:text-white">
            <Home className="h-5 w-5" aria-hidden />
            Home
          </Link>
          <Link
            href="/preview"
            className="flex min-h-[52px] min-w-[64px] flex-col items-center justify-center gap-0.5 text-[10px] font-semibold text-slate-300 hover:text-white"
          >
            <Glasses className="h-5 w-5" aria-hidden />
            Scene
          </Link>
          <Link
            href="/preview/xr"
            className="flex min-h-[52px] min-w-[64px] flex-col items-center justify-center gap-0.5 text-[10px] font-semibold text-indigo-300 hover:text-white"
          >
            <Footprints className="h-5 w-5" aria-hidden />
            XR
          </Link>
          <Link
            href="/dashboard"
            className="flex min-h-[52px] min-w-[64px] flex-col items-center justify-center gap-0.5 text-[10px] font-semibold text-slate-300 hover:text-white"
          >
            <LayoutDashboard className="h-5 w-5" aria-hidden />
            Teacher
          </Link>
        </nav>
      ) : null}
    </div>
  );

  return shell;
}
