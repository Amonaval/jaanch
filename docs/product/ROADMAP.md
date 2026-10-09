# Jaanch Roadmap

## Current state

Jaanch is engineering-implemented through **M13.4 — Narrow Clinical Interpretation Expansion**.

Current milestone:

> **Narrow-clinical-expansion alpha candidate — awaiting owner trust/result/report/clinical/profile retest.**

The deterministic core, block intake, evidence graph, safety/applicability gates, normalized HbA1c/B12 reassessment, reviewed report-evidence ingestion, consumer Health Map, local longitudinal history, narrow BP/lipid/iron/thyroid interpretation and local profile portability are implemented.

Open quality gates remain hands-on product gates, not paperwork:
1. assessment trust;
2. result comprehension;
3. evidence-ingestion trust;
4. narrow clinical interpretation trust;
5. profile import/export/mock reliability.

Any trust/comprehension/evidence-integrity defect discovered in owner testing takes priority over roadmap expansion.

---

## M13.1 — Assessment Quality Recovery + Block UX v2
Status: **ENGINEERING IMPLEMENTED — OWNER TRUST-GATE RETEST REQUIRED**  
Effort: High

Exit gate: Jaanch captured the material health facts expected by the user.

## M13.2 — Result Quality + Health Map Consumer UX v3
Status: **ENGINEERING IMPLEMENTED — OWNER RESULT-UX RETEST REQUIRED**  
Effort: High

Exit gate: the user can tell what matters, what to do, what is unknown and what changed without opening technical detail.

## M13.3 — Clinical Evidence Capture v2 / Report UX
Status: **ENGINEERING IMPLEMENTED — OWNER EVIDENCE-INGESTION RETEST REQUIRED**  
Effort: High

Candidate-only extraction, explicit review, provenance, no guessed unit/date, dedupe/latest semantics and batch reassessment are implemented. M13.4 now consumes only the specific broader confirmed measurements it explicitly authorizes.

---

## M13.4 — Narrow Clinical Interpretation Expansion
Status: **ENGINEERING IMPLEMENTED — OWNER CLINICAL/PROFILE RETEST REQUIRED**  
Effort: **High**

Implemented:
- blood pressure / cardiovascular context;
- lipid cardiovascular-risk context;
- haemoglobin/ferritin anaemia/iron-status context;
- TSH thyroid context;
- authoritative/current source registry additions;
- explicit adult/nonpregnant applicability policies;
- missing-evidence/investigation mappings;
- safety-bounded recommendations;
- anti-forgery measurement materialization and persistence sanitization;
- M13.3 report-flow integration;
- versioned `JAANCH-PROFILE-1.0` import/export;
- five built-in synthetic mock profiles plus repo JSON fixtures;
- deterministic clinical-expansion/profile verification suites.

Deliberately not implemented:
- Vitamin D interpretation;
- fasting/random glucose interpretation expansion;
- broad disease rules;
- PREVENT/ASCVD calculation;
- medication-dose algorithms;
- pregnancy-specific modules;
- cloud identity/sync/encrypted persistence.

Mission detail: `docs/missions/M13.4_NARROW_CLINICAL_INTERPRETATION_EXPANSION.md`.

---

## M13.5 — Profile + Secure Persistence Architecture v1 — NEXT

Effort: **High**

M13.4 profile JSON is intentionally local portability/testing infrastructure. M13.5 owns real persistence architecture.

Scope:
- profile/user identity boundary;
- consent model;
- retention/delete/export semantics;
- secure backend boundary;
- encryption/storage decisions;
- backup/sync/cross-device continuity;
- schema/version migrations;
- authenticated profile ownership;
- privacy-minimized telemetry/error policy where justified;
- clinical core remains independent of storage vendor.

Supabase or another backend may be evaluated here. Storage must not dictate clinical semantics.

Do not move sensitive health history to cloud merely because local JSON import/export exists.

---

## M10 live AI Utility Gate — PAUSED

M10 engineering is implemented. Resume live-model evaluation only when the intake/result/evidence/clinical output is representative enough to judge AI fairly.

Pass only if AI adds incremental contradiction detection, missing-consideration detection, useful explanation or safe disagreement articulation while respecting deterministic urgent/safety/applicability/evidence decisions and privacy minimization.

M11 remains conditional on that gate.

---

## Strategic Review 3

Run after owner validation plus M13.4/M13.5 meaningful progress, or earlier if hands-on testing exposes a strategic flaw.

Review:
- capture completeness;
- report-ingestion trust;
- clinical interpretation usefulness vs overreach;
- result comprehension;
- longitudinal value;
- profile/persistence/privacy direction;
- over-testing/under-testing risk;
- measurable AI value;
- pilot readiness.

---

## Pilot and distribution

### M15A — Pilot Safety / Privacy / Release Gate
Required before meaningful external pilot use:
- qualified clinical review of supported rules;
- source governance;
- privacy/consent/retention semantics;
- threat model and encryption decisions;
- delete/export;
- accessibility;
- telemetry/error policy;
- reproducible verification/build gate;
- intended-market claims and jurisdiction-specific regulatory review.

Milestone: controlled private-pilot candidate only when those gates are actually satisfied.

### M14 — MCP / ChatGPT App — later
Only after standalone Jaanch demonstrates value and schemas stabilize.

### M15B — Store / Production Hardening
Production builds, Play internal/TestFlight, crash monitoring, migrations, backup/recovery, store policies/assets and operational runbook.

---

## Product maturity checkpoints

| Checkpoint | Product state |
|---|---|
| M13.1 | Credible-assessment alpha candidate; owner trust retest required |
| M13.2 | Consumer-result alpha candidate; owner result retest required |
| M13.3 | Evidence-ingestion alpha candidate; owner report retest required |
| M13.4 | Narrow-clinical-expansion alpha candidate; owner clinical/profile retest required |
| Owner gates passed | Usable consumer alpha with reviewed evidence + narrow interpretation |
| M13.5 + M15A | Controlled private-pilot candidate |
| M15B | Production-candidate software, still dependent on clinical/legal/regulatory readiness |

---

## Active constraints

- Assessment quality, result comprehension and evidence integrity remain release-blocking.
- Capturing a fact does not authorize arbitrary interpretation.
- Report extraction does not equal evidence eligibility.
- Missing unit/date/source must not be guessed.
- New M13.4 rules remain `prototype` until qualified review changes maturity.
- One measurement does not equal diagnosis.
- No autonomous prescription-medication changes or therapeutic regimens.
- Evidence completeness is not overall health.
- AI cannot repair weak deterministic intake/result/clinical design.
- M11 remains conditional.
- M12 Rule Studio remains deferred.
- Generic overall health score remains dropped.
- Wearables/provider integrations/clinician portal remain deferred until core user value is proven.

For a new session, fetch current `main`, read `HANDOVER_NEXT_SESSION.md`, then README, `docs/missions/STATUS.md`, this roadmap and the latest mission document before implementation.
