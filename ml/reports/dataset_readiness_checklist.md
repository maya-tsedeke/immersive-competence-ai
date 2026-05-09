# Dataset readiness checklist

Generated: 2026-05-09T12:59:42.791066

## Required paths

| Artifact | Exists | Size (bytes) | Status | Required for | Recommendation |
|----------|--------|--------------|--------|--------------|----------------|
| ZIP OULAD | yes | 46750706 | Ready | extract | OK. |
| ZIP Dialogue | yes | 18579910 | Ready | extract | OK. |
| Extracted OULAD | yes | 464367129 | Ready | preprocess_oulad | OK. |
| Extracted dialogue | yes | 134006854 | Ready | preprocess_dialogue | OK. |
| oulad_features.csv | yes | 21615381 | Ready | training | File present; regenerate after pipeline step if data changed. |
| dialogue_features.csv | yes | 112760321 | Ready | training | File present; regenerate after pipeline step if data changed. |
| oulad_model_metrics.json | yes | 4674 | Ready | reports/model_charts | File present; regenerate after pipeline step if data changed. |
| dialogue_model_metrics.json | yes | 1445 | Ready | reports/model_charts | File present; regenerate after pipeline step if data changed. |
| learner_risk_predictions.json | yes | 18007718 | Ready | dashboard | File present; regenerate after pipeline step if data changed. |
| dialogue_predictions.json | yes | 10861329 | Ready | dashboard | File present; regenerate after pipeline step if data changed. |
| evaluation_summary.json | yes | 5772 | Ready | reports | File present; regenerate after pipeline step if data changed. |
| dashboardLearners.json | yes | 27935 | Ready | Next.js dashboard | File present; regenerate after pipeline step if data changed. |
| scenarioAnalytics.json | yes | 2447 | Ready | Next.js dashboard | File present; regenerate after pipeline step if data changed. |
| aiInsights.json | yes | 838 | Ready | Next.js dashboard | File present; regenerate after pipeline step if data changed. |
| reportSummary.json | yes | 920 | Ready | Next.js dashboard | File present; regenerate after pipeline step if data changed. |
| dialogueInsights.json | yes | 60609 | Ready | Next.js dashboard | File present; regenerate after pipeline step if data changed. |
| learnerRiskPredictions.json | yes | 42473 | Ready | Next.js dashboard | File present; regenerate after pipeline step if data changed. |
| interactionLogs.json | yes | 54546 | Ready | Next.js dashboard | File present; regenerate after pipeline step if data changed. |
| rubricByLearner.json | yes | 27654 | Ready | Next.js dashboard | File present; regenerate after pipeline step if data changed. |

## Missing (action required)

- None listed as Missing for critical ZIPs (verify manually).

## Pipeline readiness

- **Preprocessing**: requires both ZIPs and successful extract.
- **Training**: requires `oulad_features.csv` and `dialogue_features.csv`.
- **Dashboard JSON**: run `generate_dashboard_outputs.py` after training.
