# Jaanch

**Jaanch** is a deterministic, evidence-aware personal health assessment and prevention product.

It captures health context, asks adaptive follow-ups, separates known facts from inference and uncertainty, recommends the smallest useful next evidence, reassesses when eligible measured data arrives, applies deterministic safety/applicability gates, produces a consumer Health Map, supports reviewed report-evidence ingestion, stores longitudinal check-ins, supports a small set of source-governed clinical interpretation modules, provides versioned profile portability, and now has a versioned secure-persistence architecture for identity/consent/retention/sync boundaries.

The deterministic engine remains authoritative. AI is optional, opt-in, privacy-minimized, schema-constrained, and must never silently override urgent, safety, applicability or evidence-eligibility rules.

> **Prototype warning**
>
> Jaanch is a development prototype, not a medical device, diagnosis service, or replacement for a clinician. Current clinical rules, investigations, applicability policies and recommendations remain `prototype` unless explicitly stated otherwise. Current web/mobile persistence is still local application storage and is **not application-layer encrypted medical-record storage**. Prefer synthetic/demo data while evaluating the product.

---

## Current product state

The repository is engineering-implemented through **M13.5 — Profile + Secure Persistence Architecture v1**.

Current milestone:

> **Persistence-architecture alpha candidate — local-only runtime; owner trust/result/report/clinical/profile/privacy gates still open.**

Hands-on gates remain open for assessment trust, result comprehension, report-ingestion trust, narrow-clinical interpretation trust, profile import/export reliability and persistence/privacy comprehension. Any trust/evidence/privacy defect found in hands-on testing takes priority over roadmap expansion.

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
      ├─ extraction creates candidates only
      ├─ user reviews value / unit / date / reference range
      └─ explicit confirmation before promotion
      ↓
Measured-evidence eligibility
      ├─ HbA1c / B12 normalized lab path
      ├─ bounded M13.4 BP / lipids / Hb / ferritin / TSH path
      └─ unsupported markers remain recorded/unassessed
      ↓
Safety-gated action plan
      ↓
Save immutable check-in
      ↓
Versioned persistence envelope
      ├─ local owner + consent/retention metadata
      ├─ current runtime stays local-only
      └─ future remote sync blocked unless auth + consent + TLS + server encryption
      ↓
Repeat and compare
```

### Intake and result capabilities

- five primary blocks: About you, History, Current health, Lifestyle, Tests;
- adaptive/safety follow-ups;
- stable Back/Forward navigation;
- metric/imperial body measurements;
- broader diagnoses/concerns/family history + manual Other paths;
- named medicines/supplements;
- walking, steps, pace and structured exercise detail;
- broad known-result capture;
- consumer result hierarchy shared across web/mobile;
- evidence completeness explicitly **not an overall health score**.

### Report evidence capture

Web/mobile include **Import lab report**.

- PDF/image/text attachment preserves source provenance;
- current alpha uses pasted report text/OCR output for deterministic candidate extraction;
- extraction alone changes nothing;
- candidates are editable and require explicit review;
- unit/date are never guessed;
- exact duplicates are replaced, newer distinct results remain in history;
- reviewed candidates are applied in one reassessed immutable check-in based on the latest saved baseline.

Raw PDF/image bytes are **not yet claimed to be trustworthy OCR-parsed automatically**.

### M13.4 interpreted clinical depth

M13.4 deliberately adds only four bounded domains:

1. **Blood pressure / cardiovascular context** — 2024 ESC sourced prototype.
2. **Lipids / cardiovascular-risk context** — 2026 ACC/AHA dyslipidemia sourced prototype.
3. **Anaemia / iron-status evidence** — WHO haemoglobin + ferritin sourced prototype.
4. **Thyroid evidence** — NICE NG145 sourced prototype.

These modules require user-confirmed values with supported units, valid collection dates, freshness and applicable population context. One measurement is not converted into a diagnosis.

Important boundaries:
- no autonomous prescription-medication changes;
- no therapeutic iron/thyroid/lipid regimen generation;
- no PREVENT/ASCVD calculator yet;
- no pregnancy-specific BP/lipid/iron/thyroid interpretation;
- Vitamin D and fasting/random glucose remain captured but unassessed in M13.4;
- all new rules remain `prototype` until qualified clinical review changes maturity.

### Profile import/export + mocks

A **Profiles & mocks** surface is available on web and mobile.

Protocol: `JAANCH-PROFILE-1.0`.

Capabilities:
- import a profile JSON file and rerun it through the **current** deterministic engine;
- export the latest saved runnable profile/history;
- web downloads `.jaanch-profile.json`;
- mobile imports JSON through the document picker and exports via the native share sheet;
- internal derived M13.4 evidence is stripped on import/export and rebuilt only from eligible captured evidence;
- five built-in synthetic profiles can be run instantly.

Repo fixtures:

```text
examples/mock-profiles/
  low-risk-adult.json
  cardiometabolic-lipids.json
  vegetarian-b12-iron.json
  thyroid-signal.json
  severe-triglycerides.json
```

Profile JSON remains local portability/testing infrastructure. It is **not** account identity and does not imply cloud-sync consent.

### M13.5 persistence architecture

New protocols:

```text
JAANCH-PERSISTENCE-1.0
JAANCH-DELETION-1.0
JAANCH-DATA-EXPORT-1.0
```

Core module:

```text
packages/core/src/persistence.ts
```

Implemented contracts:
- local-device vs authenticated profile ownership;
- consent + policy-version state;
- retention policy;
- truthful security metadata;
- remote-persistence eligibility gate;
- storage-vendor-independent `SecurePersistencePort`;
- legacy `JAANCH-HISTORY-1.0` compatibility/migration;
- same-owner cross-device merge with immutable-snapshot conflict rejection;
- cloud-sync consent revocation;
- deletion tombstones with no health-history payload;
- owned-data export semantics;
- persistence decode strips private M13.4 derived fields again.

Current runtime truth:
- web uses browser `localStorage`;
- mobile uses AsyncStorage;
- those current stores are explicitly classified by Jaanch as `application_storage_unencrypted`;
- cloud sync is OFF;
- no auth provider or remote database is connected yet.

A future remote adapter is blocked unless the document has authenticated ownership, explicit cloud-sync consent, TLS-required transport and server-side encryption-at-rest metadata.

---

## Repository layout

```text
apps/
  mobile/              React Native + Expo — primary phone UX
  web/                 React + Vite — browser companion

packages/
  core/                deterministic engine + shared presentation/domain/persistence contracts
  ai-runtime/          optional server-only OpenAI review adapter

docs/
  product/             product contracts and roadmap
  missions/            mission implementation/status
  reviews/             strategic reviews
  ai-harness/          constrained AI review policy

examples/mock-profiles/ importable synthetic profiles
HANDOVER_NEXT_SESSION.md
```

Key M13.4–M13.5 modules:

```text
packages/core/src/clinicalMeasurements.ts
packages/core/src/m134Rules.ts
packages/core/src/m134Recommendations.ts
packages/core/src/m134ClinicalSources.ts
packages/core/src/profileBundle.ts
packages/core/src/mockProfiles.ts
packages/core/src/persistence.ts
packages/core/src/verificationClinicalExpansion.ts
packages/core/src/verificationProfiles.ts
packages/core/src/verificationPersistence.ts
apps/web/src/ProfileLabScreen.tsx
apps/mobile/ProfileLabScreen.tsx
```

---

# Run locally

## Prerequisites

- Expo SDK 57
- React Native 0.86
- React 19.2.3
- Node.js **22.13+**
- npm 10+ recommended

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

# Verification

From repo root:

```bash
npm run verify
```

The non-live verification covers the existing core plus:
- M13.3 report candidate/confirmation/provenance boundaries;
- M13.4 BP/lipid/iron/thyroid interpretation scenarios;
- missing-unit/date rejection;
- pregnancy/applicability suppression;
- direct internal-evidence forgery rejection;
- profile protocol roundtrip/import/export;
- execution of all built-in mock profiles;
- M13.5 persistence-envelope roundtrip;
- legacy-history migration compatibility;
- remote-persistence auth/consent/encryption gate;
- consent-revocation fail-closed behavior;
- cross-owner merge rejection;
- persistence sanitization of private M13.4 fields;
- deletion tombstone/data-export boundaries.

Individual suites:

```bash
npm run verify:core
npm run verify:ai-runtime
```

No GitHub CI status should be assumed to exist or pass; local verification remains important.

---

# Recommended owner retest

### 1. Run the five mock profiles

Open **Profiles & mocks** and run each scenario. Confirm the result hierarchy is understandable and the new clinical findings do not overstate certainty.

### 2. Import/export roundtrip

Export one saved/mock profile, re-import it, and confirm it reruns through the current engine with equivalent material evidence rather than trusting stored conclusions.

### 3. Evidence-integrity stress

- remove a unit or date and confirm M13.4 interpretation is blocked;
- import/report-enter the same BP/lipid/iron/TSH evidence and compare semantics;
- confirm Vitamin D/glucose remain recorded/unassessed.

### 4. Clinical boundaries

- BP `148/94` → elevated measurement / confirm-recheck context, **not diagnosed hypertension**;
- TG `1050 mg/dL` → clinician review, **no medication change**;
- nonpregnant woman Hb `10.7 g/dL` + ferritin `8 ng/mL` → cause-oriented clinician review, **no automatic iron dose**;
- TSH `12.8 mIU/L` → confirmation/FT4 context, **not a thyroid diagnosis**;
- pregnancy → configured adult M13.4 modules suppress where applicable.

### 5. Persistence migration/privacy

- open an environment with existing saved history and confirm it still loads;
- save another check-in and confirm history continues to round-trip;
- clear/reload and confirm no unexpected remote account/sync behavior appears;
- verify profile JSON wording remains portability/testing, not account/cloud sync;
- verify current local storage is not described as encrypted medical-record storage.

### 6. Re-run M13.1–M13.3 trust scenarios

Assessment navigation, result comprehension and report-import trust remain release-blocking even though M13.4/M13.5 engineering is implemented.

---

# Android phone testing

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

If Metro is stale:

```bash
cd apps/mobile
npx expo start --go --clear
```

Development client:

```bash
cd apps/mobile
npx eas-cli@latest login
npx eas-cli@latest build --platform android --profile development
npm run mobile:dev
```

Standalone preview:

```bash
cd apps/mobile
npx eas-cli@latest login
npx eas-cli@latest build --platform android --profile preview
```

Android package: `com.amonaval.jaanch`.

---

# iOS testing

Prefer an EAS development/preview build for a physical iPhone:

```bash
cd apps/mobile
npx eas-cli@latest build --platform ios --profile development
```

or:

```bash
npx eas-cli@latest build --platform ios --profile preview
```

Bundle identifier: `com.amonaval.jaanch`.

---

# Persistence and privacy

Current prototype runtime:
- web: browser `localStorage`;
- mobile: AsyncStorage;
- profile portability: user-controlled JSON file/share payload;
- persistence serialization: `JAANCH-PERSISTENCE-1.0` envelope while legacy `JAANCH-HISTORY-1.0` remains readable.

Current limitations:
- Jaanch does not provide application-layer encryption for the current browser/AsyncStorage stores;
- no live account/auth provider;
- clearing app/browser data can erase local history;
- no live cloud backup/sync;
- no live cross-device continuity.

M13.5 now defines the required boundary for a future backend: authenticated ownership + explicit consent + TLS + server encryption + revision-safe writes/deletes. Storage vendor must not dictate clinical semantics.

---

# Optional AI review

AI is **not required** to use Jaanch. The optional server-only runtime lives in `packages/ai-runtime/`.

M10 engineering exists, but the live AI Utility Gate remains paused until deterministic intake/result/evidence/clinical/persistence quality is representative enough to judge AI fairly. M11 remains conditional.

---

# Troubleshooting

Do not restore:

```text
@jaanch/core: "workspace:*"
```

Consumers use `@jaanch/core: "0.1.0"`, which npm workspaces auto-link.

If a stale failed-install state remains, clean once and reinstall. For Expo mismatches use:

```bash
npm run mobile:fix
npm run doctor:mobile
```

---

# Next work

1. Fix any owner-discovered M13.1–M13.5 trust/result/evidence/privacy defect.
2. Resume **M10 live AI Utility Gate** only when current deterministic behavior is representative enough to judge AI fairly.
3. M11 only if AI proves incremental value.
4. Strategic Review 3, then M15A pilot safety/privacy/release gate.
5. Choose/connect a concrete auth/backend adapter only when pilot infrastructure is justified; it must satisfy M13.5 rather than redefine the core.
6. M14 ChatGPT/MCP remains later; M15B production/store hardening last.

---

## Product principle

> **Jaanch organizes what is known, what is uncertain, what evidence matters next, what changed over time, and what safe action follows — with every conclusion traceable.**

For a fresh development session, start with `HANDOVER_NEXT_SESSION.md`.
