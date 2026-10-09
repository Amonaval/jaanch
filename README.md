# Jaanch

**Jaanch** is a deterministic, evidence-aware personal health assessment and prevention product.

It captures health context, asks adaptive follow-ups, separates known facts from inference and uncertainty, recommends the smallest useful next evidence, reassesses when eligible lab data arrives, applies deterministic safety/applicability gates, produces a consumer Health Map, supports reviewed report-evidence ingestion, and stores local longitudinal check-ins so meaningful changes can be compared over time.

The deterministic engine remains authoritative. AI is optional, opt-in, privacy-minimized, schema-constrained, and must never silently override urgent, safety, applicability, or evidence-eligibility rules.

> **Prototype warning**
>
> Jaanch is a development prototype, not a medical device, diagnosis service, or replacement for a clinician. Current clinical rules, investigations, applicability policies and recommendations remain `prototype` unless explicitly stated otherwise. Local history storage is prototype storage and is not encrypted medical-record storage. Prefer demo/test data while evaluating the product.

---

## Current product state

The repository is engineering-implemented through **M13.3 — Clinical Evidence Capture v2 / Report UX**.

Current milestone:

> **Evidence-ingestion alpha candidate — awaiting owner trust/result/report retest.**

Three hands-on owner gates remain open:

1. **Assessment trust:** Jaanch captured the material facts I expected it to know.
2. **Result comprehension:** without opening technical details, I can tell what matters, what to do, what is unknown, and what changed.
3. **Evidence-ingestion trust:** report import makes evidence capture easier without silently accepting extracted values or over-interpreting unsupported markers.

Any trust, comprehension, or evidence-integrity defect found during hands-on testing takes priority over roadmap expansion.

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
Smallest useful next evidence
      ↓
Manual result entry OR reviewed report import
      ├─ extraction creates candidates only
      ├─ user reviews value / unit / date / reference range
      └─ explicit confirmation before promotion
      ↓
Eligible HbA1c / B12 lab reassessment
Unsupported markers → recorded/unassessed context
      ↓
Safety-gated action plan
      ↓
Save immutable local check-in
      ↓
Repeat and compare
```

### Intake and result capabilities

- five primary blocks: About you, History, Current health, Lifestyle, Tests;
- adaptive/safety follow-up blocks;
- stable Back/Forward navigation separated from dynamic eligibility;
- metric/imperial height, weight and waist entry;
- broader diagnoses, concerns and family history plus manual/Other capture;
- named medicines with category/purpose and named supplements;
- walking, steps, pace, exercise type, frequency, duration and intensity;
- broad known-result capture including Vitamin D, glucose, lipids, hemoglobin, ferritin, TSH, blood pressure and manual Other;
- unsupported markers preserved as **recorded, not yet assessed** rather than silently interpreted;
- shared consumer result semantics across web/mobile: What matters → What to do → What evidence supports → What remains uncertain → What changed;
- evidence completeness is explicitly **not an overall health score**.

### M13.3 report-evidence capture

Web and mobile now include a dedicated **Import lab report** surface.

Implemented boundaries:

- attach PDF/image/text to retain report-level source provenance;
- paste report text or OCR output for deterministic candidate extraction;
- extraction produces **candidates only** and changes no clinical result by itself;
- candidate marker/value/unit/date/reference range/confidence/issues are visible and editable;
- user explicitly reviews and confirms each candidate;
- missing unit or report date is **not inferred/defaulted**;
- supported HbA1c/B12 still pass through existing unit/date/verification/freshness/plausibility gates;
- Vitamin D, lipids, glucose, BP, thyroid, ferritin and other unsupported markers remain `recorded_unassessed`;
- exact duplicates are replaced rather than double-counted;
- newer distinct values remain in history and existing latest-result semantics choose the newest eligible evidence;
- reviewed candidates are applied together to the latest **saved** check-in, creating one reassessed immutable snapshot;
- report provenance is retained through normalized evidence.

### Important M13.3 alpha limitation

Jaanch does **not** yet claim trustworthy OCR/PDF parsing directly from raw document bytes. Selecting a file preserves source provenance; the user currently pastes report text/OCR output.

The shared core exposes a provider-neutral extraction contract so a future document/OCR provider can create candidates without being allowed to bypass user review or deterministic clinical eligibility gates.

### Current interpreted clinical depth

Intentionally narrow:

- metabolic screening prototype;
- vitamin B12 / nutrition prototype;
- sleep screening prototype;
- concerning chest-pain urgent escalation;
- HbA1c and vitamin B12 normalized lab reassessment;
- pregnancy/pediatric/kidney/liver/frailty/polypharmacy/allergy safety/applicability gates;
- deterministic investigation prioritization;
- deterministic recommendation engine.

**Capture breadth does not authorize interpretation breadth.**

---

## Repository layout

```text
apps/
  mobile/              React Native + Expo — primary phone UX
  web/                 React + Vite — browser companion

packages/
  core/                deterministic health engine + shared presentation models
  ai-runtime/          optional server-only OpenAI review adapter

docs/
  product/             product contracts and roadmap
  missions/            mission implementation/status
  reviews/             strategic reviews
  ai-harness/          constrained AI review policy

HANDOVER_NEXT_SESSION.md
                        canonical prompt/state for a fresh work session
```

Key M13.3 modules:

```text
packages/core/src/reportEvidence.ts
packages/core/src/reportWorkflow.ts
packages/core/src/verificationEvidenceCapture.ts
apps/web/src/ReportImportScreen.tsx
apps/mobile/ReportImportScreen.tsx
```

---

# Run locally

## Prerequisites

- Expo SDK 57
- React Native 0.86
- React 19.2.3
- Node.js **22.13+**
- npm 10+ recommended

Check:

```bash
node -v
npm -v
git --version
```

## Fresh clone

```bash
git clone https://github.com/Amonaval/jaanch.git
cd jaanch
npm install
npm run verify
npm run web
```

Vite normally prints a URL similar to `http://localhost:5173`.

## Existing checkout

```bash
git pull
npm install
npm run verify
npm run web
```

`npm install` is important after M13.3 because mobile now uses `expo-document-picker`.

---

# Verification

From repo root:

```bash
npm run verify
```

This runs non-live checks for:

- adaptive/block planner behavior;
- intake/navigation regressions;
- rule execution and evidence graph invariants;
- investigation prioritization;
- safety and applicability gates;
- canonical lab handling;
- recommendations and consumer Health Map semantics;
- longitudinal snapshot/comparison logic;
- M13.3 report candidate extraction/normalization;
- explicit report-confirmation boundaries;
- missing-unit/date behavior;
- report provenance retention;
- duplicate/latest-result semantics;
- mixed supported/unassessed batch reassessment;
- AI packet/schema/safety contracts;
- server AI request construction without making a live model call.

Individual suites:

```bash
npm run verify:core
npm run verify:ai-runtime
```

There is currently **no repository CI status check attached to `main`**, so local verification is important. Do not treat absence of CI as a pass.

---

# Owner retest: what to test now

### M13.1 assessment trust

Use a realistic complete profile and verify diagnoses/concerns, named medicines, supplements, walking/activity, family history, manual Other paths and known tests are represented correctly. Stress Back/Forward and edits that change adaptive eligibility. Trigger the urgent chest-pain path once.

### M13.2 result comprehension

Without opening technical details, answer:

- What matters?
- What can I do?
- What is known?
- What is uncertain?
- What evidence should I gather next?
- What changed from the previous distinct check-in?

### M13.3 evidence-ingestion trust

1. Complete an assessment and **save a check-in**.
2. Open **Import lab report** and attach a PDF/image.
3. Paste report text containing HbA1c or B12 plus an unsupported marker such as Vitamin D or triglycerides.
4. Intentionally edit one extracted value, unit or date before review.
5. Confirm that extraction alone changes nothing.
6. Confirm reviewed HbA1c/B12 only enter the supported pathway after explicit review and normal eligibility checks.
7. Confirm Vitamin D/lipids remain clearly recorded/unassessed.
8. Try a supported marker with its unit or date missing; Jaanch should not invent either.
9. Re-import an exact duplicate and verify it is not double-counted.
10. Import a newer distinct value and verify longitudinal/latest-result behavior.
11. Compare web/mobile meaning and ordering.

---

# Android phone testing

```bash
npm install
npm run mobile:fix
npm run doctor:mobile
npm run mobile
```

`npm run mobile` starts Expo in Expo Go mode.

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

Use an Expo Go build compatible with SDK 57.

Development client:

```bash
cd apps/mobile
npx eas-cli@latest login
npx eas-cli@latest build --platform android --profile development
npm run mobile:dev
```

Standalone Android preview/APK:

```bash
cd apps/mobile
npx eas-cli@latest login
npx eas-cli@latest build --platform android --profile preview
```

Current Android package: `com.amonaval.jaanch`.

---

# iOS testing

For SDK 57, prefer an EAS development/preview build for a physical iPhone rather than assuming the App Store Expo Go build is compatible.

```bash
cd apps/mobile
npx eas-cli@latest build --platform ios --profile development
```

or:

```bash
npx eas-cli@latest build --platform ios --profile preview
```

Current bundle identifier: `com.amonaval.jaanch`.

---

# Local persistence and privacy

Current prototype persistence:

- web: browser `localStorage`;
- mobile: `@react-native-async-storage/async-storage`.

Saved check-ins are immutable versioned snapshots used for longitudinal comparison. Report import intentionally requires a saved baseline and creates a new reassessed snapshot rather than mutating the previous one.

Current limitations:

- not encrypted clinical-record storage;
- clearing browser/app data can erase history;
- no account sync;
- no backup/restore;
- no cross-device history.

Secure identity, retention/delete/export controls, encrypted persistence and cross-device continuity belong to **M13.5** and the later pilot release gate.

---

# Optional AI review

AI is **not required** to use Jaanch. The optional server-only runtime lives in `packages/ai-runtime/`.

Never put API keys in `apps/web` or `apps/mobile`.

M10 engineering is implemented, but the **live AI Utility Gate is paused** until intake/result/evidence quality is representative enough to judge AI fairly. M11 remains conditional; AI must prove incremental contradiction/missing-consideration/explanation value rather than paraphrase deterministic output.

---

# Troubleshooting

## `EUNSUPPORTEDPROTOCOL` / `workspace:*`

The repo must not restore `@jaanch/core: "workspace:*"`. Consumers use `@jaanch/core: "0.1.0"`, which npm workspaces auto-link.

After pulling latest:

```bash
npm install
```

If stale failed-install state remains, clean once and reinstall.

Windows PowerShell:

```powershell
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item -Force package-lock.json -ErrorAction SilentlyContinue
npm install
```

macOS/Linux:

```bash
rm -rf node_modules
rm -f package-lock.json
npm install
```

Only remove the lockfile for recovery from stale/pre-fix generated state.

## Expo dependency mismatch

```bash
npm run mobile:fix
npm run doctor:mobile
```

## Expo opens development-client mode instead of Expo Go

Use `npm run mobile`. For an installed development client use `npm run mobile:dev`.

---

# Next missions

Canonical sequence: `docs/product/ROADMAP.md`.

Immediate order:

1. **Owner retest M13.1 + M13.2 + M13.3.** Fix any trust/result/evidence defect first.
2. **M13.4 — Narrow Clinical Interpretation Expansion — High**, only after the owner gates are credible.
3. **M13.5 — Profile + Secure Persistence Architecture v1 — High.**
4. Resume **M10 live AI Utility Gate** only when representative intake/results/evidence exist.
5. **M11** only if AI proves incremental value.
6. Strategic Review 3.
7. M15A Pilot Safety / Privacy / Release Gate.
8. M14 MCP / ChatGPT App later.
9. M15B Store / Production Hardening last.

Do **not** redo M13.3 unless hands-on testing exposes a real defect. Do **not** broaden clinical interpretation merely because a report marker can now be captured.

---

## Product principle

> **Jaanch organizes what is known, what is uncertain, what evidence matters next, what changed over time, and what safe action follows — with every conclusion traceable.**

For a fresh development session, start with `HANDOVER_NEXT_SESSION.md`.
