import type { CompetenceTrendPoint, CompletionSlice, EngagementSlice } from "@/lib/types";

export const competenceTrend: CompetenceTrendPoint[] = [
  { date: "May 1", score: 58 },
  { date: "May 5", score: 61 },
  { date: "May 10", score: 64 },
  { date: "May 15", score: 67 },
  { date: "May 20", score: 69 },
  { date: "May 25", score: 71 },
  { date: "May 31", score: 73 },
];

export const completionDonut: CompletionSlice[] = [
  { name: "Completed", value: 78, color: "#6366f1" },
  { name: "In progress", value: 15, color: "#38bdf8" },
  { name: "Not started", value: 7, color: "#cbd5f5" },
];

export const engagementDistribution: EngagementSlice[] = [
  { label: "High", percent: 36, color: "#16a34a" },
  { label: "Medium", percent: 44, color: "#f59e0b" },
  { label: "Low", percent: 20, color: "#f87171" },
];

export const hotspotCompletion = [
  { id: "h1", label: "Identify hazard", percent: 92 },
  { id: "h2", label: "Choose action", percent: 68 },
  { id: "h3", label: "Explain decision", percent: 62 },
  { id: "h4", label: "Reflect", percent: 55 },
];
