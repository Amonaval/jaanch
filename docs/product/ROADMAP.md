# Jaanch Roadmap

## Current state

Jaanch is engineering-implemented through **M13.5 — Profile + Secure Persistence Architecture v1**.

Current milestone:

> **Persistence-architecture alpha candidate — local-only runtime; owner trust/result/report/clinical/profile/privacy gates still open.**

The deterministic core, block intake, evidence graph, safety/applicability gates, normalized HbA1c/B12 reassessment, reviewed report-evidence ingestion, consumer Health Map, local longitudinal history, narrow BP/lipid/iron/thyroid interpretation, local profile portability and a versioned secure-persistence architecture are implemented.

Open quality gates remain hands-on product gates, not paperwork:
1. assessment trust;
2. result comprehension;
3. evidence-ingestion trust;
4. narrow clinical interpretation trust;
5. profile import/export/mock reliability;
6. persistence/privacy comprehension.

Any trust/comprehension/evidence/privacy defect discovered in owner testing takes priority over roadmap expansion.

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

Candidate-only extraction, explicit review, provenance, no guessed unit/date, dedupe/latest semantics and batch reassessment are implemented. M13.4 consumes only the specific broader confirmed measurements it explicitly authorizes.

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

Mission detail: `docs/missions/M13.4_NARROW_CLINICAL_INTERPRETATION_EXPANSION.md`.

---

## M13.5 — Profile + Secure Persistence Architecture v1
Status: **ENGINEERING IMPLEMENTED — OWNER PERSISTENCE/PRIVACY REVIEW REQUIRED**  
Effort: **High**

Implemented:
- `JAANCH-PERSISTENCE-1.0` envelope;
- local-device vs authenticated ownership contract;
- consent + policy-version semantics;
- retention cap and delete/export contracts;
- truthful security metadata;
- legacy history migration compatibility;
- remote-persistence eligibility gate;
- vendor-independent backend port;
- revisioned same-owner cross-device merge semantics;
- immutable snapshot conflict rejection;
- cloud-sync consent revocation fail-closed behavior;
- `JAANCH-DELETION-1.0` tombstones;
- `JAANCH-DATA-EXPORT-1.0` owned-data export;
- persistence verification integrated into the root verification suite.

Important runtime truth:
- current web/mobile persistence is still local only;
- web uses browser `localStorage`;
- mobile uses AsyncStorage;
- current application storage is explicitly classified `application_storage_unencrypted`;
- no live account/auth provider or remote database is connected;
- profile JSON import/export does not imply cloud consent.

A future remote adapter must satisfy authenticated ownership, explicit cloud-sync consent, TLS and server-side encryption before the core marks a document `sync_eligible`.

Mission detail: `docs/missions/M13.5_PROFILE_SECURE_PERSISTENCE_ARCHITECTURE.md`.

---

## M10 live AI Utility Gate — PAUSED / NEXT CONDITIONAL WORK

M10 engineering is implemented. Resume live-model evaluation only when the intake/result/evidence/clinical/persistence behavior is representative enough to judge AI fairly.

Pass only if AI adds incremental contradiction detection, missing-consideration detection, useful explanation or safe disagreement articulation while respecting deterministic urgent/safety/applicability/evidence decisions and privacy minimization.

M11 remains conditional on that gate.

---

## Strategic Review 3

Run after owner validation plus meaningful M13.4/M13.5 hands-on evidence, or earlier if testing exposes a strategic flaw.

Review:
- capture completeness;
- report-ingestion trust;
- clinical interpretation usefulness vs overreach;
- result comprehension;
- longitudinal value;
- profile/persistence/privacy direction;
- storage/auth vendor choice vs core independence;
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
- delete/export behavior;
- concrete authenticated backend/storage adapter if cloud persistence is enabled;
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
| M13.5 | Persistence-architecture alpha candidate; local-only runtime, privacy review required |
| Owner gates passed | Usable consumer alpha with reviewed evidence + narrow interpretation |
| M13.5 contract + concrete pilot backend + M15A | Controlled private-pilot candidate |
| M15B | Production-candidate software, still dependent on clinical/legal/regulatory readiness |

---

## Active constraints

- Assessment quality, result comprehension, evidence integrity and privacy/security claims remain release-blocking.
- Capturing a fact does not authorize arbitrary interpretation.
- Report extraction does not equal evidence eligibility.
- Missing unit/date/source must not be guessed.
- New M13.4 rules remain `prototype` until qualified review changes maturity.
- One measurement does not equal diagnosis.
- No autonomous prescription-medication changes or therapeutic regimens.
- Evidence completeness is not overall health.
- Current local persistence must not be described as encrypted medical-record storage.
- Remote persistence cannot be enabled without authenticated ownership, consent, TLS and encryption-at-rest.
- Clinical semantics remain independent of storage vendor.
- AI cannot repair weak deterministic intake/result/clinical design.
- M11 remains conditional.
- M12 Rule Studio remains deferred.
- Generic overall health score remains dropped.
- Wearables/provider integrations/clinician portal remain deferred until core user value is proven.

For a new session, fetch current `main`, read `HANDOVER_NEXT_SESSION.md`, then README, `docs/missions/STATUS.md`, this roadmap and the latest mission document before implementation.
