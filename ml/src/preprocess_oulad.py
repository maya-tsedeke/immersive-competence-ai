"""
Build learner–module feature table from OULAD.

Labels final_result and at_risk are for training only — never used as input features
in train_oulad_models.py.

Early-window columns only include VLE clicks with date <= cutoff and assessments with
due date <= cutoff; scores only count when date_submitted <= cutoff.
"""

from __future__ import annotations

import sys
from pathlib import Path

import numpy as np
import pandas as pd

ML_ROOT = Path(__file__).resolve().parents[1]
if str(ML_ROOT) not in sys.path:
    sys.path.insert(0, str(ML_ROOT))

from config import (  # noqa: E402
    DATA_PROCESSED,
    EARLY_WINDOW_FRACTIONS,
    OULAD_EXTRACT_DIR,
    ensure_dirs,
)


def _find_csv(name: str) -> Path:
    matches = list(OULAD_EXTRACT_DIR.rglob(name))
    if not matches:
        raise FileNotFoundError(f"{name} not found under {OULAD_EXTRACT_DIR}. Run extract_datasets.py first.")
    return matches[0]


def _vle_features_for_subset(
    sv: pd.DataFrame,
    vle_small: pd.DataFrame,
    prefix: str,
) -> pd.DataFrame:
    if sv.empty:
        return pd.DataFrame()
    keys = ["code_module", "code_presentation", "id_student"]
    merged = sv.merge(vle_small, on="id_site", how="left")
    g = merged.groupby(keys, sort=False)
    total = g["sum_click"].sum().rename(f"{prefix}total_clicks")
    active_days = g["date"].nunique().rename(f"{prefix}active_days")
    first_d = g["date"].min().rename(f"{prefix}first_activity_date")
    last_d = g["date"].max().rename(f"{prefix}last_activity_date")
    out = pd.concat([total, active_days, first_d, last_d], axis=1)
    ad = out[f"{prefix}active_days"].replace(0, np.nan)
    out[f"{prefix}avg_clicks_per_active_day"] = out[f"{prefix}total_clicks"] / ad
    out[f"{prefix}days_active_span"] = (
        out[f"{prefix}last_activity_date"] - out[f"{prefix}first_activity_date"]
    )
    act = merged.groupby(keys + ["activity_type"], sort=False)["sum_click"].sum().reset_index()
    if not act.empty and act["activity_type"].notna().any():
        wide = act.pivot_table(
            index=keys,
            columns="activity_type",
            values="sum_click",
            aggfunc="sum",
            fill_value=0,
        )
        wide.columns = [f"{prefix}activity_{c}" for c in wide.columns.astype(str)]
        out = out.join(wide, how="left")
    return out.reset_index()


def _assess_agg(sa_frame: pd.DataFrame, prefix: str, use_cutoff: bool) -> pd.DataFrame:
    keys_local = ["code_module", "code_presentation", "id_student"]
    if sa_frame.empty:
        return pd.DataFrame(columns=keys_local)
    rows: list[dict] = []
    for group_key, chunk in sa_frame.groupby(keys_local, sort=False):
        cm, cp, sid = group_key
        chunk = chunk.copy()
        if use_cutoff:
            cut = int(chunk["_cutoff"].iloc[0])
            da = pd.to_numeric(chunk["date_assess"], errors="coerce")
            chunk = chunk.loc[da.fillna(1e9) <= cut]
            if chunk.empty:
                rows.append(
                    {
                        "code_module": cm,
                        "code_presentation": cp,
                        "id_student": sid,
                        f"{prefix}n_assessments_submitted": 0,
                        f"{prefix}mean_assessment_score": np.nan,
                        f"{prefix}weighted_assessment_score": np.nan,
                        f"{prefix}late_submission_count": 0,
                        f"{prefix}missing_submission_count": 0,
                    }
                )
                continue
        submitted = chunk["date_submitted"].notna()
        da = pd.to_numeric(chunk["date_assess"], errors="coerce")
        ds = pd.to_numeric(chunk["date_submitted"], errors="coerce")
        if use_cutoff:
            cut = int(chunk["_cutoff"].iloc[0])
            in_time = submitted & (ds.fillna(1e9) <= cut)
            due_in = da.fillna(1e9) <= cut
            miss = int(
                (due_in & (chunk["date_submitted"].isna() | (ds.fillna(1e9) > cut))).sum()
            )
        else:
            in_time = submitted
            miss = int(chunk["date_submitted"].isna().sum())

        scores = chunk.loc[in_time, "score"].astype(float)
        weights = chunk.loc[in_time, "weight"].astype(float)
        n_sub = int(in_time.sum())
        mean_s = float(scores.mean()) if len(scores) else np.nan
        wd = float(weights.sum())
        wn = float((scores * weights).sum()) if len(scores) else np.nan
        weighted = wn / wd if wd > 0 else np.nan
        late = int((submitted & (ds > da)).sum())

        rows.append(
            {
                "code_module": cm,
                "code_presentation": cp,
                "id_student": sid,
                f"{prefix}n_assessments_submitted": n_sub,
                f"{prefix}mean_assessment_score": mean_s,
                f"{prefix}weighted_assessment_score": weighted,
                f"{prefix}late_submission_count": late,
                f"{prefix}missing_submission_count": miss,
            }
        )
    return pd.DataFrame(rows)


def main() -> None:
    ensure_dirs()
    student_info = pd.read_csv(_find_csv("studentInfo.csv"))
    student_vle = pd.read_csv(_find_csv("studentVle.csv"))
    vle = pd.read_csv(_find_csv("vle.csv"))
    assessments = pd.read_csv(_find_csv("assessments.csv"))
    student_assessment = pd.read_csv(_find_csv("studentAssessment.csv"))
    registration = pd.read_csv(_find_csv("studentRegistration.csv"))
    courses = pd.read_csv(_find_csv("courses.csv"))

    assessments = assessments.rename(columns={"date": "date_assess"})
    vle_small = vle[["id_site", "activity_type"]].drop_duplicates(subset=["id_site"])

    mod_len = courses[
        ["code_module", "code_presentation", "module_presentation_length"]
    ].drop_duplicates()

    keys = ["code_module", "code_presentation", "id_student"]

    info = student_info.merge(mod_len, on=["code_module", "code_presentation"], how="left")
    reg = registration[keys + ["date_registration"]].copy()
    base = info.merge(reg, on=keys, how="left")

    sv = student_vle.merge(mod_len, on=["code_module", "code_presentation"], how="left")
    max_by_mod = student_vle.groupby(["code_module", "code_presentation"])["date"].transform("max")
    sv["module_presentation_length"] = sv["module_presentation_length"].fillna(max_by_mod + 1)

    full_cut = sv["module_presentation_length"].astype(int)
    sv_full = sv[sv["date"] <= full_cut]
    vfeat = _vle_features_for_subset(sv_full, vle_small, prefix="")
    base = base.merge(vfeat, on=keys, how="left")

    for frac in EARLY_WINDOW_FRACTIONS:
        pfx = f"early_{int(frac * 100)}_"
        sv_m = sv.copy()
        sv_m["_cut"] = np.floor(sv_m["module_presentation_length"].astype(float) * frac).astype(int)
        sub = sv_m[sv_m["date"] <= sv_m["_cut"]].drop(columns=["_cut"])
        ev = _vle_features_for_subset(sub, vle_small, prefix=pfx)
        base = base.merge(ev, on=keys, how="left")

    sa = student_assessment.merge(
        assessments[["id_assessment", "code_module", "code_presentation", "date_assess", "weight"]],
        on="id_assessment",
        how="inner",
    ).merge(mod_len, on=["code_module", "code_presentation"], how="left")
    max_d = (
        sa.groupby(["code_module", "code_presentation"])["date_assess"].transform("max")
    )
    sa["module_presentation_length"] = sa["module_presentation_length"].fillna(max_d + 1)

    afull = _assess_agg(sa.assign(_cutoff=sa["module_presentation_length"]), "", use_cutoff=False)
    base = base.merge(afull, on=keys, how="left")

    for frac in EARLY_WINDOW_FRACTIONS:
        pfx = f"early_{int(frac * 100)}_"
        cut = np.floor(sa["module_presentation_length"].astype(float) * frac).astype(int)
        sa_e = sa.copy()
        sa_e["_cutoff"] = cut
        ae = _assess_agg(sa_e, pfx, use_cutoff=True)
        base = base.merge(ae, on=keys, how="left")

    base["at_risk"] = base["final_result"].isin(["Fail", "Withdrawn"]).astype(int)

    out = DATA_PROCESSED / "oulad_features.csv"
    base.to_csv(out, index=False)
    print(f"Wrote {out} shape={base.shape}")


if __name__ == "__main__":
    main()
