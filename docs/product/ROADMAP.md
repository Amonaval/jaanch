# Jaanch Roadmap

## Current state

Jaanch is engineering-implemented through **M13.3 — Clinical Evidence Capture v2 / Report UX**.

The deterministic core, evidence graph, safety/applicability gates, normalized HbA1c/B12 reassessment, investigation prioritization, recommendation engine, optional AI runtime scaffolding, local longitudinal history, block-based intake, consumer Health Map and reviewed report-evidence ingestion are implemented.

Current milestone:

> **Evidence-ingestion alpha candidate — awaiting owner trust/result/report retest.**

Three hands-on quality gates remain open:

1. **Assessment trust:** Jaanch captured the material health facts the user expected it to know.
2. **Result comprehension:** without technical details, the user can tell what matters, what to do, what is unknown, and what changed.
3. **Evidence-ingestion trust:** report import is easier than manual entry without silently accepting extracted values or over-interpreting unsupported markers.

Canonical assessment-quality contract: `docs/product/ASSESSMENT_QUALITY_STANDARD.md`.

Any trust/comprehension/evidence-integrity defect discovered in owner testing takes priority over roadmap expansion.

---

## M13.1 — Assessment Quality Recovery + Block UX v2

Status: **ENGINEERING IMPLEMENTED — OWNER TRUST-GATE RETEST REQUIRED**  
Effort: High

Implemented: richer block intake; adaptive/safety follow-ups; stable navigation; metric/imperial capture; broader diagnoses/concerns/family history; named medicines/supplements; walking/exercise detail; broader known-result capture; strict separation between interpreted HbA1c/B12 evidence and recorded/unassessed context; web/mobile intake redesign; regression hardening.

Exit gate:
> **Jaanch captured the material health facts I expected it to know.**

---

## M13.2 — Result Quality + Health Map Consumer UX v3

Status: **ENGINEERING IMPLEMENTED — OWNER RESULT-UX RETEST REQUIRED**  
Effort: High

Implemented: shared consumer result semantics; bounded hero states; one best next step; evidence completeness separated from health; action-first hierarchy; supported evidence separated from uncertainty; recorded-but-uninterpreted facts preserved; meaningful comparison with previous distinct check-in; technical details demoted behind consumer meaning.

Exit gate:
> **Without opening technical details, I can tell what matters, what to do, what is unknown, and what changed.**

---

## M13.3 — Clinical Evidence Capture v2 / Report UX

Status: **ENGINEERING IMPLEMENTED — OWNER EVIDENCE-INGESTION RETEST REQUIRED**  
Effort: High

Goal: make high-quality report/result capture substantially easier without weakening evidence eligibility.

Implemented:
- provider-neutral report candidate and provenance contracts;
- report PDF/image/text attachment UX on web/mobile;
- deterministic pasted-text/OCR candidate extraction;
- marker normalization;
- value/unit/date/source/reference-range provenance;
- extraction confidence and parsing/clarification visibility;
- explicit user review/confirmation before promotion;
- supported HbA1c/B12 values still use existing unit/date/verification/freshness/plausibility gates;
- unsupported markers remain recorded/unassessed;
- exact duplicate replacement plus latest-result semantics;
- batch application into one reassessed immutable snapshot based on the latest saved check-in;
- report-level provenance retained through normalization;
- mobile-friendly document picker and matching web flow;
- deterministic verification fixtures around extraction/confirmation/batch reassessment boundaries.

Intentional alpha limitation:
- Jaanch does not yet claim trusted OCR/PDF parsing directly from raw bytes;
- file attachment preserves source provenance, while the user pastes report text/OCR output;
- a future provider can implement the extraction interface but cannot bypass review or eligibility gates.

Non-goals preserved:
- no automatic diagnosis from report text;
- no silent evidence eligibility;
- no broad clinical interpretation merely because a marker was captured;
- no autonomous treatment recommendation from report content.

Milestone: **evidence-ingestion alpha candidate**.

Mission detail: `docs/missions/M13.3_CLINICAL_EVIDENCE_CAPTURE_V2_REPORT_UX.md`.

---

## M13.4 — Narrow Clinical Interpretation Expansion — NEXT AFTER OWNER GATES

Effort: **High**

Only proceed after M13.1/M13.2/M13.3 hands-on gates are credible and any discovered trust defects are fixed.

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

Remains behind intake/result/evidence stabilization.

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

M10 engineering is implemented. The live-model evaluation resumes only after intake/result/evidence quality is representative enough to judge AI fairly.

Pass only if AI adds meaningful incremental contradiction detection, missing-consideration detection, useful explanation or safe disagreement articulation while respecting deterministic urgent/safety/applicability/evidence rules and privacy minimization.

Paraphrasing the deterministic engine is not enough.

## M11 — AI Review Comparison & Safe Escalation — CONDITIONAL
Only if the M10 live Utility Gate passes.

---

## Strategic Review 3

Run after owner validation and meaningful evidence-capture/clinical-expansion progress, or earlier if testing reveals a strategic product flaw.

Review:
- real-world capture completeness;
- report-ingestion usability and provenance trust;
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
Required before meaningful external pilot use: qualified clinical review, source governance, privacy/consent/retention semantics, threat model, encryption decisions, delete/export, accessibility, telemetry/error policy, reproducible verification/build gate, intended-market claims and jurisdiction-specific regulatory review.

Milestone: **controlled private-pilot candidate**, only if the gates are actually satisfied.

### M14 — MCP / ChatGPT App — later
Only after standalone Jaanch demonstrates value and the assessment schema stabilizes. ChatGPT is a conversational surface; Jaanch core controls clinical sequencing, evidence and safety.

### M15B — Store / Production Hardening
Production builds, Play internal/TestFlight, crash monitoring, migrations, backup/recovery, production persistence, store policies/assets and operational runbook.

---

## Product maturity checkpoints

| Checkpoint | Product state |
|---|---|
| M13 old build | Engineering prototype; intake known insufficient |
| M13.1 engineering | Credible-assessment alpha candidate; owner trust retest required |
| M13.2 engineering | Consumer-result alpha candidate; owner result retest required |
| M13.3 engineering | Evidence-ingestion alpha candidate; owner report retest required |
| M13.1 + M13.2 + M13.3 owner gates passed | Usable consumer alpha with reviewed evidence ingestion |
| M13.4 | Deliberately broader interpretation |
| M13.5 + M15A | Controlled private-pilot candidate |
| M15B | Production-candidate software, still dependent on clinical/legal/regulatory readiness |

---

## Active constraints

- Assessment quality is release-blocking.
- Result comprehension is release-blocking.
- Evidence-ingestion trust is release-blocking.
- Capturing a fact does not authorize deterministic interpretation.
- Report extraction does not equal evidence eligibility.
- Preserve unsupported/manual facts as recorded/unassessed context.
- Evidence completeness is not overall health.
- AI cannot repair incomplete intake, unsafe evidence capture or confusing deterministic results.
- Deterministic urgent/safety/applicability rules remain authoritative.
- M11 remains conditional.
- M12 Rule Studio remains deferred.
- Generic overall health score remains dropped.
- Wearables/provider integrations/clinician portal remain deferred until core user value is proven.

For a new work session, fetch current `main`, read `HANDOVER_NEXT_SESSION.md`, then treat current `STATUS.md`, this roadmap and mission docs as authoritative if older handover wording lags the latest mission closure.
