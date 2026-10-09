# M09 — Recommendation Engine v1

## Goal
Turn current deterministic findings into a small, ranked action plan without crossing into autonomous diagnosis, prescription medication changes, or therapeutic/high-dose supplement dosing.

## Implemented
- `RECOMMENDATIONS-1.0.0` deterministic recommendation plan.
- Narrow recommendation scope for the existing metabolic, B12/nutrition and sleep domains.
- Shared recommendation presentation model used by React Native and React web.
- Every recommendation has stable ID, domain, action class, priority, rationale, steps, related finding IDs, source IDs and maturity.
- Final disposition is the stricter of the recommendation's own boundary and the M06 safety-gate disposition: allowed / caution / clinician review / blocked.
- Urgent red flags suppress routine recommendation planning.
- Therapeutic/high-dose supplement consideration is never emitted as autonomous self-care; measured low B12 produces clinician-review guidance without dose/regimen generation.
- No recommendation starts, stops or changes prescription medication.
- Recommendation source references fail fast if they do not resolve to the clinical source registry.
- HAP-1.0 can carry a deterministic recommendation plan.

## Initial recommendation set
- Metabolic: progressively increase activity; improve individualized eating-pattern quality; complete prioritized glycemic evidence collection when needed.
- Nutrition/B12: resolve missing B12 evidence; make reliable dietary B12 sources intentional for vegetarian/vegan users; clinician review for measured low B12 treatment consideration.
- Sleep: protect a regular adequate sleep window for adults; clinician-led evaluation when the screening signal suggests possible sleep disorder.

## Clinical-source additions
- ADA Standards of Care 2026 — positive health behaviors/nutrition/physical activity.
- WHO Guidelines on Physical Activity and Sedentary Behaviour (2020).
- AASM/SRS adult sleep-duration consensus statement (2015).
- Existing NIH ODS B12, ADA diagnosis/screening and AASM OSA diagnostic sources remain in use.

All recommendation mappings remain `prototype`. Source capture does not imply clinician approval.

## Verification
Dedicated recommendation scenarios cover:
- metabolic action-plan generation;
- bounded top-action list;
- pregnancy propagation into exercise/diet cautions;
- measured low B12 -> clinician review rather than self-treatment;
- pregnancy + low B12 -> therapeutic supplement path blocked;
- urgent red-flag suppression;
- sleep routine + clinician-review separation;
- deterministic repeatability.

## Not in M09
- medication prescribing or dose changes;
- therapeutic supplement dose/regimen generation;
- broad disease-domain expansion;
- AI-generated recommendations;
- recommendation effectiveness tracking;
- clinician approval workflow.

## Next
Strategic Review 2 should evaluate usefulness, safety boundaries, over-testing/over-recommending risk, special-population behavior, evidence quality and whether M10/M11 should proceed unchanged.
