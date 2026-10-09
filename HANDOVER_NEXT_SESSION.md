# Jaanch — New Session Handover Prompt

You are taking over active development of **Jaanch**, a deterministic, evidence-aware personal health assessment and prevention product.

## 1. Start here

Repository: `Amonaval/jaanch`  
Default branch: `main`

M10.1 code commit:

```text
6d4fde672979ee20038a8985180c1d80c8596ce3
M10.1: wire live AI review into web
```

A documentation/closure commit is newer. **Always fetch current `main` before writing anything. Never overwrite a newer head.**

Read completely:

```text
README.md
docs/missions/STATUS.md
docs/product/ROADMAP.md
docs/product/ASSESSMENT_QUALITY_STANDARD.md
docs/missions/M10_AI_HARNESS_RUNTIME.md
docs/missions/M10.1_LIVE_AI_REVIEW_WEB_UX.md
docs/missions/M13.1_ASSESSMENT_QUALITY_RECOVERY.md
docs/missions/M13.2_RESULT_QUALITY_HEALTH_MAP_UX.md
docs/missions/M13.3_CLINICAL_EVIDENCE_CAPTURE_V2_REPORT_UX.md
docs/missions/M13.4_NARROW_CLINICAL_INTERPRETATION_EXPANSION.md
docs/missions/M13.5_PROFILE_SECURE_PERSISTENCE_ARCHITECTURE.md
```

Then inspect current source relevant to the requested work.

## 2. Product thesis / hard boundaries

Jaanch is **not** an AI diagnosis chatbot.

Core loop:

```text
Capture context → adaptive assessment → deterministic evidence/findings
→ missing/contradicting/supporting evidence → smallest useful next evidence
→ manual/report measurement capture → eligibility gates → reassessment
→ safety-gated actions → immutable check-in → versioned persistence
→ optional explicit-consent AI second pass → repeat/compare
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
9. prescription-medication changes are never autonomous;
10. therapeutic/high-dose supplement or iron/thyroid/lipid regimens are not autonomously generated;
11. urgent red flags override routine flow;
12. applicability runs before adult rules/recommendations;
13. AI cannot override deterministic urgent/safety/applicability/evidence gates;
14. clinical maturity remains explicit (`prototype` / `reviewed` / `approved`);
15. local profile JSON does not imply cloud consent;
16. remote health persistence requires authenticated ownership + explicit sync consent + TLS + encryption-at-rest;
17. browser localStorage/mobile AsyncStorage must not be described as Jaanch-encrypted medical-record storage;
18. provider API keys must never be shipped to browser/mobile clients;
19. external AI review requires explicit consent and minimum-necessary evidence;
20. invalid/safety-violating AI output must not be displayed as usable advice.

## 3. Implemented mission state

Engineering implemented:

```text
M01–M09.1 deterministic engine/safety/governance
M10 AI harness/privacy/runtime engineering
M10.1 Live AI Review + Web UX — live real-model utility gate OPEN
M13 local longitudinal history
M13.1 Assessment Quality Recovery — owner trust retest open
M13.2 Consumer Health Map v3 — owner result retest open
M13.3 Clinical Evidence Capture v2 / Report UX — owner report retest open
M13.4 Narrow Clinical Interpretation Expansion — owner clinical/profile retest open
M13.5 Profile + Secure Persistence Architecture v1 — owner persistence/privacy review open
```

Do not reconstruct completed missions unless current code or hands-on testing exposes a real defect.

## 4. Clinical/evidence state

M13.3 report ingestion:
- attachment provenance preserved;
- pasted report text/OCR candidate extraction;
- extraction alone changes nothing;
- explicit review required;
- missing unit/date stays missing;
- exact duplicate/latest semantics;
- reviewed batch creates one reassessed immutable snapshot.

M13.4 bounded interpreted domains:
- BP / cardiovascular context — `CV-BP-001`, `ESC-BP-2024`;
- lipids — `CV-LIPID-001`, `AHA-ACC-DYSLIPIDEMIA-2026`;
- anaemia/iron — `NUT-IRON-001`, WHO haemoglobin/ferritin;
- thyroid — `MET-THYROID-001`, NICE NG145.

All remain prototype. Vitamin D, fasting/random glucose and unknown markers remain recorded/unassessed in this expansion.

`packages/core/src/clinicalMeasurements.ts` remains the trust boundary for broader measurements. Do not weaken its verification/unit/date/freshness/plausibility gates or expose forged `__m134_*` fields.

## 5. Profile portability / mocks

Protocol: `JAANCH-PROFILE-1.0`.

Imported profiles rerun the current deterministic engine; stored conclusions are not trusted. Internal M13.4 evidence is stripped and rebuilt from eligible evidence.

Five mocks:

```text
examples/mock-profiles/low-risk-adult.json
examples/mock-profiles/cardiometabolic-lipids.json
examples/mock-profiles/vegetarian-b12-iron.json
examples/mock-profiles/thyroid-signal.json
examples/mock-profiles/severe-triglycerides.json
```

Profile JSON is portability/testing, not cloud consent.

## 6. M13.5 persistence architecture

Core:

```text
packages/core/src/persistence.ts
```

Protocols:

```text
JAANCH-PERSISTENCE-1.0
JAANCH-DELETION-1.0
JAANCH-DATA-EXPORT-1.0
```

Current runtime:
- web: browser `localStorage`;
- mobile: AsyncStorage;
- classified `application_storage_unencrypted`;
- local-only;
- no auth/cloud database.

Remote eligibility requires authenticated owner + explicit cloud-sync consent + TLS + server encryption. `SecurePersistencePort` is vendor independent.

## 7. M10 / M10.1 AI architecture

### Existing M10 core

Core module:

```text
packages/core/src/aiReview.ts
```

Stable contracts:
- packet `JAANCH-AI-REVIEW-1.0`;
- output `AI-ASSESSMENT-1.0`;
- harness `1.1`;
- explicit external-AI consent;
- raw answer map omitted;
- stale/ineligible labs omitted;
- strict local schema/invariant validation;
- deterministic urgent state cannot be downgraded;
- unsupported applicability cannot receive prohibited self-care;
- treatment advice stays gated;
- AI disagreements must reference known finding IDs.

Server-only provider:

```text
packages/ai-runtime/src/openaiResponsesProvider.ts
```

Uses OpenAI Responses API, strict JSON-schema structured output and `store:false`.

### M10.1 packet-only server boundary

New shared helper:

```text
packages/core/src/aiReviewRuntime.ts
```

`runAIReviewPacket(...)` lets the server review the already-minimized packet without receiving the full HAP/raw answer map.

New HTTP boundary:

```text
packages/ai-runtime/src/httpHandler.ts
```

Rules:
- POST only;
- only `JAANCH-AI-REVIEW-1.0` body;
- consent must be true;
- raw/arbitrary answer bodies rejected;
- default 256 KiB body cap;
- response `no-store`;
- health request bodies are not logged.

### M10.1 web UX

New:

```text
apps/web/src/AIReviewScreen.tsx
apps/web/vite.config.ts
```

Web navigation exposes **AI Review**.

Flow:
1. save deterministic check-in;
2. open AI Review;
3. consent to one review;
4. only then create minimized packet;
5. inspect counts of shared facts/missing evidence/labs and omitted raw fields;
6. press Run AI review;
7. POST minimized packet to `/api/ai-review`;
8. display output only if Jaanch validation passes.

AI UX shows explanation, red flags, missing considerations, disagreements, domain explanations, advisory actions, safety gating and provider/model/harness/schema trace.

It never mutates deterministic state.

### Local configuration

Root `.env.example` exists. Copy to `.env.local` (gitignored):

```text
JAANCH_AI_LIVE_ENABLED=true
OPENAI_API_KEY=<key>
JAANCH_AI_MODEL=gpt-6-sol
```

`npm run web` loads root `.env.local` through Vite server config. API key is not a `VITE_` variable.

The current live endpoint is a Vite dev/preview server integration. Production needs a real server/serverless mount later; do not expose keys from a static build.

### Live gate

```bash
npm run ai:gate
```

Runs all five mocks against the configured provider with fixed fixture assessment date `2026-10-09T12:00:00Z` and prints validation/priority/disagreement/missing-consideration/signal data plus JSON report.

The CLI loads root `.env.local` when available.

**No live real-model gate was run in the M10.1 implementation session. M11 remains blocked.**

## 8. Verification

Root:

```bash
npm run verify
```

M10.1 adds `packages/ai-runtime/src/verifyWeb.ts` verifying:
- minimized packet forwarding;
- shared strict output schema;
- provider/model traceability;
- server consent enforcement;
- raw-body rejection.

Existing M10 tests continue to cover minimization, stale evidence omission, urgent downgrade rejection, unsupported-domain guidance rejection, strict structured output and `store:false`.

Do not claim CI passed unless actual checks exist.

## 9. Owner gates still open

Owner should test:
1. M13.1 capture completeness/navigation;
2. M13.2 result comprehension;
3. M13.3 report trust;
4. all five M13.4 mocks;
5. profile import/export;
6. M13.5 local persistence/privacy wording and migration;
7. configure M10.1 live AI;
8. low-risk mock should remain appropriately quiet;
9. higher-signal mocks should gain useful explanation/missing-context reasoning without diagnosis/treatment overreach;
10. `npm run ai:gate` all five outputs;
11. judge whether AI is worth invoking again, not just whether it produces novelty.

Any trust/result/evidence/privacy/AI-safety defect outranks roadmap work.

## 10. Next decision

If no owner defect is supplied:
1. run M10.1 live web review + five-mock utility gate with a real configured model;
2. if incremental value is defensible → **M11 — AI Review v2 / deeper contextual utility — High**;
3. if value is weak/noisy → keep AI optional/deferred and run Strategic Review 3 without forcing M11;
4. then M15A Pilot Safety / Privacy / Release Gate;
5. select a concrete auth/backend only when pilot infrastructure is justified and it satisfies M13.5;
6. M14 ChatGPT/MCP later; M15B production/store hardening last.

## 11. Working rules

- Prefer high-value bounded work over broad frameworks.
- Normal mission budget 1–2 coherent commits.
- Keep web/mobile meaning shared in core where appropriate.
- Do not add GitHub Actions unless requested.
- Use authoritative/current sources for clinical rules.
- Preserve source IDs, rule versions, evidence IDs and provenance.
- Keep `prototype/reviewed/approved` explicit.
- Do not restore `@jaanch/core: "workspace:*"`; workspace consumers use version `0.1.0`.
- Fix owner-discovered trust defects before roadmap work.
- Do not connect sensitive cloud storage without identity/consent/security semantics.
- Do not expose provider secrets to browser/mobile bundles.
- Do not unlock M11 just because M10.1 is wired; require real utility evidence.

## 12. What to do when this handover is opened

1. Fetch current `main`.
2. Read the canonical files in section 1.
3. Inspect current source relevant to the task.
4. Prioritize any owner-discovered defect.
5. Otherwise follow the next-decision gate above.
6. At mission closure update code, verification, mission docs, STATUS/ROADMAP/README/handover and state the exact next effort.
