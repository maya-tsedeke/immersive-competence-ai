"""
Evaluate anonymised ThingLink-style pilot events for the learning-environment model path.

Input:
  ml/data/raw/thinglink_pilot_events.json

Accepted JSON shape:
  {"events": [...]} or [...]

Outputs:
  ml/outputs/pilot_feature_table.csv
  ml/outputs/pilot_model_metrics.json
  ml/outputs/pilot_predictions.json
  ml/outputs/pilot_model_card.md

The script is intentionally conservative. Under 100 sessions it runs a
small-data rule baseline and writes a model card that says the pilot data is
not sufficient for scientific model claims.
"""

from __future__ import annotations

import json
import re
import sys
from collections import Counter, defaultdict
from pathlib import Path

import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    brier_score_loss,
    confusion_matrix,
    f1_score,
    recall_score,
)
from sklearn.model_selection import GroupShuffleSplit
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

ML_ROOT = Path(__file__).resolve().parents[1]
SRC = Path(__file__).resolve().parent
for p in (ML_ROOT, SRC):
    if str(p) not in sys.path:
        sys.path.insert(0, str(p))

from config import OUTPUTS_DIR, RANDOM_SEED, THINGLINK_PILOT_EVENTS_JSON, ensure_dirs  # noqa: E402
from utils import write_json  # noqa: E402

EVENT_TYPES = {
    "session_start",
    "hotspot_click",
    "path_step",
    "branch_choice",
    "quiz_response",
    "reflection_submit",
    "teacher_label",
    "session_end",
}

PATH_STEPS = {"Observe", "Decide", "Justify", "Reflect", "Review"}
DIRECT_IDENTIFIER_RE = re.compile(r"(@|\b\d{6,}\b|\b(patient|social security|ssn)\b)", re.I)


def _load_json_events() -> list[dict]:
    if not THINGLINK_PILOT_EVENTS_JSON.is_file():
        return []
    data = json.loads(THINGLINK_PILOT_EVENTS_JSON.read_text(encoding="utf-8"))
    if isinstance(data, list):
        rows = data
    elif isinstance(data, dict):
        rows = data.get("events") or data.get("pilotEvents") or []
    else:
        rows = []
    return [r for r in rows if isinstance(r, dict)]


def _validate(rows: list[dict]) -> tuple[list[dict], list[str]]:
    valid: list[dict] = []
    errors: list[str] = []
    for idx, row in enumerate(rows, start=1):
        missing = [k for k in ("sessionId", "learnerPseudonym", "scenarioId", "eventType", "timestamp") if not row.get(k)]
        if missing:
            errors.append(f"row {idx}: missing {', '.join(missing)}")
            continue
        if row["eventType"] not in EVENT_TYPES:
            errors.append(f"row {idx}: unsupported eventType {row['eventType']!r}")
            continue
        if str(row.get("pathStep") or "") and row.get("pathStep") not in PATH_STEPS:
            errors.append(f"row {idx}: unsupported pathStep {row.get('pathStep')!r}")
            continue
        reflection = str(row.get("reflectionText") or "")
        learner = str(row.get("learnerPseudonym") or "")
        if DIRECT_IDENTIFIER_RE.search(reflection) or DIRECT_IDENTIFIER_RE.search(learner):
            errors.append(f"row {idx}: possible direct identifier found")
            continue
        try:
            pd.Timestamp(row["timestamp"])
        except Exception:
            errors.append(f"row {idx}: invalid timestamp")
            continue
        valid.append(row)
    return valid, errors


def _count_cues(text: str, cues: tuple[str, ...]) -> int:
    low = text.lower()
    return sum(low.count(c) for c in cues)


def _features(events: list[dict]) -> pd.DataFrame:
    sessions: dict[str, list[dict]] = defaultdict(list)
    for event in events:
        sessions[str(event["sessionId"])].append(event)

    rows = []
    for session_id, evs in sessions.items():
        evs_sorted = sorted(evs, key=lambda e: pd.Timestamp(e["timestamp"]))
        learner = str(evs_sorted[0].get("learnerPseudonym", "unknown"))
        scenario = str(evs_sorted[0].get("scenarioId", "unknown"))
        event_counts = Counter(str(e.get("eventType")) for e in evs_sorted)
        step_counts = Counter(str(e.get("pathStep") or "") for e in evs_sorted)
        hotspots = {str(e.get("hotspotId")) for e in evs_sorted if e.get("hotspotId")}
        reflections = " ".join(str(e.get("reflectionText") or "") for e in evs_sorted).strip()
        labels = [str(e.get("teacherLabel")) for e in evs_sorted if e.get("teacherLabel")]
        label = labels[-1] if labels else ""
        timestamps = [pd.Timestamp(e["timestamp"]) for e in evs_sorted]
        duration_sec = max(0.0, (max(timestamps) - min(timestamps)).total_seconds()) if len(timestamps) > 1 else 0.0
        dwell_total_ms = sum(float(e.get("dwellMs") or 0) for e in evs_sorted)
        completed_steps = all(step_counts.get(step, 0) > 0 for step in ("Observe", "Decide", "Justify", "Reflect"))
        reasoning_cues = _count_cues(reflections, ("because", "therefore", "evidence", "so that", "i compared"))
        uncertainty_cues = _count_cues(reflections, ("maybe", "not sure", "confused", "unclear", "i think"))

        rows.append(
            {
                "sessionId": session_id,
                "learnerPseudonym": learner,
                "scenarioId": scenario,
                "event_count": len(evs_sorted),
                "hotspot_click_count": event_counts.get("hotspot_click", 0),
                "unique_hotspots": len(hotspots),
                "branch_choice_count": event_counts.get("branch_choice", 0),
                "quiz_response_count": event_counts.get("quiz_response", 0),
                "reflection_submit_count": event_counts.get("reflection_submit", 0),
                "duration_sec": duration_sec,
                "dwell_total_ms": dwell_total_ms,
                "completed_pathway": int(completed_steps),
                "reflection_length": len(reflections),
                "reasoning_cues": reasoning_cues,
                "uncertainty_cues": uncertainty_cues,
                "reflection_text": reflections,
                "teacherLabel": label,
                "feedbackNeeded": int(label == "feedbackNeeded"),
            }
        )
    return pd.DataFrame(rows)


def _rule_score(row: pd.Series) -> float:
    score = 0.15
    if not int(row.get("completed_pathway", 0)):
        score += 0.25
    if float(row.get("reflection_length", 0)) < 60:
        score += 0.2
    if float(row.get("uncertainty_cues", 0)) > float(row.get("reasoning_cues", 0)):
        score += 0.2
    if float(row.get("hotspot_click_count", 0)) < 2:
        score += 0.15
    return float(min(0.95, max(0.05, score)))


def _evaluate_ablation(df: pd.DataFrame, feature_cols: list[str], text_col: str | None = None) -> dict:
    labelled = df[df["teacherLabel"].isin(["feedbackNeeded", "onTrack", "strongEvidence"])].copy()
    labelled["y"] = (labelled["teacherLabel"] == "feedbackNeeded").astype(int)
    if len(labelled) < 100 or labelled["y"].nunique() < 2:
        return {"mode": "not_enough_labelled_sessions", "session_count": int(len(labelled))}

    groups = labelled["learnerPseudonym"].astype(str)
    split = GroupShuffleSplit(n_splits=1, test_size=0.25, random_state=RANDOM_SEED)
    train_idx, test_idx = next(split.split(labelled, labelled["y"], groups=groups))
    train = labelled.iloc[train_idx]
    test = labelled.iloc[test_idx]

    transformers = [("num", StandardScaler(), feature_cols)]
    cols_for_model = feature_cols[:]
    if text_col:
        transformers.append(("text", TfidfVectorizer(max_features=800, ngram_range=(1, 2), min_df=1), text_col))
        cols_for_model.append(text_col)

    pipe = Pipeline(
        steps=[
            ("prep", ColumnTransformer(transformers=transformers, remainder="drop")),
            ("clf", LogisticRegression(max_iter=300, class_weight="balanced", random_state=RANDOM_SEED)),
        ]
    )
    pipe.fit(train[cols_for_model], train["y"])
    pred = pipe.predict(test[cols_for_model])
    proba = pipe.predict_proba(test[cols_for_model])[:, 1]

    return {
        "mode": "trained_pilot_model",
        "session_count": int(len(labelled)),
        "macro_f1": float(f1_score(test["y"], pred, average="macro", zero_division=0)),
        "feedbackNeededRecall": float(recall_score(test["y"], pred, zero_division=0)),
        "calibrationBrier": float(brier_score_loss(test["y"], proba)),
        "confusion_matrix": confusion_matrix(test["y"], pred, labels=[0, 1]).tolist(),
    }


def _write_model_card(metrics: dict, errors: list[str]) -> None:
    card = [
        "# Pilot Learning-Environment Model Card",
        "",
        "## Intended use",
        "Teacher-in-the-loop support for immersive learning environments using anonymised ThingLink-style event exports.",
        "",
        "## Current status",
        metrics.get("status", "unknown"),
        "",
        "## Targets",
        "- feedbackNeeded",
        "- engagementPattern",
        "- reflectionQuality",
        "- reasoningDepth",
        "- competenceEvidenceLevel",
        "- suggestedTeacherAction",
        "",
        "## Evaluation",
        json.dumps(metrics.get("evaluation", {}), indent=2),
        "",
        "## Limitations",
        "- Not an automatic grading system.",
        "- Requires anonymised pilot data and teacher labels for scientific claims.",
        "- Public-data baselines are not ThingLink telemetry.",
    ]
    if errors:
        card.extend(["", "## Import warnings", *[f"- {e}" for e in errors[:20]]])
    (OUTPUTS_DIR / "pilot_model_card.md").write_text("\n".join(card), encoding="utf-8")


def main() -> None:
    ensure_dirs()
    raw_rows = _load_json_events()
    valid, errors = _validate(raw_rows)
    df = _features(valid) if valid else pd.DataFrame()

    if not df.empty:
        df.to_csv(OUTPUTS_DIR / "pilot_feature_table.csv", index=False)

    predictions = []
    for _, row in df.iterrows():
        score = _rule_score(row)
        predictions.append(
            {
                "sessionId": row["sessionId"],
                "learnerPseudonym": row["learnerPseudonym"],
                "scenarioId": row["scenarioId"],
                "feedbackNeedScore": round(score, 4),
                "feedbackNeeded": score >= 0.5,
                "evidenceLines": [
                    f"hotspot_click_count={row['hotspot_click_count']}",
                    f"completed_pathway={row['completed_pathway']}",
                    f"reflection_length={row['reflection_length']}",
                    f"reasoning_cues={row['reasoning_cues']}",
                    f"uncertainty_cues={row['uncertainty_cues']}",
                ],
                "method": "small-data rule baseline; train pilot model only after sufficient labelled sessions",
            }
        )
    write_json(OUTPUTS_DIR / "pilot_predictions.json", predictions)

    numeric = [
        "event_count",
        "hotspot_click_count",
        "unique_hotspots",
        "branch_choice_count",
        "quiz_response_count",
        "reflection_submit_count",
        "duration_sec",
        "dwell_total_ms",
        "completed_pathway",
        "reflection_length",
        "reasoning_cues",
        "uncertainty_cues",
    ]

    eval_clicks = _evaluate_ablation(df, ["event_count", "hotspot_click_count", "unique_hotspots"]) if not df.empty else {}
    eval_text = _evaluate_ablation(df, ["reflection_length", "reasoning_cues", "uncertainty_cues"], "reflection_text") if not df.empty else {}
    eval_combined = _evaluate_ablation(df, numeric, "reflection_text") if not df.empty else {}

    status = (
        "No pilot data found. Place anonymised events at ml/data/raw/thinglink_pilot_events.json."
        if not raw_rows
        else "Small-data rule baseline only; collect at least 100 labelled sessions before pilot model claims."
        if len(df) < 100
        else "Pilot evaluation ready; inspect ablation metrics before making claims."
    )

    metrics = {
        "data_available": bool(raw_rows),
        "valid_event_count": int(len(valid)),
        "rejected_event_count": int(len(errors)),
        "session_count": int(len(df)),
        "status": status,
        "targets": [
            "feedbackNeeded",
            "engagementPattern",
            "reflectionQuality",
            "reasoningDepth",
            "competenceEvidenceLevel",
            "suggestedTeacherAction",
        ],
        "evaluation": {
            "clicks_only": eval_clicks,
            "text_only": eval_text,
            "combined_trace_text": eval_combined,
        },
        "limitations": [
            "Teacher labels are required as reference standard.",
            "No live ThingLink API is assumed.",
            "Direct identifiers are rejected where detected, but governance review remains required.",
        ],
    }
    write_json(OUTPUTS_DIR / "pilot_model_metrics.json", metrics)
    _write_model_card(metrics, errors)
    print(status)


if __name__ == "__main__":
    main()
