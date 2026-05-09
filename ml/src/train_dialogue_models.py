"""
Train TF-IDF baselines on dialogue text using heuristic labels (proof-of-concept only).

Labels are not validated human-ground truth — see outputs["label_disclaimer"].
"""

from __future__ import annotations

import sys
import warnings
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, confusion_matrix, f1_score, precision_recall_fscore_support
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.svm import LinearSVC

ML_ROOT = Path(__file__).resolve().parents[1]
if str(ML_ROOT) not in sys.path:
    sys.path.insert(0, str(ML_ROOT))

SRC = Path(__file__).resolve().parent
if str(SRC) not in sys.path:
    sys.path.insert(0, str(SRC))

from config import DATA_PROCESSED, MODELS_DIR, OUTPUTS_DIR, RANDOM_SEED, ensure_dirs  # noqa: E402
from utils import write_json  # noqa: E402

LABEL_DISCLAIMER = (
    "Dialogue labels are heuristic baselines for demonstration — not validated ground truth. "
    "Do not treat metrics as indicative of real-world dialogue understanding performance."
)


def _safe_stratified_split(X, y, **kwargs):
    warn: str | None = None
    try:
        return train_test_split(X, y, stratify=y, **kwargs), warn
    except ValueError as exc:
        warn = f"Stratified train_test_split unavailable ({exc}); using non-stratified split."
        out = train_test_split(X, y, stratify=None, **kwargs)
        return out, warn


def _eval(name: str, pipe: Pipeline, X_te, y_te, labels: list | None, split_warn: str | None) -> dict:
    pred = pipe.predict(X_te)
    labs = labels[:] if labels is not None else sorted(pd.unique(np.concatenate([y_te, pred])))
    out: dict = {
        "model": name,
        "accuracy": float(accuracy_score(y_te, pred)),
        "macro_f1": float(f1_score(y_te, pred, average="macro", zero_division=0)),
        "confusion_matrix": confusion_matrix(y_te, pred, labels=labs).tolist(),
        "labels_order": [str(x) for x in labs],
    }
    if split_warn:
        out["split_warning"] = split_warn
    if labs == [0, 1] or (set(labs) == {0, 1} and len(labs) == 2):
        pr, rc, f1, _ = precision_recall_fscore_support(
            y_te, pred, average=None, labels=[0, 1], zero_division=0
        )
        out["precision_positive_class_1"] = float(pr[1]) if len(pr) > 1 else 0.0
        out["recall_positive_class_1"] = float(rc[1]) if len(rc) > 1 else 0.0
        out["f1_positive_class_1"] = float(f1[1]) if len(f1) > 1 else 0.0
    return out


def _fit_text_pipeline(
    X_tr,
    y_tr,
    *,
    clf_kind: str,
    min_df_first: int = 2,
) -> tuple[Pipeline, list[str]]:
    notes: list[str] = []
    last_err: Exception | None = None
    for min_df in (min_df_first, 1):
        if clf_kind == "lr":
            clf = LogisticRegression(max_iter=200, class_weight="balanced", random_state=RANDOM_SEED)
        else:
            clf = LinearSVC(random_state=RANDOM_SEED)
        try:
            vec = TfidfVectorizer(
                max_features=12000,
                ngram_range=(1, 2),
                min_df=min_df,
            )
            pipe = Pipeline([("tfidf", vec), ("clf", clf)])
            pipe.fit(X_tr, y_tr)
            if min_df != min_df_first:
                notes.append(f"TfidfVectorizer used min_df={min_df} after min_df={min_df_first} was unsuitable.")
            return pipe, notes
        except ValueError as e:
            last_err = e
            notes.append(f"TfidfVectorizer(min_df={min_df}) ValueError: {e}; retrying with min_df=1 if applicable.")
            if min_df == 1:
                break
    raise RuntimeError(f"Could not fit TF-IDF pipeline: {last_err}") from last_err


def main() -> None:
    ensure_dirs()
    path = DATA_PROCESSED / "dialogue_features.csv"
    if not path.is_file():
        raise FileNotFoundError("Run preprocess_dialogue.py first.")
    df = pd.read_csv(path)
    text = df["full_conversation"].fillna("").astype(str)

    metrics: dict = {
        "label_disclaimer": LABEL_DISCLAIMER,
        "random_seed": RANDOM_SEED,
        "tasks": {},
        "pipeline_warnings": [],
    }
    preds_out: list[dict] = []

    # reflection_quality
    y_refl = df["reflection_quality"].astype(str)
    (X_tr, X_te, y_tr, y_te), sw = _safe_stratified_split(
        text, y_refl, test_size=0.2, random_state=RANDOM_SEED
    )
    pipe_r, n_r = _fit_text_pipeline(X_tr, y_tr, clf_kind="lr", min_df_first=2)
    metrics["pipeline_warnings"].extend(n_r)
    classes = sorted(y_refl.unique())
    metrics["tasks"]["reflection_quality"] = _eval(
        "tfidf_logistic", pipe_r, X_te, y_te, labels=classes, split_warn=sw
    )
    joblib.dump(pipe_r, MODELS_DIR / "dialogue_reflection_quality.joblib")

    # confusion_detected
    y_conf = df["confusion_detected"].astype(int)
    (X_tr, X_te, y_tr, y_te), sw = _safe_stratified_split(
        text, y_conf, test_size=0.2, random_state=RANDOM_SEED
    )
    pipe_c, n_c = _fit_text_pipeline(X_tr, y_tr, clf_kind="lr", min_df_first=2)
    metrics["pipeline_warnings"].extend(n_c)
    metrics["tasks"]["confusion_detected"] = _eval(
        "tfidf_logistic", pipe_c, X_te, y_te, labels=[0, 1], split_warn=sw
    )
    joblib.dump(pipe_c, MODELS_DIR / "dialogue_confusion.joblib")

    # reasoning_depth
    y_reas = df["reasoning_depth"].astype(str)
    (X_tr, X_te, y_tr, y_te), sw = _safe_stratified_split(
        text, y_reas, test_size=0.2, random_state=RANDOM_SEED
    )
    pipe_s, n_s = _fit_text_pipeline(X_tr, y_tr, clf_kind="svc", min_df_first=2)
    metrics["pipeline_warnings"].extend(n_s)
    r_classes = sorted(y_reas.unique())
    metrics["tasks"]["reasoning_depth"] = _eval(
        "tfidf_linearsvc", pipe_s, X_te, y_te, labels=r_classes, split_warn=sw
    )
    joblib.dump(pipe_s, MODELS_DIR / "dialogue_reasoning_depth.joblib")

    refl_all = pipe_r.predict(text)
    conf_all = pipe_c.predict(text)
    reas_all = pipe_s.predict(text)
    conf_proba_full = pipe_c.predict_proba(text)[:, 1]

    for i, row in df.iterrows():
        cp = float(conf_proba_full[i])
        preds_out.append(
            {
                "conversation_id": row["conversation_id"],
                "predicted_reflection_quality": str(refl_all[i]),
                "predicted_confusion": int(conf_all[i]),
                "predicted_reasoning_depth": str(reas_all[i]),
                "confidence_confusion_proxy": round(cp, 4),
            }
        )

    write_json(OUTPUTS_DIR / "dialogue_model_metrics.json", metrics)
    write_json(OUTPUTS_DIR / "dialogue_predictions.json", preds_out)
    print("Saved", OUTPUTS_DIR / "dialogue_model_metrics.json")


if __name__ == "__main__":
    warnings.filterwarnings("ignore", category=UserWarning)
    main()
