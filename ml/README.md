# Immersive Competence AI — ML / research pipeline

This folder contains a **reproducible baseline** that ingests **OULAD** (zip: `anonymisedData.zip`) and the **Google Education Dialogue Dataset** (`Education-Dialogue-Dataset-main.zip`), trains **sklearn** models without external APIs, and exports **small JSON files** into the Next.js app at `src/lib/generated/`.

## Dataset purpose

- **OULAD:** learner–module features and **binary at-risk** indicators (**Fail / Withdrawn** vs **Pass / Distinction**). `final_result` and `at_risk` are **labels only**; they are **never** used as model inputs.
- **Education Dialogue:** conversational text for **heuristic** reflection/confusion/reasoning labels. These labels are **proof-of-concept only**, not validated human ground truth.

## Folder layout

```
ml/
  README.md
  requirements.txt
  config.py
  run_pipeline.py
  data/
    raw/                     # place ZIPs here (original archives elsewhere can stay untouched)
    processed/
  notebooks/
  src/
    extract_datasets.py
    preprocess_oulad.py
    preprocess_dialogue.py
    train_oulad_models.py
    train_dialogue_models.py
    generate_dashboard_outputs.py
    evaluate_models.py
    utils.py
  models/                    # joblib dumps
  reports/                   # optional matplotlib exports
```

## Copy ZIP files (required)

Place both archives in:

`immersive-competence-ai/ml/data/raw/`

- `anonymisedData.zip`
- `Education-Dialogue-Dataset-main.zip`

The pipeline **extracts copies** into `data/raw/*_extracted/` and **does not delete** the ZIPs.

## Python environment (Windows)

```powershell
cd immersive-competence-ai\ml
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
```

## Run modes (`run_pipeline.py`)

From the **repository root** (or run with `cwd=ml/`; scripts resolve paths from `ml/config.py`):

| Command | Purpose |
|---------|---------|
| `python ml/run_pipeline.py --inspect-only` | Path checklist + **raw** dataset inspection (ZIPs, extracts). Does not train. |
| `python ml/run_pipeline.py --report-only` | Build `ml/reports/` (markdown, **PNG+PDF** figures at 300 DPI, CSV tables) from **existing** processed CSVs and outputs. |
| `python ml/run_pipeline.py --full` | Same as default: extract → preprocess → train → dashboard JSON → evaluate → **report-only**. |
| `python ml/run_pipeline.py` | Default = full pipeline (equivalent to `--full`). |

**Recommended first step on a new machine:** run `--inspect-only`, place missing ZIPs under `ml/data/raw/`, then run `--full` (or `--report-only` after a prior full run).

Or step by step:

```powershell
cd ml
python src/extract_datasets.py
python src/preprocess_oulad.py
python src/train_oulad_models.py
python src/preprocess_dialogue.py
python src/train_dialogue_models.py
python src/generate_dashboard_outputs.py
python src/evaluate_models.py
```

## What each stage produces

| Step | Main outputs |
|------|----------------|
| `extract_datasets.py` | Extracted CSV/JSON under `data/raw/*_extracted/` |
| `preprocess_oulad.py` | `data/processed/oulad_features.csv` |
| `train_oulad_models.py` | `outputs/oulad_model_metrics.json`, `outputs/oulad_feature_importance.csv` (if computed), `outputs/learner_risk_predictions.json`, `models/oulad_at_risk_best.joblib` |
| `preprocess_dialogue.py` | `data/processed/dialogue_features.csv` |
| `train_dialogue_models.py` | `outputs/dialogue_model_metrics.json`, `outputs/dialogue_predictions.json`, dialogue `models/*.joblib` |
| `generate_dashboard_outputs.py` | **Dashboard JSON** in `../src/lib/generated/` (capped cohort, default ~80 learners) |
| `evaluate_models.py` | `outputs/evaluation_summary.json` |

**Full-size** risk predictions remain in `ml/outputs/learner_risk_predictions.json`. **`src/lib/generated/learnerRiskPredictions.json`** stays **small** for a fast Next.js bundle.

## Connecting outputs to the web app

The Next.js code loads JSON from `src/lib/generated/` when present and **falls back** to `src/lib/data/*.ts` mocks (see `src/lib/dataset.ts`).

Regenerate after changing models or caps:

```powershell
python ml/run_pipeline.py
```

## Safeguards / limitations

- **No label leakage:** `final_result` / `at_risk` are excluded from feature matrices. Early-window models use only VLE/assessment events **on or before** the fractional module timeline cut-off (assessment **scores** after the cut-off are excluded for those features).
- **Primary:** binary **at-risk** prediction; **secondary:** multiclass `final_result`.
- **Dialogue labels:** **heuristic**; metrics are **not** claims about production dialogue understanding.
- **Not ThingLink data** — real validation needs an **anonymised ThingLink export**.
- **No paid APIs** and **no hidden network calls** in this pipeline.

This is a **research prototype**, not a final validated AI assessment system. Use **AI-assisted insight**, **risk indicator**, and **suggested teacher action** language in the UI — avoid “diagnosis”, “guaranteed assessment”, or “final judgement”.

## Article-quality figures (`ml/reports/figures/`)

Inspection mode **`--report-only`** (or full pipeline, which ends with the same report step) writes paired **PNG and PDF** plots using Matplotlib with:

- Serif fonts (**Times New Roman** where installed, with fallbacks; the script warns if none resolve)
- **300 DPI** raster output and vector **PDF** for each figure
- Single-column width **~3.5 in** and wider layouts **~7.2 in** where a comparison chart needs space

These files are intended for drafts targeting **IEEE / Elsevier / Springer**-style article layouts.
