# Jaanch — New Session Handover Prompt

You are taking over active development of **Jaanch**, a deterministic, evidence-aware personal health assessment and prevention product.

## 1. Start here

Repository: `Amonaval/jaanch`  
Default branch: `main`

M11 code commit:

```text
7d48d0e17d851b36eb09eedf8421f8da7f17662c
M11: add contextual longitudinal AI review v2
```

A docs/privacy-hardening closure commit is expected to be newer. **Always fetch current `main` before writing anything. Never overwrite a newer head.**

Read completely:

```text
README.md
docs/missions/STATUS.md
docs/product/ROADMAP.md
docs/product/ASSESSMENT_QUALITY_STANDARD.md
docs/missions/M10_AI_HARNESS_RUNTIME.md
docs/missions/M10.1_LIVE_AI_REVIEW_WEB_UX.md
docs/missions/M11_AI_REVIEW_V2_CONTEXTUAL_UTILITY.md
docs/missions/M13.1_ASSESSMENT_QUALITY_RECOVERY.md
docs/missions/M13.2_RESULT_QUALITY_HEALTH_MAP_UX.md
docs/missions/M13.3_CLINICAL_EVIDENCE_CAPTURE_V2_REPORT_UX.md
docs/missions/M13.4_NARROW_CLINICAL_INTERPRETATION_EXPANSION.md
docs/missions/M13.5_PROFILE_SECURE_PERSISTENCE_ARCHITECTURE.md
```

Then inspect the actual current source relevant to the requested task.

## 2. Product thesis / non-negotiable boundaries

Jaanch is **not** an AI diagnosis chatbot.

Core loop:

```text
Capture context → adaptive deterministic assessment
→ evidence/findings/missing evidence
→ safety/applicability
→ measured/report evidence eligibility
→ reassessment + safe actions
→ immutable check-in + local persistence
→ optional explicit-consent AI review
→ repeat / compare
```

Non-negotiable:
1. questionnaire signals are not diagnoses;
2. confidence is not disease probability;
3. no generic overall health score;
4. evidence completeness is not overall health;
5. capture does not automatically authorize interpretation;
6. report extraction creates candidates only;
7. unit/date/source must not be guessed;
8. one measurement does not automatically become a diagnosis;
9. prescription-medication changes are never autonomous;
10. therapeutic/high-dose iron/thyroid/lipid/supplement regimens are not autonomously generated;
11. urgent red flags override routine flow;
12. applicability runs before adult rules/recommendations;
13. AI cannot override deterministic urgent/safety/applicability/evidence gates;
14. clinical maturity remains explicit (`prototype` / `reviewed` / `approved`);
15. profile JSON portability does not imply cloud consent;
16. remote persistence requires authenticated ownership + explicit consent + TLS + encryption at rest;
17. browser localStorage/mobile AsyncStorage are not Jaanch-encrypted medical-record stores;
18. provider API keys never ship to browser/mobile clients;
19. external AI review requires explicit per-run consent and minimum-necessary data;
20. invalid/safety-violating AI output is not displayed as usable advice;
21. longitudinal AI must never infer a trend when no prior comparison exists;
22. AI must not manufacture novelty simply to justify its presence.

## 3. Implemented mission state

Engineering implemented:

```text
M01–M09.1 deterministic engine/safety/governance
M10 AI harness/privacy/runtime
M10.1 Live AI Review + Web UX — live utility gate still open
M11 AI Review v2 / deeper contextual utility — owner/real-model utility gate open
M13 longitudinal local history
M13.1 Assessment Quality Recovery — owner trust retest open
M13.2 Consumer Health Map — owner result retest open
M13.3 Clinical Evidence Capture v2 / Report UX — owner report retest open
M13.4 Narrow Clinical Interpretation Expansion — owner clinical/profile retest open
M13.5 Profile + Secure Persistence Architecture — owner persistence/privacy review open
```

Do not reconstruct completed missions unless current code or hands-on testing exposes a real defect.

## 4. Clinical/evidence state

M13.4 bounded prototype domains:
- BP / cardiovascular context — `CV-BP-001`;
- lipids — `CV-LIPID-001`;
- anaemia/iron — `NUT-IRON-001`;
- thyroid — `MET-THYROID-001`.

`packages/core/src/clinicalMeasurements.ts` remains the trust boundary for broader measurements. Do not weaken confirmation/unit/date/freshness/plausibility rules or accept forged internal `__m134_*` evidence.

Vitamin D, fasting/random glucose and unknown markers remain recorded/unassessed in this expansion.

M13.3 report ingestion remains candidate-only until explicit review; missing unit/date stays missing.

## 5. Profile/persistence state

Profile protocol:

```text
JAANCH-PROFILE-1.0
```

Five mocks:

```text
low-risk-adult
cardiometabolic-lipids
vegetarian-b12-iron
thyroid-signal
severe-triglycerides
```

Persistence protocols:

```text
JAANCH-PERSISTENCE-1.0
JAANCH-DELETION-1.0
JAANCH-DATA-EXPORT-1.0
```

Current runtime is local only:
- web `localStorage`;
- mobile AsyncStorage;
- classified `application_storage_unencrypted`;
- no cloud sync/auth database.

## 6. M10/M10.1 AI v1 state

Stable contracts:

```text
JAANCH-AI-REVIEW-1.0
AI-ASSESSMENT-1.0
Harness 1.1
```

Properties:
- explicit consent;
- raw answer map omitted;
- stale/ineligible labs omitted;
- strict output schema;
- treatment advice gated;
- deterministic urgent state cannot be downgraded;
- unsupported applicability cannot receive prohibited self-care;
- provider credentials server-side;
- OpenAI request uses `store:false`;
- v1 endpoint `/api/ai-review` remains for traceability.

## 7. M11 AI Review v2 state

New contracts:

```text
JAANCH-AI-REVIEW-2.0
AI-ASSESSMENT-2.0
Harness 2.0
```

Core:

```text
packages/core/src/aiReviewV2.ts
packages/core/src/verificationAIV2.ts
```

Runtime:

```text
packages/ai-runtime/src/openaiContextReviewProvider.ts
packages/ai-runtime/src/httpHandlerV2.ts
packages/ai-runtime/src/verifyV2.ts
packages/ai-runtime/src/liveUtilityGateV2.ts
```

Web:

```text
apps/web/src/AIReviewScreen.tsx
apps/web/vite.config.ts
```

Harness:

```text
docs/ai-harness/HEALTH_ASSESSMENT_HARNESS_V2.md
```

### v2 packet content

Includes current minimized v1 packet plus coded context:
- age band;
- condition/concern codes;
- medication/supplement categories;
- family-history codes;
- reproductive-context code;
- bounded activity.

Explicitly omits:
- raw answer map;
- free text;
- medication/supplement names/dose/frequency;
- raw previous snapshot;
- older full history.

If a previous check-in exists, sends deterministic latest-two-check-in deltas only:
- finding changes;
- normalized lab changes;
- eligible BP/lipid/Hb/ferritin/TSH measurement changes;
- recommendation changes;
- evidence-completeness delta.

### v2 output

Adds:
- `utility.materialAddition`;
- longitudinal synthesis;
- prioritized evidence gaps with source IDs;
- traceable contradiction types;
- clinician-prep brief;
- nested v1 base review.

Invariants:
- no longitudinal claim without longitudinal input;
- unknown source/related IDs rejected;
- `materialAddition=false` cannot coexist with contradictions/prioritized gaps;
- v1 safety validation still applies.

### v2 HTTP boundary

Endpoint:

```text
POST /api/ai-review-v2
```

Current Vite dev/preview boundary:
- explicit consent;
- strict v2 protocol/purpose;
- body cap;
- `no-store` response headers;
- minimization flags enforced;
- unexpected top-level/current/context/longitudinal/minimization fields rejected;
- request bodies not logged.

This is still **not production security infrastructure**. A real deployment needs appropriate authentication/authorization, origin/CSRF controls, rate limiting, abuse controls and server deployment review.

## 8. Verification / live gates

Root verification:

```bash
npm run verify
```

M11 live gate:

```bash
npm run ai:gate:v2
```

M10.1 v1 gate remains:

```bash
npm run ai:gate
```

No live model was declared to have passed merely because M11 engineering was implemented.

## 9. Owner gates still open

Must test:
1. M13.1 capture completeness/navigation;
2. M13.2 result comprehension;
3. M13.3 report trust;
4. M13.4 clinical/profile behavior;
5. M13.5 persistence/privacy wording and migration;
6. M11 low-risk quietness;
7. M11 high-signal prioritization without overreach;
8. no medication/dose changes;
9. `npm run ai:gate:v2` all five mocks;
10. genuine two-check-in longitudinal synthesis;
11. distinction between evidence change and health change;
12. privacy wording matches what leaves browser.

Any trust/evidence/privacy/AI-safety defect outranks roadmap expansion.

## 10. Next planned work

If no owner defect is supplied, do **Strategic Review 3 — High**.

Do not automatically create M11.1/M12 AI work. Strategic Review 3 should decide:
- whether AI v2 is genuinely valuable;
- what should be removed or simplified;
- whether product breadth is sufficient for a controlled pilot;
- whether a concrete backend is justified;
- the smallest M15A pilot safety/privacy/release plan.

Later:
- M15A pilot gate;
- concrete backend only if justified and compliant with M13.5;
- M14 ChatGPT/MCP later;
- M15B production/store hardening last.

## 11. Working rules

- Prefer bounded high-value work over frameworks.
- Normal mission budget 1–2 coherent commits.
- Keep clinical semantics backend-independent.
- Do not add GitHub Actions unless requested.
- Preserve source/rule/evidence IDs and provenance.
- Keep `prototype/reviewed/approved` explicit.
- Do not restore `@jaanch/core: "workspace:*"`; workspace consumers use `0.1.0`.
- Fix owner-discovered trust defects before roadmap work.
- Do not expose provider secrets to clients.
- Do not treat AI novelty as product value.

## 12. When this handover is opened

1. Fetch current `main`.
2. Read canonical files in section 1.
3. Inspect actual current source relevant to the task.
4. Prioritize owner-discovered defects.
5. Otherwise run Strategic Review 3 next.
6. At mission closure update code/verification/docs/status/roadmap/handover and state next effort.
