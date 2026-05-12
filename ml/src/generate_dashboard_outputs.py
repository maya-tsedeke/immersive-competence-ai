"""
Combine OULAD risk outputs, dialogue model outputs, and mock ThingLink fields.

Writes dashboard-friendly JSON under src/lib/generated/ (capped learner count).
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

import numpy as np
import pandas as pd

ML_ROOT = Path(__file__).resolve().parents[1]
SRC = Path(__file__).resolve().parent
for p in (ML_ROOT, SRC):
    if str(p) not in sys.path:
        sys.path.insert(0, str(p))

from config import (  # noqa: E402
    DASHBOARD_LEARNER_COUNT,
    DASHBOARD_LEARNER_MAX,
    DASHBOARD_LEARNER_MIN,
    DATA_PROCESSED,
    GENERATED_DIR,
    OUTPUTS_DIR,
    RANDOM_SEED,
    ensure_dirs,
)
from utils import display_learner_id, llm_placeholder_summarize, stable_anon_id, write_json  # noqa: E402


def _reasoning_ui(depth: str) -> str:
    d = (depth or "").strip().lower()
    if d == "high":
        return "Good"
    if d == "low":
        return "Needs support"
    return "Developing"


def _engagement_from_clicks(clicks: float) -> str:
    if clicks < 800:
        return "Low"
    if clicks < 3500:
        return "Medium"
    return "High"


def _reflection_level(q: str) -> str:
    return q if q in ("Low", "Medium", "High") else "Medium"


def _rubric_reflection(r: str) -> str:
    if r == "High":
        return "Good"
    if r == "Low":
        return "Needs support"
    return "Developing"


def _status(risk_score: float, at_risk_pred: int) -> str:
    if risk_score >= 0.55 or at_risk_pred == 1:
        return "At risk"
    if risk_score >= 0.35:
        return "Needs feedback"
    return "Strong"


def _score_from_assessment(mean_score: float) -> int:
    if pd.isna(mean_score):
        return 65
    return int(max(0, min(100, float(mean_score))))


def main() -> None:
    ensure_dirs()
    n_cap = max(DASHBOARD_LEARNER_MIN, min(DASHBOARD_LEARNER_MAX, DASHBOARD_LEARNER_COUNT))

    oulad_path = DATA_PROCESSED / "oulad_features.csv"
    risk_path = OUTPUTS_DIR / "learner_risk_predictions.json"
    dialogue_csv = DATA_PROCESSED / "dialogue_features.csv"
    dp_path = OUTPUTS_DIR / "dialogue_predictions.json"

    if not oulad_path.is_file():
        raise FileNotFoundError(oulad_path)
    if not risk_path.is_file():
        raise FileNotFoundError(risk_path)

    oulad = pd.read_csv(oulad_path)
    risks = pd.DataFrame(json.loads(risk_path.read_text(encoding="utf-8")))
    dlg = pd.read_csv(dialogue_csv) if dialogue_csv.is_file() else pd.DataFrame()
    dlg_preds = (
        pd.DataFrame(json.loads(dp_path.read_text(encoding="utf-8"))) if dp_path.is_file() else pd.DataFrame()
    )

    oulad = oulad.copy()
    oulad["sourceStudentId"] = oulad["id_student"].apply(lambda x: stable_anon_id(int(x)))
    merged = oulad.merge(risks, on="sourceStudentId", how="inner", suffixes=("", "_risk"))
    merged["riskScore"] = pd.to_numeric(merged["riskScore"], errors="coerce").fillna(0.5)

    idx_max = merged.groupby("id_student")["riskScore"].idxmax()
    top = merged.loc[idx_max].sort_values("riskScore", ascending=False).head(n_cap)

    dlg_n = len(dlg) if not dlg.empty else 0

    dash_learners = []
    dialogue_insights = []
    interaction_logs = []
    rubric_by_learner: dict = {}

    for i, (_, row) in enumerate(top.iterrows()):
        sid = int(row["id_student"])
        lid = str(row.get("learnerId") or display_learner_id(sid, i))
        rs = float(row["riskScore"])
        pred_fail = str(row.get("predictedOutcome", "")).startswith("Fail")
        if "predictedOutcome" not in row or pd.isna(row.get("predictedOutcome")):
            pred_fail = rs >= 0.5
        pred_or = int(pred_fail)
        mean_scr = row.get("mean_assessment_score", np.nan)
        clicks = float(row.get("total_clicks", 0) or 0)
        if np.isnan(clicks):
            clicks = 0.0

        d_idx = i % dlg_n if dlg_n else -1
        dlg_row = dlg.iloc[d_idx] if d_idx >= 0 else None
        dp_row = dlg_preds.iloc[d_idx] if d_idx >= 0 and not dlg_preds.empty else None

        refl_q = str(dp_row["predicted_reflection_quality"]) if dp_row is not None else "Medium"
        reas = str(dp_row["predicted_reasoning_depth"]) if dp_row is not None else "Medium"
        conf = bool(int(dp_row["predicted_confusion"])) if dp_row is not None else False
        conf_f = float(dp_row["confidence_confusion_proxy"]) if dp_row is not None else 0.65

        student_text = str(dlg_row["student_messages"]) if dlg_row is not None else ""
        topic = str(dlg_row["topic"]) if dlg_row is not None else "Module topic (dialogue corpus)"

        ref_level = _reflection_level(refl_q)

        last_ad = row.get("last_activity_date", 200)
        if last_ad is None or (isinstance(last_ad, float) and np.isnan(last_ad)):
            last_ad = 200
        last_ad = int(last_ad)
        first_ad = row.get("first_activity_date", 0)
        if first_ad is None or (isinstance(first_ad, float) and np.isnan(first_ad)):
            first_ad = 0
        first_ad = int(first_ad)

        dash_learners.append(
            {
                "id": lid,
                "score": _score_from_assessment(mean_scr),
                "engagement": _engagement_from_clicks(clicks),
                "reflection": ref_level,
                "status": _status(rs, pred_or),
                "completedAt": f"Day {last_ad}",
                "timeSpentMin": round(float(clicks) / 220.0, 1),
                "sourceStudentId": row["sourceStudentId"],
                "riskScore": round(rs, 4),
                "code_module": row.get("code_module"),
                "code_presentation": row.get("code_presentation"),
            }
        )

        misconception = (
            "Heuristic cue: learner language suggests uncertainty in the sampled dialogue "
            "(instructional signal only, not a clinical label)."
            if conf
            else "No strong confusion heuristic in the sampled dialogue excerpt."
        )

        dialogue_insights.append(
            {
                "conversationId": str(dlg_row["conversation_id"]) if dlg_row is not None else f"conv_{i:04d}",
                "learnerId": lid,
                "reflectionQuality": ref_level,
                "reasoningDepth": _reasoning_ui(reas),
                "confusionDetected": conf,
                "aiReasoningSummary": llm_placeholder_summarize(student_text)[:500],
                "misconception": misconception,
                "teacherFeedbackSuggestion": (
                    "Ask the learner to explain why the selected action fits the observed evidence "
                    "(AI-assisted suggestion — prototype)."
                ),
                "confidence": round(float(conf_f), 2),
                "topic": topic,
                "labelDisclaimer": (
                    "Heuristic proof-of-concept labels — not validated ground truth; use as discussion prompts only."
                ),
            }
        )

        first_d = first_ad
        last_d = last_ad
        mid = first_d + max(0, (last_d - first_d) // 3)
        mid2 = first_d + max(0, (last_d - first_d) // 2)

        interaction_logs.append(
            {
                "learnerId": lid,
                "events": [
                    {"id": "t1", "label": "Scenario engagement start (VLE proxy)", "at": f"Day {first_d}", "tone": "default"},
                    {
                        "id": "t2",
                        "label": f"Resource / hotspot intensity (~{int(clicks)} clicks)",
                        "at": f"Day {mid}",
                        "tone": "success",
                    },
                    {
                        "id": "t3",
                        "label": "Assessment-related activity (OULAD proxy)",
                        "at": f"Day {mid2}",
                        "tone": "warning" if pred_or else "default",
                    },
                    {
                        "id": "t4",
                        "label": "Reflection / dialogue (public dataset proxy)",
                        "at": f"Day {last_d}",
                        "tone": "success",
                    },
                ],
            }
        )

        obs = "Good" if clicks > 2000 else "Developing"
        dec = "Developing" if pred_or else "Good"
        just = _reasoning_ui(reas)
        refl_r = _rubric_reflection(ref_level)
        rubric_by_learner[lid] = [
            {"criterion": "Observation", "rating": obs},
            {"criterion": "Decision-making", "rating": dec},
            {"criterion": "Justification", "rating": just},
            {"criterion": "Reflection", "rating": refl_r},
        ]

    risk_subset = []
    for _, row in top.iterrows():
        m = risks[risks["sourceStudentId"] == row["sourceStudentId"]]
        m = m.sort_values("riskScore", ascending=False) if "riskScore" in m.columns else m
        rec = m.iloc[0].to_dict() if not m.empty else {}
        out = {
            "learnerId": row.get("learnerId") or display_learner_id(int(row["id_student"]), 0),
            "sourceStudentId": row["sourceStudentId"],
            "riskScore": round(float(row["riskScore"]), 4),
            "riskLevel": "At risk" if float(row["riskScore"]) >= 0.5 else "Lower risk indicator",
            "predictedOutcome": "Fail or Withdrawn" if float(row["riskScore"]) >= 0.5 else "Pass or Distinction",
            "keyFactors": rec.get("keyFactors") or ["Review activity and assessment trajectory."],
            "teacherRecommendation": rec.get("teacherRecommendation")
            or "Suggested teacher action: monitor engagement using prototype indicators only.",
        }
        risk_subset.append(out)

    at_risk_ids = [d["id"] for d in dash_learners if d["status"] == "At risk"]

    hotspot_completion = [
        {"id": "h1", "label": "Observe / resource clicks", "percent": 88},
        {"id": "h2", "label": "Decide / mixed activity types", "percent": 72},
        {"id": "h3", "label": "Assess / explain (score proxy)", "percent": 64},
        {"id": "h4", "label": "Reflect (dialogue proxy)", "percent": 58},
    ]

    scenario = {
        "scenarioInteractionEvents": [
            {"id": "t1", "label": "Cohort VLE activity begins", "at": "T+0", "tone": "default"},
            {"id": "t2", "label": "Hotspot / resource traffic builds", "at": "T+25pct module", "tone": "success"},
            {"id": "t3", "label": "Assessment clustering window", "at": "T+50pct module", "tone": "warning"},
            {"id": "t4", "label": "Dialogue-style reflection activity", "at": "T+75pct module", "tone": "success"},
        ],
        "learningPathway": "Observe → Decide → Justify → Reflect",
        "hotspotCompletion": hotspot_completion,
        "engagementDistribution": [
            {"label": "High", "percent": 33, "color": "#16a34a"},
            {"label": "Medium", "percent": 45, "color": "#f59e0b"},
            {"label": "Low", "percent": 22, "color": "#f87171"},
        ],
        "competenceTrend": [
            {"date": "Week 1", "score": 58},
            {"date": "Week 2", "score": 62},
            {"date": "Week 3", "score": 66},
            {"date": "Week 4", "score": 70},
            {"date": "Week 5", "score": 73},
        ],
        "completionDonut": [
            {"name": "On track", "value": 68, "color": "#6366f1"},
            {"name": "Developing", "value": 22, "color": "#38bdf8"},
            {"name": "Monitor", "value": 10, "color": "#cbd5f5"},
        ],
        "keyInsight": (
            "Prototype mapping: higher at-risk indicators cluster with lower early assessment engagement "
            "in OULAD — treat as a research indicator only."
        ),
        "kpi": {
            "avgScorePct": int(np.nanmean([d["score"] for d in dash_learners]) or 73),
            "learnersAtRiskCount": len(at_risk_ids),
            "avgEngagementMin": round(float(np.mean([d["timeSpentMin"] for d in dash_learners]) or 14.2), 1),
            "reflectionLabel": "Medium–High",
        },
        "mappingNote": (
            "OULAD activity → ThingLink-style timeline and hotspots; dialogue corpus → reflection / AI chat proxy."
        ),
    }

    ai_insights = [
        {
            "id": "1",
            "title": "AI-assisted class insight (baseline)",
            "body": (
            "Public OULAD + dialogue prototypes suggest reviewing justification depth relative to interaction patterns "
            "— use as a feedback-need indicator for discussion with learners, not as a sole basis for high-stakes decisions."
            ),
            "confidence": "Medium · prototype",
        },
        {
            "id": "2",
            "title": "Heuristic dialogue pattern",
            "body": (
                "Confusion heuristics align with shorter reflective turns in the education dialogue sample "
                "(labels are not validated ground truth)."
            ),
            "confidence": "Prototype confidence",
        },
        {
            "id": "3",
            "title": "Suggested teacher action",
            "body": "Add structured rationale scaffolds after decision points; reinforce evidence-based reflection prompts.",
            "confidence": "Pedagogical suggestion",
        },
    ]

    report_summary = {
        "title": "Competence Analytics Report (baseline)",
        "scenarioName": "Public dataset prototype (OULAD + dialogue mapping)",
        "learnerCount": len(dash_learners),
        "classSummary": (
            f"Sample of {len(dash_learners)} learners ranked by prototype at-risk score. "
            "Not validated on real ThingLink telemetry."
        ),
        "atRiskLearners": at_risk_ids[:20],
        "misconceptions": [
            "Heuristic confusion cues in dialogue excerpts",
            "Early vs late assessment engagement (OULAD baseline)",
        ],
        "recommendedActions": [
            "Review the Model information / limitations card with stakeholders",
            "Plan anonymised ThingLink-style pilot export for learning-environment validation",
        ],
    }

    meta = {
        "generatedBy": "generate_dashboard_outputs.py",
        "dashboardLearnerCap": n_cap,
        "randomSeed": RANDOM_SEED,
        "datasetNote": "OULAD + Education Dialogue Dataset — not ThingLink production data.",
        "dialogueLabelNote": "Heuristic proof-of-concept labels only — not validated annotations.",
        "uiBaselineLabel": "AI baseline model · Public dataset prototype",
    }

    write_json(GENERATED_DIR / "dashboardLearners.json", {"learners": dash_learners, "meta": meta})
    write_json(GENERATED_DIR / "learnerRiskPredictions.json", risk_subset)
    write_json(GENERATED_DIR / "dialogueInsights.json", dialogue_insights)
    write_json(GENERATED_DIR / "scenarioAnalytics.json", scenario)
    write_json(GENERATED_DIR / "aiInsights.json", ai_insights)
    write_json(GENERATED_DIR / "reportSummary.json", report_summary)
    write_json(GENERATED_DIR / "interactionLogs.json", interaction_logs)
    write_json(GENERATED_DIR / "rubricByLearner.json", rubric_by_learner)
    print("Wrote dashboard JSON to", GENERATED_DIR)


if __name__ == "__main__":
    main()
