"""
Train baseline OULAD models.

Primary task: binary at_risk (Fail/Withdrawn vs Pass/Distinction).
Secondary: multiclass final_result.

final_result and at_risk are never used as features.
"""

from __future__ import annotations

import sys
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import HistGradientBoostingClassifier, RandomForestClassifier
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    confusion_matrix,
    f1_score,
    precision_recall_fscore_support,
)
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

ML_ROOT = Path(__file__).resolve().parents[1]
if str(ML_ROOT) not in sys.path:
    sys.path.insert(0, str(ML_ROOT))

SRC = Path(__file__).resolve().parent
if str(SRC) not in sys.path:
    sys.path.insert(0, str(SRC))

from config import (  # noqa: E402
    DATA_PROCESSED,
    MODELS_DIR,
    OUTPUTS_DIR,
    RANDOM_SEED,
    ensure_dirs,
)
from utils import display_learner_id, stable_anon_id, write_json  # noqa: E402

LABEL_COLS = {"final_result", "at_risk"}
DROP_FROM_FEATURES = {"id_student"}  # high-cardinality identifier — not a causal feature here


def _feature_columns(df: pd.DataFrame, *, exclude_early: bool = False) -> tuple[list[str], list[str]]:
    exclude = LABEL_COLS | DROP_FROM_FEATURES
    cats = []
    nums = []
    for c in df.columns:
        if c in exclude:
            continue
        if exclude_early and str(c).startswith("early_"):
            continue
        if c in ("gender", "region", "highest_education", "imd_band", "age_band", "disability"):
            cats.append(c)
        elif df[c].dtype == object or str(df[c].dtype) == "category":
            cats.append(c)
        elif c in ("code_module", "code_presentation"):
            cats.append(c)
        else:
            nums.append(c)
    return nums, cats


def _num_cat_for_subset(cols: list[str], df: pd.DataFrame) -> tuple[list[str], list[str]]:
    nums: list[str] = []
    cats: list[str] = []
    for c in cols:
        if c in ("gender", "region", "highest_education", "imd_band", "age_band", "disability"):
            cats.append(c)
        elif c in ("code_module", "code_presentation"):
            cats.append(c)
        elif df[c].dtype == object or str(df[c].dtype) == "category":
            cats.append(c)
        else:
            nums.append(c)
    return nums, cats


def _make_pipeline(nums: list[str], cats: list[str], model) -> Pipeline:
    num_pipe = Pipeline(
        steps=[
            ("imputer", SimpleImputer(strategy="median")),
            ("scaler", StandardScaler()),
        ]
    )
    cat_pipe = Pipeline(
        steps=[
            ("imputer", SimpleImputer(strategy="most_frequent")),
            ("onehot", OneHotEncoder(handle_unknown="ignore", sparse_output=False, max_categories=50)),
        ]
    )
    pre = ColumnTransformer(
        transformers=[
            ("num", num_pipe, nums),
            ("cat", cat_pipe, cats),
        ],
        remainder="drop",
    )
    return Pipeline(steps=[("prep", pre), ("clf", model)])


def _eval_clf(name: str, pipe: Pipeline, X_te, y_te, labels=None) -> dict:
    pred = pipe.predict(X_te)
    lab_order = list(labels) if labels is not None else sorted(pd.unique(y_te))
    out: dict = {
        "model": name,
        "accuracy": float(accuracy_score(y_te, pred)),
        "macro_f1": float(f1_score(y_te, pred, average="macro", zero_division=0)),
        "confusion_matrix": confusion_matrix(y_te, pred, labels=labels).tolist(),
        "labels_order": lab_order,
    }
    # At-risk class metrics: always report for binary [0, 1] classification (positive = 1)
    binary_labels = labels is not None and list(labels) == [0, 1]
    looks_binary = False
    if binary_labels:
        looks_binary = True
    else:
        try:
            y_u_num = np.unique(np.asarray(y_te).astype(int))
            looks_binary = set(y_u_num) <= {0, 1} and len(y_u_num) <= 2
        except (ValueError, TypeError):
            looks_binary = False
    if looks_binary:
        pr, rc, f1, _ = precision_recall_fscore_support(
            y_te, pred, average=None, labels=[0, 1], zero_division=0
        )
        out["precision_at_risk_class_1"] = float(pr[1]) if len(pr) > 1 else 0.0
        out["recall_at_risk_class_1"] = float(rc[1]) if len(rc) > 1 else 0.0
        out["f1_at_risk_class_1"] = float(f1[1]) if len(f1) > 1 else 0.0
    return out


def _permutation_importance_rows(pipe: Pipeline, X_te, y_te, feature_names: list[str], n_repeats: int = 5) -> pd.DataFrame:
    try:
        from sklearn.inspection import permutation_importance
    except ImportError:
        return pd.DataFrame()
    result = permutation_importance(
        pipe, X_te, y_te, n_repeats=n_repeats, random_state=RANDOM_SEED, scoring="f1_macro"
    )
    imp = result.importances_mean
    order = np.argsort(-np.abs(imp))[:40]
    rows = []
    for i in order:
        rows.append({"feature": feature_names[i] if i < len(feature_names) else str(i), "importance_mean": imp[i]})
    return pd.DataFrame(rows)


def main() -> None:
    ensure_dirs()
    path = DATA_PROCESSED / "oulad_features.csv"
    if not path.is_file():
        raise FileNotFoundError(f"Missing {path} — run preprocess_oulad.py first.")
    df = pd.read_csv(path)
    df = df.dropna(subset=["final_result", "at_risk"])

    y_bin = df["at_risk"].astype(int)
    y_mc = df["final_result"].astype(str)

    # Full-timeline models: exclude all early_* partial-window aggregates
    nums_full, cats_full = _feature_columns(df, exclude_early=True)
    feature_full = df[nums_full + cats_full]
    idx = np.arange(len(df))
    idx_train, idx_test = train_test_split(
        idx,
        test_size=0.2,
        random_state=RANDOM_SEED,
        stratify=y_bin,
    )
    X_train = feature_full.iloc[idx_train]
    X_test = feature_full.iloc[idx_test]
    yb_tr, yb_te = y_bin.iloc[idx_train], y_bin.iloc[idx_test]
    ym_tr, ym_te = y_mc.iloc[idx_train], y_mc.iloc[idx_test]

    # --- Primary binary models
    models_bin = {
        "logistic_regression": LogisticRegression(max_iter=200, class_weight="balanced", random_state=RANDOM_SEED),
        "random_forest": RandomForestClassifier(
            n_estimators=100, class_weight="balanced", random_state=RANDOM_SEED, n_jobs=-1
        ),
        "hist_gradient_boosting": HistGradientBoostingClassifier(random_state=RANDOM_SEED),
    }
    try:
        from xgboost import XGBClassifier  # type: ignore

        models_bin["xgboost"] = XGBClassifier(
            random_state=RANDOM_SEED,
            eval_metric="logloss",
            tree_method="hist",
        )
    except Exception:
        pass

    metrics_bin: dict = {}
    best_name = None
    best_f1 = -1.0
    best_pipe = None

    for name, est in models_bin.items():
        pipe = _make_pipeline(nums_full, cats_full, est)
        pipe.fit(X_train, yb_tr)
        m = _eval_clf(name, pipe, X_test, yb_te, labels=[0, 1])
        metrics_bin[name] = m
        if m["macro_f1"] > best_f1:
            best_f1 = m["macro_f1"]
            best_name = name
            best_pipe = pipe

    joblib.dump(best_pipe, MODELS_DIR / "oulad_at_risk_best.joblib")

    # Early-window-only binary: features for that window + pre-course / demo fields only
    demo_keep = (
        "num_of_prev_attempts",
        "studied_credits",
        "date_registration",
        "module_presentation_length",
        "gender",
        "region",
        "highest_education",
        "imd_band",
        "age_band",
        "disability",
        "code_module",
        "code_presentation",
    )
    early_metrics: dict = {}
    for tag, pfx in [("early_25", "early_25_"), ("early_50", "early_50_"), ("early_75", "early_75_")]:
        cols = [
            c
            for c in df.columns
            if (c.startswith(pfx) or c in demo_keep)
            and c not in LABEL_COLS
            and c not in DROP_FROM_FEATURES
        ]
        if not any(str(c).startswith(pfx) for c in cols):
            continue
        num_sub, cat_sub = _num_cat_for_subset(cols, df)
        Xe_tr = df.iloc[idx_train][cols]
        Xe_te = df.iloc[idx_test][cols]
        est = HistGradientBoostingClassifier(random_state=RANDOM_SEED)
        pipe_e = _make_pipeline(num_sub, cat_sub, est)
        pipe_e.fit(Xe_tr, yb_tr)
        early_metrics[tag] = _eval_clf(f"hgb_{tag}", pipe_e, Xe_te, yb_te, labels=[0, 1])

    # Multiclass (secondary)
    classes = sorted(y_mc.unique())
    models_mc = {
        "logistic_regression": LogisticRegression(
            max_iter=400, class_weight="balanced", random_state=RANDOM_SEED, solver="lbfgs"
        ),
        "random_forest": RandomForestClassifier(n_estimators=80, class_weight="balanced", random_state=RANDOM_SEED, n_jobs=-1),
    }
    metrics_mc: dict = {}
    for name, est in models_mc.items():
        pipe = _make_pipeline(nums_full, cats_full, est)
        pipe.fit(X_train, ym_tr)
        metrics_mc[name] = _eval_clf(name, pipe, X_test, ym_te, labels=classes)

    # Feature names for permutation (best binary pipe — get from column transformer)
    def _top_perm(pipe: Pipeline, X_te_sub, y_te_sub) -> pd.DataFrame:
        try:
            prep = pipe.named_steps["prep"]
            fn = prep.get_feature_names_out()
            return _permutation_importance_rows(pipe, X_te_sub, y_te_sub, list(fn))
        except Exception:
            return pd.DataFrame()

    perm_df = _top_perm(best_pipe, X_test, yb_te) if best_pipe is not None else pd.DataFrame()
    if not perm_df.empty:
        perm_df.to_csv(OUTPUTS_DIR / "oulad_feature_importance.csv", index=False)

    payload = {
        "random_seed": RANDOM_SEED,
        "primary_task": "binary_at_risk",
        "best_binary_model": best_name,
        "binary_models": metrics_bin,
        "early_window_binary_models": early_metrics,
        "secondary_task": "multiclass_final_result",
        "multiclass_models": metrics_mc,
        "limitation": "Proof-of-concept baseline on public OULAD; not validated on ThingLink telemetry.",
    }
    write_json(OUTPUTS_DIR / "oulad_model_metrics.json", payload)

    # Predictions for all rows (full output)
    risk_rows = []
    proba = None
    if best_pipe and hasattr(best_pipe.named_steps["clf"], "predict_proba"):
        proba = best_pipe.predict_proba(feature_full)[:, 1]

    for i, row in df.reset_index(drop=True).iterrows():
        sid = int(row["id_student"])
        pred = int(best_pipe.predict(feature_full.iloc[[i]])[0])
        ps = float(proba[i]) if proba is not None else float(pred)
        result_label = row["final_result"]
        risk_rows.append(
            {
                "learnerId": display_learner_id(sid, i),
                "sourceStudentId": stable_anon_id(sid),
                "riskScore": round(ps, 4),
                "riskLevel": "At risk" if ps >= 0.5 else "Lower risk indicator",
                "predictedOutcome": "Fail or Withdrawn" if pred == 1 else "Pass or Distinction",
                "true_final_result": result_label,
                "true_at_risk": int(row["at_risk"]),
                "keyFactors": _heuristic_factors(row),
                "teacherRecommendation": _teacher_note(ps, pred),
            }
        )

    write_json(OUTPUTS_DIR / "learner_risk_predictions.json", risk_rows)
    print("Saved metrics and predictions to", OUTPUTS_DIR)


def _heuristic_factors(row: pd.Series) -> list[str]:
    factors = []
    try:
        ms = row.get("mean_assessment_score", np.nan)
        if not pd.isna(ms) and float(ms) < 50:
            factors.append("Below-average assessment score (risk indicator)")
        tc = row.get("total_clicks")
        if tc is not None and not pd.isna(tc) and float(tc) < 500:
            factors.append("Low VLE click volume")
        if float(row.get("active_days", 0) or 0) < 20:
            factors.append("Few active learning days")
        ad = row.get("early_50_n_assessments_submitted", np.nan)
        if not pd.isna(ad) and float(ad) < 1:
            factors.append("Limited early submitted assessments")
    except (TypeError, ValueError):
        pass
    if not factors:
        factors.append("Review activity and assessment trajectory for this learner-module pair.")
    return factors[:5]


def _teacher_note(ps: float, pred: int) -> str:
    if pred == 1 or ps >= 0.55:
        return (
            "Suggested teacher action: offer a short check-in and targeted feedback before the next summative step. "
            "Treat this as AI-assisted insight from a public-dataset prototype — not a sole basis for grading or placement."
        )
    return (
        "Suggested teacher action: reinforce strengths while monitoring engagement (public-dataset prototype indicator only)."
    )


if __name__ == "__main__":
    main()
