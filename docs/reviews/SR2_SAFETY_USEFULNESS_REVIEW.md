# Strategic Review 2 — Safety, Applicability & Product Usefulness

Date: 2026-10-09
Scope: M06–M09, with end-to-end review of M01–M09
Decision: **CONTINUE WITH CHANGES**

## Executive verdict
Jaanch has crossed an important threshold: it is no longer only an adaptive questionnaire. It now has an auditable deterministic loop:

`questions → evidence → findings → missing evidence → investigations → lab reassessment → safety-gated actions`

The product thesis remains strong. The evidence graph, minimum-useful investigation plan, explicit safety gate, lab reassessment and constrained recommendation model are coherent and worth continuing.

However, SR2 found a material pre-AI integrity gap: **clinical applicability is not yet enforced early enough in the pipeline**. Safety currently constrains recommendations, but adult-oriented rules and investigation mappings can still execute for children or pregnancy contexts. In addition, direct questionnaire lab values can bypass M08 normalization/freshness/provenance, and mutually exclusive multi-select answers can coexist.

The next mission therefore should not be AI. Insert **M09.1 — Applicability & Evidence Integrity Hardening** before M10.

---

## What is working

### 1. Deterministic evidence architecture — CONTINUE
The M01–M05 foundation is holding up. Facts, derived facts, missing evidence, findings, investigations and provenance remain separated and inspectable.

**Decision:** CONTINUE.

### 2. Safety gate — CONTINUE, MOVE EARLIER
M06 correctly blocks medication changes, gates therapeutic supplementation, suppresses routine plans during urgent red flags, and becomes more conservative for pregnancy, kidney/liver disease, frailty, polypharmacy and allergy context.

The gap is placement: some applicability constraints need to affect rule and investigation execution, not only downstream recommendations.

**Decision:** CONTINUE the safety model, but add pre-rule applicability gates in M09.1.

### 3. Investigation priority — CONTINUE
M05 recommends tests only when they resolve explicit evidence gaps, groups alternatives and selects a smallest useful set. In the current narrow domain scope there is no evidence of shotgun-testing behavior.

**Decision:** CONTINUE. Preserve the rule that investigation priority means uncertainty reduction, not medical necessity.

### 4. Health Map / shared presentation — CONTINUE
M07 keeps semantic ordering and labels shared across mobile/web while allowing platform-native rendering.

**Decision:** CONTINUE.

### 5. Lab reassessment — CONTINUE WITH CANONICALIZATION
M08 created the right lab contract: marker, value, unit, date, source, verification, freshness and provenance, plus before/after reassessment.

The problem is that the older questionnaire path still accepts bare `hba1c` and `b12` values. Rules can therefore receive a number with no collection date, verification state or lab-record provenance.

**Decision:** CHANGE. M09.1 must make normalized lab records the canonical path for lab-informed findings.

### 6. Recommendation engine — CONTINUE
M09 is intentionally conservative. It produces a bounded action list, keeps therapeutic B12 replacement behind clinician review, never emits prescription medicine changes, propagates special-population safety decisions and suppresses routine planning during urgent red flags.

**Decision:** CONTINUE. Do not broaden recommendation classes yet.

---

## Material gaps found

### A. Rule applicability is not a first-class gate — BLOCKER BEFORE AI
Current rules can execute outside the population implied by their source. Examples:
- adult metabolic heuristics can run for children;
- ADA metabolic screening logic can still contribute findings in pregnancy even though pregnancy-specific diagnosis is explicitly outside the mapped source scope;
- adult sleep-duration assumptions can exist alongside pediatric contexts.

Downstream caution labels are not enough. A finding that should never have been generated should not merely be shown with a caution badge.

**Decision:** INSERT **M09.1 — Applicability & Evidence Integrity Hardening**.

Required capabilities:
- rule/investigation/recommendation applicability metadata;
- pre-execution population gating;
- explicit `not_assessed` / `not_applicable` behavior instead of manufacturing a reassuring `good` or `monitor` result;
- source-population compatibility checks;
- pediatric and pregnancy golden scenarios;
- unsupported-context explanations surfaced to Health Map.

### B. Lab evidence has two competing ingestion paths — CHANGE
M08 normalized lab records are safe and traceable, but questionnaire numeric fields `hba1c` and `b12` can still directly drive lab-informed findings.

That bypasses:
- collection date;
- verification;
- freshness;
- source;
- lab-record provenance;
- newest-record selection.

**Decision:** M09.1 should make normalized lab records the canonical route. Legacy numeric questions may remain only as UI capture that is immediately converted into a lab record with required metadata, or be removed from adaptive assessment entirely.

### C. Input contradictions are not normalized — CHANGE
Multi-select inputs can currently contain contradictory states such as:
- `diagnosedConditions = ['none', 'kidney']`;
- `currentConcerns = ['none', 'fatigue']`.

This is not an AI problem. It is deterministic input integrity.

**Decision:** M09.1 must add exclusive-option semantics and/or answer normalization/validation before planning/rules execute.

### D. “Not assessed” is distinct from “insufficient data” — CHANGE
A rule that is outside its intended population is not merely missing evidence. It is not applicable under the current rule set.

**Decision:** introduce an explicit applicability state in the shared model. Do not force unsupported populations into ordinary finding statuses.

### E. Clinical-source maturity is still prototype-only — CONTINUE WITH HONESTY
Source capture and source-ID validation are useful, but source capture is not clinical approval. Current rules, test mappings and recommendations remain prototype artifacts.

**Decision:** KEEP prototype labeling. Before public clinical claims or broad pilot use, select a narrow subset for actual clinical review rather than trying to “approve everything.”

### F. No current over-recommendation problem — CONTINUE, KEEP CAPS
The bounded top-five action plan and narrow domain scope are currently reasonable. The system is more likely to under-cover conditions than overwhelm the user.

**Decision:** keep the action cap and avoid adding broad generic wellness advice that is unrelated to findings.

### G. AI can add value, but only as an evaluated challenger — CHANGE M10
The original M10 concept is still useful, but a model call by itself adds little value if it only paraphrases the deterministic Health Map.

M10 must prove one of these incremental benefits:
- identify a real contradiction missed by the deterministic engine;
- identify an important missing consideration;
- improve explanation without changing medical meaning;
- challenge a false-positive/false-negative candidate;
- prioritize evidence gaps more clearly.

**Decision:** CHANGE M10 to **AI Harness Runtime + Evaluation Gate**.

Required M10 properties:
- versioned Jaanch harness;
- minimum-necessary HAP projection instead of sending every duplicated field blindly;
- explicit consent/data-sharing boundary;
- strict JSON/schema validation;
- provider/model metadata and harness version stored with output;
- AI result stored separately from deterministic result;
- red-flag and safety policy invariants checked after model output;
- golden adversarial/evaluation packets;
- measurable comparison against deterministic baseline.

### H. M11 should be conditional — CHANGE
An Engine-vs-AI reconciliation layer is valuable only if M10 demonstrates real incremental value.

**Decision:** M11 proceeds only if M10 passes the evaluation gate. Otherwise defer AI reconciliation and move to longitudinal value sooner.

### I. Privacy minimization becomes urgent at M10 — CHANGE
HAP currently can contain raw answers, normalized labs, deterministic assessment and recommendation plan, which may duplicate sensitive facts. That is acceptable internally but should not automatically define the external AI packet.

**Decision:** M10 must build a deliberate external packet projection containing only fields necessary for the requested AI review.

### J. Remote CI remains absent — WATCH
The repository has executable verification suites, but no remote CI status checks are attached to current commits.

**Decision:** do not add GitHub Actions automatically. Before external release/pilot, require a reproducible verification gate in the release process. Revisit CI in M15 unless explicitly requested earlier.

---

## M09.1 — required scope

**Mission:** Applicability & Evidence Integrity Hardening  
**Effort:** High

1. Add applicability contracts to rules/investigations/recommendations.
2. Gate unsupported populations before rule execution and test generation.
3. Add explicit not-assessed/not-applicable representation and Health Map wording.
4. Make normalized lab records the canonical source of lab-informed evidence.
5. Prevent stale/unverified/bare numeric lab data from becoming lab-informed evidence.
6. Normalize mutually exclusive answer options (`none` vs concrete selections).
7. Detect contradictory or impossible answer states deterministically.
8. Add pediatric, pregnancy, incompatible-source, contradictory-answer and lab-bypass golden scenarios.
9. Preserve auditability: explain why a domain was not assessed.
10. Do not add new health domains.

M09.1 is a correctness mission, not a breadth mission.

---

## Revised sequence

1. **M09.1 — Applicability & Evidence Integrity Hardening** — High
2. **M10 — AI Harness Runtime + Evaluation Gate** — High
3. **M11 — Engine vs AI Verdict** — High, **conditional on M10 proving incremental value**
4. **M13 — Longitudinal Health** — Medium/High
5. **Strategic Review 3**
6. M14/M15 distribution and release hardening

If M10 fails to provide meaningful incremental value, defer M11 and move directly to M13.

---

## Product-positioning conclusion

The strongest near-term product story is not “AI diagnoses your health.” It is:

> **Jaanch organizes what is known, what is uncertain, what evidence matters next, and what safe action follows — with every conclusion traceable.**

AI should strengthen that system, not become the system.

---

## Decisions summary

| Area | Decision |
|---|---|
| Deterministic core | CONTINUE |
| Evidence graph | CONTINUE |
| Safety gate | CONTINUE; move applicability earlier |
| Investigation engine | CONTINUE |
| Lab reassessment | CONTINUE; canonicalize input path |
| Recommendation engine | CONTINUE; keep narrow |
| Broad health-domain expansion | DEFER |
| Applicability model | CHANGE — M09.1 blocker before AI |
| Contradictory answer handling | CHANGE — M09.1 |
| Raw lab questionnaire pathway | CHANGE — remove/boundary-convert |
| Clinical maturity | KEEP prototype until real review |
| M10 AI runtime | CHANGE — evaluation-first + privacy-minimized |
| M11 reconciliation | CONDITIONAL on M10 value |
| Generic health score | REMAINS DROPPED |
| Rule Studio | REMAINS DEFERRED |

## Final SR2 decision
**CONTINUE WITH CHANGES.**

The architecture is strong enough to continue. The next mission should harden population applicability and evidence integrity before introducing probabilistic AI behavior.