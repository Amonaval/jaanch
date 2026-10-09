# Jaanch

**Jaanch** is a deterministic, evidence-aware personal health assessment and prevention product.

It captures health context, asks adaptive follow-ups, separates known facts from inference and uncertainty, recommends the smallest useful next evidence, reassesses when eligible measured data arrives, applies deterministic safety/applicability gates, produces a consumer Health Map, supports reviewed report-evidence ingestion, stores longitudinal check-ins, supports bounded clinical interpretation, versioned profile portability, a secure-persistence architecture, and now an optional live AI second-pass review on the web.

The deterministic engine remains authoritative. AI is optional, explicit-consent, privacy-minimized, schema-constrained, and cannot silently override urgent, safety, applicability or evidence-eligibility rules.

> **Prototype warning**
>
> Jaanch is a development prototype, not a medical device, diagnosis service, or replacement for a clinician. Current clinical rules, investigations, applicability policies and recommendations remain `prototype` unless explicitly stated otherwise. Current web/mobile persistence is local application storage and is **not application-layer encrypted medical-record storage**. Prefer synthetic/demo data while evaluating the product.

---

## Current product state

Engineering implemented:
- M01–M09.1 deterministic foundation;
- M10 AI harness/privacy/evaluation runtime;
- M13–M13.5 longitudinal, product-quality, clinical/profile and persistence architecture;
- **M10.1 — Live AI Review + Web UX**.

Current milestone:

> **AI-review web alpha candidate — deterministic product + persistence architecture implemented; live real-model utility gate and owner trust/privacy gates remain open.**

A live model has **not** been declared useful merely because the integration exists. M11 remains conditional on hands-on evaluation.

---

## What works today

```text
Block-based health intake
      ↓
Adaptive follow-ups
      ↓
Deterministic assessment + evidence graph
      ↓
Safety / applicability gates
      ↓
Consumer Health Map
      ├─ What matters now
      ├─ What you can do
      ├─ What evidence supports
      ├─ What is still uncertain
      └─ What changed since last check-in
      ↓
Manual result entry OR reviewed report import
      ↓
Measured-evidence eligibility
      ├─ HbA1c / B12 normalized lab path
      ├─ bounded BP / lipids / Hb / ferritin / TSH path
      └─ unsupported markers remain recorded/unassessed
      ↓
Safety-gated action plan
      ↓
Save immutable check-in
      ↓
Versioned persistence envelope
      ↓
Optional explicit-consent AI Review
      ├─ minimized evidence packet
      ├─ server-only model credentials
      ├─ structured output
      └─ local safety/invariant validation before display
      ↓
Repeat and compare
```

### Clinical depth

Current bounded interpreted domains:
1. Blood pressure / cardiovascular context.
2. Lipids / cardiovascular-risk context.
3. Anaemia / iron-status evidence.
4. Thyroid evidence.

Important boundaries:
- one measurement is not automatically a diagnosis;
- no autonomous prescription-medication changes;
- no therapeutic iron/thyroid/lipid regimen generation;
- no PREVENT/ASCVD calculator yet;
- no pregnancy-specific BP/lipid/iron/thyroid modules;
- Vitamin D and fasting/random glucose remain captured but unassessed in the current expansion;
- all new rules remain `prototype` until qualified review changes maturity.

### Report evidence capture

Web/mobile include **Import lab report**.

- PDF/image/text attachment preserves source provenance;
- pasted report text/OCR output creates deterministic candidates;
- extraction alone changes nothing;
- candidates are editable and require explicit review;
- unit/date are never guessed;
- reviewed candidates apply in one reassessed immutable check-in.

Raw PDF/image bytes are **not yet claimed to be trustworthy OCR-parsed automatically**.

### Profile import/export + mocks

Protocol: `JAANCH-PROFILE-1.0`.

The **Profiles & mocks** surface supports:
- profile JSON import through the current deterministic engine;
- latest-profile/history export;
- five built-in synthetic profiles;
- web JSON download and mobile JSON document sharing/import.

Fixtures:

```text
examples/mock-profiles/
  low-risk-adult.json
  cardiometabolic-lipids.json
  vegetarian-b12-iron.json
  thyroid-signal.json
  severe-triglycerides.json
```

Profile JSON is portability/testing infrastructure. It is **not** account identity and does not imply cloud-sync consent.

### Persistence architecture

Protocols:

```text
JAANCH-PERSISTENCE-1.0
JAANCH-DELETION-1.0
JAANCH-DATA-EXPORT-1.0
```

Current runtime truth:
- web uses browser `localStorage`;
- mobile uses AsyncStorage;
- those stores are explicitly classified by Jaanch as `application_storage_unencrypted`;
- cloud sync is OFF;
- no auth provider or remote database is connected.

A future remote adapter is blocked unless authenticated ownership, explicit cloud-sync consent, TLS and server-side encryption-at-rest requirements are satisfied.

---

# M10.1 — Live AI Review on web

The web navigation now contains **AI Review**.

AI review works only from a saved deterministic check-in.

Flow:

```text
saved check-in
   ↓
internal HAP
   ↓
user explicitly consents
   ↓
browser creates minimized JAANCH-AI-REVIEW-1.0
   ↓
user presses Run AI review
   ↓
POST /api/ai-review
   ↓
server-only OpenAI Responses provider
   ↓
strict structured output
   ↓
Jaanch schema + safety validation
   ↓
show advisory output only when valid
```

### Privacy properties

Before sending anything:
- consent must be selected;
- raw questionnaire answers are omitted from the external packet;
- stale/ineligible lab records are omitted;
- the UI shows how many evidence facts, missing items and eligible labs will be shared;
- the API key stays server-side;
- consent is not persisted.

The minimized packet **still contains sensitive health evidence**. This is not described as anonymous data.

The existing provider sends OpenAI Responses requests with `store: false` and strict JSON-schema output.

### What AI can show

A validated review can provide:
- a concise explanation;
- red flags preserved from deterministic safety state;
- possible missing considerations;
- disagreements with specific deterministic findings;
- domain-level explanation;
- missing evidence;
- advisory actions;
- treatment-gating reasons.

AI output is never merged into deterministic findings/recommendations.

### Development server boundary

The current live endpoint is mounted by `apps/web/vite.config.ts` for Vite development/preview. That keeps provider credentials on the server side during local web testing.

A future production deployment needs a real server/serverless endpoint using the same runtime contract. A static-only deployment cannot safely host live AI.

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

Vite normally prints a URL similar to `http://localhost:5173`.

---

# Enable live AI review locally

Copy the example config:

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

`.env.local` is gitignored. Do not rename the API key variable with a `VITE_` prefix.

Then:

```bash
npm run web
```

In Jaanch:
1. run/import an assessment;
2. save a check-in;
3. choose **AI Review**;
4. select one-run consent;
5. inspect the minimized packet counts;
6. choose **Run AI review**.

If live AI is disabled or credentials/model are missing, the deterministic product continues to work and AI Review reports a provider configuration error.

---

# Five-mock live AI utility gate

Once `.env.local` is configured:

```bash
npm run ai:gate
```

This runs the same live provider across all five mock profiles and reports:
- model/provider;
- validation status;
- priority;
- disagreements;
- missing considerations;
- incremental signal count;
- provider/validation errors.

A larger novelty count is **not automatically better**. Low-risk profiles should not acquire invented problems, and a zero-novelty answer may be correct when deterministic Jaanch already covers the material evidence.

M11 is not unlocked until the live outputs are manually judged useful and safe.

---

# Verification

From repo root:

```bash
npm run verify
```

The non-live verification covers:
- deterministic engine and safety/applicability;
- report candidate/confirmation/provenance boundaries;
- narrow BP/lipid/iron/thyroid scenarios;
- missing-unit/date rejection;
- profile import/export and all mocks;
- persistence envelope/migration/ownership/consent/delete/export boundaries;
- AI packet minimization;
- stale-lab omission;
- urgent downgrade rejection;
- unsupported-domain AI self-care rejection;
- treatment-advice gating;
- strict OpenAI structured request + `store:false`;
- M10.1 packet-only web runtime forwarding;
- M10.1 server consent/raw-body rejection.

Individual suites:

```bash
npm run verify:core
npm run verify:ai-runtime
```

No GitHub CI status should be assumed to exist or pass; local verification remains important.

---

# Recommended owner test

1. Run all five deterministic mocks first.
2. Confirm report/profile/manual evidence semantics remain trustworthy.
3. Confirm persistence migration/local-only wording is understandable.
4. Configure live AI.
5. Run the low-risk mock and ensure AI stays appropriately quiet.
6. Run cardiometabolic, B12/iron, thyroid and severe-TG scenarios.
7. Check whether AI adds real explanation/missing-context value rather than merely paraphrasing.
8. Check that it does not diagnose, prescribe, downgrade red flags or bypass applicability.
9. Run `npm run ai:gate` and inspect all five outputs together.
10. Decide **M11 GO / MODIFY / DEFER** based on product usefulness, not novelty count alone.

Any owner-discovered trust, evidence, privacy or AI-safety defect outranks roadmap expansion.

---

# Mobile

Mobile remains deterministic/profile/report focused in M10.1; live AI UX is web-only for now.

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

Android package: `com.amonaval.jaanch`.
Bundle identifier: `com.amonaval.jaanch`.

---

# Repository layout

```text
apps/
  web/
    src/AIReviewScreen.tsx
    vite.config.ts
  mobile/

packages/
  core/
    src/aiReview.ts
    src/aiReviewRuntime.ts
    src/persistence.ts
  ai-runtime/
    src/openaiResponsesProvider.ts
    src/httpHandler.ts
    src/liveUtilityGate.ts
    src/verifyWeb.ts

docs/
  missions/
  product/
  ai-harness/
```

---

# Next decision

1. Fix any M13.1–M13.5 or M10.1 owner-discovered defect.
2. Run the M10.1 web review + `npm run ai:gate` with a real configured model.
3. If AI demonstrates defensible incremental value: **M11 — AI Review v2 / deeper contextual utility — High**.
4. If AI does not add enough value: keep it optional/deferred and move to Strategic Review 3 without forcing M11.
5. Then M15A pilot safety/privacy/release work; M14 ChatGPT/MCP later; M15B production/store hardening last.

---

## Product principle

> **Jaanch organizes what is known, what is uncertain, what evidence matters next, what changed over time, and what safe action follows — with every conclusion traceable. AI may review that structure, but it does not replace it.**

For a fresh development session, start with `HANDOVER_NEXT_SESSION.md`.
