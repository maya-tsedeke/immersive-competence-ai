#!/usr/bin/env python3
"""
Run the ML pipeline from the repository root.

Examples:
  python ml/run_pipeline.py --inspect-only
  python ml/run_pipeline.py --report-only
  python ml/run_pipeline.py --full
  python ml/run_pipeline.py              (same as --full)

From ml/: use .. prefix or chdir to repo root for relative paths to src/lib/generated.
"""

from __future__ import annotations

import argparse
import subprocess
import sys
from pathlib import Path

ML_DIR = Path(__file__).resolve().parent
SRC = ML_DIR / "src"

PIPELINE_STEPS = [
    "extract_datasets.py",
    "preprocess_oulad.py",
    "train_oulad_models.py",
    "preprocess_dialogue.py",
    "train_dialogue_models.py",
    "generate_dashboard_outputs.py",
    "evaluate_models.py",
]

INSPECT = SRC / "inspect_and_report_datasets.py"


def _run_script(path: Path) -> None:
    if not path.is_file():
        raise FileNotFoundError(path)
    print(f"\n=== Running {path.name} ===\n")
    subprocess.check_call([sys.executable, str(path)], cwd=str(ML_DIR))


def main() -> None:
    parser = argparse.ArgumentParser(description="Immersive Competence AI ML pipeline")
    parser.add_argument(
        "--inspect-only",
        action="store_true",
        help="Check paths and raw data; write checklist (no figures that need processed CSVs beyond optional reads).",
    )
    parser.add_argument(
        "--report-only",
        action="store_true",
        help="Generate reports/figures/tables from existing processed outputs (no training).",
    )
    parser.add_argument(
        "--full",
        action="store_true",
        help="Run extraction, preprocessing, training, dashboard JSON, evaluation, then full inspection report.",
    )
    args = parser.parse_args()

    full = args.full or (not args.inspect_only and not args.report_only)

    if args.inspect_only:
        subprocess.check_call([sys.executable, str(INSPECT), "--inspect-only"], cwd=str(ML_DIR))
        return

    if args.report_only and not full:
        subprocess.check_call([sys.executable, str(INSPECT), "--report-only"], cwd=str(ML_DIR))
        return

    for script in PIPELINE_STEPS:
        _run_script(SRC / script)
    subprocess.check_call([sys.executable, str(INSPECT), "--report-only"], cwd=str(ML_DIR))


if __name__ == "__main__":
    main()
