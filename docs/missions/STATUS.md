# Mission Status

## Completed / engineering-implemented
- M01 — Foundation + Constitution: IMPLEMENTED (prototype scope)
- M02 — Adaptive Question Planner v1: IMPLEMENTED
- M03 — Versioned Rule Registry: IMPLEMENTED
- M04 — Evidence Graph + Finding Model: IMPLEMENTED
- M05 — Screening & Test Priority Engine: IMPLEMENTED
- Strategic Review 1: COMPLETE — CONTINUE WITH CHANGES
- M05.1 — Core Verification Harness: IMPLEMENTED
- M06 — Safety Gate + Clinical Source Baseline: IMPLEMENTED
- M07 — Health Map UX v2 + Shared Presentation Model: IMPLEMENTED
- M08 — Lab Reassessment + Normalization/Freshness: IMPLEMENTED
- M09 — Recommendation Engine v1: IMPLEMENTED
- Strategic Review 2: COMPLETE — CONTINUE WITH CHANGES
- M09.1 — Clinical Applicability & Evidence Integrity Gate: IMPLEMENTED
- M10 — AI Harness Runtime + Privacy/Evaluation: ENGINEERING IMPLEMENTED; LIVE UTILITY GATE PAUSED
- M13 — Longitudinal Health + Local Persistence: IMPLEMENTED

## M13.1 — Assessment Quality Recovery + Block UX v2
Status: **ENGINEERING IMPLEMENTED — OWNER TRUST-GATE RETEST REQUIRED**  
Effort: **High**

Owner gate:
> **Jaanch captured the material facts I expected it to know.**

## M13.2 — Result Quality + Health Map Consumer UX v3
Status: **ENGINEERING IMPLEMENTED — OWNER RESULT-UX RETEST REQUIRED**  
Effort: **High**

Owner gate:
> **Without opening technical details, I can tell what matters, what to do, what is unknown, and what changed.**

## M13.3 — Clinical Evidence Capture v2 / Report UX
Status: **ENGINEERING IMPLEMENTED — OWNER EVIDENCE-INGESTION RETEST REQUIRED**  
Effort: **High**

Implemented:
- provider-neutral report candidate/provenance contract;
- PDF/image/text provenance capture on web/mobile;
- deterministic pasted-text/OCR candidate extraction;
- explicit review before evidence promotion;
- HbA1c/B12 normalized lab eligibility remains authoritative;
- report unit/date are never guessed;
- exact duplicate/latest-result semantics;
- one reassessed immutable snapshot per reviewed report batch.

M13.4 integration update:
- confirmed BP/lipid/haemoglobin/ferritin/TSH measurements can now feed the **bounded M13.4 interpretation path** only after their verification/unit/date/freshness/applicability gates pass;
- Vitamin D, fasting/random glucose and unknown markers remain recorded/unassessed.

Mission detail: `docs/missions/M13.3_CLINICAL_EVIDENCE_CAPTURE_V2_REPORT_UX.md`.

## M13.4 — Narrow Clinical Interpretation Expansion
Status: **ENGINEERING IMPLEMENTED — OWNER CLINICAL/PROFILE RETEST REQUIRED**  
Effort: **High**

Implemented clinical domains:
- **blood pressure / cardiovascular context** — `CV-BP-001`, sourced to 2024 ESC;
- **lipid cardiovascular-risk context** — `CV-LIPID-001`, sourced to 2026 ACC/AHA dyslipidemia guidance;
- **anaemia / iron-status evidence** — `NUT-IRON-001`, sourced to WHO haemoglobin/ferritin guidance;
- **thyroid evidence** — `MET-THYROID-001`, sourced to NICE NG145.

Evidence integrity:
- broader measurements remain stored as captured measurements rather than being blindly added to the old HbA1c/B12 lab engine;
- eligibility requires user confirmation, supported unit, valid date, freshness and plausible range;
- private derived evidence is rebuilt only by the trusted capture path;
- public `assess(...)` strips forged internal M13.4 fields;
- persisted snapshots/profile exports strip internal derived evidence.

New investigation mappings:
- `MEASURE-BP`
- `LAB-LIPID-PANEL`
- `LAB-HEMOGLOBIN`
- `LAB-FERRITIN`
- `LAB-TSH`

New safety-bounded recommendations:
- `REC-BP-RECHECK-001`
- `REC-LIPID-RISK-001`
- `REC-IRON-REVIEW-001`
- `REC-THYROID-REVIEW-001`

### Profile portability / mocks
Protocol: `JAANCH-PROFILE-1.0`

Implemented:
- profile JSON import/export on web/mobile;
- imported profiles rerun the current deterministic engine;
- export preserves the runnable draft plus optional local history;
- web downloads `.jaanch-profile.json`;
- mobile imports `.json` via document picker and exports through the native share sheet;
- five built-in mock scenarios plus matching repo fixtures under `examples/mock-profiles/`.

Mocks:
1. low-risk adult;
2. cardiometabolic + lipids;
3. vegetarian + B12 + iron/anaemia;
4. thyroid signal;
5. severe triglyceride signal.

Profile portability is **not** secure cloud persistence or identity. M13.5 still owns that architecture.

Mission detail: `docs/missions/M13.4_NARROW_CLINICAL_INTERPRETATION_EXPANSION.md`.

## Combined owner validation gate
Jaanch is still not product-validated until hands-on use confirms:
1. assessment captures material facts;
2. result hierarchy is understandable;
3. report import is trustworthy;
4. the new clinical modules do not overstate certainty or prescribe autonomously;
5. mock/import/export flow is reliable and reruns evidence through the current engine.

Recommended M13.4 retest:
1. run all five built-in mocks;
2. export one mock/profile and re-import it;
3. use missing/incorrect unit or date and confirm interpretation is blocked;
4. test BP 148/94 and verify “measurement signal / confirm”, not “diagnosed hypertension”;
5. test TG ≥1000 and verify clinician-review boundary without medication change;
6. test female nonpregnant Hb 10.7 + ferritin 8 and verify cause-oriented review without autonomous iron dose;
7. test TSH 12.8 and verify confirmation/FT4 context rather than diagnosis;
8. test pregnancy and verify adult BP/lipid/iron/thyroid rules suppress where configured;
9. import the same values through report capture and compare semantics with manual/profile capture;
10. confirm Vitamin D/glucose still remain recorded/unassessed in M13.4.

Any trust/comprehension/evidence-integrity defect found in owner testing takes priority over the roadmap.

## Current product milestone
**Narrow-clinical-expansion alpha candidate — awaiting owner trust/result/report/clinical/profile retest.**

All new clinical rules and mappings remain `prototype`; source capture does not mean clinical approval.

## Next work
1. Fix any owner-discovered M13.1–M13.4 trust/result/evidence defect.
2. **M13.5 — Profile + Secure Persistence Architecture v1 — High.**
3. Resume **M10 live AI Utility Gate** only after intake/result/evidence/clinical quality is representative.
4. M11 remains conditional on M10 proving incremental value.
5. Strategic Review 3.
6. M15A Pilot Safety / Privacy / Release Gate.
7. M14 MCP / ChatGPT App later; M15B production/store hardening last.

## Active constraints
- Assessment quality is release-blocking.
- Result comprehension is release-blocking.
- Evidence-ingestion trust is release-blocking.
- Clinical expansion must stay narrow and source-governed.
- One measurement does not automatically become a diagnosis.
- Capturing a fact does not automatically authorize interpretation.
- Missing provenance must not be guessed.
- Prescription-medication changes are never autonomously recommended.
- Therapeutic iron/thyroid/lipid regimens are not autonomously prescribed.
- Evidence completeness is not overall health.
- Deterministic urgent/safety/applicability/evidence rules remain authoritative.
- Generic overall health score remains dropped.

## Session handover
Canonical new-session state: `HANDOVER_NEXT_SESSION.md`.

Always verify current `main`, then read README, this status file, roadmap and the latest mission doc before writing.

## Execution agreement
- Repository: `Amonaval/jaanch`
- Normal mission commit budget: 1–2 commits.
- High effort for assessment/result/evidence/safety/applicability/clinical/persistence/release work.
