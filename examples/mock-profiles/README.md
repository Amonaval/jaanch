# Jaanch mock profiles

These files use the versioned `JAANCH-PROFILE-1.0` portability format introduced with M13.4. They are synthetic test data, not real patient records.

Use them from **Profiles & mocks → Import JSON**, or run the equivalent built-in mock directly from the app.

| File | Purpose |
|---|---|
| `low-risk-adult.json` | Low-risk baseline with a recent blood-pressure reading. |
| `cardiometabolic-lipids.json` | Metabolic risk + HbA1c + BP + lipid context. |
| `vegetarian-b12-iron.json` | Vegetarian pattern + low B12 + low haemoglobin/ferritin. |
| `thyroid-signal.json` | Thyroid history + markedly high TSH requiring confirmation. |
| `severe-triglycerides.json` | TG ≥1000 mg/dL clinician-review boundary while already on a lipid medicine. |

## Expected safety behavior

- Imported JSON is rerun through the **current** deterministic engine; stored/derived conclusions are not trusted.
- Internal M13.4 derived fields are stripped on import/export and rebuilt only from eligible captured measurements.
- HbA1c/B12 still use the normalized lab pathway.
- BP, lipids, haemoglobin, ferritin and TSH use the bounded M13.4 recorded-measurement pathway only when verification, unit, date, freshness and applicability gates pass.
- Vitamin D, fasting/random glucose and arbitrary/unknown markers remain captured but unassessed in M13.4.
- These mocks exercise prototype rules. They are not clinical validation cases or medical advice.
