# Jaanch Roadmap

## Current state

Jaanch is implemented through **M13.2 — Result Quality + Health Map Consumer UX v3**.

The deterministic core, evidence graph, safety/applicability gates, normalized HbA1c/B12 reassessment, investigation prioritization, recommendation engine, optional AI runtime scaffolding, local longitudinal history, block-based intake and consumer Health Map are implemented.

The current milestone is:

> **Consumer-result alpha candidate — awaiting owner retest.**

Two quality gates remain open before adding more product complexity:

1. **Assessment trust:** Jaanch captured the material health facts the user expected it to know.
2. **Result comprehension:** without technical details, the user can tell what matters, what to do, what is unknown, and what changed.

Canonical assessment-quality contract: `docs/product/ASSESSMENT_QUALITY_STANDARD.md`.

---

## M13.1 — Assessment Quality Recovery + Block UX v2

Status: **ENGINEERING IMPLEMENTED — OWNER TRUST-GATE RETEST REQUIRED**  
Effort: High

Implemented:

- five richer primary blocks instead of one-question-per-screen navigation;
- adaptive history/safety/sleep/follow-up blocks;
- stable visited-block navigation independent of dynamic eligibility;
- Back/Forward preservation when the plan is unchanged;
- explicit invalidation when earlier edits change the adaptive plan;
- direct section navigation for review/edit;
- metric/imperial measurement entry with canonical storage;
- broader diagnosis/concern/family-history capture + manual Other paths;
- named medicines with reason/category and named supplements;
- walking, steps, pace, exercise type, duration/frequency/intensity;
- broader known-evidence capture including Vitamin D, glucose, lipids, hemoglobin, ferritin, TSH, BP and manual Other;
- strict separation between interpreted HbA1c/B12 evidence and broader recorded/unassessed context;
- richer HAP/internal context and longitudinal snapshot persistence;
- redesigned mobile/web assessment surfaces;
- intake/navigation golden scenarios and post-implementation editing hardening.

Exit gate:

> **Jaanch captured the material health facts I expected it to know.**

---

## M13.2 — Result Quality + Health Map Consumer UX v3

Status: **ENGINEERING IMPLEMENTED — OWNER RESULT-UX RETEST REQUIRED**  
Effort: High

Implemented:

- shared `buildConsumerResultViewModel` used by web/mobile;
- bounded hero states: urgent / attention / needs evidence / quiet;
- one best-next-step summary;
- evidence completeness explicitly separated from overall health;
- consumer hierarchy: What matters now → What you can do → What evidence supports → What remains uncertain → What changed;
- recommendation steps surfaced, not rationale-only cards;
- supported evidence separated from uncertainty/test gaps;
- recorded-but-uninterpreted facts remain visible without unsupported conclusions;
- current result compared against the previous **distinct** saved check-in;
- meaningful finding/lab/evidence-completeness change summaries;
- technical governance/HAP demoted behind details on web;
- presentation regressions for hero semantics, urgent suppression, certainty/uncertainty separation and longitudinal comparison.

Exit gate:

> **Without opening technical details, I can tell what matters, what to do, what is unknown, and what changed.**

### Combined owner retest

Before M13.3 if possible, test:

- realistic complete profile;
- vegetarian + known B12 + recorded Vitamin D;
- cholesterol/BP medicines;
- regular walking without formal exercise;
- unlisted diagnosis and concern;
- known HbA1c/lipids;
- Back → Forward with adaptive content;
- earlier edits that change the adaptive plan;
- urgent chest-pain path;
- repeat check-in preserving manual facts;
- repeat check-in with meaningful change;
- repeat check-in with no meaningful change;
- web/mobile semantic parity.

Any trust/comprehension defect discovered here takes priority over the next mission.

---

## M13.3 — Clinical Evidence Capture v2 / Report UX — NEXT

Effort: **High**

Goal: make high-quality evidence capture substantially easier without weakening evidence eligibility.

Scope:

- faster structured manual lab/result entry;
- report image/PDF ingestion;
- extraction produces **candidate evidence only**;
- explicit user confirmation before evidence can become eligible;
- marker normalization;
- value/unit/date/source/reference-range provenance;
- extraction confidence and parsing-error visibility;
- duplicate/latest-result handling;
- report-level provenance retained through normalized evidence;
- unsupported markers remain recorded/unassessed;
- mobile-friendly capture UX;
- deterministic verification fixtures for extraction/confirmation boundaries.

Non-goals:

- no automatic diagnosis from report text;
- no silent evidence eligibility;
- no broad new clinical interpretation merely because a value can be extracted;
- no autonomous treatment recommendation from report content.

Milestone: **usable evidence-ingestion alpha**.

---

## M13.4 — Narrow Clinical Interpretation Expansion

Effort: **High**

Only after M13.1/M13.2 hands-on gates are credible.

Add a few high-value modules at a time, potentially:

- blood pressure / cardiovascular screening;
- lipid context;
- iron/anemia context;
- thyroid context where justified;
- Vitamin D only if evidence/product value and safety boundaries justify it.

Every interpreted domain requires:

- authoritative clinical sources;
- explicit applicability;
- evidence model;
- contradiction/missing-evidence behavior;
- investigation mapping;
- recommendation boundary;
- safety interactions;
- golden scenarios;
- prototype/reviewed/approved maturity state.

No broad “100 diseases” expansion.

---

## M13.5 — Profile + Secure Persistence Architecture v1

Effort: **High**

Moved behind intake/result stabilization.

Scope:

- profile/user identity;
- consent/retention/delete/export semantics;
- secure backend boundary;
- backup/sync/cross-device continuity;
- encryption/storage decisions;
- data migration/version contracts;
- clinical core remains storage-vendor independent.

Supabase or another backend may be evaluated here; storage choice must not dictate clinical semantics.

---

## M10 live AI Utility Gate — PAUSED

M10 engineering is implemented. The live-model evaluation resumes only after intake/result quality is representative enough to judge AI fairly.

Pass only if AI adds meaningful incremental value such as:

- contradiction detection;
- missing-consideration detection;
- useful explanation;
- safe disagreement articulation;

while respecting deterministic urgent/safety/applicability/evidence rules and privacy minimization.

Paraphrasing the deterministic engine is **not** enough.

## M11 — AI Review Comparison & Safe Escalation — CONDITIONAL

Only if the M10 live Utility Gate passes.

---

## Strategic Review 3

Run after M13.1 + M13.2 owner validation and meaningful evidence-capture/clinical-expansion progress, or earlier if testing reveals a strategic product flaw.

Review:

- real-world capture completeness;
- result comprehension/trust;
- evidence-gathering usefulness;
- longitudinal value;
- over-testing/under-testing risk;
- justified clinical expansion;
- measurable AI value;
- persistence/privacy direction;
- pilot readiness.

---

## Pilot and distribution

### M15A — Pilot Safety / Privacy / Release Gate

Required before meaningful external pilot use:

- qualified clinical review of supported rule set;
- source governance;
- privacy/consent/retention semantics;
- threat model;
- encryption decisions;
- delete/export;
- accessibility;
- telemetry/error policy;
- reproducible verification/build gate;
- intended-market claims and jurisdiction-specific regulatory review.

Milestone: **controlled private-pilot candidate**, only if the gates are actually satisfied.

### M14 — MCP / ChatGPT App — later

Only after standalone Jaanch demonstrates value and the assessment schema stabilizes. ChatGPT is a conversational surface; Jaanch core controls clinical sequencing, evidence and safety.

### M15B — Store / Production Hardening

- production Android/iOS builds;
- Play internal track/TestFlight;
- crash monitoring;
- migrations;
- backup/recovery;
- production persistence;
- store policies/assets;
- operational runbook.

---

## Product maturity checkpoints

| Checkpoint | Product state |
|---|---|
| M13 old build | Engineering prototype; intake known insufficient |
| M13.1 engineering | Credible-assessment alpha candidate; owner trust retest required |
| M13.2 engineering | Consumer-result alpha candidate; owner result retest required |
| M13.1 + M13.2 owner gates passed | Usable consumer alpha |
| M13.3 | Better evidence ingestion |
| M13.4 | Deliberately broader interpretation |
| M13.5 + M15A | Controlled private-pilot candidate |
| M15B | Production-candidate software, still dependent on clinical/legal/regulatory readiness |

---

## Active constraints

- Assessment quality is release-blocking.
- Result comprehension is release-blocking.
- Capturing a fact does not authorize deterministic interpretation.
- Preserve unsupported/manual facts as recorded/unassessed context.
- Evidence completeness is not overall health.
- AI cannot repair incomplete intake or confusing deterministic results.
- Deterministic urgent/safety/applicability rules remain authoritative.
- M11 remains conditional.
- M12 Rule Studio remains deferred.
- Generic overall health score remains dropped.
- Wearables/provider integrations/clinician portal remain deferred until core user value is proven.

For a new work session, read `HANDOVER_NEXT_SESSION.md` before implementation.
