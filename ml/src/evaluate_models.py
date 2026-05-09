"""Aggregate evaluation summaries from saved metric JSON files."""

from __future__ import annotations

import sys
from pathlib import Path

ML_ROOT = Path(__file__).resolve().parents[1]
SRC = Path(__file__).resolve().parent
for p in (ML_ROOT, SRC):
    if str(p) not in sys.path:
        sys.path.insert(0, str(p))

from config import OUTPUTS_DIR, ensure_dirs  # noqa: E402
from utils import write_json  # noqa: E402


def main() -> None:
    ensure_dirs()
    import json

    out = {}
    for name in ("oulad_model_metrics.json", "dialogue_model_metrics.json"):
        p = OUTPUTS_DIR / name
        if p.is_file():
            out[name.replace(".json", "")] = json.loads(p.read_text(encoding="utf-8"))
    write_json(OUTPUTS_DIR / "evaluation_summary.json", out)
    print("Wrote", OUTPUTS_DIR / "evaluation_summary.json")


if __name__ == "__main__":
    main()
