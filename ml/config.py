"""Central configuration for the ML pipeline — paths, seed, dashboard caps."""

from __future__ import annotations

import os
from pathlib import Path

# Directory containing this file (the `ml/` folder)
ML_ROOT = Path(__file__).resolve().parent

DATA_RAW = ML_ROOT / "data" / "raw"
DATA_PROCESSED = ML_ROOT / "data" / "processed"
OUTPUTS_DIR = ML_ROOT / "outputs"
MODELS_DIR = ML_ROOT / "models"
REPORTS_DIR = ML_ROOT / "reports"
REPORTS_FIGURES_DIR = REPORTS_DIR / "figures"
REPORTS_TABLES_DIR = REPORTS_DIR / "tables"

OULAD_EXTRACT_DIR = DATA_RAW / "oulad_extracted"
DIALOGUE_EXTRACT_DIR = DATA_RAW / "dialogue_extracted"

OULAD_ZIP = DATA_RAW / "anonymisedData.zip"
DIALOGUE_ZIP = DATA_RAW / "Education-Dialogue-Dataset-main.zip"
THINGLINK_PILOT_EVENTS_JSON = DATA_RAW / "thinglink_pilot_events.json"

# Next.js app root (sibling of `ml/`)
GENERATED_DIR = ML_ROOT.parent / "src" / "lib" / "generated"

RANDOM_SEED = int(os.environ.get("ML_RANDOM_SEED", "42"))

DASHBOARD_LEARNER_MIN = 30
DASHBOARD_LEARNER_MAX = 100
DASHBOARD_LEARNER_COUNT = int(os.environ.get("DASHBOARD_LEARNER_COUNT", "80"))

EARLY_WINDOW_FRACTIONS = (0.25, 0.50, 0.75)

AT_RISK_POSITIVE_LABEL = 1


def ensure_dirs() -> None:
    for p in (
        DATA_RAW,
        DATA_PROCESSED,
        OUTPUTS_DIR,
        MODELS_DIR,
        REPORTS_DIR,
        REPORTS_FIGURES_DIR,
        REPORTS_TABLES_DIR,
        GENERATED_DIR,
        OULAD_EXTRACT_DIR,
        DIALOGUE_EXTRACT_DIR,
    ):
        p.mkdir(parents=True, exist_ok=True)
