# Dataset inspection report

Generated: 2026-05-09T13:00:12.540367

## 1. Readiness Checklist

See `dataset_readiness_checklist.md` for the full table.

## 2. Raw Dataset Inspection

(No blocking notes.)

## 3. Processed OULAD Inspection

- Shape: 32593 × 137
- Feature overview (first 30, article labels): Code Module, Code Presentation, Id Student, Gender, Region, Highest Education, Imd Band, Age Band, Num Of Prev Attempts, Studied Credits, Disability, Final Learning Outcome, Module Presentation Length, Date Registration, Total Learning Interactions, Number of Active Learning Days, First Activity Date, Last Activity Date, Avg Clicks Per Active Day, Days Active Span, Dataplus (learning-activity intensity), Dualpane (learning-activity intensity), Externalquiz (learning-activity intensity), Folder (learning-activity intensity), Forumng (learning-activity intensity), Glossary (learning-activity intensity), Homepage (learning-activity intensity), Htmlactivity (learning-activity intensity), Oucollaborate (learning-activity intensity), Oucontent (learning-activity intensity)

## 4. Processed Dialogue Inspection

- Shape: 47234 × 16
- Feature overview (first 30, article labels): Conversation Id, Topic, Teacher Messages, Student Messages, Full Conversation, Number of Dialogue Turns, Average Learner Response Length, Number of Learner Questions, Uncertainty Indicators, Reasoning Indicators, Reflection Indicators, Reflection Quality, Detected Learning Difficulty, Reasoning Depth, Need for Teacher Feedback, Label Note

## 5. Class Distributions

Summary tables: `reports/tables/oulad_class_distribution_*.csv`, `dialogue_class_distribution_*.csv`.

## 6. Missing Data

See figure `oulad_missing_values_processed` and `dialogue_missing_values_processed`.

## 7. Generated Figures

- Count: **28** (PNG + PDF pairs under `reports/figures/`)

## 8. Generated Tables

- `reports/tables/raw_file_summary.csv`
- `reports/tables/oulad_processed_summary.csv` (if available)
- `reports/tables/dialogue_processed_summary.csv` (if available)
- `reports/tables/model_metrics_summary.csv` (if metrics exist)

## 9. Model Output Availability

- `oulad_model_metrics.json`: present
- `dialogue_model_metrics.json`: present

## 10. Limitations and Next Steps

- Public OULAD and dialogue corpora are not ThingLink telemetry.
- Dialogue labels are heuristic; metrics are not claims of production NLP performance.
- If ZIPs are missing, run: copy archives to `ml/data/raw/` then `python ml/run_pipeline.py --full`.
