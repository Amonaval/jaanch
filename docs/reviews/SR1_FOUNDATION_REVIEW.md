# Strategic Review 1 — Foundation, Evidence & Investigation Architecture

Date: 2026-10-09
Scope: M01–M05
Decision: **CONTINUE WITH CHANGES**

## Executive verdict
The core thesis is holding up well. Jaanch now has a coherent deterministic chain:

`adaptive questions → versioned rules → evidence graph → findings → missing evidence → prioritized investigations`

There is no reason to pivot away from the deterministic + optional harnessed-AI model. The strongest part of the product is not the questionnaire itself; it is the auditable separation of facts, derived facts, uncertainty, findings and evidence-resolution actions.

The biggest current weakness is not architecture—it is **verification and clinical-governance maturity**. We should not add more health domains or recommendation complexity until the core scenarios are executable as tests and safety/source governance is in place.

---

## What is working

### 1. Shared deterministic core — CONTINUE
Mobile and web consume the same planner, rule registry, evidence model and assessment engine. Clinical behavior is not embedded in React/React Native views.

**Decision:** CONTINUE.

### 2. Mobile-first + web companion — CONTINUE
The split is appropriate. Mobile is the primary assessment/check-in surface; web is useful for richer result inspection, debugging and future admin/clinician workflows.

**Decision:** CONTINUE. Do not force React Native Web merely for component-reuse metrics.

### 3. Adaptive questioning — CONTINUE
The planner now has explicit ranking, skip/unknown state, rationale and navigation. This is enough for the current prototype.

**Decision:** CONTINUE. Do not add sophisticated information-gain mathematics yet.

### 4. Versioned rules — CONTINUE, keep simple
The function-based rule registry is sufficiently explicit for the current number of rules and already provides IDs, versions, maturity and trace output.

**Decision:** CONTINUE. Do **not** build a full declarative DSL now. Revisit only when Rule Studio or rule volume justifies it.

### 5. Evidence graph — CONTINUE
M04 is the strongest architectural layer so far. Stable nodes, derived lineage, contradiction, missing evidence and invariant validation create a useful audit model.

**Decision:** CONTINUE.

### 6. Investigation priority — CONTINUE WITH LANGUAGE CHANGE
M05 correctly recommends investigations only when they resolve explicit missing evidence and can suppress redundant alternatives. However the internal tier `essential` could be misread by a consumer as medical necessity.

**Decision:** CHANGE user-facing wording to **High assessment priority** while retaining the internal deterministic enum for now. Every UI must state that investigation priority describes uncertainty reduction, not a medical order.

---

## Material gaps found

### A. Automated scenario coverage is insufficient — CHANGE / BLOCKER BEFORE M06
We have graph invariants and catalog validation, but no committed golden-scenario suite proving end-to-end behavior across representative answer combinations.

This is the highest-priority engineering gap because M06 introduces safety suppression logic.

**Decision:** INSERT **M05.1 — Core Verification Harness** before M06.

Required coverage:
- healthy/low-signal baseline;
- high metabolic screening signal;
- vegetarian + fatigue/tingling with missing B12;
- measured low B12;
- measured B12 contradicting questionnaire suspicion under the prototype cutoff;
- red-flag chest-pain interruption;
- skipped/unknown answers;
- investigation alternative de-duplication;
- uncovered missing evidence;
- graph invariant failures;
- deterministic repeatability from identical inputs.

The test fixtures should execute the shared core, not duplicate rule logic in tests.

### B. Clinical provenance is too late in the old roadmap — CHANGE
Rules and investigation mappings correctly carry `prototype` maturity, but source entries are placeholders. Waiting until M15 for clinical-content governance would allow too much unsourced logic to accumulate.

**Decision:** Expand M06 into **Safety Gate + Clinical Source Baseline**.

Before any rule can move from `prototype` toward `reviewed/approved`, the model should support:
- source/reference identifier;
- source title / issuing body;
- publication/version date where applicable;
- population/applicability notes;
- reviewer status;
- rule/test mapping to sources;
- explicit unsupported/prototype state.

This does not mean building a large medical knowledge database in M06. It means establishing the governance contract early.

### C. Special-population context is not yet captured — CHANGE
The current master questions do not yet adequately capture pregnancy/breastfeeding, medication/supplement context, allergies, kidney/liver context detail, or other states needed before action recommendations.

**Decision:** M06 must extend baseline context and implement deterministic suppression/gating before M09 Recommendation Engine.

### D. Broader health-domain expansion would be premature — DEFER
The product vision mentions cardiovascular/activity and eventually many more domains, but the current implemented rule depth is metabolic, nutrition/B12 and sleep plus one safety path.

**Decision:** DEFER broad domain expansion until after M09 + SR2. First prove safety, lab reassessment and recommendations on a narrow set of domains.

### E. Lab data lacks time/unit semantics — CHANGE M08
A lab number without collection date, unit provenance and normalized interpretation context is not enough for longitudinal reassessment.

**Decision:** M08 must include:
- value;
- unit;
- collection date/time when available;
- source/manual-entry provenance;
- normalized marker ID;
- optional lab reference range capture;
- freshness/age semantics separate from clinical interpretation.

Do not silently treat an old result as current.

### F. Presentation logic can drift across platforms — CHANGE M07
Medical logic is shared, but the web and mobile result rendering already duplicate grouping/label decisions.

**Decision:** M07 should add a platform-neutral **Health Map view model / selectors**. Share presentation semantics and ordering, not necessarily React components.

### G. Rule Studio is too early for MVP — DEFER
M12 Rule Studio is useful eventually, but it is primarily authoring infrastructure. It does not improve the first user journey as much as safety, reassessment, longitudinal comparison or distribution.

**Decision:** DEFER M12 until after the first release/distribution hardening unless rule-authoring volume becomes a real bottleneck. Keep the mission number reserved rather than renumbering the roadmap.

### H. Overall health score — DROP FROM NEAR-TERM SCOPE
A single overall score would imply a validated weighting model we do not have and could obscure domain-specific uncertainty.

**Decision:** DROP a generic overall health score from near-term UX. Continue showing evidence completeness, domain findings and prioritized actions separately.

### I. Product naming drift — CHANGE
Repository/app uses **Jaanch** while some foundational docs still use HealthMap.

**Decision:** Canonical product name is **Jaanch**. “Health Map” remains the name of the result experience, not the product.

---

## Revised immediate sequence

1. **M05.1 — Core Verification Harness** — Medium
2. **M06 — Safety Gate + Clinical Source Baseline** — High
3. **M07 — Health Map UX v2 + shared presentation model** — Medium
4. **M08 — Lab Reassessment + normalization/freshness** — High
5. **M09 — Recommendation Engine v1** — High
6. **Strategic Review 2**

No broad domain expansion before SR2 unless required to validate a safety abstraction.

---

## M09 recommendation boundary reaffirmed
M09 may produce low-risk lifestyle, nutrition, exercise, monitoring and clinician-review actions. Supplement/treatment-like actions remain gated. High-dose replacement regimens, prescription changes and disease-specific treatment protocols require approved clinical rules and safety context; absence of those rules must result in clinician-review guidance rather than invented dosing.

---

## Decisions summary

| Area | Decision |
|---|---|
| Deterministic core | CONTINUE |
| Mobile-first + web | CONTINUE |
| Adaptive planner | CONTINUE |
| Rule registry | CONTINUE; no DSL yet |
| Evidence graph | CONTINUE |
| Test-priority engine | CONTINUE; change consumer wording |
| Automated core scenarios | CHANGE — add M05.1 before M06 |
| Clinical source governance | CHANGE — move into M06 |
| Broad health-domain expansion | DEFER until after SR2 |
| Lab freshness/unit model | CHANGE M08 |
| Shared presentation semantics | CHANGE M07 |
| Rule Studio | DEFER post-MVP unless needed |
| Generic overall health score | DROP near-term |
| Product naming | CHANGE to Jaanch canonical |

## Final SR1 decision
**CONTINUE WITH CHANGES.**

The architecture is sufficiently strong to keep building. The next work should improve confidence in correctness and safety rather than add breadth.
