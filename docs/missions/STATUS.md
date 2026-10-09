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

## M10 closure
- Added privacy-minimized `JAANCH-AI-REVIEW-1.0` packet.
- External AI packet creation requires explicit opt-in consent.
- Raw questionnaire answers are not shared; only derived/relevant evidence is projected.
- Only eligible normalized lab evidence is shared externally; stale/unverified/future/ineligible labs are omitted.
- Added strict `AI-ASSESSMENT-1.0` JSON Schema plus local validation/invariant enforcement.
- Deterministic urgent/safety/applicability boundaries cannot be silently relaxed by AI output.
- Added deterministic AI Utility Gate evaluation primitives and golden fixtures.
- Added server-only `@jaanch/ai-runtime` OpenAI Responses adapter; mobile/web never own API keys.
- Live provider is disabled by default and requires explicit enablement/configuration.
- OpenAI request uses strict JSON-Schema structured output and `store:false` baseline.
- Canonical Markdown harness is loaded into the provider request and version metadata is retained.
- Provider errors/invalid output leave the deterministic assessment unchanged.
- `npm run verify` now includes AI-core and server request-construction checks.

## AI Utility Gate
Status: **PENDING REAL-MODEL EVALUATION**

The repository/runtime implementation is complete, but no live API credential/model run is available in this session. Do not claim that M11 is approved from canned fixtures alone.

Gate outcome must be one of:
- `CONTINUE M11` only if a real configured model adds expected review value while preserving safety/applicability/evidence boundaries; or
- `DEFER M11` if behavior is primarily paraphrase, unsafe, unsupported-context leakage, evidence misuse, or too variable.

## Current
AI Utility Gate live evaluation: NEXT DECISION POINT
Effort: High

## Conditional next work
- If gate passes: M11 — AI Review Comparison & Safe Escalation: High
- If gate does not pass / remains unavailable: M13 — Longitudinal Health + Persistence: Medium/High

## Active SR2 constraints
- No adult-oriented rule/test mapping may silently run in an unsupported population.
- One canonical normalized lab-ingestion path drives lab-informed findings.
- Investigation planning respects applicability before ordinary prioritization.
- Contradictory inputs are normalized before rule execution.
- AI must not treat stale/unverified/ineligible lab records as active evidence.
- AI must not upgrade prototype logic to clinical authority.
- Live AI data sharing must be opt-in and minimized.
- Deterministic urgent/safety/applicability restrictions remain authoritative.
- M11 proceeds only if M10 proves incremental review value with a real configured model.
- Do not introduce a generic overall health score.

## Execution agreement
- Repository: `Amonaval/jaanch`
- Commit budget: 1–2 commits per mission
- Default effort: Medium
- Safety/applicability/AI/reconciliation missions use High effort.
- Strategic reviews may continue, change, drop or defer roadmap work.
