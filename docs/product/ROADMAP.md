# Jaanch Roadmap

## Foundation through M13
The deterministic core, safety/applicability gates, evidence graph, normalized HbA1c/B12 reassessment, recommendations, optional AI runtime scaffolding and local longitudinal history are implemented.

The first owner hands-on test after M13 changed product priority: intake quality and navigation integrity are now release-blocking.

Canonical quality contract: `docs/product/ASSESSMENT_QUALITY_STANDARD.md`.

---

## M13.1 — Assessment Quality Recovery + Block UX v2
Status: **ENGINEERING IMPLEMENTED — OWNER RETEST REQUIRED**
Effort: High

Implemented engineering scope:
- five richer primary assessment blocks instead of one question per screen;
- adaptive history/safety/sleep follow-up blocks;
- stable visited block navigation independent of dynamic eligibility;
- Back/Forward preservation when the plan is unchanged;
- stale Forward history discarded when an earlier edit changes the plan;
- direct section navigation for review/edit;
- human-friendly height/waist/weight units with canonical values;
- broader diagnosis/concern/family-history capture + manual Other paths;
- named medicines + reason/category and named supplements;
- walking, steps, pace, exercise type, duration/frequency/intensity;
- broad known-evidence capture including Vitamin D, glucose, lipids, CBC headline evidence, ferritin, TSH, BP and manual Other;
- strict separation between interpreted HbA1c/B12 lab evidence and broader `recorded_unassessed` context;
- richer HAP/internal context and longitudinal snapshot persistence;
- redesigned mobile/web assessment hierarchy;
- navigation/intake golden scenarios.

### M13.1 exit gate
Owner must retest realistic profiles and confirm:
> Jaanch captured the material health facts I expected it to know.

Until that passes, M13.1 is not product-validated.

### Milestone after successful retest
**Credible assessment alpha.**

---

## M13.2 — Result Quality + Health Map Consumer UX v3 — NEXT AFTER RETEST
Effort: High

Scope:
- simplify results around `What matters`, `What is missing`, `What to do next`, `What changed`;
- clearly surface `Recorded but not yet assessed` facts;
- improve finding priority/comprehension;
- distinguish deterministic conclusions from recorded context;
- make recommendations/investigations easier to act on;
- keep evidence/rule/source detail expandable;
- improve longitudinal comparison readability;
- add stronger review/edit-from-results flows;
- test comprehension of risk vs diagnosis vs missing evidence.

Milestone: **usable consumer alpha**.

---

## M13.3 — Clinical Evidence Capture v2 / Report UX
Effort: High

Scope:
- normalize the broader marker catalogue;
- faster manual entry;
- report image/PDF capture;
- extraction produces candidates only;
- explicit user confirmation before evidence eligibility;
- date/unit/source/reference-range provenance;
- visible extraction confidence/errors;
- unsupported markers remain recorded/unassessed.

---

## M13.4 — Narrow Clinical Interpretation Expansion
Effort: High

Only after M13.1 + M13.2 pass hands-on gates.

Add a few high-value interpretation modules at a time, potentially:
- blood pressure / cardiovascular screening;
- lipid context;
- iron/anemia context;
- thyroid screening context where justified;
- Vitamin D only if evidence/product value and safety boundaries justify it.

Every interpreted domain requires authoritative sources, applicability, evidence model, investigation mapping, recommendation boundary, safety interactions and golden scenarios.

No broad “100 diseases” expansion.

---

## M13.5 — Profile + Secure Persistence Architecture v1
Effort: High

Moved behind intake/result stabilization.

Scope:
- profile/user identity;
- consent/retention/delete/export semantics;
- secure backend boundary;
- backup/sync/cross-device continuity;
- data migration/version contracts;
- clinical core remains storage-vendor independent.

Supabase or another backend may be evaluated here.

---

## M10 live AI Utility Gate — PAUSED
M10 engineering exists, but real-model evaluation resumes only after M13.1/M13.2 make the packet representative enough to judge AI fairly.

Pass only if AI adds useful contradiction/missing-consideration/explanation value while respecting deterministic urgent/safety/applicability/evidence rules and privacy minimization.

## M11 — AI Review Comparison & Safe Escalation — CONDITIONAL
Only if M10 passes.

---

## Strategic Review 3
Run after M13.1 + M13.2 and meaningful owner retest.

Review:
- real-world capture completeness;
- result comprehension/trust;
- evidence-gathering usefulness;
- longitudinal value;
- justified clinical expansion;
- measurable AI value;
- persistence/privacy direction;
- pilot readiness.

---

## Pilot and distribution
### M15A — Pilot Safety / Privacy / Release Gate
Required before external pilot users: qualified clinical review, source governance, privacy/consent/retention, threat model, encryption decisions, delete/export, accessibility, telemetry policy, reproducible verification/build gate and jurisdiction-specific claims/regulatory review.

Milestone: controlled private-pilot candidate if gates are actually satisfied.

### M14 — MCP / ChatGPT App — later
Only after standalone Jaanch demonstrates value and the assessment schema stabilizes. ChatGPT remains a conversational surface; Jaanch core controls sequencing and safety.

### M15B — Store / Production Hardening
Production Android/iOS builds, Play/TestFlight, crash monitoring, app/data migrations, backup/recovery, production persistence, store policies/assets and operational runbook.

---

## Product maturity checkpoints
| Checkpoint | Product state |
|---|---|
| M13 old build | Engineering prototype; intake known insufficient |
| M13.1 engineering | Credible-assessment alpha candidate; owner retest required |
| M13.1 trust gate passed | Credible assessment alpha |
| M13.2 | Usable consumer alpha |
| M13.3/M13.4 | Better evidence ingestion + deliberately broader interpretation |
| M13.5 + M15A | Controlled private-pilot candidate |
| M15B | Production-candidate software, still dependent on clinical/legal/regulatory readiness |

## Active constraints
- Assessment quality is release-blocking.
- Capturing a fact does not authorize deterministic interpretation.
- Preserve unsupported/manual facts as recorded/unassessed context.
- AI cannot repair incomplete intake.
- M11 remains conditional.
- M12 Rule Studio remains deferred.
- Generic overall health score remains dropped.
- Wearables/provider integrations/clinician portal remain deferred until core user value is proven.
