"""
Parse Education Dialogue JSON → tabular features + heuristic labels.

Heuristic labels are proof-of-concept only — not validated ground truth.
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

import pandas as pd

ML_ROOT = Path(__file__).resolve().parents[1]
if str(ML_ROOT) not in sys.path:
    sys.path.insert(0, str(ML_ROOT))

from config import DATA_PROCESSED, DIALOGUE_EXTRACT_DIR, ensure_dirs  # noqa: E402

CONFUSION_PHRASES = (
    "don't understand",
    "do not understand",
    "confused",
    "not sure",
    "huh?",
    "what's that",
    "i don't get",
)
REASONING_MARKERS = ("because", "therefore", "if ", " then", "so that", "reason", "cause", "implies")
REFLECTION_MARKERS = ("i think", "i learned", "i realize", "in my opinion", "reflect", "understand now")
UNCERTAIN = ("maybe", "perhaps", "not sure", "i guess", "kind of", "sort of")

LABEL_NOTE = (
    "Heuristic labels for baseline demonstration only — not validated against human annotation."
)


def _iter_conversation_items(root: Path) -> list[dict]:
    items: list[dict] = []
    for p in sorted(root.rglob("*.json")):
        if "conversation" not in p.name.lower():
            continue
        with p.open(encoding="utf-8") as f:
            data = json.load(f)
        if isinstance(data, list):
            for i, obj in enumerate(data):
                items.append({"source_file": p.name, "list_index": i, "payload": obj})
        elif isinstance(data, dict):
            items.append({"source_file": p.name, "list_index": 0, "payload": data})
    return items


def _extract_topic(payload: dict) -> str:
    if "background_info" in payload and isinstance(payload["background_info"], dict):
        t = payload["background_info"].get("topic")
        if t:
            return str(t)
    for key in ("topic", "title", "subject"):
        if key in payload:
            return str(payload[key])
    return ""


def _normalize_messages(payload: dict) -> list[dict]:
    if "conversation" in payload and isinstance(payload["conversation"], list):
        return [m for m in payload["conversation"] if isinstance(m, dict)]
    if "messages" in payload and isinstance(payload["messages"], list):
        return [m for m in payload["messages"] if isinstance(m, dict)]
    if "turns" in payload and isinstance(payload["turns"], list):
        return [m for m in payload["turns"] if isinstance(m, dict)]
    return []


def _role_text(msg: dict) -> tuple[str, str]:
    role = (
        msg.get("role")
        or msg.get("speaker")
        or msg.get("from")
        or msg.get("author")
        or ""
    )
    text = msg.get("text") or msg.get("content") or msg.get("message") or ""
    return str(role).strip(), str(text).strip()


def _heuristic_labels(full_text: str, student_text: str, n_turns: int, avg_student_len: float) -> dict:
    s_low = student_text.lower()
    confusion = any(p in s_low for p in CONFUSION_PHRASES)
    r_count = sum(s_low.count(m.strip()) for m in REASONING_MARKERS)
    refl = sum(s_low.count(m.strip()) for m in REFLECTION_MARKERS)

    if len(student_text) < 40 and sum(s_low.count(u) for u in UNCERTAIN) >= 1:
        reflection_quality = "Low"
    elif refl >= 2 and avg_student_len > 35:
        reflection_quality = "High"
    else:
        reflection_quality = "Medium"

    if r_count >= 3 and avg_student_len > 45:
        reasoning_depth = "High"
    elif r_count >= 1:
        reasoning_depth = "Medium"
    else:
        reasoning_depth = "Low"

    needs_feedback = confusion or reflection_quality == "Low" or (reasoning_depth == "Low" and n_turns < 6)

    return {
        "reflection_quality": reflection_quality,
        "confusion_detected": confusion,
        "reasoning_depth": reasoning_depth,
        "needs_teacher_feedback": needs_feedback,
    }


def main() -> None:
    ensure_dirs()
    if not DIALOGUE_EXTRACT_DIR.is_dir():
        raise FileNotFoundError(f"Missing {DIALOGUE_EXTRACT_DIR}. Run extract_datasets.py first.")

    rows: list[dict] = []
    for item in _iter_conversation_items(DIALOGUE_EXTRACT_DIR):
        payload = item["payload"]
        topic = _extract_topic(payload)
        msgs = _normalize_messages(payload)
        teacher_lines: list[str] = []
        student_lines: list[str] = []
        for m in msgs:
            role, text = _role_text(m)
            rl = role.lower()
            if "student" in rl or rl == "learner":
                if text:
                    student_lines.append(text)
            elif "teacher" in rl or rl == "tutor" or "instructor" in rl:
                if text:
                    teacher_lines.append(text)
            elif text:
                student_lines.append(text)
        full_conv = "\n".join(f"{r}: {t}" for r, t in (_role_text(m) for m in msgs) if t)
        student_blob = " ".join(student_lines)
        n_turns = len(msgs)
        avg_student_len = (
            float(sum(len(s) for s in student_lines) / len(student_lines)) if student_lines else 0.0
        )

        s_low = student_blob.lower()
        confusion_markers = sum(1 for p in CONFUSION_PHRASES if p in s_low)
        reasoning_markers = sum(s_low.count(m.strip()) for m in REASONING_MARKERS)
        reflection_markers = sum(s_low.count(m.strip()) for m in REFLECTION_MARKERS)

        labels = _heuristic_labels(full_conv, student_blob, n_turns, avg_student_len)
        cid = f"{item['source_file']}_{item['list_index']}"
        rows.append(
            {
                "conversation_id": cid,
                "topic": topic,
                "teacher_messages": " | ".join(teacher_lines[:12]),
                "student_messages": student_blob,
                "full_conversation": full_conv,
                "number_of_turns": n_turns,
                "average_student_message_length": avg_student_len,
                "student_question_count": student_blob.count("?"),
                "confusion_markers": confusion_markers,
                "reasoning_markers": reasoning_markers,
                "reflection_markers": reflection_markers,
                **labels,
                "label_note": LABEL_NOTE,
            }
        )

    df = pd.DataFrame(rows)
    out = DATA_PROCESSED / "dialogue_features.csv"
    df.to_csv(out, index=False)
    print(f"Wrote {out} rows={len(df)} - {LABEL_NOTE}")


if __name__ == "__main__":
    main()
