"""
Dataset readiness checklist, inspection, publication-style figures, and markdown reports.

Run modes:
  python src/inspect_and_report_datasets.py --inspect-only
  python src/inspect_and_report_datasets.py --report-only
  python src/inspect_and_report_datasets.py --full  (inspect + full report)
"""

from __future__ import annotations

import argparse
import json
import sys
from datetime import datetime
from pathlib import Path

import numpy as np
import pandas as pd

ML_ROOT = Path(__file__).resolve().parents[1]
SRC = Path(__file__).resolve().parent
for p in (ML_ROOT, SRC):
    if str(p) not in sys.path:
        sys.path.insert(0, str(p))

from config import (  # noqa: E402
    DATA_PROCESSED,
    DIALOGUE_EXTRACT_DIR,
    DIALOGUE_ZIP,
    GENERATED_DIR,
    OUTPUTS_DIR,
    OULAD_EXTRACT_DIR,
    OULAD_ZIP,
    REPORTS_DIR,
    REPORTS_FIGURES_DIR,
    REPORTS_TABLES_DIR,
    ensure_dirs,
)

OULAD_EXPECTED = [
    "studentInfo.csv",
    "studentVle.csv",
    "vle.csv",
    "studentAssessment.csv",
    "assessments.csv",
    "studentRegistration.csv",
    "courses.csv",
]

# --- Publication-facing labels (internal column keys stay snake_case in code/data) ---

DISPLAY_LABELS: dict[str, str] = {
    "final_result": "Final Learning Outcome",
    "at_risk": "Learner Risk Status",
    "total_clicks": "Total Learning Interactions",
    "active_days": "Number of Active Learning Days",
    "mean_assessment_score": "Average Assessment Score",
    "weighted_assessment_score": "Weighted Assessment Score",
    "reflection_quality": "Reflection Quality",
    "confusion_detected": "Detected Learning Difficulty",
    "reasoning_depth": "Reasoning Depth",
    "needs_teacher_feedback": "Need for Teacher Feedback",
    "number_of_turns": "Number of Dialogue Turns",
    "average_student_message_length": "Average Learner Response Length",
    "student_question_count": "Number of Learner Questions",
    "reasoning_markers": "Reasoning Indicators",
    "reflection_markers": "Reflection Indicators",
    "confusion_markers": "Uncertainty Indicators",
    "early_25_total_clicks": "Learning Interactions in First 25% of Course",
    "early_50_total_clicks": "Learning Interactions in First 50% of Course",
    "early_75_total_clicks": "Learning Interactions in First 75% of Course",
    "logistic_regression": "Logistic Regression",
    "random_forest": "Random Forest",
    "hist_gradient_boosting": "Histogram Gradient Boosting",
    "xgboost": "Extreme Gradient Boosting",
    "binary_at_risk": "Learner Risk Prediction",
    "multiclass_final_result": "Final Learning Outcome Prediction",
    "tfidf_logistic": "TF–IDF Logistic Regression",
    "tfidf_linearsvc": "TF–IDF Linear SVM",
}

VALUE_LABELS: dict[str, dict] = {
    "at_risk": {
        0: "Not At Risk",
        1: "At Risk",
        "0": "Not At Risk",
        "1": "At Risk",
    },
    "confusion_detected": {
        0: "No Learning Difficulty Detected",
        1: "Learning Difficulty Detected",
        False: "No Learning Difficulty Detected",
        True: "Learning Difficulty Detected",
        "0": "No Learning Difficulty Detected",
        "1": "Learning Difficulty Detected",
        "False": "No Learning Difficulty Detected",
        "True": "Learning Difficulty Detected",
    },
    "needs_teacher_feedback": {
        0: "No Immediate Feedback Needed",
        1: "Teacher Feedback Recommended",
        False: "No Immediate Feedback Needed",
        True: "Teacher Feedback Recommended",
        "0": "No Immediate Feedback Needed",
        "1": "Teacher Feedback Recommended",
    },
    "reflection_quality": {
        "Low": "Low Reflection Quality",
        "Medium": "Moderate Reflection Quality",
        "High": "High Reflection Quality",
    },
    "reasoning_depth": {
        "Low": "Low Reasoning Depth",
        "Medium": "Moderate Reasoning Depth",
        "High": "High Reasoning Depth",
    },
    "final_result": {
        "Distinction": "Distinction",
        "Pass": "Pass",
        "Fail": "Fail",
        "Withdrawn": "Withdrawn",
    },
}

FREQ_LEARNER_RECORDS = "Number of Learner Records"
FREQ_CONVERSATIONS = "Number of Conversations"


def _humanize_unknown_key(key: str) -> str:
    """Readable fallback: never emit raw snake_case feature tokens on figures."""
    s = str(key)
    if s.startswith("activity_"):
        rest = s[9:].replace("_", " ").strip()
        base = rest.title() if rest else "Activity"
        return f"{base} (learning-activity intensity)"
    parts = s.replace("_", " ").strip().title().split()
    return " ".join(parts) if parts else s


def display_label(name: str | None) -> str:
    if name is None:
        return ""
    s = str(name)
    return DISPLAY_LABELS.get(s, _humanize_unknown_key(s))


def display_value(column: str, value) -> str:
    """Map raw class / category values to article-ready text."""
    col = str(column)
    m = VALUE_LABELS.get(col, {})
    if value in m:
        return str(m[value])
    # NumPy scalars
    if hasattr(value, "item"):
        try:
            value = value.item()
        except (ValueError, AttributeError):
            pass
    if isinstance(value, (np.integer, np.floating)):
        iv = int(value)
        if iv in m:
            return str(m[iv])
        sv = str(iv)
        if sv in m:
            return str(m[sv])
    if isinstance(value, float) and value.is_integer():
        iv = int(value)
        if iv in m:
            return str(m[iv])
    if isinstance(value, str):
        if value in m:
            return str(m[value])
        lowered = {str(k).lower(): v for k, v in m.items() if isinstance(k, str)}
        if value.lower() in lowered:
            return str(lowered[value.lower()])
    if isinstance(value, (bool, np.bool_)) and value in m:
        return str(m[bool(value)])
    sv = str(value).strip()
    if sv in m:
        return str(m[sv])
    try:
        iv = int(float(sv))
        if iv in m:
            return str(m[iv])
    except (ValueError, TypeError):
        pass
    return str(value)


def display_model_name(name: str | None) -> str:
    if name is None:
        return ""
    s = str(name)
    return DISPLAY_LABELS.get(s, _humanize_unknown_key(s))


def display_task_name(name: str | None) -> str:
    if name is None:
        return ""
    s = str(name)
    if s in DISPLAY_LABELS:
        return DISPLAY_LABELS[s]
    return display_label(s)


def _confusion_tick_labels(task_key: str, raw_labels: list) -> list[str]:
    return [display_value(task_key, x) for x in raw_labels]


def _stat_path(rel: str) -> dict:
    p = Path(rel)
    if not p.is_absolute():
        p = (ML_ROOT / rel).resolve() if not rel.startswith("src") else (ML_ROOT.parent / rel).resolve()
    out = {
        "path": str(p),
        "exists": p.exists(),
        "size_bytes": p.stat().st_size if p.exists() and p.is_file() else None,
        "mtime": datetime.fromtimestamp(p.stat().st_mtime).isoformat() if p.exists() else None,
    }
    if p.exists() and p.is_dir():
        out["size_bytes"] = sum(f.stat().st_size for f in p.rglob("*") if f.is_file())
    return out


def _status_row(name: str, rel: str, required_for: str) -> dict:
    st = _stat_path(rel)
    exists = st["exists"]
    if not exists:
        status = "Missing"
        rec = f"Missing {name}. See ml/README.md for required placement."
    elif "processed" in rel or "outputs" in rel or "generated" in rel:
        status = "Ready"
        rec = "File present; regenerate after pipeline step if data changed."
    else:
        status = "Ready"
        rec = "OK."
    return {
        "artifact": name,
        "relative": rel,
        "required_for": required_for,
        "exists": "yes" if exists else "no",
        "size_bytes": st["size_bytes"],
        "mtime": st["mtime"],
        "status": status,
        "recommendation": rec,
    }


def _line_count_csv(path: Path) -> int:
    try:
        with path.open("r", encoding="utf-8", errors="replace") as f:
            return max(0, sum(1 for _ in f) - 1)
    except OSError:
        return -1


def _setup_matplotlib():
    import matplotlib

    from matplotlib import font_manager as fm

    matplotlib.rcParams.update(
        {
            "font.family": "serif",
            "font.serif": ["Times New Roman", "Times", "DejaVu Serif"],
            "font.size": 12,
            "axes.titlesize": 15,
            "axes.labelsize": 13,
            "xtick.labelsize": 11,
            "ytick.labelsize": 11,
            "legend.fontsize": 11,
            "figure.dpi": 300,
            "savefig.dpi": 300,
            "axes.linewidth": 1.0,
        }
    )
    available = {f.name for f in fm.fontManager.ttflist}
    if "Times New Roman" not in available:
        print("[figures] WARNING: Times New Roman not found; using configured serif fallback (e.g. DejaVu Serif).")
    return matplotlib


def _save_fig(fig, stem: str):
    REPORTS_FIGURES_DIR.mkdir(parents=True, exist_ok=True)
    fig.savefig(REPORTS_FIGURES_DIR / f"{stem}.png", bbox_inches="tight", pad_inches=0.12)
    fig.savefig(REPORTS_FIGURES_DIR / f"{stem}.pdf", bbox_inches="tight", pad_inches=0.12)


def _bar_counts(ax, labels, counts, title: str, ylabel: str = FREQ_LEARNER_RECORDS, rotate: int = 0):
    colors = ["#2c5282", "#3182ce", "#63b3ed", "#90cdf4", "#bee3f8", "#e2e8f0"] * 4
    x = np.arange(len(labels))
    bars = ax.bar(x, counts, color=colors[: len(labels)], edgecolor="#1a202c", linewidth=0.4)
    ax.set_title(title, pad=8)
    ax.set_ylabel(ylabel)
    ax.set_xticks(x)
    max_lab = max((len(str(l)) for l in labels), default=0)
    tick_fs = 9 if max_lab > 12 else 10
    ax.set_xticklabels(labels, rotation=rotate, ha="right" if rotate else "center", fontsize=tick_fs)
    ax.grid(axis="y", linestyle="--", linewidth=0.5, alpha=0.35)
    ax.set_axisbelow(True)
    for b, c in zip(bars, counts):
        ax.text(b.get_x() + b.get_width() / 2, b.get_height(), str(int(c)), ha="center", va="bottom", fontsize=8)
    ax.spines["top"].set_visible(False)
    ax.spines["right"].set_visible(False)


def _plot_confusion_matrix(cm: list, labels: list[str], title: str, stem: str):
    _setup_matplotlib()
    import matplotlib.pyplot as plt

    arr = np.asarray(cm, dtype=float)
    ncls = arr.shape[0]
    # Larger canvas for multiclass; extra room for rotated tick labels and colorbar
    side = 4.8 + 0.55 * max(0, ncls - 2)
    fig_w = side + 0.9
    fig_h = side
    fig, ax = plt.subplots(figsize=(fig_w, fig_h), layout="constrained")
    im = ax.imshow(arr, cmap="Blues", aspect="auto")
    ax.set_xticks(range(ncls))
    ax.set_yticks(range(ncls))
    tick_fs = max(8.5, 11 - 0.8 * ncls)
    ax.set_xticklabels(labels, rotation=40, ha="right", fontsize=tick_fs)
    ax.set_yticklabels(labels, fontsize=tick_fs)
    ax.set_title(title, fontsize=14)
    ax.set_xlabel("Predicted category", fontsize=12)
    ax.set_ylabel("Observed category", fontsize=12)
    anno_fs = max(9.5, 12 - ncls)
    mx = float(arr.max()) if arr.size else 1.0
    for i in range(arr.shape[0]):
        for j in range(arr.shape[1]):
            v = int(arr[i, j])
            cell_frac = float(arr[i, j]) / max(mx, 1e-9)
            c = "white" if cell_frac > 0.55 else "black"
            ax.text(j, i, v, ha="center", va="center", color=c, fontsize=anno_fs)
    cbar = fig.colorbar(im, ax=ax, fraction=0.08, pad=0.02, shrink=0.82)
    cbar.set_label("Count (test samples)", fontsize=10)
    cbar.ax.tick_params(labelsize=9)
    _save_fig(fig, stem)
    plt.close(fig)


def build_checklist_rows() -> list[dict]:
    rows = []
    paths = [
        ("ZIP OULAD", "data/raw/anonymisedData.zip", "extract"),
        ("ZIP Dialogue", "data/raw/Education-Dialogue-Dataset-main.zip", "extract"),
        ("Extracted OULAD", "data/raw/oulad_extracted", "preprocess_oulad"),
        ("Extracted dialogue", "data/raw/dialogue_extracted", "preprocess_dialogue"),
        ("oulad_features.csv", "data/processed/oulad_features.csv", "training"),
        ("dialogue_features.csv", "data/processed/dialogue_features.csv", "training"),
        ("oulad_model_metrics.json", "outputs/oulad_model_metrics.json", "reports/model_charts"),
        ("dialogue_model_metrics.json", "outputs/dialogue_model_metrics.json", "reports/model_charts"),
        ("learner_risk_predictions.json", "outputs/learner_risk_predictions.json", "dashboard"),
        ("dialogue_predictions.json", "outputs/dialogue_predictions.json", "dashboard"),
        ("evaluation_summary.json", "outputs/evaluation_summary.json", "reports"),
    ]
    for name, rel, req in paths:
        rows.append(_status_row(name, rel, req))
    gen = [
        "src/lib/generated/dashboardLearners.json",
        "src/lib/generated/scenarioAnalytics.json",
        "src/lib/generated/aiInsights.json",
        "src/lib/generated/reportSummary.json",
        "src/lib/generated/dialogueInsights.json",
        "src/lib/generated/learnerRiskPredictions.json",
        "src/lib/generated/interactionLogs.json",
        "src/lib/generated/rubricByLearner.json",
    ]
    for rel in gen:
        rows.append(_status_row(rel.split("/")[-1], rel, "Next.js dashboard"))
    return rows


def print_checklist(rows: list[dict]) -> None:
    for r in rows:
        print(f"[{r['status']}] {r['artifact']}: exists={r['exists']}")


def write_checklist_md(rows: list[dict], path: Path) -> None:
    lines = [
        "# Dataset readiness checklist",
        "",
        f"Generated: {datetime.now().isoformat()}",
        "",
        "## Required paths",
        "",
        "| Artifact | Exists | Size (bytes) | Status | Required for | Recommendation |",
        "|----------|--------|--------------|--------|--------------|----------------|",
    ]
    for r in rows:
        sz = r["size_bytes"] if r["size_bytes"] is not None else "-"
        lines.append(
            f"| {r['artifact']} | {r['exists']} | {sz} | {r['status']} | {r['required_for']} | {r['recommendation']} |"
        )
    missing = [r for r in rows if r["status"] == "Missing"]
    lines.extend(["", "## Missing (action required)", ""])
    if not missing:
        lines.append("- None listed as Missing for critical ZIPs (verify manually).")
    else:
        for r in missing:
            if r["status"] == "Missing":
                lines.append(f"- **{r['artifact']}**: {r['recommendation']}")
    lines.extend(
        [
            "",
            "## Pipeline readiness",
            "",
            "- **Preprocessing**: requires both ZIPs and successful extract.",
            "- **Training**: requires `oulad_features.csv` and `dialogue_features.csv`.",
            "- **Dashboard JSON**: run `generate_dashboard_outputs.py` after training.",
            "",
        ]
    )
    path.write_text("\n".join(lines), encoding="utf-8")


def inspect_raw_oulad() -> tuple[list[dict], str]:
    rows = []
    notes = []
    root = OULAD_EXTRACT_DIR
    if not root.is_dir():
        return [], "OULAD extracted folder missing — run extract_datasets.py."
    for fn in OULAD_EXPECTED:
        p = root / fn
        if not p.is_file():
            hits = list(root.rglob(fn))
            p = hits[0] if hits else p
        if not p.is_file():
            notes.append(f"Missing raw file: {fn}")
            continue
        n = _line_count_csv(p)
        try:
            df = pd.read_csv(p, nrows=5)
            cols = list(df.columns)
            dups = ""
        except Exception as e:
            cols = []
            dups = str(e)
        rows.append(
            {
                "dataset": "oulad_raw",
                "file_name": fn,
                "rows_est": n,
                "columns": len(cols),
                "column_names": cols[:40],
                "note": dups,
            }
        )
    return rows, "\n".join(notes) if notes else ""


def inspect_raw_dialogue() -> tuple[list[dict], str]:
    rows = []
    notes = []
    root = DIALOGUE_EXTRACT_DIR
    if not root.is_dir():
        return [], "Dialogue extracted folder missing — run extract_datasets.py."
    for p in sorted(root.rglob("conversations*.json")):
        try:
            data = json.loads(p.read_text(encoding="utf-8"))
            n_conv = len(data) if isinstance(data, list) else 1
            sample = data[0] if isinstance(data, list) and data else data
        except Exception as e:
            notes.append(f"{p.name}: {e}")
            continue
        rows.append(
            {
                "file_name": p.name,
                "n_conversations": n_conv,
                "top_level_keys": list(sample.keys()) if isinstance(sample, dict) else [],
            }
        )
    return rows, "\n".join(notes)


def readiness_summary(rows: list[dict]) -> tuple[str, list[str]]:
    miss: list[str] = []
    if not OULAD_ZIP.is_file():
        miss.append(str(OULAD_ZIP))
    if not DIALOGUE_ZIP.is_file():
        miss.append(str(DIALOGUE_ZIP))
    ready_train = (
        (DATA_PROCESSED / "oulad_features.csv").is_file() and (DATA_PROCESSED / "dialogue_features.csv").is_file()
    )
    if miss:
        return "Not ready", miss
    if not ready_train:
        return "Not ready (preprocessing pending)", miss
    return "Ready", miss


def generate_figures_and_tables(oulad_df: pd.DataFrame | None, dlg_df: pd.DataFrame | None):
    _setup_matplotlib()
    import matplotlib.pyplot as plt

    REPORTS_TABLES_DIR.mkdir(parents=True, exist_ok=True)
    n_figs = 0

    if oulad_df is not None and len(oulad_df):
        # Class distributions
        if "final_result" in oulad_df.columns:
            vc = oulad_df["final_result"].value_counts()
            fig, ax = plt.subplots(figsize=(7.2, 3.8), layout="constrained")
            _bar_counts(
                ax,
                [display_value("final_result", x) for x in vc.index.tolist()],
                vc.values.tolist(),
                "Distribution of Final Learning Outcomes",
                ylabel=FREQ_LEARNER_RECORDS,
                rotate=35,
            )
            _save_fig(fig, "oulad_final_result_distribution")
            plt.close(fig)
            n_figs += 1
        if "at_risk" in oulad_df.columns:
            vc = oulad_df["at_risk"].value_counts().sort_index()
            labs = [display_value("at_risk", i) for i in (0, 1)]
            fig, ax = plt.subplots(figsize=(3.5, 3.8), layout="constrained")
            _bar_counts(
                ax,
                labs,
                [int(vc.get(i, 0)) for i in (0, 1)],
                "Distribution of Learner Risk Status",
                ylabel=FREQ_LEARNER_RECORDS,
            )
            _save_fig(fig, "oulad_at_risk_distribution")
            plt.close(fig)
            n_figs += 1
        if "code_module" in oulad_df.columns:
            vc = oulad_df["code_module"].value_counts().head(20)
            fig, ax = plt.subplots(figsize=(7.2, 4.5), layout="constrained")
            _bar_counts(
                ax,
                vc.index.tolist(),
                vc.values.tolist(),
                "Distribution of Course Modules (Top 20)",
                ylabel=FREQ_LEARNER_RECORDS,
                rotate=45,
            )
            _save_fig(fig, "oulad_module_distribution")
            plt.close(fig)
            n_figs += 1
        if "code_presentation" in oulad_df.columns:
            vc = oulad_df["code_presentation"].value_counts()
            fig, ax = plt.subplots(figsize=(7.2, 3.8), layout="constrained")
            _bar_counts(
                ax,
                vc.index.tolist(),
                vc.values.tolist(),
                "Distribution of Course Presentations",
                ylabel=FREQ_LEARNER_RECORDS,
                rotate=35,
            )
            _save_fig(fig, "oulad_presentation_distribution")
            plt.close(fig)
            n_figs += 1
        for col, stem, title_text in [
            ("total_clicks", "oulad_total_clicks_distribution", "Distribution of Total Learning Interactions"),
            ("active_days", "oulad_active_days_distribution", "Distribution of Active Learning Days"),
            (
                "mean_assessment_score",
                "oulad_average_assessment_score_distribution",
                "Distribution of Average Assessment Scores",
            ),
        ]:
            if col in oulad_df.columns:
                fig, ax = plt.subplots(figsize=(3.5, 3.2), layout="constrained")
                s = pd.to_numeric(oulad_df[col], errors="coerce").dropna()
                if len(s):
                    ax.hist(s.clip(upper=s.quantile(0.99)), bins=40, color="#2c5282", edgecolor="white")
                ax.set_title(title_text)
                ax.set_xlabel(display_label(col))
                ax.set_ylabel(FREQ_LEARNER_RECORDS)
                ax.grid(axis="y", linestyle="--", linewidth=0.5, alpha=0.35)
                ax.set_axisbelow(True)
                _save_fig(fig, stem)
                plt.close(fig)
                n_figs += 1
        if "final_result" in oulad_df.columns and "total_clicks" in oulad_df.columns:
            fig, ax = plt.subplots(figsize=(7.2, 4.5), layout="constrained")
            data = oulad_df[["final_result", "total_clicks"]].copy()
            data["total_clicks"] = pd.to_numeric(data["total_clicks"], errors="coerce")
            cats = sorted(data["final_result"].unique())
            ax.boxplot(
                [data.loc[data["final_result"] == c, "total_clicks"].dropna() for c in cats],
                tick_labels=[display_value("final_result", c) for c in cats],
            )
            ax.set_xticklabels([display_value("final_result", c) for c in cats], rotation=35, ha="right", fontsize=9)
            ax.set_title("Learning Interactions by Final Learning Outcome")
            ax.set_ylabel(display_label("total_clicks"))
            ax.grid(axis="y", linestyle="--", linewidth=0.5, alpha=0.35)
            ax.set_axisbelow(True)
            _save_fig(fig, "oulad_clicks_by_final_result")
            plt.close(fig)
            n_figs += 1
        if "final_result" in oulad_df.columns and "mean_assessment_score" in oulad_df.columns:
            fig, ax = plt.subplots(figsize=(7.2, 4.5), layout="constrained")
            data = oulad_df[["final_result", "mean_assessment_score"]].copy()
            data["mean_assessment_score"] = pd.to_numeric(data["mean_assessment_score"], errors="coerce")
            cats = sorted(data["final_result"].unique())
            ax.boxplot(
                [data.loc[data["final_result"] == c, "mean_assessment_score"].dropna() for c in cats],
                tick_labels=[display_value("final_result", c) for c in cats],
            )
            ax.set_xticklabels([display_value("final_result", c) for c in cats], rotation=35, ha="right", fontsize=9)
            ax.set_title("Assessment Performance by Final Learning Outcome")
            ax.set_ylabel(display_label("mean_assessment_score"))
            ax.grid(axis="y", linestyle="--", linewidth=0.5, alpha=0.35)
            ax.set_axisbelow(True)
            _save_fig(fig, "oulad_assessment_score_by_final_result")
            plt.close(fig)
            n_figs += 1
        miss = oulad_df.isna().mean().sort_values(ascending=False).head(25) * 100
        fig, ax = plt.subplots(figsize=(7.2, 4.8), layout="constrained")
        y_labels = [display_label(str(idx)) for idx in miss.index.tolist()][::-1]
        ax.barh(y_labels, miss.values.tolist()[::-1], color="#4a5568")
        ax.set_xlabel("Missing values (% of cells, by column)")
        ax.set_title("Missing Data in Processed Learning Analytics Features")
        ax.set_ylabel("Feature")
        ax.grid(axis="x", linestyle="--", linewidth=0.5, alpha=0.35)
        ax.set_axisbelow(True)
        _save_fig(fig, "oulad_missing_values_processed")
        plt.close(fig)
        n_figs += 1
        act_cols = [c for c in oulad_df.columns if c.startswith("activity_")][:15]
        if act_cols:
            means = oulad_df[act_cols].mean().sort_values(ascending=False)
            fig, ax = plt.subplots(figsize=(7.2, 4.5), layout="constrained")
            _bar_counts(
                ax,
                [display_label(c) for c in means.index.tolist()],
                means.round(1).tolist(),
                "Distribution of Learning Activity Types",
                ylabel="Mean interaction count",
                rotate=55,
            )
            _save_fig(fig, "oulad_activity_type_feature_distribution")
            plt.close(fig)
            n_figs += 1
        ec = ["early_25_total_clicks", "early_50_total_clicks", "early_75_total_clicks"]
        if all(c in oulad_df.columns for c in ec):
            fig, ax = plt.subplots(figsize=(7.2, 4.0), layout="constrained")
            parts = []
            labs = [display_label(c) for c in ec]
            for c in ec:
                s = pd.to_numeric(oulad_df[c], errors="coerce").dropna()
                s = s.clip(upper=s.quantile(0.99)) if len(s) else s
                parts.append(s)
            ax.boxplot(parts, tick_labels=labs)
            ax.set_title("Learning Interactions Across Early Course Windows")
            ax.set_ylabel("Total learning interactions (99th percentile clip)")
            ax.grid(axis="y", linestyle="--", linewidth=0.5, alpha=0.35)
            ax.set_axisbelow(True)
            _save_fig(fig, "oulad_early_window_clicks_comparison")
            plt.close(fig)
            n_figs += 1

    if dlg_df is not None and len(dlg_df):
        dlg_bar_specs = [
            ("reflection_quality", "dialogue_reflection_quality_distribution", "Distribution of Reflection Quality"),
            (
                "confusion_detected",
                "dialogue_confusion_detected_distribution",
                "Distribution of Detected Learning Difficulty",
            ),
            ("reasoning_depth", "dialogue_reasoning_depth_distribution", "Distribution of Reasoning Depth"),
            (
                "needs_teacher_feedback",
                "dialogue_needs_feedback_distribution",
                "Distribution of Teacher Feedback Need",
            ),
        ]
        for col, stem, title in dlg_bar_specs:
            if col in dlg_df.columns:
                vc = dlg_df[col].value_counts()
                fig, ax = plt.subplots(figsize=(4.2, 3.8), layout="constrained")
                _bar_counts(
                    ax,
                    [display_value(col, x) for x in vc.index.tolist()],
                    vc.values.tolist(),
                    title,
                    ylabel=FREQ_CONVERSATIONS,
                    rotate=20,
                )
                _save_fig(fig, stem)
                plt.close(fig)
                n_figs += 1
        dlg_hist_specs = [
            ("number_of_turns", "dialogue_turn_count_distribution", "Distribution of Dialogue Length"),
            (
                "average_student_message_length",
                "dialogue_student_message_length_distribution",
                "Distribution of Learner Response Length",
            ),
            ("reasoning_markers", "dialogue_reasoning_markers_distribution", "Distribution of Reasoning Indicators"),
            (
                "reflection_markers",
                "dialogue_reflection_markers_distribution",
                "Distribution of Reflection Indicators",
            ),
            ("confusion_markers", "dialogue_confusion_markers_distribution", "Distribution of Uncertainty Indicators"),
        ]
        for col, stem, title in dlg_hist_specs:
            if col in dlg_df.columns:
                fig, ax = plt.subplots(figsize=(3.5, 3.2), layout="constrained")
                s = pd.to_numeric(dlg_df[col], errors="coerce").dropna()
                if len(s):
                    ax.hist(s.clip(upper=s.quantile(0.99) if s.max() > 0 else 1), bins=35, color="#553c9a", edgecolor="white")
                ax.set_title(title)
                ax.set_xlabel(display_label(col))
                ax.set_ylabel(FREQ_CONVERSATIONS)
                ax.grid(axis="y", linestyle="--", linewidth=0.5, alpha=0.35)
                ax.set_axisbelow(True)
                _save_fig(fig, stem)
                plt.close(fig)
                n_figs += 1
        miss = dlg_df.isna().mean().sort_values(ascending=False).head(20) * 100
        fig, ax = plt.subplots(figsize=(7.2, 4.2), layout="constrained")
        y_labels = [display_label(str(idx)) for idx in miss.index.tolist()][::-1]
        ax.barh(y_labels, miss.values.tolist()[::-1], color="#553c9a")
        ax.set_xlabel("Missing values (% of cells, by column)")
        ax.set_title("Missing Data in Processed Dialogue Features")
        ax.set_ylabel("Feature")
        ax.grid(axis="x", linestyle="--", linewidth=0.5, alpha=0.35)
        ax.set_axisbelow(True)
        _save_fig(fig, "dialogue_missing_values_processed")
        plt.close(fig)
        n_figs += 1

    # Model charts from JSON (if present)
    oulad_m = OUTPUTS_DIR / "oulad_model_metrics.json"
    if oulad_m.is_file():
        j = json.loads(oulad_m.read_text(encoding="utf-8"))
        bin_models = j.get("binary_models") or {}
        names, acc, f1 = [], [], []
        for k, v in bin_models.items():
            names.append(k)
            acc.append(v.get("accuracy", 0))
            f1.append(v.get("macro_f1", 0))
        if names:
            fig, ax = plt.subplots(figsize=(7.2, 3.8), layout="constrained")
            x = np.arange(len(names))
            w = 0.35
            ax.bar(x - w / 2, acc, w, label="Accuracy", color="#2c5282")
            ax.bar(x + w / 2, f1, w, label="Macro F1", color="#718096")
            ax.set_xticks(x)
            ax.set_xticklabels([display_model_name(n) for n in names], rotation=25, ha="right", fontsize=9)
            ax.set_title("Learner risk prediction models (OULAD, held-out test set)")
            ax.set_ylabel("Metric value")
            ax.legend(loc="upper right", fontsize=9)
            ax.set_ylim(0, 1.05)
            ax.grid(axis="y", linestyle="--", linewidth=0.5, alpha=0.35)
            ax.set_axisbelow(True)
            _save_fig(fig, "oulad_model_comparison")
            plt.close(fig)
            n_figs += 1
        best = j.get("best_binary_model")
        if best and bin_models.get(best):
            cm = bin_models[best].get("confusion_matrix")
            lo = bin_models[best].get("labels_order", ["0", "1"])
            if cm:
                disp_labs = _confusion_tick_labels("at_risk", lo)
                _plot_confusion_matrix(
                    cm,
                    disp_labs,
                    f"Confusion matrix: Learner Risk Status — {display_model_name(best)}",
                    "oulad_at_risk_confusion_matrix",
                )
                n_figs += 1

    dlg_m = OUTPUTS_DIR / "dialogue_model_metrics.json"
    if dlg_m.is_file():
        j = json.loads(dlg_m.read_text(encoding="utf-8"))
        tasks = j.get("tasks") or {}
        names, acc, f1s = [], [], []
        for tname, tv in tasks.items():
            names.append(tname)
            acc.append(tv.get("accuracy", 0))
            f1s.append(tv.get("macro_f1", 0))
        if names:
            fig, ax = plt.subplots(figsize=(7.2, 3.8), layout="constrained")
            x = np.arange(len(names))
            w = 0.35
            ax.bar(x - w / 2, acc, w, label="Accuracy", color="#553c9a")
            ax.bar(x + w / 2, f1s, w, label="Macro F1", color="#b794f4")
            ax.set_xticks(x)
            ax.set_xticklabels([display_task_name(n) for n in names], rotation=15, ha="right", fontsize=9)
            ax.set_title("Dialogue learning tasks (held-out test set)")
            ax.set_ylabel("Metric value")
            ax.legend(loc="upper right", fontsize=9)
            ax.set_ylim(0, 1.05)
            ax.grid(axis="y", linestyle="--", linewidth=0.5, alpha=0.35)
            ax.set_axisbelow(True)
            _save_fig(fig, "dialogue_model_comparison")
            plt.close(fig)
            n_figs += 1
        stems = [
            ("reflection_quality", "dialogue_reflection_confusion_matrix", "Reflection Quality"),
            ("confusion_detected", "dialogue_confusion_confusion_matrix", "Detected Learning Difficulty"),
            ("reasoning_depth", "dialogue_reasoning_confusion_matrix", "Reasoning Depth"),
        ]
        for tn, stem, short_title in stems:
            tv = tasks.get(tn)
            if tv and tv.get("confusion_matrix"):
                labs_raw = tv.get("labels_order", [])
                disp_labs = _confusion_tick_labels(tn, labs_raw)
                _plot_confusion_matrix(
                    tv["confusion_matrix"],
                    disp_labs,
                    f"Confusion matrix: {short_title}",
                    stem,
                )
                n_figs += 1

    return n_figs


def write_tables(
    raw_summary: list[dict],
    oulad_df: pd.DataFrame | None,
    dlg_df: pd.DataFrame | None,
):
    REPORTS_TABLES_DIR.mkdir(parents=True, exist_ok=True)
    # raw_file_summary
    rows = []
    for r in raw_summary:
        if "file_name" not in r:
            continue
        fn = r["file_name"]
        ds = r.get("dataset", "oulad_raw")
        if ds == "dialogue_raw":
            hits = list(DIALOGUE_EXTRACT_DIR.rglob(fn)) if DIALOGUE_EXTRACT_DIR.is_dir() else []
            p = hits[0] if hits else Path()
            sz_mb = p.stat().st_size / (1024 * 1024) if p.is_file() else 0
            rows.append(
                {
                    "dataset": "dialogue_raw",
                    "file_name": fn,
                    "rows": r.get("n_conversations", -1),
                    "columns": len(r.get("top_level_keys") or []),
                    "file_size_mb": round(sz_mb, 4),
                    "missing_cells": "",
                    "duplicate_rows": "",
                }
            )
            continue
        p = OULAD_EXTRACT_DIR / fn
        if not p.is_file():
            hit = list(OULAD_EXTRACT_DIR.rglob(fn))
            p = hit[0] if hit else p
        sz_mb = p.stat().st_size / (1024 * 1024) if p.is_file() else 0
        miss = dup = 0
        nrows = r.get("rows_est", -1)
        ncols = r.get("columns", 0)
        if p.is_file() and nrows >= 0:
            try:
                df = pd.read_csv(p)
                miss = int(df.isna().sum().sum())
                dup = int(df.duplicated().sum())
                nrows = len(df)
                ncols = len(df.columns)
            except Exception:
                pass
        rows.append(
            {
                "dataset": r.get("dataset", "oulad_raw"),
                "file_name": fn,
                "rows": nrows,
                "columns": ncols,
                "file_size_mb": round(sz_mb, 4),
                "missing_cells": miss,
                "duplicate_rows": dup,
            }
        )
    pd.DataFrame(rows).to_csv(REPORTS_TABLES_DIR / "raw_file_summary.csv", index=False)

    if oulad_df is not None and len(oulad_df):
        dup_r = int(oulad_df.duplicated().sum())
        row = {
            "rows": len(oulad_df),
            "columns": len(oulad_df.columns),
            "unique_learners": oulad_df["id_student"].nunique() if "id_student" in oulad_df.columns else "",
            "modules": oulad_df["code_module"].nunique() if "code_module" in oulad_df.columns else "",
            "presentations": oulad_df["code_presentation"].nunique() if "code_presentation" in oulad_df.columns else "",
            "missing_percentage": round(float(oulad_df.isna().mean().mean() * 100), 4),
            "duplicate_rows": dup_r,
        }
        pd.DataFrame([row]).to_csv(REPORTS_TABLES_DIR / "oulad_processed_summary.csv", index=False)
        fr = pd.DataFrame()
        ar = pd.DataFrame()
        if "final_result" in oulad_df.columns:
            vc = oulad_df["final_result"].value_counts()
            pd.DataFrame(
                {
                    "final_learning_outcome": [display_value("final_result", x) for x in vc.index],
                    "count": vc.values,
                    "percent": (vc.values / len(oulad_df) * 100).round(2),
                }
            ).to_csv(REPORTS_TABLES_DIR / "oulad_class_distribution_final_result.csv", index=False)
            fr = pd.DataFrame(
                {
                    "attribute": [display_label("final_result")] * len(vc),
                    "category": [display_value("final_result", x) for x in vc.index],
                    "count": vc.values,
                    "percent": (vc.values / len(oulad_df) * 100).round(2),
                }
            )
        if "at_risk" in oulad_df.columns:
            vc = oulad_df["at_risk"].value_counts()
            pd.DataFrame(
                {
                    "learner_risk_status": [display_value("at_risk", x) for x in vc.index],
                    "count": vc.values,
                    "percent": (vc.values / len(oulad_df) * 100).round(2),
                }
            ).to_csv(REPORTS_TABLES_DIR / "oulad_class_distribution_at_risk.csv", index=False)
            ar = pd.DataFrame(
                {
                    "attribute": [display_label("at_risk")] * len(vc),
                    "category": [display_value("at_risk", x) for x in vc.index],
                    "count": vc.values,
                    "percent": (vc.values / len(oulad_df) * 100).round(2),
                }
            )
        if not fr.empty or not ar.empty:
            pd.concat([fr, ar], ignore_index=True).to_csv(REPORTS_TABLES_DIR / "oulad_class_distribution.csv", index=False)

    if dlg_df is not None and len(dlg_df):
        row = {
            "rows": len(dlg_df),
            "columns": len(dlg_df.columns),
            "conversations": len(dlg_df),
            "topics": dlg_df["topic"].nunique() if "topic" in dlg_df.columns else "",
            "missing_percentage": round(float(dlg_df.isna().mean().mean() * 100), 4),
            "duplicate_rows": int(dlg_df.duplicated().sum()),
        }
        pd.DataFrame([row]).to_csv(REPORTS_TABLES_DIR / "dialogue_processed_summary.csv", index=False)
        d_parts: list[pd.DataFrame] = []
        for col in ["reflection_quality", "confusion_detected", "reasoning_depth", "needs_teacher_feedback"]:
            if col in dlg_df.columns:
                vc = dlg_df[col].value_counts()
                d_parts.append(
                    pd.DataFrame(
                        {
                            "attribute": [display_label(col)] * len(vc),
                            "category": [display_value(col, x) for x in vc.index],
                            "count": vc.values,
                            "percent": (vc.values / len(dlg_df) * 100).round(2),
                        }
                    )
                )
                pd.DataFrame(
                    {
                        "category_label": [display_value(col, x) for x in vc.index],
                        "count": vc.values,
                        "percent": (vc.values / len(dlg_df) * 100).round(2),
                    }
                ).to_csv(REPORTS_TABLES_DIR / f"dialogue_class_distribution_{col}.csv", index=False)
        if d_parts:
            pd.concat(d_parts, ignore_index=True).to_csv(REPORTS_TABLES_DIR / "dialogue_class_distribution.csv", index=False)

    # model_metrics_summary.csv
    mrows = []
    if (OUTPUTS_DIR / "oulad_model_metrics.json").is_file():
        j = json.loads((OUTPUTS_DIR / "oulad_model_metrics.json").read_text(encoding="utf-8"))
        for k, v in (j.get("binary_models") or {}).items():
            mrows.append(
                {
                    "dataset": "oulad",
                    "task": display_task_name("binary_at_risk"),
                    "model": display_model_name(k),
                    "accuracy": v.get("accuracy"),
                    "macro_f1": v.get("macro_f1"),
                    "precision_learning_risk_class": v.get("precision_at_risk_class_1"),
                    "recall_learning_risk_class": v.get("recall_at_risk_class_1"),
                    "f1_learning_risk_class": v.get("f1_at_risk_class_1"),
                    "notes": "",
                }
            )
    if (OUTPUTS_DIR / "dialogue_model_metrics.json").is_file():
        j = json.loads((OUTPUTS_DIR / "dialogue_model_metrics.json").read_text(encoding="utf-8"))
        for t, v in (j.get("tasks") or {}).items():
            mrows.append(
                {
                    "dataset": "dialogue",
                    "task": display_task_name(t),
                    "model": display_model_name(v.get("model") or ""),
                    "accuracy": v.get("accuracy"),
                    "macro_f1": v.get("macro_f1"),
                    "precision_learning_risk_class": v.get("precision_positive_class_1"),
                    "recall_learning_risk_class": v.get("recall_positive_class_1"),
                    "f1_learning_risk_class": v.get("f1_positive_class_1"),
                    "notes": " | ".join(
                        p for p in (v.get("split_warning"), "; ".join(j.get("pipeline_warnings") or [])) if p
                    )[:500],
                }
            )
    if mrows:
        pd.DataFrame(mrows).to_csv(REPORTS_TABLES_DIR / "model_metrics_summary.csv", index=False)


def write_inspection_report_md(
    checklist_rows: list[dict],
    raw_oulad_note: str,
    oulad_df: pd.DataFrame | None,
    dlg_df: pd.DataFrame | None,
    n_figs: int,
):
    lines = [
        "# Dataset inspection report",
        "",
        f"Generated: {datetime.now().isoformat()}",
        "",
        "## 1. Readiness Checklist",
        "",
        "See `dataset_readiness_checklist.md` for the full table.",
        "",
        "## 2. Raw Dataset Inspection",
        "",
        raw_oulad_note or "(No blocking notes.)",
        "",
        "## 3. Processed OULAD Inspection",
        "",
    ]
    if oulad_df is None:
        lines.append("Processed OULAD not loaded (file missing).")
    else:
        lines.append(f"- Shape: {oulad_df.shape[0]} × {oulad_df.shape[1]}")
        lines.append(
            "- Feature overview (first 30, article labels): "
            + ", ".join(display_label(str(c)) for c in oulad_df.columns[:30])
        )
    lines.extend(["", "## 4. Processed Dialogue Inspection", ""])
    if dlg_df is None:
        lines.append("Processed dialogue not loaded (file missing).")
    else:
        lines.append(f"- Shape: {dlg_df.shape[0]} × {dlg_df.shape[1]}")
        lines.append(
            "- Feature overview (first 30, article labels): "
            + ", ".join(display_label(str(c)) for c in dlg_df.columns[:30])
        )
    lines.extend(
        [
            "",
            "## 5. Class Distributions",
            "",
                "Summary tables: `reports/tables/oulad_class_distribution_*.csv`, `dialogue_class_distribution_*.csv`.",
            "",
            "## 6. Missing Data",
            "",
            "See figure `oulad_missing_values_processed` and `dialogue_missing_values_processed`.",
            "",
            "## 7. Generated Figures",
            "",
            f"- Count: **{n_figs}** (PNG + PDF pairs under `reports/figures/`)",
            "",
            "## 8. Generated Tables",
            "",
            "- `reports/tables/raw_file_summary.csv`",
            "- `reports/tables/oulad_processed_summary.csv` (if available)",
            "- `reports/tables/dialogue_processed_summary.csv` (if available)",
            "- `reports/tables/model_metrics_summary.csv` (if metrics exist)",
            "",
            "## 9. Model Output Availability",
            "",
        ]
    )
    for name in ["oulad_model_metrics.json", "dialogue_model_metrics.json"]:
        p = OUTPUTS_DIR / name
        lines.append(f"- `{name}`: {'present' if p.is_file() else 'missing'}")
    lines.extend(
        [
            "",
            "## 10. Limitations and Next Steps",
            "",
            "- Public OULAD and dialogue corpora are not ThingLink telemetry.",
            "- Dialogue labels are heuristic; metrics are not claims of production NLP performance.",
            "- If ZIPs are missing, run: copy archives to `ml/data/raw/` then `python ml/run_pipeline.py --full`.",
            "",
        ]
    )
    (REPORTS_DIR / "dataset_inspection_report.md").write_text("\n".join(lines), encoding="utf-8")


def main():
    parser = argparse.ArgumentParser(description="Inspect datasets and generate reports / figures.")
    parser.add_argument("--inspect-only", action="store_true", help="Path checklist + raw inspection only")
    parser.add_argument("--report-only", action="store_true", help="Figures + tables + markdown from existing files")
    parser.add_argument("--full", action="store_true", help="Full report (same as --report-only if processed data exists)")
    args = parser.parse_args()
    inspect_only = args.inspect_only and not args.report_only and not args.full
    report = args.report_only or args.full or (not args.inspect_only and not args.report_only and not args.full)

    ensure_dirs()
    checklist_rows = build_checklist_rows()
    print_checklist(checklist_rows)
    write_checklist_md(checklist_rows, REPORTS_DIR / "dataset_readiness_checklist.md")

    raw_tbl: list[dict] = []
    raw_note = ""
    if OULAD_EXTRACT_DIR.is_dir():
        o_rows, raw_note = inspect_raw_oulad()
        for r in o_rows:
            raw_tbl.append({**r, "dataset": "oulad_raw"})
    if DIALOGUE_EXTRACT_DIR.is_dir():
        d_rows, d_note = inspect_raw_dialogue()
        if d_note:
            raw_note = (raw_note + "\n" + d_note).strip() if raw_note else d_note
        for r in d_rows:
            raw_tbl.append({**r, "dataset": "dialogue_raw"})

    if inspect_only:
        label, miss = readiness_summary(checklist_rows)
        print("\n=== Summary (inspect-only) ===")
        print(f"Dataset readiness: {label}")
        if miss:
            print("Missing ZIPs or paths:", miss)
        print("Next: copy missing ZIPs to ml/data/raw/ then run `python ml/run_pipeline.py --full`")
        return

    oulad_df = None
    dlg_df = None
    op = DATA_PROCESSED / "oulad_features.csv"
    dp = DATA_PROCESSED / "dialogue_features.csv"
    if op.is_file():
        oulad_df = pd.read_csv(op)
    if dp.is_file():
        dlg_df = pd.read_csv(dp)

    n_figs = 0
    if report:
        n_figs = generate_figures_and_tables(oulad_df, dlg_df)
        write_tables(raw_tbl, oulad_df, dlg_df)
        write_inspection_report_md(checklist_rows, raw_note, oulad_df, dlg_df, n_figs)

    label, miss = readiness_summary(checklist_rows)
    print("\n=== Final summary ===")
    print(f"Dataset readiness: {label}")
    print("Missing required files:", miss if miss else "(none critical listed)")
    print("Processed OULAD shape:", oulad_df.shape if oulad_df is not None else "N/A")
    print("Processed dialogue shape:", dlg_df.shape if dlg_df is not None else "N/A")
    print("Figures generated (PNG+PDF pairs):", n_figs)
    n_tbl = len(list(REPORTS_TABLES_DIR.glob("*.csv"))) if REPORTS_TABLES_DIR.is_dir() else 0
    print("Tables in reports/tables:", n_tbl)
    print("Reports directory:", REPORTS_DIR)
    print("Generated dashboard JSON exists:", (GENERATED_DIR / "dashboardLearners.json").is_file())
    if label == "Ready" and (GENERATED_DIR / "dashboardLearners.json").is_file():
        print("Next recommended command: npm run dev  (optional: python ml/run_pipeline.py --full to retrain)")
    elif label == "Ready":
        print("Next recommended command: python ml/run_pipeline.py --full")
    else:
        print("Next recommended command: copy ZIPs into ml/data/raw/ then python ml/run_pipeline.py --full")


if __name__ == "__main__":
    main()
