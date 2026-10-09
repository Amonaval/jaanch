# Mission Status

## Completed
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

Implemented:
- five primary assessment sections with adaptive/safety follow-ups;
- stable block Back/Forward navigation and plan-change invalidation;
- metric/imperial canonical measurements;
- broader conditions, concerns, family history and manual Other paths;
- named medicines/supplements;
- walking plus structured exercise capture;
- broader known-result capture;
- HbA1c/B12 remain on the interpreted lab path while unsupported markers stay `recorded_unassessed`;
- richer longitudinal/HAP context and web/mobile intake UX;
- intake/navigation verification and post-implementation editing hardening.

Owner gate:
> **Jaanch captured the material facts I expected it to know.**

## M13.2 — Result Quality + Health Map Consumer UX v3
Status: **ENGINEERING IMPLEMENTED — OWNER RESULT-UX RETEST REQUIRED**  
Effort: **High**

Implemented:
- shared `buildConsumerResultViewModel` across web/mobile;
- bounded urgent / attention / needs-evidence / quiet hero semantics;
- evidence completeness explicitly not represented as overall health;
- hierarchy: What matters now → What you can do → What evidence supports → What remains uncertain → What changed;
- concrete recommendation steps;
- supported evidence separated from uncertainty;
- recorded-but-uninterpreted facts retained visibly;
- comparison against the previous distinct saved check-in;
- meaningful finding/lab/evidence-completeness change summaries;
- technical governance detail demoted behind consumer meaning.

Owner gate:
> **Without opening technical details, I can tell what matters, what to do, what is unknown, and what changed.**

## M13.3 — Clinical Evidence Capture v2 / Report UX
Status: **ENGINEERING IMPLEMENTED — OWNER EVIDENCE-INGESTION RETEST REQUIRED**  
Effort: **High**

Implemented:
- provider-neutral report candidate/provenance contract;
- deterministic text/OCR candidate extraction and marker normalization;
- extraction confidence and parsing/clarification visibility;
- explicit review/confirmation before evidence promotion;
- existing HbA1c/B12 unit/date/verification/freshness/plausibility gates remain authoritative;
- unsupported markers remain `recorded_unassessed` after confirmation;
- exact duplicate replacement and latest-result semantics;
- report provenance retained through normalized evidence;
- batch application of reviewed candidates into one reassessed immutable snapshot based on the latest saved check-in;
- dedicated web report-import surface with browser PDF/image/text picker;
- dedicated mobile report-import surface with `expo-document-picker`;
- editable value/unit/date/reference range before confirmation;
- deterministic M13.3 verification scenarios.

Alpha limitation:
- raw PDF/image bytes are **not** automatically OCR-parsed in this mission;
- attachment preserves source provenance and the user pastes report text/OCR output;
- a future extraction provider may implement the provider-neutral contract, but cannot bypass confirmation or clinical eligibility gates.

Mission detail: `docs/missions/M13.3_CLINICAL_EVIDENCE_CAPTURE_V2_REPORT_UX.md`.

## Combined owner validation gate
Jaanch is not product-validated until hands-on use confirms all three:
1. **Jaanch captured the material facts I expected it to know.**
2. **Without opening technical details, I can tell what matters, what to do, what is unknown, and what changed.**
3. **Report import makes evidence capture easier without silently accepting extracted values or over-interpreting unsupported markers.**

Recommended retest scenarios:
1. healthy/low-risk adult;
2. vegetarian with known low B12 + recorded low Vitamin D;
3. cholesterol medicine + blood-pressure medicine;
4. daily walker with little formal exercise;
5. unlisted diagnosis + unlisted concern;
6. metabolic-risk profile with known HbA1c/lipids;
7. Back → Forward after adaptive follow-up exists;
8. edit an earlier section so the adaptive plan changes;
9. urgent chest-pain path;
10. repeat check-in preserving manual/custom facts;
11. repeat check-in with meaningful change;
12. repeat check-in with no meaningful change;
13. compare web/mobile result meaning and ordering;
14. attach a report, extract candidates, edit a wrong value/unit/date and confirm only reviewed items;
15. confirm HbA1c/B12 plus unsupported Vitamin D/lipids and verify only supported evidence can influence deterministic findings;
16. re-import an exact duplicate and then a newer distinct result;
17. compare web/mobile report-import semantics.

Any new trust/comprehension/evidence-integrity defect found in owner testing takes priority over the roadmap.

## Current product milestone
**Evidence-ingestion alpha candidate — awaiting owner trust/result/report retest.**

Clinical interpretation breadth remains deliberately narrow.

## Next work after retest
1. Fix any M13.1/M13.2/M13.3 defects found in hands-on use.
2. **M13.4 — Narrow Clinical Interpretation Expansion** — High, only after trust gates are credible.
3. **M13.5 — Profile + Secure Persistence Architecture v1** — High.
4. Resume **M10 live AI Utility Gate** only after intake/result/evidence quality is representative.
5. **M11** remains conditional on M10 proving incremental value.
6. Strategic Review 3.
7. M15A Pilot Safety / Privacy / Release Gate.
8. M14 MCP / ChatGPT App later; M15B production/store hardening last.

## Active constraints
- Assessment quality is release-blocking.
- Result comprehension is release-blocking.
- Evidence-ingestion trust is release-blocking.
- Capture breadth does not authorize interpretation breadth.
- Manual/unassessed facts must not become diagnoses automatically.
- Report extraction must never equal evidence eligibility.
- Evidence completeness must never be represented as overall health.
- AI must not compensate for poor intake or confusing deterministic results.
- Deterministic urgent/safety/applicability/evidence rules remain authoritative.
- Cloud persistence remains behind intake/result/evidence stabilization.
- No generic overall health score.

## Session handover
Canonical new-session prompt/state:

```text
HANDOVER_NEXT_SESSION.md
```

A new session should verify the current `main` head and read that handover plus `README.md`, this status file and `docs/product/ROADMAP.md` before implementation. When handover text and current mission docs differ, current `main` plus `STATUS.md`/`ROADMAP.md` govern.

## Execution agreement
- Repository: `Amonaval/jaanch`
- Normal mission commit budget: 1–2 commits.
- High effort for assessment quality, result quality, evidence capture, safety, applicability, AI, persistence, clinical expansion and release gates.
