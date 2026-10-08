# Jaanch Roadmap

## Phase 1 — Deterministic foundation — COMPLETE THROUGH M05
- Master-question baseline.
- Adaptive follow-up selection.
- Versioned rule registry.
- Evidence graph and finding model.
- Screening/test priority engine.
- Red-flag interruption prototype.
- HAP export.

## Immediate quality gate — M05.1
### Core Verification Harness
Before expanding safety logic, establish executable golden scenarios for planner/rule/evidence/investigation behavior.

Required focus:
- representative healthy and higher-signal profiles;
- missing vs measured evidence;
- contradiction paths;
- skip/unknown behavior;
- red-flag suppression;
- investigation de-duplication;
- graph/catalog invariant failures;
- deterministic repeatability.

## Phase 2 — Safety + clinical governance
### M06 — Safety Gate + Clinical Source Baseline
- pregnancy/breastfeeding and special-population context;
- medication/supplement/allergy context;
- kidney/liver and other suppression context;
- contraindication/recommendation-class gates;
- stronger red-flag handling;
- source/reference registry contract;
- rule/investigation maturity and approval workflow baseline.

### M07 — Health Map UX v2
- domain map;
- prioritized findings/actions;
- evidence completeness;
- shared platform-neutral presentation selectors/view model;
- patient-friendly evidence and uncertainty wording;
- rule/provenance inspection.

### M08 — Lab Reassessment + normalization/freshness
- manual lab entry;
- normalized marker IDs;
- units;
- collection date/time;
- source/manual-entry provenance;
- optional reference-range capture;
- freshness semantics;
- reassessment and changed-verdict view.

### M09 — Recommendation Engine v1
- lifestyle;
- diet;
- exercise;
- monitoring;
- clinician-review actions;
- only appropriately gated supplement considerations.

**No broad domain expansion before M09 + Strategic Review 2 unless required to validate a safety abstraction.**

## Strategic Review 2 — after M09
Review clinical-safety posture, usefulness, recommendation boundaries, false reassurance, over-testing risk, special-population behavior and explainability.

## Phase 3 — Harnessed AI review
### M10 — AI Harness Runtime
- harness + HAP prompt construction;
- strict output-schema validation;
- separate AI result storage;
- independent review behavior.

### M11 — Engine vs AI Verdict
- agreement/disagreement model;
- missing-evidence resolver;
- deterministic reconciliation;
- AI never silently overrides core safety/rules.

## Phase 4 — Longitudinal product loop
### M13 — Longitudinal Health
- assessment history;
- trends;
- compare;
- retest loop;
- before/after Health Map.

### M12 — Rule Studio v1 — DEFERRED
Rule Studio remains valuable but is not required for first user value. Defer until after initial distribution/release hardening unless rule-authoring volume becomes a real bottleneck.

## Strategic Review 3 — after M13, before distribution
Review end-to-end product value, AI-harness usefulness, disagreement behavior, longitudinal retention value, privacy/data minimization and ChatGPT/MCP fit.

## Phase 5 — Distribution and hardening
### M14 — MCP / ChatGPT App
- API/tool contracts;
- interactive ChatGPT surface;
- sequencing remains in Jaanch core;
- permission and data-sharing boundaries.

### M15 — Validation & Release Hardening
- clinical content review workflow hardening;
- privacy model;
- audit trail;
- accessibility;
- threat model;
- release checklist.

## Deferred breadth
Until SR2, defer:
- many additional health domains;
- wearables;
- lab-provider integrations;
- clinician portal;
- generic overall health score;
- large declarative rule DSL.

## Execution cadence
- Build in 1–2 commits per mission.
- Execute related missions in bounded batches; retain mission-level verification and status.
- Medium effort is the default; raise to High for architecture/safety/reconciliation/distribution missions.
- Strategic reviews may continue, change, defer, merge or drop later work.
