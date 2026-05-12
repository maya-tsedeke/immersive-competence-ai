import type { LearningEnvironmentModelTarget } from "@/lib/types";

export const learningEnvironmentModelTargets: LearningEnvironmentModelTarget[] = [
  {
    id: "feedbackNeeded",
    label: "Feedback need",
    description: "Whether the teacher should review or intervene after the learner activity.",
    evidenceInputs: ["path completion", "branch choices", "quiz response", "reflection text", "teacher label"],
  },
  {
    id: "engagementPattern",
    label: "Engagement pattern",
    description: "Interaction rhythm across immersive hotspots and learning pathway steps.",
    evidenceInputs: ["hotspot count", "dwell time", "sequence order", "repeat attempts"],
  },
  {
    id: "reflectionQuality",
    label: "Reflection quality",
    description: "Evidence quality in learner explanation and reflection text.",
    evidenceInputs: ["reflection length", "reasoning cues", "uncertainty cues", "teacher label"],
  },
  {
    id: "reasoningDepth",
    label: "Reasoning depth",
    description: "Whether the learner links observations, decisions, and justification coherently.",
    evidenceInputs: ["justification text", "pathway step", "branch choice", "reflection text"],
  },
  {
    id: "competenceEvidenceLevel",
    label: "Competence evidence level",
    description: "Teacher-facing summary of how much observable evidence supports the competence criteria.",
    evidenceInputs: ["completed steps", "rubric criterion", "quiz score", "teacher label"],
  },
  {
    id: "suggestedTeacherAction",
    label: "Suggested teacher action",
    description: "Explainable recommendation for feedback, resubmission, monitoring, or extension activity.",
    evidenceInputs: ["model target outputs", "teacher label", "rubric criterion", "evidence lines"],
  },
];

export const thingLinkPilotSchemaRows = [
  ["sessionId", "Required", "Pseudonymous learning session key."],
  ["learnerPseudonym", "Required", "Research-safe learner key; no name, email, student number, or patient data."],
  ["scenarioId", "Required", "Stable immersive scenario or lesson graph identifier."],
  ["eventType", "Required", "session_start, hotspot_click, path_step, branch_choice, quiz_response, reflection_submit, teacher_label, session_end."],
  ["timestamp", "Required", "ISO timestamp for ordering and sequence features."],
  ["pathStep", "Recommended", "Observe, Decide, Justify, Reflect, or Review."],
  ["hotspotId", "Recommended", "ThingLink-style hotspot or node identifier."],
  ["branchChoice", "Optional", "Decision or path selected by the learner."],
  ["quizResponse", "Optional", "Quiz, check-for-understanding, or rubric-linked response."],
  ["reflectionText", "Optional", "Short learner explanation or reflection after anonymisation."],
  ["teacherLabel", "Recommended", "feedbackNeeded, onTrack, strongEvidence, or local teacher rubric label."],
  ["dwellMs", "Optional", "Time spent in node or step, in milliseconds."],
  ["deviceMode", "Optional", "desktop, mobile, tablet, vr, or immersive-room."],
];

export const demoScriptSteps = [
  {
    title: "Learner view",
    body: "Open /preview or a ThingLink-style scenario link. The learner explores hotspots, follows the learning pathway, chooses a response, and writes a reflection.",
  },
  {
    title: "AI analysis view",
    body: "Open /ai-workflow and run AI analysis. The system converts trace, response, and reflection evidence into teacher-facing indicators.",
  },
  {
    title: "Teacher review view",
    body: "Open the learner detail page, inspect provenance, confidence, evidence lines, and save a teacher decision or override.",
  },
  {
    title: "Research evidence view",
    body: "Open /research to explain public-data baseline limits, ThingLink-style pilot schema, evaluation metrics, and teacher-in-the-loop governance.",
  },
];

export const scientificWorkPackage = [
  "RQ1: How can immersive interaction traces indicate learner progress across a learning pathway?",
  "RQ2: Can reflection text improve feedback-need recommendations beyond clicks and completion alone?",
  "RQ3: Which ThingLink-style events best predict teacher-labelled support needs?",
  "RQ4: How can AI recommendations remain explainable, calibrated, and teacher-controlled?",
];

export const scientificAlignmentSources = [
  {
    title: "ThingLink learning platform",
    body: "Use immersive/spatial learning, sharing, analytics, and LMS/xAPI-style delivery as the product alignment frame.",
    href: "https://www.thinglink.com/learning",
  },
  {
    title: "ThingLink Scenario Builder and AI creation",
    body: "Align with AI-assisted scenario creation while keeping this prototype focused on analytics and teacher review.",
    href: "https://www.thinglink.com/blog/new-tools-help-organizations-modernize-learning-save-time/",
  },
  {
    title: "AI and XR personalized learning research",
    body: "Current reviews emphasize contextual learner data, adaptive feedback, and stronger validation beyond short-term outcomes.",
    href: "https://www.ischool.berkeley.edu/research/publications/2025/towards-contextual-based-ai-scoping-review-artificial-intelligence-x",
  },
  {
    title: "Immersive procedural learning evidence",
    body: "Procedural VR research shows promise, but calls for more consistent designs, outcomes, and transfer measures.",
    href: "https://www.sciencedirect.com/science/article/pii/S0360131524001386",
  },
];

export const pilotEvaluationChecklist = [
  "Grouped train/test split by learner or class.",
  "Macro F1 and recall for feedbackNeeded.",
  "Brier score or equivalent calibration check.",
  "Confusion matrix with teacher-labelled support categories.",
  "Teacher-label agreement where more than one reviewer is available.",
  "Ablation: clicks only vs text only vs combined trace and text.",
];
