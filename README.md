# Jaanch

**Jaanch** is a deterministic, evidence-aware personal health assessment and prevention product.

It captures health context, separates known facts from inference and uncertainty, recommends the smallest useful next evidence, reassesses when eligible measured data arrives, applies deterministic safety/applicability gates, produces a consumer Health Map, supports reviewed report evidence, longitudinal check-ins, bounded clinical interpretation, profile portability and a versioned persistence architecture.

An optional web AI second pass exists, but the deterministic engine remains authoritative.

> **Prototype warning**
>
> Jaanch is a development prototype, not a medical device, diagnosis service or replacement for a clinician. Current clinical rules remain `prototype` unless explicitly promoted by qualified review. Current local web/mobile storage is not application-layer encrypted medical-record storage. Prefer synthetic/demo data while evaluating.

---

## Current state

Engineering implemented:
- M01–M09.1 deterministic foundation;
- M10 AI harness/privacy/runtime;
- M10.1 live web AI review;
- **M11 AI Review v2 / deeper contextual utility**;
- M13–M13.5 longitudinal/product-quality/report/clinical/profile/persistence architecture.

Current milestone:

> **Context-aware AI-review web alpha candidate — owner trust/privacy/real-model utility gates remain open.**

M11 was implemented because the owner explicitly chose to proceed before the M10.1 live real-model gate was completed. Therefore implementation does **not** mean AI utility is proven.

---

## Core product loop

```text
Capture health context
      ↓
Adaptive deterministic assessment
      ↓
Evidence graph + findings + missing evidence
      ↓
Safety / applicability gates
      ↓
Consumer Health Map
      ↓
Manual evidence OR reviewed report import
      ↓
Eligibility / freshness / provenance gates
      ↓
Reassessment + safety-gated actions
      ↓
Save immutable check-in
      ↓
Versioned local persistence
      ↓
Optional explicit-consent AI second pass
      ↓
Repeat / compare
```

### Current bounded clinical interpretation

Prototype modules:
1. blood pressure / cardiovascular context;
2. lipids / cardiovascular-risk context;
3. anaemia / iron-status evidence;
4. thyroid evidence.

Boundaries:
- one measurement does not automatically become a diagnosis;
- no autonomous prescription changes;
- no therapeutic iron/thyroid/lipid/high-dose supplement regimens;
- missing unit/date/source is not guessed;
- pregnancy-specific interpretation is not claimed for these adult modules;
- Vitamin D and fasting/random glucose remain captured/unassessed in the current expansion.

---

# AI Review v2 — M11

Versioned contracts:

```text
Packet:  JAANCH-AI-REVIEW-2.0
Output:  AI-ASSESSMENT-2.0
Harness: 2.0
```

The v1 M10/M10.1 contracts remain in the repo for traceability.

## What v2 sends after explicit consent

Current deterministic review packet plus a bounded context capsule:
- age band, not exact age;
- condition and concern codes;
- medication categories, not names/doses;
- supplement categories, not names/doses;
- structured family-history codes;
- reproductive-context code when present;
- bounded activity fields.

It does **not** send:
- raw questionnaire answer map;
- free-text notes;
- custom free-text history/concerns;
- medication names/doses/frequency;
- supplement names/doses/frequency;
- raw previous snapshot;
- full older history.

When at least two saved check-ins exist, v2 can additionally send deterministic deltas from the latest two check-ins only:
- finding changes;
- eligible normalized lab changes;
- eligible BP/lipid/Hb/ferritin/TSH measurement changes;
- recommendation changes;
- evidence-completeness delta.

These are observations, not causal conclusions.

## What v2 can return

- whether AI made a **material addition**;
- concise base explanation;
- longitudinal synthesis;
- prioritized evidence gaps grounded in supplied IDs;
- traceable evidence/trend/engine contradictions;
- short clinician-conversation brief;
- treatment-gating reasons.

Important invariants:
- no invented trend when no previous comparison exists;
- unknown evidence/finding IDs invalidate the output;
- if `materialAddition=false`, v2 cannot still emit contradictions or prioritized gaps;
- M10 base safety validation remains nested inside M11 validation;
- invalid output is hidden rather than partially displayed.

## Web endpoint

```text
POST /api/ai-review-v2
```

The old `/api/ai-review` remains for v1 traceability.

Current endpoints are mounted through Vite development/preview middleware. This is **not** a production authenticated health-data API.

---

# Run locally

## Prerequisites

- Node.js **22.13+**
- npm 10+ recommended
- Expo SDK 57 / React Native 0.86 for mobile

Fresh clone:

```bash
git clone https://github.com/Amonaval/jaanch.git
cd jaanch
npm install
npm run verify
npm run web
```

Existing checkout:

```bash
git pull
npm install
npm run verify
npm run web
```

---

# Enable live AI locally

Copy config:

```bash
cp .env.example .env.local
```

PowerShell:

```powershell
Copy-Item .env.example .env.local
```

Edit `.env.local`:

```text
JAANCH_AI_LIVE_ENABLED=true
OPENAI_API_KEY=<your OpenAI API key>
JAANCH_AI_MODEL=gpt-6-sol
```

`.env.local` is gitignored. Never rename the provider key using a `VITE_` prefix.

Then:

```bash
npm run web
```

In the browser:
1. complete or import an assessment;
2. save a check-in;
3. open **AI Review**;
4. explicitly consent;
5. inspect what will be shared/omitted;
6. run contextual AI review.

Provider credentials remain server-side.

---

# AI live gates

M10.1 v1:

```bash
npm run ai:gate
```

M11 v2:

```bash
npm run ai:gate:v2
```

The v2 command runs all five synthetic profiles and reports:
- provider/model;
- validation status;
- highest priority;
- `materialAddition`;
- evidence-gap count;
- contradiction count;
- clinician-question count;
- aggregate signal count;
- provider/validation errors.

A larger signal count is not automatically better. Low-risk profiles should often stay quiet.

Longitudinal utility must be judged using genuine multi-check-in history; single-snapshot mocks cannot prove it.

---

# Verification

```bash
npm run verify
```

Important AI checks include:
- explicit consent;
- current packet minimization;
- stale/ineligible lab omission;
- urgent downgrade rejection;
- unsupported-domain self-care rejection;
- treatment-advice gating;
- strict OpenAI structured output + `store:false`;
- v2 omission of free text and medication/supplement names;
- v2 structured-category retention;
- raw prior snapshot omission;
- longitudinal delta construction;
- no invented trend without a previous check-in;
- traceable-ID enforcement;
- `materialAddition=false` quietness;
- raw-body/minimization/unexpected-field HTTP rejection.

No GitHub CI status should be assumed. Run local verification.

---

# Profiles & mocks

Protocol: `JAANCH-PROFILE-1.0`.

Fixtures:

```text
examples/mock-profiles/
  low-risk-adult.json
  cardiometabolic-lipids.json
  vegetarian-b12-iron.json
  thyroid-signal.json
  severe-triglycerides.json
```

Profile JSON is portability/testing infrastructure, not cloud identity or cloud-sync consent.

---

# Persistence

Current runtime:
- web: browser `localStorage`;
- mobile: AsyncStorage;
- current stores are classified `application_storage_unencrypted`;
- cloud sync OFF;
- no live auth provider or remote database.

Future remote persistence requires authenticated ownership, explicit cloud consent, TLS and server encryption according to M13.5.

---

# Mobile

```bash
npm install
npm run mobile:fix
npm run doctor:mobile
npm run mobile
```

If LAN discovery fails:

```bash
cd apps/mobile
npx expo start --go --tunnel
```

M11 live AI UX is currently web-only.

---

# Repository highlights

```text
packages/core/src/aiReview.ts                 # M10 v1 contract
packages/core/src/aiReviewRuntime.ts          # M10.1 v1 packet runtime
packages/core/src/aiReviewV2.ts               # M11 contextual/longitudinal contract
packages/ai-runtime/src/openaiResponsesProvider.ts
packages/ai-runtime/src/openaiContextReviewProvider.ts
packages/ai-runtime/src/httpHandler.ts
packages/ai-runtime/src/httpHandlerV2.ts
apps/web/src/AIReviewScreen.tsx
docs/ai-harness/HEALTH_ASSESSMENT_HARNESS.md
docs/ai-harness/HEALTH_ASSESSMENT_HARNESS_V2.md
```

---

# Recommended owner test now

1. `npm run verify`.
2. Run all five deterministic mocks.
3. Configure live AI.
4. Run AI Review v2 for all five mocks.
5. Run `npm run ai:gate:v2`.
6. Confirm low-risk stays appropriately quiet.
7. Confirm high-signal profiles prioritize rather than explode into generic recommendations.
8. Confirm no medication/dose changes.
9. Create/use a genuine second check-in and inspect longitudinal synthesis.
10. Confirm AI distinguishes new evidence from actual health change.
11. Decide whether AI is genuinely worth keeping.

Any trust/evidence/privacy/AI-safety defect takes priority over new roadmap work.

---

# Next planned mission

**Strategic Review 3 — High effort.**

Evaluate whole-product usefulness and reduce the pilot roadmap before adding more AI or infrastructure.

Do not automatically start M11.1/M12 AI expansion just because M11 exists.

---

## Product principle

> **Jaanch organizes what is known, what is uncertain, what evidence matters next, what changed over time, and what safe action follows — with every conclusion traceable. AI may review that structure, but it never replaces it.**

For a fresh development session, start with `HANDOVER_NEXT_SESSION.md`.
