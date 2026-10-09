# Jaanch Roadmap

## Phase 1 — Deterministic foundation — COMPLETE
- Master-question baseline.
- Adaptive follow-up selection.
- Versioned rule registry.
- Evidence graph and finding model.
- Screening/test priority engine.
- Red-flag interruption prototype.
- HAP export.
- Core verification harness.

## Phase 2 — Safety, reassessment and actions — COMPLETE THROUGH M09
### M06 — Safety Gate + Clinical Source Baseline — COMPLETE
- special-population context;
- medication/supplement/allergy context;
- kidney/liver constraints;
- recommendation-class gates;
- source/reference registry;
- maturity/provenance baseline.

### M07 — Health Map UX v2 — COMPLETE
- shared platform-neutral presentation model;
- prioritized findings/actions;
- evidence completeness;
- safety/investigation/governance presentation.

### M08 — Lab Reassessment + normalization/freshness — COMPLETE
- normalized lab records;
- units/date/source/verification/freshness;
- reassessment and changed-result view;
- lab provenance.

### M09 — Recommendation Engine v1 — COMPLETE
- bounded lifestyle/diet/exercise/monitoring/clinician-review actions;
- safety-gated therapeutic boundaries.

## Strategic Review 2 — COMPLETE
Decision: **CONTINUE WITH CHANGES**.

Key finding: population applicability and evidence-ingestion integrity had to be hardened before live AI review.

## M09.1 — Clinical Applicability & Evidence Integrity Gate — COMPLETE
- first-class applicability contracts;
- pre-rule population gating;
- applicability-aware investigations/recommendations;
- canonical normalized lab pathway;
- raw-lab questionnaire bypass removed;
- contradictory-answer normalization;
- applicability UX/governance/verification.

## Phase 3 — Harnessed AI review
### M10 — AI Harness Runtime + Privacy/Evaluation — ENGINEERING COMPLETE
Implemented:
- canonical Jaanch harness naming/versioning;
- privacy-minimized `JAANCH-AI-REVIEW-1.0` packet;
- explicit external-AI opt-in boundary;
- eligible-lab-only sharing;
- strict `AI-ASSESSMENT-1.0` JSON Schema;
- local post-provider safety/applicability invariant validation;
- immutable/separate AI review result;
- provider/model/harness/schema trace;
- deterministic provider-error/invalid-output fallback;
- fixed-fixture utility/safety evaluation;
- server-only OpenAI Responses adapter behind disabled-by-default feature configuration;
- request baseline uses strict JSON-Schema structured output and `store:false`.

### AI Utility Gate — NEXT DECISION POINT
A real configured model must be evaluated before M11 proceeds.

Continue into M11 only if live evaluation demonstrates incremental review value while preserving deterministic safety, applicability and evidence eligibility.

If AI is primarily paraphrase, invents facts, relaxes safety, treats ineligible evidence as current, or is too variable:
- DEFER M11;
- MOVE M13 Longitudinal Health next.

### M11 — AI Review Comparison & Safe Escalation — HIGH, CONDITIONAL
Proceed only after a defensible `continue_m11` utility-gate result.
- agreement/disagreement display;
- evidence needed to resolve disagreement;
- safest interim action;
- deterministic urgent/safety/applicability constraints remain authoritative;
- no silent merged medical verdict;
- no more-permissive AI override.

## Phase 4 — Longitudinal product loop
### M13 — Longitudinal Health + Persistence — MEDIUM/HIGH
- assessment persistence/history;
- trends;
- compare;
- retest loop;
- before/after Health Map;
- lab history;
- action-plan evolution.

Move M13 ahead of M11 if the M10 AI Utility Gate is not convincingly passed or live evaluation remains unavailable.

### M12 — Rule Studio v1 — DEFERRED
Revisit only when rule-authoring volume becomes a demonstrated bottleneck.

## Strategic Review 3
Run after longitudinal work plus whichever AI path survives the utility gate. Review end-to-end user value, retention/retest value, AI incremental usefulness, disagreement behavior, privacy/data minimization, pilot readiness and ChatGPT/MCP fit.

## Phase 5 — Distribution and hardening
### M14 — MCP / ChatGPT App
- API/tool contracts;
- interactive ChatGPT surface;
- sequencing remains in Jaanch core;
- explicit permission and data-sharing boundaries.

### M15 — Validation & Release Hardening
Before public release:
- qualified clinical-content review/approval workflow;
- source freshness/review process;
- reproducible verification/release gate;
- privacy/consent model;
- audit trail;
- accessibility;
- threat model;
- jurisdiction-specific legal/regulatory assessment for intended claims/distribution;
- release checklist.

## Deferred breadth
Until the AI Utility Gate / longitudinal decision:
- additional health domains except where required to validate abstractions;
- wearables;
- lab-provider integrations;
- clinician portal;
- generic overall health score;
- large declarative rule DSL.

## Execution cadence
- Build in 1–2 commits per mission.
- Execute related missions in bounded batches; retain mission-level verification and status.
- Medium effort is default; use High for architecture/safety/AI/reconciliation/distribution missions.
- Strategic reviews may continue, change, defer, merge or drop later work.
