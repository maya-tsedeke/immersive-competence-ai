"""Extract OULAD and Education Dialogue zips into ml/data/raw/*_extracted/. ZIPs in data/raw are never deleted."""

from __future__ import annotations

import sys
import zipfile
from pathlib import Path

# Allow `python ml/run_pipeline.py` from repo root
ML_ROOT = Path(__file__).resolve().parents[1]
if str(ML_ROOT) not in sys.path:
    sys.path.insert(0, str(ML_ROOT))

from config import (  # noqa: E402
    DIALOGUE_EXTRACT_DIR,
    DIALOGUE_ZIP,
    OULAD_EXTRACT_DIR,
    OULAD_ZIP,
    ensure_dirs,
)


def _extract_zip(zip_path: Path, dest: Path) -> list[str]:
    if not zip_path.is_file():
        raise FileNotFoundError(f"Expected zip at {zip_path} — copy anonymisedData.zip / Education-Dialogue-Dataset-main.zip here.")
    dest.mkdir(parents=True, exist_ok=True)
    names: list[str] = []
    with zipfile.ZipFile(zip_path, "r") as zf:
        for m in zf.namelist():
            if m.endswith("/") or "__MACOSX" in m:
                continue
            names.append(m)
        zf.extractall(dest)
    return names


def main() -> None:
    ensure_dirs()
    print("Extracting OULAD...")
    n1 = _extract_zip(OULAD_ZIP, OULAD_EXTRACT_DIR)
    print(f"  -> {OULAD_EXTRACT_DIR} ({len(n1)} files)")
    print("Extracting Education Dialogue...")
    n2 = _extract_zip(DIALOGUE_ZIP, DIALOGUE_EXTRACT_DIR)
    print(f"  -> {DIALOGUE_EXTRACT_DIR} ({len(n2)} files)")
    csvs = [p for p in OULAD_EXTRACT_DIR.rglob("*.csv")]
    print("OULAD CSVs:", [c.name for c in csvs])


if __name__ == "__main__":
    main()
