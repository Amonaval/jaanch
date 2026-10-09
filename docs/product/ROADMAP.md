# Jaanch Roadmap

## Phase 1 — Deterministic foundation — COMPLETE
- adaptive questioning;
- versioned rules;
- evidence graph;
- findings + missing evidence;
- investigation priority;
- core verification.

## Phase 2 — Safety, reassessment and actions — COMPLETE
- M06 Safety Gate + Clinical Source Baseline;
- M07 shared Health Map presentation;
- M08 normalized/fresh lab reassessment;
- M09 bounded safety-gated recommendations;
- SR2 applicability/evidence-integrity review;
- M09.1 applicability gating + canonical lab ingestion.

## Phase 3 — Optional harnessed AI — ENGINEERING READY, VALUE NOT YET PROVEN
### M10 — AI Harness Runtime + Privacy/Evaluation — ENGINEERING COMPLETE
- privacy-minimized external packet;
- explicit opt-in;
- eligible-evidence-only sharing;
- strict structured output + local invariant validation;
- server-only OpenAI adapter;
- model/harness/schema trace;
- deterministic fallback;
- offline utility-gate fixtures.

### AI Utility Gate — PENDING
A real configured model must demonstrate incremental review value before M11 proceeds.

Pass criteria include useful contradiction/missing-consideration detection without relaxing deterministic urgent/safety/applicability/evidence rules.

If the model mainly paraphrases, is too variable, or violates invariants, defer M11.

### M11 — AI Review Comparison & Safe Escalation — CONDITIONAL
Only if the AI Utility Gate passes.

---

# Phase 4 — Longitudinal product loop

## M13 — Longitudinal Health + Local Persistence — COMPLETE
Jaanch now supports:
- explicit saved check-ins;
- immutable snapshots;
- local web/mobile persistence;
- retest/new-check-in flow;
- latest-vs-previous finding comparison;
- investigation changes;
- action-plan changes;
- lab trends;
- shared longitudinal presentation semantics.

### Product checkpoint: **TEST THE PRODUCT NOW**
Do not wait for more missions before using Jaanch yourself.

Current end-to-end loop:

`Assess → Health Map → Missing evidence → Add labs → Reassess → Safe actions → Save → Retest → Compare`

Your hands-on feedback now has higher value than adding more architecture or medical domains.

---

## M13.1 — First-Run UX & Product Usability Hardening — NEXT — HIGH
Start only after the first real web/phone test so fixes are grounded in actual friction.

Scope:
- onboarding / prototype disclaimer that is useful rather than noisy;
- clearer assessment progress and navigation;
- better mobile visual hierarchy;
- Health Map simplification;
- make “what should I do next?” unmistakable;
- improve empty/loading/error states;
- history/check-in UX;
- reset/delete controls;
- reduce developer-looking content on primary surfaces;
- keep provenance/audit detail expandable rather than removed.

### Milestone after M13.1
**Usable alpha.**

It should feel like one coherent consumer product rather than a collection of engine outputs.

---

## M13.2 — Profile + Secure Persistence Architecture v1 — HIGH
Do after UX validation.

Scope:
- profile/user identity model;
- explicit consent/retention/delete/export semantics;
- secure persistence architecture;
- backend boundary;
- backup/sync/cross-device continuity;
- migration/version contract;
- keep clinical core independent of storage vendor.

Supabase or another backend may be evaluated here, but backend complexity should not precede validation of the local product loop.

### Milestone after M13.2
Multi-session/account architecture ready for controlled external testing, subject to pilot safety/privacy review.

---

## M13.3 — Lab / Report Capture UX — MEDIUM/HIGH
Scope:
- faster manual lab entry;
- report-image/PDF capture flow;
- parsed values require explicit user confirmation before becoming eligible evidence;
- unit/date/source provenance retained;
- extraction confidence/errors surfaced;
- no OCR/AI extraction silently becomes clinical truth.

---

## M13.4 — Narrow Clinical Expansion — HIGH
Only after the current loop is useful in hands-on testing.

Add a few high-value domains at a time, potentially:
- blood pressure / cardiovascular screening;
- lipids;
- iron/anemia context;
- thyroid screening context where justified;
- vitamin D only if evidence/product value justifies it.

Every new domain must include:
- authoritative source mapping;
- applicability contract;
- evidence model;
- investigation mapping;
- recommendation boundary;
- safety interaction;
- golden scenarios.

No “100 diseases” expansion.

---

# Strategic Review 3 — HIGH
Run after M13.1/M13.2 direction is clear and after initial real usage feedback.

Review:
- actual user value after one assessment and repeated check-ins;
- comprehension/misinterpretation;
- retention/retest value;
- whether action plans feel useful;
- what medical breadth is justified;
- whether AI adds measurable value;
- privacy/data minimization;
- pilot readiness;
- ChatGPT/MCP fit.

---

# Phase 5 — Pilot and distribution

## M15A — Pilot Safety / Privacy / Release Gate — HIGH
Required before real external pilot users.

Scope:
- qualified clinical review/approval of the deliberately narrow supported rule set;
- source freshness/review process;
- privacy/consent/data-retention model;
- threat model;
- local/cloud encryption decisions;
- delete/export controls;
- accessibility;
- telemetry/error policy;
- reproducible verification/build gate;
- jurisdiction-specific legal/regulatory/claims assessment;
- pilot release checklist.

### Milestone after M15A
**Controlled private-pilot candidate**, assuming the required clinical/privacy/legal gates are actually satisfied.

---

## M14 — MCP / ChatGPT App — HIGH, LATER
Do after standalone Jaanch demonstrates value.

ChatGPT should be a conversational surface over Jaanch tools such as:
- start assessment;
- submit answers;
- get next questions;
- get Health Map;
- submit labs;
- get action plan;
- compare check-ins.

Jaanch core continues to control medical sequencing and safety.

---

## M15B — Store / Production Hardening — HIGH
Scope:
- production Android/iOS builds;
- Play internal testing / TestFlight;
- crash/error monitoring;
- app version/data migrations;
- backup/recovery;
- production persistence hardening;
- store policies/assets;
- operational runbook;
- production release checklist.

### Milestone after M15B
**Production candidate**, still dependent on real clinical/regulatory review and pilot evidence rather than code completion alone.

---

# Product maturity checkpoints

| Checkpoint | What Jaanch should be |
|---|---|
| **M13 — now** | Working end-to-end prototype; owner should test immediately |
| **M13.1** | Usable alpha with coherent consumer UX |
| **M13.2 + M15A** | Controlled private-pilot candidate with persistence/privacy/safety foundations |
| **M13.4 + pilot learning** | Clinically broader but still deliberately bounded product |
| **M15B** | Production-candidate software, subject to external clinical/legal/regulatory readiness |

---

## Deferred / conditional
- M11 remains conditional on the M10 real-model AI Utility Gate.
- M12 Rule Studio remains deferred until authoring volume is a demonstrated bottleneck.
- Generic overall health score remains dropped.
- Wearables, broad lab-provider integrations and clinician portal remain deferred until core user value is proven.

## Execution cadence
- 1–2 commits per mission.
- Medium effort by default.
- High for safety, applicability, AI, persistence, clinical expansion and release gates.
- Strategic reviews can change/drop/defer planned work.
