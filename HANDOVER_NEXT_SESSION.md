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

The immediate pre-documentation-sync product head was:

```text
d9107cec98d440a04f3f072f4dffe991c0267d82
M13.3: harden report unit and date provenance
```

A documentation/handover commit will normally be newer. **Always fetch the current `main` head before writing anything. Never overwrite a newer head.**

First read these canonical files completely:

```text
README.md
docs/missions/STATUS.md
docs/product/ROADMAP.md
docs/product/ASSESSMENT_QUALITY_STANDARD.md
docs/missions/M13.1_ASSESSMENT_QUALITY_RECOVERY.md
docs/missions/M13.2_RESULT_QUALITY_HEALTH_MAP_UX.md
docs/missions/M13.3_CLINICAL_EVIDENCE_CAPTURE_V2_REPORT_UX.md
```

Then inspect the current implementation files relevant to the requested mission rather than relying only on this prompt.

## 2. Product thesis

Jaanch is not an AI diagnosis chatbot.

Core loop:

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
Manual result entry OR reviewed report-evidence capture
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

These are architectural rules, not copywriting preferences:

1. Questionnaire signals are **not diagnoses**.
2. Confidence means confidence in the assessment statement, **not disease probability**.
3. No generic overall health score.
4. Evidence completeness is **not overall health**.
5. Capturing a health fact does **not** authorize deterministic interpretation of that fact.
6. Unsupported/manual/report facts must remain visible as `recorded_unassessed` context rather than disappear or be over-interpreted.
7. Report extraction creates **candidate evidence only**. Extraction is never equivalent to clinical eligibility.
8. Missing report unit/date/source facts must not be guessed or silently defaulted.
9. Prescription medication changes are never autonomously recommended.
10. Therapeutic/high-dose supplement guidance requires clinician-review/safety gating; Jaanch does not invent treatment regimens.
11. Urgent red flags override routine wellness flow.
12. Population applicability must be checked **before** adult-oriented rules/tests/recommendations run.
13. Normalized lab evidence must respect marker, unit, collection date, verification, freshness and provenance.
14. AI must never silently override deterministic urgent/safety/applicability/evidence-eligibility decisions.
15. AI must be privacy-minimized, schema-constrained and optional.
16. Clinical rule/test/recommendation maturity remains explicit: `prototype` / `reviewed` / `approved`.
17. A captured authoritative source does not magically make a rule clinically approved.

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
reportEvidence.ts
reportWorkflow.ts
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
M13.3 Clinical Evidence Capture v2 / Report UX — engineering done; owner evidence-ingestion retest required
```

Do not reconstruct or redo completed missions unless current code or owner hands-on testing exposes a real defect.

## 6. M13.1 — assessment quality state

M13.1 corrected shallow intake and fragile question-by-question navigation.

Current intake includes:

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

Post-M13.1 hardening fixed selected-state rendering and numeric-clearing regressions. Do not reintroduce them.

Owner gate still open:

> **Jaanch captured the material facts I expected it to know.**

## 7. M13.2 — result quality state

M13.2 introduced shared consumer result semantics:

```text
Your Health Map
1. What matters now
2. What you can do
3. What the evidence supports
4. What is still uncertain
5. What changed since last time
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

Longitudinal comparison uses the previous **distinct** saved check-in when the latest saved snapshot is materially equivalent to the live preview.

Owner gate still open:

> **Without opening technical details, I can tell what matters, what to do, what is unknown, and what changed.**

## 8. M13.3 — evidence capture state

M13.3 is engineering-implemented. Do not restart it.

Shared core:

- provider-neutral `ReportEvidenceCandidate` / `ReportProvenance` contract;
- deterministic pasted-text/OCR extraction for common markers;
- marker normalization for HbA1c, B12, Vitamin D, glucose, lipids, hemoglobin, ferritin, TSH and BP;
- extraction confidence and clarification/issues surfaced;
- candidates remain inert until explicit user review/confirmation;
- supported HbA1c/B12 still pass through existing unit/date/verification/freshness/plausibility gates;
- unsupported markers become `recorded_unassessed` after confirmation;
- report provenance retained through normalization;
- exact duplicate replacement plus existing latest-result semantics;
- reviewed candidates can be applied as one batch to the latest saved check-in, creating one reassessed immutable snapshot.

Web/mobile:

- dedicated **Import lab report** surface without rewriting the existing assessment App;
- web native file picker;
- mobile `expo-document-picker`;
- PDF/image/text attachment preserves source provenance;
- pasted report text/OCR output is parsed into candidates;
- value, unit, collection date and reference range are editable before review;
- confidence/issues and review/ignore states are visible;
- returning to assessment reloads persisted history after apply.

Important safety hardening already done:

- **do not infer a unit when the report did not provide one**;
- **do not prefill report collection date as today**;
- missing unit/date remains visibly unresolved and blocks supported-lab confirmation.

Intentional alpha limitation:

> Raw PDF/image bytes are not automatically OCR-parsed. File attachment retains provenance; the user pastes report text/OCR output. A future extraction provider may implement the provider-neutral contract but must not bypass review or clinical eligibility gates.

Report import intentionally requires an existing saved baseline. This prevents the report flow from inventing the rest of the user’s health context.

Owner gate still open:

> **Report import makes evidence capture easier without silently accepting extracted values or over-interpreting unsupported markers.**

## 9. Current combined owner validation gate

Engineering is ahead of hands-on owner validation.

Before treating Jaanch as a usable consumer alpha, confirm all three:

1. assessment captured the material facts expected;
2. consumer result meaning/action/uncertainty/change is understandable without technical details;
3. report evidence capture is trustworthy and easier than manual entry without false provenance or unsupported interpretation.

Recommended M13.3 owner tests:

1. save a normal Jaanch check-in first;
2. attach PDF/image and verify source provenance;
3. paste report text with HbA1c/B12 plus Vitamin D or lipids;
4. edit an intentionally wrong value/unit/date before review;
5. verify extraction alone changes nothing;
6. verify HbA1c/B12 only enter the supported path after explicit review and normal eligibility checks;
7. verify unsupported markers stay recorded/unassessed;
8. omit unit/date and verify Jaanch does not guess them;
9. re-import an exact duplicate;
10. import a newer distinct result;
11. compare web/mobile semantics.

If the owner gives new hands-on defects, **fix them before continuing the roadmap**. In this health product, trust/result/evidence-integrity defects are release-blocking.

## 10. Next planned engineering mission

If no owner defect is supplied and the user asks to continue beyond M13.3, the next planned mission is:

# M13.4 — Narrow Clinical Interpretation Expansion

Effort: **High**

However, M13.4 should only proceed when the owner trust/result/report gates are credible enough. If the user has not tested yet, clearly state that those gates remain open; do not pretend product validation happened merely because engineering is complete.

Potential domains, only a few at a time:

- blood pressure / cardiovascular screening;
- lipid context;
- iron/anemia context;
- thyroid context where justified;
- Vitamin D only if evidence/product value and safety boundaries justify it.

Every interpreted domain must include:

- authoritative/current clinical sources;
- explicit applicability;
- evidence model;
- contradiction/missing-evidence behavior;
- investigation mapping;
- recommendation boundary;
- safety interactions;
- golden scenarios;
- explicit prototype/reviewed/approved maturity.

No broad “100 diseases” expansion.

## 11. Missions after M13.4

Current roadmap:

```text
M13.4 Narrow Clinical Interpretation Expansion
M13.5 Profile + Secure Persistence Architecture v1
Resume M10 live AI Utility Gate
M11 only if M10 proves incremental AI value
Strategic Review 3
M15A Pilot Safety / Privacy / Release Gate
M14 MCP / ChatGPT App later
M15B Store / Production Hardening last
```

M13.5 remains behind intake/result/evidence stabilization. Supabase or another backend may be evaluated there, but storage choice must not dictate clinical semantics.

## 12. AI status

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

But **M10 live AI Utility Gate remains paused** until intake/result/evidence quality is representative enough to judge AI fairly.

Do not implement M11 merely because plumbing exists. AI must demonstrate incremental contradiction/missing-consideration/explanation value beyond deterministic output.

## 13. Persistence status

Current history is local-first prototype persistence:

```text
web    → localStorage
mobile → AsyncStorage
```

Snapshots are immutable/versioned for comparison. Report import writes one new reassessed snapshot rather than mutating the prior check-in.

Known limitations:

- not encrypted medical-record storage;
- no identity/account;
- no cloud sync;
- no backup/restore;
- no cross-device continuity.

Those belong to M13.5 / release hardening.

## 14. Build/run baseline

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
expo-document-picker added by M13.3
```

Important npm rule:

```text
Do NOT restore @jaanch/core: "workspace:*"
```

Consumers use:

```text
@jaanch/core: "0.1.0"
```

because npm workspaces auto-link the matching local package.

## 15. Verification / CI state

The repo has a committed verification harness and root command:

```bash
npm run verify
```

M13.3 deterministic scenarios cover:

- extraction creates candidates only;
- marker normalization;
- explicit confirmation boundary;
- report provenance retention;
- supported-lab normal eligibility gates;
- unsupported markers stay unassessed;
- missing unit is not inferred;
- missing collection date blocks supported-lab promotion;
- exact duplicate handling;
- newer distinct/latest-result semantics;
- mixed reviewed batch → one reassessed snapshot;
- low-confidence unknown-marker visibility.

At M13.3 handover, **no GitHub CI status checks are attached to `main`**. Do not claim CI passed unless that changes and you actually inspect/run it.

When changing core semantics, add deterministic regression scenarios that execute the real shared core; do not duplicate clinical rule logic inside tests.

## 16. Working style / engineering rules

- Prefer 20–30% effort for 70–80% product value.
- Do not overbuild frameworks/DSLs before a real need exists.
- Normal mission commit budget: 1–2 commits; allow more only for genuinely separate layers or a real defect discovered during verification.
- Each mission should be independently understandable from history.
- Keep web/mobile semantics shared in core; platform views may differ.
- Do not add GitHub Actions unless requested.
- Do not broaden clinical domains opportunistically while implementing UI/infrastructure.
- Use authoritative/current sources when adding clinical rules or source metadata.
- Keep prototype/reviewed/approved maturity explicit.
- Preserve auditability: rule ID/version, evidence IDs, source IDs, provenance.
- Prefer explicit `recorded_unassessed` over fake certainty.
- Fix owner-discovered trust issues before roadmap work.
- Never fabricate report provenance by guessing unit/date/source facts.

## 17. Important product lessons

1. A strong engine with shallow intake still produces a weak health product.
2. Capture breadth and interpretation breadth must remain separate.
3. Health UX needs block-level flow, not one Next click per trivial question.
4. Navigation history must be stable even when adaptive eligibility changes.
5. Walking must count as real activity context.
6. Known lab values should be capturable even before Jaanch can interpret them.
7. Consumer results should start with meaning/action, not rule metadata.
8. Missing evidence must not look like a disease finding.
9. Evidence completeness must never look like a health score.
10. Longitudinal value depends on meaningful distinct states.
11. Report extraction is a data-entry assistant, not a clinical authority.
12. Missing provenance should stay missing rather than be silently guessed.
13. AI should not compensate for weak deterministic intake/result/evidence design.
14. Result quality and trust are existential; plausible-looking wrong/partial output can cause total user rejection.

## 18. What to do when this prompt is pasted

1. Acknowledge the handover briefly.
2. Fetch current `main`; never assume the SHA above is still current.
3. Read the canonical files from section 1 completely.
4. Inspect actual source files relevant to the requested work.
5. If the user provides hands-on test feedback, prioritize those defects over the roadmap.
6. Do **not** redo M13.1/M13.2/M13.3 unless a real regression/testing defect requires it.
7. If the user simply asks to continue, state that the three owner gates remain open and that the next planned engineering mission is **M13.4 — Narrow Clinical Interpretation Expansion — High effort**. Proceed only in accordance with the user’s current instruction and the roadmap gate.
8. Keep the user updated during substantial repository work.
9. At mission closure, update code, deterministic verification, mission docs, `STATUS.md`, `ROADMAP.md`, `README.md` and this handover when the canonical state changes.

Do not ask the user to repeat project history already present in the repository.
