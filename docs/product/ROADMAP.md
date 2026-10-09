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
- lifestyle;
- diet;
- exercise;
- monitoring;
- clinician-review actions;
- safety-gated therapeutic boundaries.

## Strategic Review 2 — COMPLETE
Decision: **CONTINUE WITH CHANGES**.

Key finding: the core product loop is strong, but population applicability and evidence-ingestion integrity must be hardened before live AI review.

## Immediate quality gate — M09.1
### M09.1 — Clinical Applicability & Evidence Integrity Gate — HIGH
Required scope:
- first-class population/applicability contract for rules, investigations and recommendations;
- prevent adult-oriented logic from silently running in unsupported pediatric/pregnancy/special-population contexts;
- safety/applicability-aware investigation planning;
- one canonical normalized lab-ingestion path;
- remove/directly normalize raw `hba1c` / `b12` questionnaire bypasses;
- answer normalization/contradiction validation (`none` exclusivity, impossible combinations);
- governance reporting expanded to recommendations and applicability/safety policy;
- golden scenarios for pediatric, pregnancy, kidney/liver, contradictory inputs and lab-ingestion bypass.

Broad domain expansion remains frozen through M09.1 and the M10 AI Utility Gate.

## Phase 3 — Harnessed AI review
### M10 — AI Harness Runtime + Privacy/Evaluation — HIGH
Changed by SR2 from a simple runtime mission into a safety/privacy/evaluation mission.

Required scope:
- canonical Jaanch harness naming/versioning;
- minimized AI packet derived from HAP rather than indiscriminately sharing all data;
- explicit evidence eligibility/freshness semantics;
- explicit prototype/reviewed/approved authority semantics;
- strict structured-output validation;
- immutable/separate AI result;
- explicit opt-in sharing boundary;
- model/runtime + harness + schema version trace;
- deterministic fallback on timeout/error/invalid output;
- fixed-fixture AI usefulness/safety evaluation;
- live model adapter behind an optional feature flag.

### AI Utility Gate — part of M10 closure
Continue into M11 only if AI demonstrates incremental review value while preserving deterministic safety.

If AI is primarily paraphrase, invents facts, relaxes safety, treats ineligible evidence as current, or creates unacceptable variability:
- DEFER M11;
- MOVE M13 Longitudinal Health next.

### M11 — AI Review Comparison & Safe Escalation — HIGH, CONDITIONAL
Renamed/reframed from “Engine vs AI Verdict.”

- agreement/disagreement display;
- missing evidence needed to resolve disagreement;
- safest interim action;
- deterministic urgent/safety constraints remain authoritative;
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

Move M13 ahead of M11 if the M10 AI Utility Gate is not convincingly passed.

### M12 — Rule Studio v1 — DEFERRED
Rule Studio remains valuable but is not required for first user value. Defer until rule-authoring volume becomes a demonstrated bottleneck.

## Strategic Review 3 — after longitudinal + whichever AI path survives the utility gate
Review:
- end-to-end user value;
- retention/retest value;
- AI incremental usefulness if retained;
- disagreement behavior;
- privacy/data minimization;
- pilot readiness;
- ChatGPT/MCP fit.

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
- privacy/consent model;
- audit trail;
- accessibility;
- threat model;
- jurisdiction-specific legal/regulatory assessment for intended claims/distribution;
- release checklist.

## Deferred breadth
Until M09.1 + M10 Utility Gate, defer:
- additional health domains except where required to validate applicability abstractions;
- wearables;
- lab-provider integrations;
- clinician portal;
- generic overall health score;
- large declarative rule DSL.

## Execution cadence
- Build in 1–2 commits per mission.
- Execute related missions in bounded batches; retain mission-level verification and status.
- Medium effort is the default; raise to High for architecture/safety/AI/reconciliation/distribution missions.
- Strategic reviews may continue, change, defer, merge or drop later work.
