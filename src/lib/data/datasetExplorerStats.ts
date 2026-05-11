/** Summary stats for Dataset Explorer (no large CSVs in repo). */

export const OULAD_RAW_SUMMARY = {
  label: "OULAD (Open University Learning Analytics Dataset)",
  approximateRows: 32_593,
  approximateColumns: 137,
  fileSizeNote: "Raw files not bundled in this demo build.",
  missingCellsPct: "Varies by feature extract; processed slice normalized in ML pipeline.",
  duplicateRows: "De-duplication applied in preprocessing notebook (prototype).",
};

export const DIALOGUE_RAW_SUMMARY = {
  label: "Education Dialogue / reflective corpora (public baselines)",
  approximateRows: 47_234,
  approximateColumns: 16,
  fileSizeNote: "Raw exports not bundled; dialogueInsights.json holds heuristic summaries.",
  missingCellsPct: "~low in processed dialogue slice used for dashboards",
  duplicateRows: "Heuristic de-dup on conversation id where applicable",
};

export const PROCESSED_SUMMARY = {
  ouladGrid: "32,593 × 137 (illustrative processed grid referenced in research narrative)",
  dialogueGrid: "47,234 × 16 (illustrative processed dialogue features)",
  uniqueLearnersNote: "Cohort counts on dashboard use generated JSON slice (80 learners sample).",
  topicsNote: "Topic labels are prototype mappings for ThingLink-style scenarios.",
};

export const THINGLINK_MAPPING_ROWS = [
  { from: "OULAD engagement / VLE clicks", to: "ThingLink / immersive hotspot interactions" },
  { from: "Activity dates & span", to: "Scenario timeline & session spans" },
  { from: "Assessment & scores", to: "Quiz / rubric scores in teacher dashboard" },
  { from: "Dialogue turns & reflection-like text", to: "Learner reflection and AI-assisted dialogue scaffolds" },
  { from: "Model outputs & risk indicators", to: "AI-assisted insight cards (teacher review required)" },
];

/** Class distribution demo data for charts (synthetic summary). */
export const CLASS_DISTRIBUTION_DEMO = {
  finalLearningOutcome: [
    { name: "Pass", value: 58 },
    { name: "In progress", value: 22 },
    { name: "Withdrawn", value: 12 },
    { name: "Unknown", value: 8 },
  ],
  learnerRiskStatus: [
    { name: "Low", value: 35 },
    { name: "Medium", value: 40 },
    { name: "High", value: 25 },
  ],
  reflectionQuality: [
    { name: "High", value: 28 },
    { name: "Medium", value: 45 },
    { name: "Low", value: 27 },
  ],
  detectedLearningDifficulty: [
    { name: "None / weak signal", value: 44 },
    { name: "Heuristic cue", value: 36 },
    { name: "Follow-up suggested", value: 20 },
  ],
  reasoningDepth: [
    { name: "Proficient", value: 22 },
    { name: "Developing", value: 51 },
    { name: "Early", value: 27 },
  ],
  teacherFeedbackNeed: [
    { name: "Low", value: 33 },
    { name: "Medium", value: 47 },
    { name: "High", value: 20 },
  ],
};

export const NUMERIC_HISTOGRAM_DEMO = [
  { range: "0–20", learners: 8 },
  { range: "21–40", learners: 18 },
  { range: "41–60", learners: 32 },
  { range: "61–80", learners: 28 },
  { range: "81–100", learners: 14 },
];
