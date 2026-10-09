# Jaanch — New Session Handover Prompt

You are taking over active development of **Jaanch**, a deterministic, evidence-aware personal health assessment and prevention product.

## 1. Start here

Repository: `Amonaval/jaanch`  
Default branch: `main`

The immediate M13.4 core commit was:

```text
a3075277a85d28bf0cc63b93110e35929ddce6a4
M13.4: add narrow clinical interpretation and profile protocol
```

A UI/docs/fixtures commit is expected to be newer. **Always fetch current `main` before writing anything. Never overwrite a newer head.**

Read these canonical files completely:

```text
README.md
docs/missions/STATUS.md
docs/product/ROADMAP.md
docs/product/ASSESSMENT_QUALITY_STANDARD.md
docs/missions/M13.1_ASSESSMENT_QUALITY_RECOVERY.md
docs/missions/M13.2_RESULT_QUALITY_HEALTH_MAP_UX.md
docs/missions/M13.3_CLINICAL_EVIDENCE_CAPTURE_V2_REPORT_UX.md
docs/missions/M13.4_NARROW_CLINICAL_INTERPRETATION_EXPANSION.md
```

Then inspect the actual current source relevant to the requested work.

## 2. Product thesis / hard boundaries

Jaanch is **not** an AI diagnosis chatbot.

Core loop:

```text
Capture context → adaptive assessment → deterministic evidence/findings
→ missing/contradicting/supporting evidence → smallest useful next evidence
→ manual/report measurement capture → eligibility gates → reassessment
→ safety-gated actions → immutable check-in → repeat/compare
```

Non-negotiable:
1. questionnaire signals are not diagnoses;
2. confidence is confidence in an assessment statement, not disease probability;
3. no generic overall health score;
4. evidence completeness is not overall health;
5. capture does not authorize interpretation;
6. report extraction creates candidates only;
7. unit/date/source facts must not be guessed;
8. one measurement does not automatically become a diagnosis;
9. prescription medication changes are never autonomous;
10. therapeutic/high-dose supplement or iron/thyroid/lipid regimens are not autonomously generated;
11. urgent red flags override routine flow;
12. applicability runs before adult rules/recommendations;
13. AI cannot override deterministic urgent/safety/applicability/evidence gates;
14. all clinical rule/test/recommendation maturity stays explicit (`prototype` / `reviewed` / `approved`).

## 3. Implemented mission state

Engineering implemented:

```text
M01–M09.1 foundational deterministic engine/safety/governance
M10 AI harness engineering — live utility gate PAUSED
M13 local longitudinal history
M13.1 Assessment Quality Recovery — owner trust retest open
M13.2 Consumer Health Map v3 — owner result retest open
M13.3 Clinical Evidence Capture v2 / Report UX — owner report retest open
M13.4 Narrow Clinical Interpretation Expansion — owner clinical/profile retest open
```

Do not reconstruct completed missions unless current code or hands-on testing exposes a real defect.

## 4. M13.3 evidence capture state

Report ingestion:
- file attachment preserves provenance;
- user pastes report text/OCR in current alpha;
- extraction creates candidates only;
- explicit review is required;
- missing unit/date stays missing;
- HbA1c/B12 use existing normalized lab eligibility;
- exact duplicates replaced; newer distinct results remain;
- reviewed candidates apply as one new reassessed snapshot based on latest saved baseline.

M13.4 integration now means confirmed BP/lipid/haemoglobin/ferritin/TSH recorded measurements can feed only the bounded new modules after their own unit/date/verification/freshness/applicability gates. Vitamin D, fasting/random glucose and unknown markers remain recorded/unassessed.

## 5. M13.4 clinical expansion state

New source-governed prototype rules:

### Blood pressure
- rule `CV-BP-001`;
- source `ESC-BP-2024`;
- adult nonpregnant applicability;
- recent confirmed `mmHg` only;
- 2024 ESC office-BP classification used as screening context;
- single reading never becomes a hypertension diagnosis;
- marked readings ask for clinician review; no medication changes.

### Lipids
- rule `CV-LIPID-001`;
- source `AHA-ACC-DYSLIPIDEMIA-2026`;
- adult nonpregnant applicability;
- confirmed mg/dL only; no silent mmol conversion;
- LDL ≥160 mg/dL is important risk context, not a universal target;
- TG ≥500 clinician-review context; TG ≥1000 high-attention clinician review;
- no PREVENT calculator yet; no medication decision engine.

### Anaemia / iron
- rule `NUT-IRON-001`;
- sources `WHO-ANAEMIA-2024`, `WHO-FERRITIN-2020`;
- current applicability nonpregnant age 18–65;
- adult Hb thresholds female <12 g/dL, male <13 g/dL; severe <8 g/dL;
- ferritin <15 ng/mL depleted-iron-store signal in bounded context;
- missing Hb/ferritin becomes explicit evidence gaps;
- no autonomous iron regimen.

### Thyroid
- rule `MET-THYROID-001`;
- source `NICE-THYROID-NG145`;
- adult nonpregnant applicability;
- TSH ≥10 or <0.1 is a confirm/clinician-review signal only;
- no diagnosis from one TSH value;
- FT4/FT3 confirmation remains clinician-guided; no medication changes.

All new rules remain `prototype`.

## 6. M13.4 evidence-integrity architecture

`packages/core/src/clinicalMeasurements.ts` is the trust boundary for broader captured measurements.

It validates:
- marker;
- user confirmation;
- supported unit;
- valid collection date;
- freshness;
- plausible range;
- latest eligible result.

It materializes private `__m134_*` fields only through the trusted capture path and tags them with a module-private Symbol. Public `assess(...)` strips forged internal fields. `createAssessmentSnapshot(...)` strips internal fields before persistence/export.

Do not weaken this boundary by exposing a public “trusted” boolean or accepting `__m134_*` from imported JSON.

## 7. Profile import/export + mocks

Protocol: `JAANCH-PROFILE-1.0`.

Core modules:

```text
packages/core/src/profileBundle.ts
packages/core/src/mockProfiles.ts
packages/core/src/verificationProfiles.ts
```

Rules:
- imported profiles rerun through the **current** deterministic engine;
- derived/stored conclusions are not trusted;
- internal M13.4 fields are stripped on import/export;
- export preserves runnable draft and optional local history;
- this is local portability/testing only, not cloud identity or encrypted persistence.

UI:
- web: `Profiles & mocks`, import JSON, download profile JSON;
- mobile: import JSON document, export via native Share;
- running a profile saves one resulting local check-in.

Five built-in and repo fixtures:

```text
examples/mock-profiles/low-risk-adult.json
examples/mock-profiles/cardiometabolic-lipids.json
examples/mock-profiles/vegetarian-b12-iron.json
examples/mock-profiles/thyroid-signal.json
examples/mock-profiles/severe-triglycerides.json
```

## 8. Verification

Root command:

```bash
npm run verify
```

M13.4 verification adds:
- BP interpretation;
- internal evidence forgery rejection;
- missing-unit rejection;
- severe-TG clinician-review boundary;
- low Hb + ferritin boundary;
- marked-TSH confirmation boundary;
- pregnancy applicability suppression;
- persistence sanitization;
- profile JSON roundtrip/import/export;
- all mocks executing.

Do not claim CI passed unless you inspect actual checks. At prior handovers, `main` had no attached CI status checks.

## 9. Owner gates still open

Engineering progress does not equal product validation.

Owner should test:
1. M13.1 capture completeness/navigation;
2. M13.2 result comprehension;
3. M13.3 report trust;
4. all five M13.4 mock profiles;
5. export → re-import roundtrip;
6. missing unit/date and unsupported marker behavior;
7. BP/TG/iron/TSH boundaries without diagnostic/treatment overreach;
8. report-imported evidence vs manual/profile evidence semantic parity.

Any discovered trust/result/evidence defect takes priority over roadmap work.

## 10. Next planned mission

If no new owner defect is supplied and the user asks to continue:

# M13.5 — Profile + Secure Persistence Architecture v1

Effort: **High**

M13.5 owns:
- profile/user identity;
- consent;
- retention/delete/export semantics;
- secure backend boundary;
- encryption/storage decisions;
- backup/sync/cross-device continuity;
- migrations/versioning;
- authenticated profile ownership;
- storage-vendor-independent clinical core.

Supabase or another backend may be evaluated here, but do not treat M13.4 JSON portability as permission to move sensitive health data to cloud without the privacy/security design.

After M13.5: resume M10 live AI Utility Gate only when deterministic product quality is representative; M11 only if AI proves incremental value; then Strategic Review 3 and M15A. M14 ChatGPT/MCP is later, M15B production/store hardening last.

## 11. Working rules

- Prefer high-value bounded work over broad frameworks.
- Normal mission budget 1–2 coherent commits.
- Keep web/mobile meaning shared in core; platform UI may differ.
- Do not add GitHub Actions unless requested.
- Use authoritative/current sources for clinical rules.
- Preserve source IDs, rule versions, evidence IDs and provenance.
- Keep `prototype/reviewed/approved` explicit.
- Do not restore `@jaanch/core: "workspace:*"`; workspace consumers use version `0.1.0`.
- Fix owner-discovered trust defects before roadmap vanity work.

## 12. What to do when this handover is opened

1. Fetch current `main` and verify it is newer/equal to the documented state.
2. Read the canonical files listed in section 1.
3. Inspect current source relevant to the requested task.
4. If hands-on defects are supplied, prioritize them.
5. Otherwise proceed with M13.5 at High effort when requested.
6. At closure update code, verification, mission docs, STATUS/ROADMAP/README/handover and state the exact next effort.
