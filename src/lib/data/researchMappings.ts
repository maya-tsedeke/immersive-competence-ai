import type {
  FutureThingLinkField,
  ResearchMappingRow,
  ResearchPipelineStep,
} from "@/lib/types";

/** Public learning-data semantics to future ThingLink-style exports. */
export const researchMappings: ResearchMappingRow[] = [
  {
    publicDatasetField: "OULAD total learning interactions",
    futureThingLinkField: "ThingLink hotspot clicks",
    note: "Volume and ordering of exploratory interactions in an immersive learning scene.",
  },
  {
    publicDatasetField: "OULAD activity dates",
    futureThingLinkField: "ThingLink scenario timeline",
    note: "Temporal placement for engagement, pacing, and learning pathway progress.",
  },
  {
    publicDatasetField: "OULAD activity type",
    futureThingLinkField: "ThingLink media / hotspot type",
    note: "Distinguishes content views, questions, branch choices, and reflection prompts.",
  },
  {
    publicDatasetField: "OULAD assessment score",
    futureThingLinkField: "ThingLink quiz / rubric response",
    note: "Competence-linked outcome proxy aligned to teacher-defined criteria.",
  },
  {
    publicDatasetField: "Education dialogue dataset",
    futureThingLinkField: "Open response / reflection text",
    note: "Learner explanation and reflection evidence for feedback-need modelling.",
  },
  {
    publicDatasetField: "Dialogue model output",
    futureThingLinkField: "Teacher dashboard insight",
    note: "Aggregated, explainable support suggestions; AI-assisted, not final judgement.",
  },
];

export const researchPipelineSteps: ResearchPipelineStep[] = [
  {
    id: "datasets",
    title: "Public learning datasets",
    description:
      "OULAD traces and education dialogue corpora provide a reproducible baseline, not ThingLink telemetry.",
  },
  {
    id: "preprocess",
    title: "Preprocessing and mapping",
    description:
      "Clean, align, and map public fields to immersive learning events for demo dashboards and model baselines.",
  },
  {
    id: "models",
    title: "Baseline ML models",
    description:
      "Models estimate feedback need, engagement patterns, reflection quality, reasoning depth, and teacher action cues.",
  },
  {
    id: "insights",
    title: "Teacher-facing insights",
    description:
      "Evidence, confidence, provenance, and limitation notes support review rather than automatic assessment.",
  },
  {
    id: "pilot",
    title: "ThingLink-style pilot import",
    description:
      "Anonymised events replace mock rows when a governed pilot export is available; no live API is assumed.",
  },
  {
    id: "validation",
    title: "Scientific validation",
    description:
      "Grouped evaluation, calibration, teacher-label agreement, and ablations determine what can be claimed.",
  },
];

export const futureThingLinkFields: FutureThingLinkField[] = [
  {
    id: "scenario",
    label: "Scenario ID",
    description: "Stable identifier for an immersive scenario or lesson graph.",
  },
  {
    id: "session",
    label: "Learner / session ID",
    description: "Pseudonymous learner key or session id suitable for research governance.",
  },
  {
    id: "hotspots",
    label: "Hotspot clicks",
    description: "Ordered clicks with target ids and optional coordinates for 360 or tagged media.",
  },
  {
    id: "pathway",
    label: "Learning pathway step",
    description: "Observe, Decide, Justify, Reflect, and Review states for learning-progress modelling.",
  },
  {
    id: "branches",
    label: "Branch choices",
    description: "Selected paths, response choices, or scenario decisions.",
  },
  {
    id: "time",
    label: "Time spent",
    description: "Dwell segments at nodes and total session duration.",
  },
  {
    id: "openText",
    label: "Open-text responses",
    description: "Textual explanations and reflections captured with consent-aware anonymisation.",
  },
  {
    id: "quiz",
    label: "Quiz / rubric response",
    description: "Educator or auto-scored responses tied to competence criteria.",
  },
  {
    id: "feedback",
    label: "Teacher label / feedback",
    description: "Human review labels used as the reference standard for pilot evaluation.",
  },
];
