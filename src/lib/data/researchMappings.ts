import type {
  FutureThingLinkField,
  ResearchMappingRow,
  ResearchPipelineStep,
} from "@/lib/types";

/** OULAD / dialogue semantics → future ThingLink-style exports (research mapping only). */
export const researchMappings: ResearchMappingRow[] = [
  {
    publicDatasetField: "OULAD total learning interactions",
    futureThingLinkField: "ThingLink hotspot clicks",
    note: "Volume and ordering of exploratory interactions.",
  },
  {
    publicDatasetField: "OULAD activity dates",
    futureThingLinkField: "ThingLink scenario timeline",
    note: "Temporal placement for engagement and session curves.",
  },
  {
    publicDatasetField: "OULAD activity type",
    futureThingLinkField: "ThingLink media / hotspot type",
    note: "Discriminates tag, image, video, quiz, and branch-equivalent nodes.",
  },
  {
    publicDatasetField: "OULAD assessment score",
    futureThingLinkField: "ThingLink quiz / rubric score",
    note: "Competence-linked outcome proxy aligned to rubric dimensions.",
  },
  {
    publicDatasetField: "Education dialogue dataset",
    futureThingLinkField: "ThingLink AI conversation / reflection",
    note: "Open responses and optional in-scenario dialogue traces.",
  },
  {
    publicDatasetField: "Dialogue model output",
    futureThingLinkField: "Teacher dashboard insight",
    note: "Aggregated, explainable summaries — AI-assisted, not a final judgement.",
  },
];

export const researchPipelineSteps: ResearchPipelineStep[] = [
  {
    id: "datasets",
    title: "OULAD + Education Dialogue Dataset",
    description:
      "Public traces and dialogue corpora define features and labels for a proof-of-concept baseline — not ThingLink telemetry.",
  },
  {
    id: "preprocess",
    title: "Preprocessing",
    description:
      "Cleaning, alignment, and synthetic learner mapping for demo dashboards only; real pilots need anonymised exports.",
  },
  {
    id: "models",
    title: "Baseline ML models",
    description:
      "Classifier / regression style models produce risk and quality proxies from open data — teacher remains responsible for interpretation.",
  },
  {
    id: "insights",
    title: "AI-assisted insights",
    description:
      "Narratives and distributions surface patterns for review — heuristic dialogue labels, not validated ground truth.",
  },
  {
    id: "json",
    title: "Dashboard JSON",
    description:
      "Serialized bundles (learners, scenario analytics, dialogue, reports) feed this Next.js teacher workspace.",
  },
  {
    id: "thinglink",
    title: "Future ThingLink integration",
    description:
      "Replace JSON from public datasets with anonymised ThingLink scenario exports using the same conceptual mapping.",
  },
];

export const futureThingLinkFields: FutureThingLinkField[] = [
  {
    id: "scenario",
    label: "Scenario ID",
    description: "Stable identifier for a ThingLink immersive scenario or lesson graph.",
  },
  {
    id: "session",
    label: "Learner / session ID",
    description: "Pseudonymous learner key or session id suitable for research governance.",
  },
  {
    id: "hotspots",
    label: "Hotspot clicks",
    description: "Ordered clicks with coordinates/target ids for 360° or tagged media.",
  },
  {
    id: "branches",
    label: "Branch choices",
    description: "Selected paths, dialog options, or tagged hotspots that branch narrative.",
  },
  {
    id: "time",
    label: "Time spent",
    description: "Dwell segments at nodes and total session duration.",
  },
  {
    id: "openText",
    label: "Open-text responses",
    description: "Textual explanations and reflections captured in-app.",
  },
  {
    id: "aiConv",
    label: "AI conversations",
    description: "Optional tutor/agent exchanges with consent-aware logging.",
  },
  {
    id: "quiz",
    label: "Quiz / rubric score",
    description: "Educator or auto scoring tied to competence dimensions.",
  },
  {
    id: "feedback",
    label: "Teacher feedback",
    description: "Annotations and notes linked back to learner attempts.",
  },
];
