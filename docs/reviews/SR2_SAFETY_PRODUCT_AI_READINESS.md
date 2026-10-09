# Strategic Review 2 — Safety, Product Value & AI Readiness

Date: 2026-10-09
Scope: M01–M09
Decision: **CONTINUE WITH CHANGES**

## Executive verdict
Jaanch has crossed an important threshold: it is no longer only a questionnaire prototype. The implemented loop is now coherent and useful:

`adaptive questions → deterministic rules → evidence graph → findings → missing evidence → investigations → lab reassessment → safety-gated action plan`

The strongest product differentiator remains the deterministic evidence loop, not AI. M08 and M09 materially strengthened the product because new evidence can change the assessment and produce a bounded action plan without pretending to diagnose or prescribe.

There is no architectural reason to pivot. However, Jaanch is **not yet ready to hand its packet to a live AI reviewer**. SR2 found two high-severity integrity gaps and several readiness gaps that should be corrected first.

The next mission should therefore be **M09.1 — Clinical Applicability & Evidence Integrity Gate**, not M10.

---

## What is working

### 1. Deterministic evidence architecture — CONTINUE
The evidence graph, rule trace, contradiction/missing-evidence model and investigation engine remain the strongest foundation in the repository.

**Decision:** CONTINUE.

### 2. Mobile-first + shared core/presentation semantics — CONTINUE
React Native remains the right primary user surface. Web remains a useful companion. Shared presentation models have prevented clinical wording/order from drifting across platforms.

**Decision:** CONTINUE. Keep platform-native view layers.

### 3. Lab reassessment loop — CONTINUE
M08 established an important product behavior: new measured evidence can resolve uncertainty, remove an investigation, change evidence level and change a finding.

**Decision:** CONTINUE. Make the normalized lab path canonical in M09.1.

### 4. Recommendation boundaries — CONTINUE
M09 correctly keeps medication changes out of autonomous recommendations and keeps therapeutic/high-dose supplementation behind clinician review or blocking. Urgent red flags suppress ordinary recommendations.

**Decision:** CONTINUE.

### 5. Source provenance and maturity — CONTINUE, strengthen governance coverage
Rules and investigations carry explicit source IDs/maturity. Recommendations validate source IDs and remain prototype.

**Decision:** CONTINUE, but recommendation and safety/applicability artifacts must enter the same governance reporting model before release.

### 6. Verification-first development — CONTINUE
The golden scenario suite has become an important safety mechanism. M09 added recommendation-specific scenarios rather than relying on UI inspection.

**Decision:** CONTINUE. Every new safety/applicability behavior must add a regression fixture.

---

## Material gaps found

### A. Population applicability is not first-class — BLOCKER BEFORE AI
The current safety gate mostly constrains downstream recommendations. It does not prevent an adult-oriented rule or investigation mapping from producing a finding/test plan for a population the rule was not designed for.

Examples:
- the metabolic heuristic uses adult-style BMI/waist screening signals even when `age < 18`;
- pregnancy can still receive the same metabolic finding/investigation path before recommendation caution is applied;
- the ADA diagnostic source has pregnancy-specific considerations, while the current Jaanch metabolic rule is explicitly not a pregnancy-specific algorithm;
- sleep/B12 rules similarly lack explicit population applicability metadata.

A downstream caution is not equivalent to preventing an inapplicable upstream interpretation.

**Decision:** INSERT **M09.1 — Clinical Applicability & Evidence Integrity Gate**.

Every rule/investigation/recommendation should be able to declare applicability such as:
- age range;
- pregnancy/postpartum applicability;
- sex/reproductive applicability where clinically relevant;
- kidney/liver context restrictions;
- required evidence type/context;
- explicitly unsupported populations.

When applicability is not satisfied, the artifact should be suppressed or return an explicit `unsupported_context` / `clinician_review` state rather than running adult logic and merely adding a warning later.

### B. Raw lab values can bypass the M08 evidence contract — BLOCKER BEFORE AI
M08 introduced normalized lab records with marker ID, unit, collection date, source, verification and freshness. However the questionnaire still exposes raw `hba1c` and `b12` numeric answers.

Those values can directly create lab-informed findings without:
- a collection date;
- user-confirmation state;
- freshness classification;
- lab-record provenance;
- canonical lab-ingestion validation.

This creates two competing evidence paths.

**Decision:** M09.1 must establish **one canonical lab evidence path**.

Preferred direction:
- questionnaire may ask whether lab results are available;
- actual lab values should be entered through the normalized lab-record workflow;
- if convenience entry remains during assessment, it must create a real `LabRecord` and pass through the same normalization/eligibility logic rather than writing a bare answer value.

No bare lab number should be able to make a finding `lab_informed`.

### C. Investigation planning is not population/safety gated — CHANGE
`TestPlan` is built from evidence gaps before the safety gate. This means an investigation can be recommended even when its source/applicability is not valid for the current population.

**Decision:** M09.1 must apply applicability to findings **and investigations**, not recommendations only.

Investigation priority should remain uncertainty-reduction priority, but an inapplicable investigation mapping must not be shown as the ordinary next step.

### D. Input consistency is too permissive — CHANGE
Multi-select answers can currently contain contradictory states such as:
- `diagnosedConditions = ['none', 'kidney']`;
- `currentConcerns = ['none', 'fatigue']`.

This is manageable in a prototype, but unsafe as an AI input because the model may resolve contradictions differently from the deterministic engine.

**Decision:** M09.1 adds answer normalization/validation:
- exclusive options such as `none` remove other options, and vice versa;
- impossible/contradictory combinations surface an explicit validation state;
- downstream rules receive normalized facts.

### E. Clinical governance does not yet cover all recommendation/safety artifacts — CHANGE
Recommendations validate source IDs, but the shared `ClinicalGovernanceReport` primarily inventories rules and investigations. Safety policy decisions also have no provenance/maturity contract.

**Decision:** extend governance reporting so the system can answer:
- which rules are prototype/reviewed/approved;
- which investigations are prototype/reviewed/approved;
- which recommendations are prototype/reviewed/approved;
- which safety/applicability policies are product policy versus clinically sourced policy;
- which source IDs are unresolved or stale.

Do not promote anything automatically because the code has existed for a long time.

### F. Red-flag coverage is intentionally narrow — CONTINUE WITH EXPLICIT COVERAGE LANGUAGE
Only configured red flags can be detected. The current chest-pain pathway is useful, but absence of a configured red flag cannot mean the person is medically safe.

The Health Map already uses wording such as “no configured safety flag was triggered,” which is preferable to “no safety concern.”

**Decision:** CONTINUE this wording discipline. M10/AI must not imply that AI fills all unconfigured emergency coverage gaps.

### G. AI packet needs stronger evidence-eligibility semantics — CHANGE M10
HAP can contain normalized lab records, including records that are stale, future-dated or unverified. The deterministic engine knows which records are eligible, but the current AI harness does not explicitly require the model to respect `eligibleForAssessment`/freshness/verification semantics.

The harness also still contains legacy `HealthMap` naming.

**Decision:** M10 must version the HAP/harness contract before any live AI use.

The AI must:
- distinguish active eligible evidence from historical/ineligible evidence;
- never upgrade stale/unverified evidence into current clinical fact;
- never upgrade a `prototype` deterministic rule/recommendation into clinical authority;
- respect every deterministic safety/applicability restriction;
- receive only the minimum necessary packet.

### H. Privacy/data minimization is a precondition for live AI — CHANGE M10
The constitution requires minimization and clear sharing boundaries, but HAP currently represents the complete assessment packet.

**Decision:** live AI review must be opt-in and use a minimized AI packet. Record:
- harness version;
- packet schema version;
- model/runtime identifier;
- consent/sharing boundary;
- output schema version;
- whether the AI call succeeded/failed.

AI failure must never degrade the deterministic result.

### I. AI usefulness is not yet proven — CONDITIONAL M11
The deterministic engine now already explains findings, missing evidence, investigations and actions. An AI layer that simply rewrites these outputs adds complexity and health risk without product value.

**Decision:** M10 must include an **AI Utility Gate** using fixed HAP fixtures.

The AI layer should demonstrate that it can add value by doing at least one of:
- identifying a deliberately omitted consideration;
- spotting a contradiction the deterministic engine intentionally leaves unresolved;
- explaining an evidence conflict more clearly;
- proposing a safe missing-evidence question within policy.

It must simultaneously demonstrate that it does **not**:
- invent facts;
- relax safety;
- turn prototype logic into diagnosis;
- recommend medication changes/high-dose regimens;
- treat ineligible lab evidence as current;
- produce invalid schema.

If M10 is mostly paraphrase or fails the safety/evidence tests, **DEFER M11 and move M13 Longitudinal Health ahead of it**.

### J. “Final verdict” language overstates AI authority — CHANGE M11
A deterministic + AI merged “final verdict” risks implying equal authority between a governed deterministic rule and a generative reviewer.

**Decision:** rename/reframe M11 as **AI Review Comparison & Safe Escalation**.

The combined experience may show:
- agreement;
- disagreement;
- missing evidence needed to resolve disagreement;
- safest interim action.

It must not silently synthesize a more permissive medical conclusion. Deterministic urgent/safety restrictions remain authoritative.

### K. Mobile result UX is becoming dense — CHANGE LATER, NOT A BLOCKER
The mobile result screen now includes Health Map priorities, action plan, labs, safety, findings, investigations and governance in one long flow.

**Decision:** do not interrupt the core roadmap for a design-system rewrite. Before a real pilot, split the result experience into simple mobile sections/tabs such as Summary, Actions, Health Map and Labs while keeping the shared view models.

### L. Persistence/longitudinal value remains strategically important — CONTINUE M13
The in-memory reassessment loop proves the concept, but mobile-first repeated use requires persistence/history.

**Decision:** keep M13. If AI utility is weak, move M13 immediately after M10 rather than investing further in AI reconciliation.

---

## External clinical-source sanity check
The source direction used by Jaanch remains reasonable, but it reinforces the need for explicit population applicability:

- ADA 2026 separates nonpregnant diabetes diagnostic use from pregnancy-specific screening/diagnostic considerations and notes circumstances where A1C relationships can differ.
- WHO physical-activity guidance provides population-specific guidance across adults, older adults, pregnancy/postpartum, chronic conditions and disability rather than one undifferentiated rule.

This is why “one generic rule + downstream caution” is not sufficient as Jaanch matures.

---

## Revised roadmap

### NEXT — M09.1: Clinical Applicability & Evidence Integrity Gate — HIGH
Required scope:
1. first-class population/applicability contract for rules/investigations/recommendations;
2. safety/applicability-aware investigation planning;
3. canonical normalized lab-ingestion path; remove raw lab bypass;
4. answer normalization and contradictory-input validation;
5. expanded governance report including recommendations/applicability policy;
6. regression fixtures for pediatric, pregnancy, kidney/liver, contradictory answers and lab-bypass cases.

### M10 — AI Harness Runtime + Privacy/Evaluation — HIGH
Changed from Medium to High because it handles sensitive health information and a generative reviewer.

Required scope:
1. canonical `Jaanch` harness naming/versioning;
2. minimized HAP/AI packet contract;
3. explicit evidence eligibility/freshness semantics;
4. explicit prototype/reviewed/approved semantics for AI;
5. strict output-schema validation;
6. separate immutable AI result;
7. explicit opt-in data-sharing boundary;
8. deterministic fallback on timeout/error/invalid output;
9. fixture-based AI utility/safety evaluation before live UX exposure;
10. live AI behind a feature flag / optional adapter.

### AI Utility Gate — part of M10 closure
Decision after M10:
- **CONTINUE M11** if AI adds measurable review value while respecting safety; or
- **DEFER M11 / MOVE M13 NEXT** if AI is primarily paraphrase or creates unacceptable variability.

### M11 — AI Review Comparison & Safe Escalation — HIGH, CONDITIONAL
Do not call it an authoritative final verdict. Preserve deterministic safety authority.

### M13 — Longitudinal Health + Persistence — MEDIUM/HIGH
Assessment history, lab trends, retest loop, before/after Health Map and persistence. Move ahead of M11 if AI utility is weak.

### M12 — Rule Studio — REMAINS DEFERRED
No evidence yet that rule-authoring volume is the bottleneck.

### M14/M15 — Distribution and Release Hardening
Before public release, M15 must include:
- qualified clinical-content review/approval workflow;
- privacy/consent model;
- security/threat model;
- accessibility;
- auditability;
- jurisdiction-specific legal/regulatory assessment for intended product claims and distribution.

---

## Domain breadth decision
Broad health-domain expansion remains **DEFERRED through M09.1 and the M10 utility gate**.

Reason: adding more rules before applicability/evidence integrity is fixed would multiply the same safety ambiguity. Depth and correctness remain higher value than adding another 10 domains.

After M10, domain expansion should be selective and require:
- source-backed applicability;
- golden scenarios;
- explicit safety behavior;
- investigation/recommendation boundaries;
- clear prototype maturity until qualified review occurs.

---

## Decisions summary

| Area | Decision |
|---|---|
| Deterministic evidence core | CONTINUE |
| Mobile-first + web companion | CONTINUE |
| Health Map/shared presentation | CONTINUE |
| Lab reassessment concept | CONTINUE; make normalized path canonical |
| Recommendation engine | CONTINUE |
| Population applicability | CHANGE — M09.1 blocker before AI |
| Investigation safety/applicability | CHANGE — M09.1 |
| Raw lab-answer bypass | REMOVE / normalize through canonical lab path |
| Contradictory inputs | CHANGE — add normalization/validation |
| Clinical governance coverage | EXPAND |
| Broad domain expansion | DEFER through M10 utility gate |
| M10 AI runtime | CONTINUE WITH MAJOR SCOPE CHANGE; HIGH effort |
| Live AI sharing | OPT-IN + minimized packet only |
| AI utility | MUST BE PROVEN with fixtures |
| M11 | CONDITIONAL; rename/reframe safe comparison/escalation |
| M13 longitudinal | CONTINUE; move ahead if AI value is weak |
| Rule Studio | REMAINS DEFERRED |
| Generic overall health score | REMAINS DROPPED |

## Final SR2 decision
**CONTINUE WITH CHANGES.**

Jaanch now has enough product substance that adding AI immediately would be premature. First close the population-applicability and evidence-ingestion integrity gaps. Then evaluate AI as an optional reviewer under a minimized, versioned, safety-constrained protocol. If AI cannot beat deterministic explanation/review on usefulness without compromising safety, the correct strategic decision is to invest next in longitudinal retention rather than force an AI feature into the product.
