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
- M10 — AI Harness Runtime + Privacy/Evaluation: ENGINEERING IMPLEMENTED
- M13 — Longitudinal Health + Local Persistence: IMPLEMENTED

## First hands-on owner review — IMPORTANT RESULT

The current build is a **working engineering prototype but not yet a credible assessment alpha**.

Observed issues are not cosmetic only; they affect evidence completeness and therefore result quality:

- UI is too plain / engineering-oriented;
- assessment is too question-by-question;
- Back/Next can lose or skip a dynamically planned question;
- height/waist units are not user-friendly;
- condition list too narrow;
- no robust Other/manual diagnosis path;
- medication capture too shallow, including common cholesterol-medication context;
- concern/symptom list too narrow;
- no robust Other/manual concern path;
- walking is not represented adequately;
- exercise type/duration/intensity model is too weak;
- known Vitamin D and other lab values may be ignored because only B12/HbA1c are currently structured/interpreted;
- detail/AI context is therefore incomplete;
- the original adaptive 10–20 master → 20–50+ follow-up concept has been compressed too far.

Assessment quality is now a **release-blocking trust criterion**.

See:
- `docs/product/ASSESSMENT_QUALITY_STANDARD.md`
- `docs/missions/M13.1_ASSESSMENT_QUALITY_RECOVERY.md`

## Current
### M13.1 — Assessment Quality Recovery + Block UX v2
Effort: **HIGH**
Status: **NEXT / BLOCKING**

M13.1 now includes:
- 4–6 block assessment flow rather than one Next per small question;
- stable Back/Forward visited-flow navigation;
- regression fix for lost adaptive question after Back;
- broader ~50–100 potential evidence/question bank with adaptive display;
- human-friendly height/waist/weight units;
- broader diagnoses + Other/manual condition;
- named/manual medicines and purposes;
- named/manual supplements;
- broader current concerns + Other/manual detail;
- walking + exercise type/duration/intensity/steps capture;
- broader family-history capture where useful;
- broader known lab/measurement capture including Vitamin D, lipids, BP, thyroid/iron headline values and Other/manual evidence;
- explicit `recorded/unassessed` facts for captured evidence Jaanch cannot yet deterministically interpret;
- preservation of richer context in saved history/detail and future privacy-minimized AI packet;
- materially stronger mobile-first UI hierarchy;
- hands-on owner trust gate before mission closure.

M13.1 may use **3–4 commits** because it is a corrective mission across shared schema, navigation, both UIs and verification. Quality takes priority over artificial commit compression.

## Owner trust scenarios required before M13.1 closes
1. generally healthy adult;
2. vegetarian with known low B12 + low Vitamin D;
3. cholesterol + blood-pressure medicines;
4. daily walking but little formal exercise;
5. unlisted diagnosis + unlisted health concern;
6. metabolic-risk profile with HbA1c/lipids;
7. Back/Edit after adaptive follow-ups exist;
8. urgent chest-pain path;
9. repeat check-in retaining custom/manual facts.

## Revised upcoming sequence
1. **M13.1 — Assessment Quality Recovery + Block UX v2** — High — NEXT/BLOCKING
2. **M13.2 — Result Quality + Health Map Consumer UX v3** — High
3. **M13.3 — Clinical Evidence Capture v2 / Report UX** — High
4. **M13.4 — Narrow Clinical Interpretation Expansion** — High, only after quality gates
5. **M13.5 — Profile + Secure Persistence Architecture v1** — High
6. **M10 live AI Utility Gate** — resume after richer intake/results are stable
7. **M11 — AI Review Comparison & Safe Escalation** — High, CONDITIONAL
8. **Strategic Review 3** — High
9. **M15A — Pilot Safety / Privacy / Release Gate** — High
10. **M14 — MCP / ChatGPT App** — later
11. **M15B — Store / Production Hardening** — High

## M13.2 intent
Results should lead with:
- What matters;
- What is missing;
- What to do next;
- What changed;
- Recorded but not yet assessed context.

Clinical/source/provenance detail remains accessible but should not dominate the consumer surface.

## M13.3 intent
Improve structured/manual/report evidence ingestion. Image/PDF/OCR/AI extraction must require explicit user confirmation before evidence becomes eligible.

## M13.4 intent
Interpret a deliberately narrow set of additional domains only after capture/result quality is credible. Potential modules include BP/cardiovascular, lipids, iron/anemia, thyroid, and Vitamin D where justified. Capture breadth does not imply interpretation authority.

## M13.5 intent
Secure profile/account persistence only after the intake schema stabilizes; do not freeze an incomplete model into backend architecture.

## AI decision point
### M10 AI Utility Gate — PAUSED
M10 engineering exists, but AI evaluation is not the current priority.

A model evaluated against incomplete intake could appear weak or hallucination-prone simply because Jaanch failed to capture the user's context.

Resume only after M13.1/M13.2 provide a representative packet.

M11 proceeds only if the real-model gate demonstrates incremental value while preserving deterministic safety/applicability/evidence boundaries.

## Active constraints
- Assessment quality is release-blocking.
- AI must not compensate for poor intake.
- No known material fact should be dropped merely because Jaanch lacks a rule for it.
- Captured-but-unsupported facts are preserved as recorded/unassessed context.
- Free text does not silently become deterministic medical truth.
- No adult-oriented rule/test mapping may silently run in unsupported populations.
- One canonical normalized lab-ingestion path drives interpreted lab findings.
- Investigation planning respects applicability.
- Contradictory inputs are normalized before rule execution.
- AI must not treat stale/unverified/ineligible lab records as active evidence.
- AI must not upgrade prototype logic to clinical authority.
- Live AI sharing must be opt-in/minimized.
- Deterministic urgent/safety/applicability restrictions remain authoritative.
- Do not introduce a generic overall health score.

## Execution agreement
- Repository: `Amonaval/jaanch`
- Default commit budget: 1–2 commits per mission.
- Exception: M13.1 may use 3–4 commits because it is a cross-layer corrective quality mission.
- Default effort: Medium.
- Assessment-quality/safety/applicability/AI/reconciliation/persistence/release missions use High effort.
- Strategic reviews may continue, change, drop or defer roadmap work.
