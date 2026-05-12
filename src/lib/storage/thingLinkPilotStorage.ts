import type {
  ThingLinkPathStep,
  ThingLinkPilotEvent,
  ThingLinkPilotEventType,
  ThingLinkPilotImportSummary,
} from "@/lib/types";

export const THINGLINK_PILOT_EVENTS_STORAGE_KEY = "ica_thinglink_pilot_events_v1";
export const THINGLINK_PILOT_EVENTS_CHANGE_EVENT = "ica-thinglink-pilot-events-changed";

const EVENT_TYPES: ThingLinkPilotEventType[] = [
  "session_start",
  "hotspot_click",
  "path_step",
  "branch_choice",
  "quiz_response",
  "reflection_submit",
  "teacher_label",
  "session_end",
];

const PATH_STEPS: ThingLinkPathStep[] = ["Observe", "Decide", "Justify", "Reflect", "Review"];

type PilotStoreV1 = {
  version: 1;
  events: ThingLinkPilotEvent[];
  imports: ThingLinkPilotImportSummary[];
};

function emptyStore(): PilotStoreV1 {
  return { version: 1, events: [], imports: [] };
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function readStore(): PilotStoreV1 {
  if (typeof window === "undefined") return emptyStore();
  try {
    const raw = window.localStorage.getItem(THINGLINK_PILOT_EVENTS_STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as Partial<PilotStoreV1>;
    if (parsed.version !== 1 || !Array.isArray(parsed.events)) return emptyStore();
    return {
      version: 1,
      events: parsed.events,
      imports: Array.isArray(parsed.imports) ? parsed.imports.slice(-20) : [],
    };
  } catch {
    return emptyStore();
  }
}

function writeStore(store: PilotStoreV1) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(THINGLINK_PILOT_EVENTS_STORAGE_KEY, JSON.stringify(store));
  window.dispatchEvent(new CustomEvent(THINGLINK_PILOT_EVENTS_CHANGE_EVENT));
}

function nonEmptyString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function optionalString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function directIdentifierFound(value: string | undefined): boolean {
  if (!value) return false;
  return /@/.test(value) || /\b\d{6,}\b/.test(value) || /\b(patient|social security|ssn)\b/i.test(value);
}

function normalizeEvent(value: unknown, index: number): { event?: ThingLinkPilotEvent; error?: string } {
  const row = asRecord(value);
  if (!row) return { error: `Row ${index + 1}: expected an object.` };

  const sessionId = nonEmptyString(row.sessionId);
  const learnerPseudonym = nonEmptyString(row.learnerPseudonym);
  const scenarioId = nonEmptyString(row.scenarioId);
  const eventType = nonEmptyString(row.eventType) as ThingLinkPilotEventType | null;
  const timestamp = nonEmptyString(row.timestamp);

  if (!sessionId) return { error: `Row ${index + 1}: missing sessionId.` };
  if (!learnerPseudonym) return { error: `Row ${index + 1}: missing learnerPseudonym.` };
  if (!scenarioId) return { error: `Row ${index + 1}: missing scenarioId.` };
  if (!eventType || !EVENT_TYPES.includes(eventType)) return { error: `Row ${index + 1}: unsupported eventType.` };
  if (!timestamp || Number.isNaN(Date.parse(timestamp))) return { error: `Row ${index + 1}: invalid timestamp.` };

  const reflectionText = optionalString(row.reflectionText);
  if (directIdentifierFound(learnerPseudonym) || directIdentifierFound(reflectionText)) {
    return { error: `Row ${index + 1}: possible direct identifier found; anonymise before import.` };
  }

  const pathStepRaw = optionalString(row.pathStep);
  const pathStep = PATH_STEPS.includes(pathStepRaw as ThingLinkPathStep)
    ? (pathStepRaw as ThingLinkPathStep)
    : undefined;
  const dwellNumber = typeof row.dwellMs === "number" ? row.dwellMs : Number(row.dwellMs);

  return {
    event: {
      sessionId,
      learnerPseudonym,
      scenarioId,
      eventType,
      timestamp: new Date(timestamp).toISOString(),
      pathStep,
      hotspotId: optionalString(row.hotspotId),
      branchChoice: optionalString(row.branchChoice),
      quizResponse: optionalString(row.quizResponse),
      reflectionText,
      teacherLabel: optionalString(row.teacherLabel),
      dwellMs: Number.isFinite(dwellNumber) && dwellNumber >= 0 ? Math.round(dwellNumber) : undefined,
      deviceMode: optionalString(row.deviceMode),
      xapiVerb: optionalString(row.xapiVerb),
      ltiContextId: optionalString(row.ltiContextId),
    },
  };
}

function extractEvents(json: unknown): unknown[] {
  if (Array.isArray(json)) return json;
  const row = asRecord(json);
  if (!row) return [];
  if (Array.isArray(row.events)) return row.events;
  if (Array.isArray(row.pilotEvents)) return row.pilotEvents;
  return [];
}

function eventKey(event: ThingLinkPilotEvent): string {
  return [
    event.sessionId,
    event.learnerPseudonym,
    event.scenarioId,
    event.eventType,
    event.timestamp,
    event.pathStep ?? "",
    event.hotspotId ?? "",
    event.branchChoice ?? "",
  ].join("|");
}

export function listThingLinkPilotEvents(): ThingLinkPilotEvent[] {
  return readStore().events.slice().sort((a, b) => (a.timestamp > b.timestamp ? 1 : -1));
}

export function getThingLinkPilotImportHistory(): ThingLinkPilotImportSummary[] {
  return readStore().imports.slice().reverse();
}

export function importThingLinkPilotEvents(json: unknown): ThingLinkPilotImportSummary {
  const rows = extractEvents(json);
  const accepted: ThingLinkPilotEvent[] = [];
  const errors: string[] = [];

  rows.forEach((row, index) => {
    const res = normalizeEvent(row, index);
    if (res.event) accepted.push(res.event);
    if (res.error) errors.push(res.error);
  });

  const store = readStore();
  const existing = new Set(store.events.map(eventKey));
  const merged = store.events.slice();
  for (const event of accepted) {
    const key = eventKey(event);
    if (!existing.has(key)) {
      existing.add(key);
      merged.push(event);
    }
  }

  const summary: ThingLinkPilotImportSummary = {
    importedAt: new Date().toISOString(),
    source: "thinglink_pilot_export",
    acceptedEvents: accepted.length,
    rejectedEvents: Math.max(0, rows.length - accepted.length),
    errors: errors.slice(0, 20),
  };

  writeStore({ version: 1, events: merged, imports: [...store.imports, summary].slice(-20) });
  return summary;
}

export function buildThingLinkPilotSchemaTemplate() {
  const now = new Date().toISOString();
  return {
    version: 1,
    note:
      "ThingLink-style anonymised pilot events. Remove names, emails, student numbers, patient data, and free-text identifiers before import.",
    requiredFields: ["sessionId", "learnerPseudonym", "scenarioId", "eventType", "timestamp"],
    events: [
      {
        sessionId: "sess-demo-001",
        learnerPseudonym: "learner-001",
        scenarioId: "learning-environment-demo",
        eventType: "session_start",
        timestamp: now,
        pathStep: "Observe",
        deviceMode: "mobile",
      },
      {
        sessionId: "sess-demo-001",
        learnerPseudonym: "learner-001",
        scenarioId: "learning-environment-demo",
        eventType: "hotspot_click",
        timestamp: now,
        pathStep: "Observe",
        hotspotId: "observe-evidence",
        dwellMs: 12000,
      },
      {
        sessionId: "sess-demo-001",
        learnerPseudonym: "learner-001",
        scenarioId: "learning-environment-demo",
        eventType: "reflection_submit",
        timestamp: now,
        pathStep: "Reflect",
        reflectionText: "I compared the evidence, chose an action, and explained why it fits the learning goal.",
        teacherLabel: "onTrack",
      },
    ],
  };
}
