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

## M09.1 closure
- Added first-class applicability policies for current metabolic, B12/nutrition, sleep and red-flag logic.
- Rules are applicability-gated before they can create findings/evidence; unsupported contexts remain traceable instead of running adult logic plus a later warning.
- Investigations carry applicability policy IDs and are suppressed upstream when the current context is unsupported.
- Recommendations carry applicability policy IDs in addition to M06 safety disposition.
- Removed raw HbA1c/B12 questionnaire fields from the adaptive flow.
- Public `assess()` strips bare lab-number fields; only eligible normalized `LabRecord` evidence can drive lab-informed findings.
- Core input normalization resolves contradictory `none + positive` selections and records normalization events.
- React Native and React web enforce exclusive `none` selection in the UI as well.
- Added shared Applicability & Evidence Integrity presentation semantics across platforms.
- Clinical governance now inventories rules, investigations, recommendations, applicability policies and product safety policy IDs.
- Golden scenarios cover pediatric/pregnancy applicability, canonical lab enforcement, stale/unverified/future labs, contradictory answers, kidney safety and governance coverage.
- Current applicability/rule/investigation/recommendation mappings remain `prototype`; unsupported context means the current Jaanch mapping is not configured for that population, not that clinical evaluation is unnecessary.

## Current
M10 — AI Harness Runtime + Privacy/Evaluation: NEXT
Effort: High

## M10 closure gate
AI Utility Gate must decide:
- CONTINUE M11 if AI adds measurable review value while respecting deterministic safety/applicability/evidence boundaries; or
- DEFER M11 and move M13 Longitudinal Health next if AI is primarily paraphrase or too variable.

## Then
M11 — AI Review Comparison & Safe Escalation: High, CONDITIONAL
M13 — Longitudinal Health + Persistence: Medium/High; move ahead if AI utility is weak

## Active SR2 constraints
- No adult-oriented rule/test mapping may silently run in an unsupported population.
- One canonical normalized lab-ingestion path drives lab-informed findings.
- Investigation planning respects applicability before ordinary prioritization.
- Contradictory inputs are normalized before rule execution.
- AI must not treat stale/unverified/ineligible lab records as active evidence.
- AI must not upgrade prototype logic to clinical authority.
- Live AI data sharing must be opt-in and minimized.
- Deterministic urgent/safety/applicability restrictions remain authoritative.
- M11 proceeds only if M10 proves incremental review value.
- Do not introduce a generic overall health score.

## Execution agreement
- Repository: `Amonaval/jaanch`
- Commit budget: 1–2 commits per mission
- Default effort: Medium
- Safety/applicability/AI/reconciliation missions use High effort.
- Strategic reviews may continue, change, drop or defer roadmap work.
