"""Shared helpers: hashing, reproducibility, JSON-safe serialization, optional LLM stub."""

from __future__ import annotations

import hashlib
import json
from pathlib import Path
from typing import Any, Mapping

import numpy as np
import pandas as pd


def stable_anon_id(id_student: int | str, salt: str = "oulad-immersive-competence") -> str:
    """Short anonymized token for UI — not reversible without brute force."""
    raw = f"{salt}:{id_student}".encode("utf-8")
    return hashlib.sha256(raw).hexdigest()[:16]


def display_learner_id(id_student: int | str, index: int = 0) -> str:
    """Human-readable pseudo ID (e.g. L-A1B2) for dashboard demos."""
    h = stable_anon_id(id_student)
    return f"L-{h[:4].upper()}"


def json_numpy_sanitize(obj: Any) -> Any:
    """Convert numpy/pandas types for JSON dump."""
    if isinstance(obj, (np.integer,)):
        return int(obj)
    if isinstance(obj, (np.floating,)):
        return float(obj)
    if isinstance(obj, np.ndarray):
        return obj.tolist()
    if isinstance(obj, pd.Series):
        return obj.tolist()
    if isinstance(obj, Mapping):
        return {k: json_numpy_sanitize(v) for k, v in obj.items()}
    if isinstance(obj, (list, tuple)):
        return [json_numpy_sanitize(v) for v in obj]
    if obj is None or isinstance(obj, (str, bool)):
        return obj
    try:
        if pd.isna(obj):
            return None
    except (ValueError, TypeError):
        pass
    return obj


def write_json(path: Path, data: Any, indent: int = 2) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as f:
        json.dump(json_numpy_sanitize(data), f, indent=indent, ensure_ascii=False)


def llm_placeholder_summarize(conversation_text: str) -> str:
    """
    Zero-shot / LLM-ready stub — no API keys, no external calls.
    """
    if not conversation_text or len(conversation_text.strip()) < 20:
        return (
            "AI-assisted insight (stub): Short learner response — consider prompting for "
            "a step-by-step explanation."
        )
    lowered = conversation_text.lower()
    if any(p in lowered for p in ("don't understand", "confused", "not sure", "huh?")):
        return (
            "AI-assisted insight (stub): The exchange suggests the learner may need clarification."
        )
    if any(p in lowered for p in ("because", "therefore", "if ", " then", "reason")):
        return (
            "AI-assisted insight (stub): The learner shows some causal wording in the dialogue."
        )
    return (
        "AI-assisted insight (stub): Review reflection tone and depth for targeted teacher feedback."
    )
