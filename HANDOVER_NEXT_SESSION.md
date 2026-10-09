# Jaanch — New Session Handover Prompt

Copy/paste this entire file into a fresh ChatGPT session when continuing Jaanch.

---

You are taking over active development of **Jaanch**, a deterministic, evidence-aware personal health assessment and prevention product.

## 1. Start here — do not reconstruct the project from memory

Repository:

```text
Amonaval/jaanch
```

Default branch:

```text
main
```

The immediate pre-handover product head was:

```text
d6727ba7d5c1aaffd67f40c02bd2cb494fefa569
M13.2: ship consumer Health Map v3 on web and mobile
```

A documentation/handover commit may be newer. **Always fetch the current `main` head before writing anything. Never overwrite a newer head.**

First read these canonical files:

```text
README.md
docs/missions/STATUS.md
docs/product/ROADMAP.md
docs/product/ASSESSMENT_QUALITY_STANDARD.md
docs/missions/M13.1_ASSESSMENT_QUALITY_RECOVERY.md
docs/missions/M13.2_RESULT_QUALITY_HEALTH_MAP_UX.md
```

Then inspect the current implementation files relevant to the requested mission rather than relying only on this prompt.

## 2. Product thesis

Jaanch is not an AI diagnosis chatbot.

Core product loop:

```text
Capture health context
      ↓
Adaptive assessment
      ↓
Deterministic evidence graph + findings
      ↓
Missing / contradicting / supporting evidence
      ↓
Smallest useful next evidence
      ↓
Lab / measurement capture
      ↓
Reassessment
      ↓
Safety-gated actions
      ↓
Save immutable check-in
      ↓
Repeat → compare → improve → reassess
```

Product principle:

> Jaanch organizes what is known, what is uncertain, what evidence matters next, what changed over time, and what safe action follows — with every conclusion traceable.

**Jaanch engine controls medicine. AI is optional review/support.**

## 3. Non-negotiable clinical/product boundaries

These rules are architectural, not copywriting preferences:

1. Questionnaire signals are **not diagnoses**.
2. Confidence means confidence in the assessment statement, **not disease probability**.
3. No generic overall health score.
4. Evidence completeness is **not overall health**.
5. Capturing a health fact does **not** authorize deterministic interpretation of that fact.
6. Unsupported/manual facts must remain visible as `recorded/unassessed` context rather than disappearing or being over-interpreted.
7. Prescription medication changes are never autonomously recommended.
8. Therapeutic/high-dose supplement guidance requires clinician-review/safety gating; Jaanch does not invent treatment regimens.
9. Urgent red flags override routine wellness flow.
10. Population applicability must be checked **before** adult-oriented rules/tests/recommendations run.
11. Normalized lab evidence must respect marker, unit, collection date, verification, freshness and provenance.
12. AI must never silently override deterministic urgent/safety/applicability/evidence-eligibility decisions.
13. AI must be privacy-minimized, schema-constrained and optional.
14. Clinical rule/test/recommendation maturity remains explicit: `prototype` / `reviewed` / `approved`.
15. A captured authoritative source does not magically make a rule clinically approved.

## 4. Architecture

```text
apps/
  mobile/        React Native / Expo — primary mobile UX
  web/           React + Vite — browser companion

packages/
  core/          shared deterministic domain engine and presentation models
  ai-runtime/    optional server-only OpenAI runtime

docs/
  product/
  missions/
  reviews/
  ai-harness/
```

Important shared-core modules include:

```text
questions.ts
planner.ts
blockPlanner.ts
intake.ts
answerNormalization.ts
applicability.ts
clinicalSources.ts
safety.ts
ruleRegistry.ts
rules.ts
evidenceGraph.ts
testRegistry.ts
testPriority.ts
labs.ts
recommendations.ts
healthMapView.ts
resultView.ts
longitudinal.ts
hap.ts
aiReview.ts
verification*.ts
```

Web/mobile should share **meaning and ordering**, not necessarily React components.

## 5. Implemented mission state

Completed/implemented:

```text
M01   Foundation + Constitution
M02   Adaptive Question Planner v1
M03   Versioned Rule Registry
M04   Evidence Graph + Finding Model
M05   Screening & Test Priority Engine
SR1   Strategic Review 1 — CONTINUE WITH CHANGES
M05.1 Core Verification Harness
M06   Safety Gate + Clinical Source Baseline
M07   Health Map UX v2 + Shared Presentation Model
M08   Lab Reassessment + Normalization/Freshness
M09   Recommendation Engine v1
SR2   Strategic Review 2 — CONTINUE WITH CHANGES
M09.1 Clinical Applicability & Evidence Integrity
M10   AI Harness Runtime + Privacy/Evaluation — engineering done; live utility gate paused
M13   Longitudinal Health + Local Persistence
M13.1 Assessment Quality Recovery + Block UX v2 — engineering done; owner trust retest required
M13.2 Result Quality + Health Map Consumer UX v3 — engineering done; owner result-UX retest required
```

Do not redo these missions unless a real regression/owner test finding requires it.

## 6. Why M13.1 happened

The first hands-on owner test exposed that the earlier questionnaire was too shallow and too question-by-question:

- limited conditions/concerns;
- no adequate manual Other paths;
- walking was poorly represented;
- too few labs;
- Vitamin D and other known results could not be captured properly;
- height/waist units were awkward;
- navigation could lose adaptive content;
- one tiny question per Next click created excessive navigation;
- medicines lacked useful name/reason context;
- broader captured context needed to be available even before deterministic interpretation existed.

M13.1 corrected the intake model and made assessment quality release-blocking.

Current intake now has:

- five primary blocks: About, History, Current health, Lifestyle, Tests;
- adaptive/safety follow-up blocks;
- stable block navigation/history;
- metric/imperial entry;
- broader diagnosis/concern/family-history catalogues + manual Other;
- named medicines with category/purpose;
- named supplements;
- walking days/minutes/steps/pace;
- exercise types/days/minutes/intensity;
- broader known-result capture including Vitamin D, glucose, lipids, hemoglobin, ferritin, TSH, BP and Other;
- unsupported values preserved as recorded/unassessed.

Post-M13.1 hardening fixed:

- incorrect selected-state rendering on web;
- clearing numeric inputs leaving stale/zero values;
- mobile numeric clearing semantics.

Do not reintroduce those bugs.

## 7. Why M13.2 happened

Even with a better engine, the result screen still read too much like engineering output.

M13.2 added a shared consumer result narrative:

```text
Your Health Map

1. What matters now
2. What you can do
3. What the evidence supports
4. What is still uncertain
5. What changed since last time

Then:
- recorded but not yet interpreted facts
- safety/evidence detail
- technical governance/HAP
```

Core API:

```text
buildConsumerResultViewModel(...)
```

Hero states are bounded:

```text
urgent
attention
needs_evidence
quiet
```

A quiet state must **not** claim “you are healthy.” It only says no high-priority issue was found in evidence Jaanch can currently interpret.

M13.2 also fixed longitudinal comparison so if the latest saved snapshot is materially equivalent to the live preview, comparison uses the previous distinct check-in instead of hiding the useful change narrative.

## 8. Current owner validation gate

Engineering is ahead of owner validation.

Before treating the product as a credible alpha, the owner should confirm:

> **Jaanch captured the material facts I expected it to know.**

and:

> **Without opening technical details, I can tell what matters, what to do, what is unknown, and what changed.**

Recommended retest scenarios are in `docs/missions/STATUS.md` and `README.md`.

If the owner gives new hands-on defects, **fix them before blindly continuing the roadmap**. This is a sensitive health product; poor result quality can invalidate the product.

## 9. Current next mission

If no new owner defect is supplied and the user asks to continue, next planned mission is:

# M13.3 — Clinical Evidence Capture v2 / Report UX

Effort: **High**

Goal: make evidence/report capture much easier while preserving evidence integrity.

Expected scope:

- faster structured manual result entry;
- image/PDF report ingestion UX;
- extraction produces candidate values only;
- explicit user confirmation before evidence eligibility;
- marker normalization;
- value/unit/date/source/reference-range provenance;
- extraction confidence/errors visible;
- duplicate/latest-result semantics;
- report-level provenance retained;
- unsupported markers remain recorded/unassessed;
- mobile-friendly flow;
- verification scenarios around extraction/confirmation boundaries.

Non-goals:

- no automatic diagnosis from report prose;
- no silent acceptance of extracted values;
- no clinical rule expansion just because a report contains a marker;
- no autonomous treatment recommendations based on report extraction.

Before coding M13.3, inspect existing `labs.ts`, `intake.ts`, report-related code if any, app upload capabilities, and current dependencies. Prefer a provider-neutral candidate-extraction contract rather than binding core clinical logic to one OCR/vendor implementation.

## 10. Missions after M13.3

Current roadmap:

```text
M13.3 Clinical Evidence Capture v2 / Report UX
M13.4 Narrow Clinical Interpretation Expansion
M13.5 Profile + Secure Persistence Architecture v1
Resume M10 live AI Utility Gate
M11 only if M10 proves incremental AI value
Strategic Review 3
M15A Pilot Safety / Privacy / Release Gate
M14 MCP / ChatGPT App later
M15B Store / Production Hardening last
```

Potential M13.4 interpretation domains, only a few at a time:

- blood pressure / cardiovascular screening;
- lipid context;
- iron/anemia context;
- thyroid context where justified;
- Vitamin D only if evidence/product value and safety boundaries justify it.

Every new interpreted domain must include sources, applicability, evidence semantics, investigation mapping, safety/recommendation boundaries and golden tests.

No broad “100 diseases” expansion.

## 11. AI status

M10 engineering exists:

- privacy-minimized AI packet;
- explicit consent;
- raw-answer minimization;
- eligible-lab-only sharing;
- strict structured output;
- local invariant validation;
- server-only runtime;
- `store:false`;
- utility evaluation contract.

But **live AI Utility Gate is intentionally paused**.

Do not implement M11 merely because the plumbing exists.

M11 proceeds only if a real configured model demonstrates useful incremental review value beyond deterministic output.

## 12. Persistence status

Current history is local-first prototype persistence:

```text
web    → localStorage
mobile → AsyncStorage
```

Snapshots are immutable/versioned for comparison.

Known limitations:

- not encrypted medical-record storage;
- no identity/account;
- no cloud sync;
- no backup/restore;
- no cross-device continuity.

Those belong to M13.5 / release hardening, not M13.3.

## 13. Build/run baseline

Repo root:

```bash
npm install
npm run verify
npm run web
```

Mobile:

```bash
npm run mobile:fix
npm run doctor:mobile
npm run mobile
```

Development client:

```bash
npm run mobile:dev
```

Current mobile baseline:

```text
Expo SDK 57
React Native 0.86
React 19.2.3
Node >=22.13
npm workspace monorepo
```

Important npm fix already made:

```text
Do NOT restore @jaanch/core: "workspace:*"
```

Consumers use:

```text
@jaanch/core: "0.1.0"
```

because npm auto-links the matching local workspace package.

Normal mobile command intentionally uses Expo Go mode (`expo start --go`) because `expo-dev-client` is installed separately.

## 14. Verification / CI state

The repo has a committed verification harness and root:

```bash
npm run verify
```

No GitHub CI status checks were attached to the latest head at handover time.

Do not claim CI passed unless you actually see/run CI.

When changing core semantics, add deterministic regression scenarios. Tests must execute the real shared core; do not duplicate rule logic inside tests.

## 15. Working style / engineering rules

- Prefer 20–30% effort for 70–80% product value.
- Do not overbuild frameworks/DSLs before a real need exists.
- Normal mission budget: 1–2 commits; allow more only when a mission genuinely spans multiple coherent layers.
- Each mission should be independently understandable from history.
- Keep web/mobile semantics shared in core; platform views can differ.
- Do not add GitHub Actions unless requested.
- Do not broaden clinical domains opportunistically while implementing UI/infrastructure.
- Use authoritative/current sources when adding clinical rules or source metadata.
- Keep prototype/reviewed/approved maturity explicit.
- Preserve auditability: rule ID/version, evidence IDs, source IDs, provenance.
- Prefer explicit “recorded/unassessed” over fake certainty.
- Fix owner-discovered trust issues before roadmap vanity work.

## 16. Important product lessons from this session

1. **A strong engine with shallow intake still produces a weak health product.**
2. Capture breadth and interpretation breadth must be separate.
3. Health UX needs block-level flow, not one Next click per trivial question.
4. Navigation history must be stable even when adaptive eligibility changes.
5. Walking must count as real activity context.
6. Known lab values should be capturable even before Jaanch can interpret them.
7. Consumer results should start with meaning/action, not rule metadata.
8. Missing evidence must not look like a disease finding.
9. Evidence completeness must never look like a health score.
10. Longitudinal value depends on comparing meaningful distinct states, not merely latest snapshot IDs.
11. AI should not be used to compensate for weak deterministic intake/result design.
12. In this product, **result quality and trust are existential**; a plausible-looking wrong/partial result can cause total user rejection.

## 17. What to do when this prompt is pasted

1. Acknowledge the handover briefly.
2. Fetch current `main` and verify it is not behind the documented state.
3. Read the canonical files listed in section 1.
4. If the user provides hands-on test feedback, prioritize those defects and update the mission plan accordingly.
5. If the user simply says “continue” / “implement next,” proceed with **M13.3 — Clinical Evidence Capture v2 / Report UX** at High effort.
6. Keep the user updated during substantial repo work.
7. At mission closure, update code, verification, mission docs, `STATUS.md`, `ROADMAP.md` if needed, and state the exact next effort.

Do not ask the user to repeat project history that is already in this prompt/repo.
