# Jaanch Roadmap

## Current state

Jaanch is engineering-implemented through **M13.5 — Profile + Secure Persistence Architecture v1** and **M10.1 — Live AI Review + Web UX**.

Current milestone:

> **AI-review web alpha candidate — deterministic product + persistence architecture implemented; live real-model utility gate and owner trust/privacy gates remain open.**

The deterministic core, block intake, evidence graph, safety/applicability gates, normalized HbA1c/B12 reassessment, reviewed report-evidence ingestion, consumer Health Map, longitudinal history, narrow BP/lipid/iron/thyroid interpretation, profile portability, versioned persistence architecture and an optional live-AI web review path are implemented.

Open quality gates remain hands-on product gates:
1. assessment trust;
2. result comprehension;
3. evidence-ingestion trust;
4. narrow clinical interpretation trust;
5. profile import/export/mock reliability;
6. persistence/privacy comprehension;
7. real-model AI utility and safety.

Any trust/comprehension/evidence/privacy/AI-safety defect discovered in owner testing takes priority over roadmap expansion.

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

Candidate-only extraction, explicit review, provenance, no guessed unit/date, dedupe/latest semantics and batch reassessment are implemented. M13.4 consumes only the broader confirmed measurements it explicitly authorizes.

## M13.4 — Narrow Clinical Interpretation Expansion
Status: **ENGINEERING IMPLEMENTED — OWNER CLINICAL/PROFILE RETEST REQUIRED**  
Effort: **High**

Implemented:
- blood pressure / cardiovascular context;
- lipid cardiovascular-risk context;
- haemoglobin/ferritin anaemia/iron-status context;
- TSH thyroid context;
- source governance and applicability;
- missing-evidence/investigation mappings;
- safety-bounded recommendations;
- anti-forgery measurement materialization;
- report-flow integration;
- `JAANCH-PROFILE-1.0` import/export;
- five built-in synthetic mock profiles.

Mission detail: `docs/missions/M13.4_NARROW_CLINICAL_INTERPRETATION_EXPANSION.md`.

## M13.5 — Profile + Secure Persistence Architecture v1
Status: **ENGINEERING IMPLEMENTED — OWNER PERSISTENCE/PRIVACY REVIEW REQUIRED**  
Effort: **High**

Implemented:
- `JAANCH-PERSISTENCE-1.0` envelope;
- local-device vs authenticated ownership contract;
- consent + policy-version semantics;
- retention/delete/export contracts;
- truthful security metadata;
- legacy-history migration compatibility;
- remote-persistence eligibility gate;
- vendor-independent backend port;
- revisioned same-owner merge semantics;
- immutable snapshot conflict rejection;
- cloud-sync consent revocation fail-closed behavior;
- `JAANCH-DELETION-1.0` tombstones;
- `JAANCH-DATA-EXPORT-1.0` owned-data export.

Runtime remains local-only: browser `localStorage` / mobile AsyncStorage, explicitly `application_storage_unencrypted`, with no live auth/cloud database.

Mission detail: `docs/missions/M13.5_PROFILE_SECURE_PERSISTENCE_ARCHITECTURE.md`.

---

## M10.1 — Live AI Review + Web UX
Status: **ENGINEERING IMPLEMENTED — LIVE REAL-MODEL UTILITY GATE / OWNER REVIEW REQUIRED**  
Effort: **High**

Implemented:
- visible `AI Review` web surface;
- review requires a saved deterministic check-in;
- explicit one-run consent;
- privacy-minimized packet created in-browser only after consent;
- raw answer map omitted before network transmission;
- same-origin server endpoint with server-only OpenAI credentials;
- existing Responses API / strict structured-output provider reused;
- Jaanch schema and safety invariants remain the final acceptance gate;
- invalid output is not displayed;
- AI output never mutates deterministic state;
- five-mock live gate command: `npm run ai:gate`;
- web runtime verification integrated into `npm run verify`.

Current live status:
- no real-model call was run in the implementation session;
- owner must configure `.env.local`, run the web experience and execute the five-mock gate;
- M11 remains blocked until incremental value is demonstrated.

Mission detail: `docs/missions/M10.1_LIVE_AI_REVIEW_WEB_UX.md`.

---

## M11 — AI Review v2 / deeper contextual utility — CONDITIONAL

Effort: **High if unlocked**

Proceed only if M10.1 real-model evaluation demonstrates meaningful incremental value beyond deterministic output.

Candidate scope only if justified:
- better longitudinal explanation;
- contradiction detection across saved evidence;
- prioritized missing-context reasoning;
- clinician-preparation summary;
- higher-quality explanations while preserving deterministic boundaries.

Do not turn M11 into autonomous diagnosis, treatment or an agent that can override safety/evidence gates.

If M10.1 is mostly paraphrase/noise, defer M11.

---

## Strategic Review 3

Run after the M10.1 owner/live gate plus meaningful hands-on M13.1–M13.5 evidence, or earlier if testing exposes a strategic flaw.

Review:
- capture completeness;
- report-ingestion trust;
- clinical interpretation usefulness vs overreach;
- result comprehension;
- longitudinal repeat-use value;
- profile/persistence/privacy direction;
- measurable AI value vs complexity/cost/privacy;
- over-testing/under-testing risk;
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
- production server boundary for live AI if AI remains enabled;
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
| M10.1 | Live-AI web integration implemented; real-model utility gate required |
| Owner + AI gate passed | Usable consumer alpha with optional validated AI second pass |
| M13.5 contract + concrete pilot backend + M15A | Controlled private-pilot candidate |
| M15B | Production-candidate software, still dependent on clinical/legal/regulatory readiness |

---

## Active constraints

- Assessment quality, result comprehension, evidence integrity and privacy/security claims remain release-blocking.
- Capturing a fact does not authorize arbitrary interpretation.
- Report extraction does not equal evidence eligibility.
- Missing unit/date/source must not be guessed.
- M13.4 rules remain `prototype` until qualified review changes maturity.
- One measurement does not equal diagnosis.
- No autonomous prescription-medication changes or therapeutic regimens.
- Evidence completeness is not overall health.
- Current local persistence must not be described as encrypted medical-record storage.
- Remote persistence cannot be enabled without authenticated ownership, consent, TLS and encryption-at-rest.
- Clinical semantics remain independent of storage vendor.
- AI is optional, explicit-consent, minimized and advisory only.
- AI cannot mutate deterministic urgent/safety/applicability/evidence decisions.
- Provider credentials must never be shipped to browser/mobile clients.
- M11 remains conditional on measured M10.1 utility.
- M12 Rule Studio remains deferred.
- Generic overall health score remains dropped.
- Wearables/provider integrations/clinician portal remain deferred until core user value is proven.

For a new session, fetch current `main`, read `HANDOVER_NEXT_SESSION.md`, then README, `docs/missions/STATUS.md`, this roadmap and the latest mission document before implementation.
