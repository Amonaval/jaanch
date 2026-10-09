# Jaanch

**Jaanch** is a deterministic, evidence-aware personal health assessment and prevention product.

It captures health context, asks adaptive follow-ups, separates known facts from inference and uncertainty, recommends the smallest useful next evidence, reassesses when eligible lab data arrives, applies deterministic safety/applicability gates, produces a consumer Health Map, and stores local longitudinal check-ins so meaningful changes can be compared over time.

The deterministic engine remains authoritative. AI is optional, opt-in, privacy-minimized, schema-constrained, and must never silently override urgent, safety, applicability, or evidence-eligibility rules.

> **Prototype warning**
>
> Jaanch is a development prototype, not a medical device, diagnosis service, or replacement for a clinician. Current clinical rules, investigations, applicability policies and recommendations remain `prototype` unless explicitly stated otherwise. Local history storage is prototype storage and is not encrypted medical-record storage. Prefer demo/test data while evaluating the product.

---

## Current product state

The repository is currently through **M13.2 — Result Quality + Health Map Consumer UX v3**.

Engineering implementation is complete for the current alpha loop, but **owner hands-on validation is still required** for M13.1 intake quality and M13.2 result comprehension.

Current milestone:

> **Consumer-result alpha candidate — awaiting owner retest.**

The two owner gates are:

1. **Jaanch captured the material facts I expected it to know.**
2. **Without opening technical details, I can tell what matters, what to do, what is unknown, and what changed.**

If either gate fails, fix that before adding more clinical breadth, AI behavior, or persistence complexity.

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
Eligible HbA1c / B12 lab reassessment
      ↓
Safety-gated action plan
      ↓
Save immutable local check-in
      ↓
Repeat and compare
```

### Current intake capabilities

- five primary blocks: About you, History, Current health, Lifestyle, Tests;
- adaptive/safety follow-up blocks;
- stable Back/Forward navigation separated from dynamic eligibility;
- metric/imperial height, weight and waist entry;
- broader diagnoses, concerns and family history plus manual/Other capture;
- named medicines with category/purpose;
- named supplements;
- walking, steps, pace, exercise type, frequency, duration and intensity;
- broad known-result capture including Vitamin D, glucose, lipids, hemoglobin, ferritin, TSH, blood pressure and manual Other;
- unsupported markers are preserved as **recorded, not yet assessed** rather than silently interpreted.

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

Capture breadth does **not** authorize interpretation breadth.

### Current result UX

The shared consumer result model gives web and mobile the same semantics:

1. What matters now
2. What you can do next
3. What the evidence supports
4. What is still uncertain
5. What changed since the previous distinct saved check-in

Evidence completeness is explicitly **not an overall health score**.

Technical rule/source/HAP detail remains available but is secondary to consumer comprehension.

---

## Repository layout

```text
apps/
  mobile/              React Native + Expo — primary phone UX
  web/                 React + Vite — browser companion

packages/
  core/                deterministic health engine + shared presentation models
  ai-runtime/          server-only optional OpenAI review adapter

docs/
  product/             product contracts and roadmap
  missions/            mission implementation/status
  reviews/             strategic reviews
  ai-harness/          constrained AI review policy

HANDOVER_NEXT_SESSION.md
                        canonical prompt/state for starting a fresh work session
```

---

# Run locally

## Prerequisites

Current mobile baseline:

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

Vite normally prints a URL similar to:

```text
http://localhost:5173
```

## Existing checkout

```bash
git pull
npm install
npm run verify
npm run web
```

---

# Verification

From repo root:

```bash
npm run verify
```

This runs non-live checks for:

- adaptive/block planner behavior;
- intake/navigation regressions;
- rule execution;
- evidence graph invariants;
- investigation prioritization;
- safety and applicability gates;
- canonical lab handling;
- recommendations;
- consumer Health Map semantics;
- longitudinal snapshot/comparison logic;
- AI packet/schema/safety contracts;
- server AI request construction without making a live model call.

Individual suites:

```bash
npm run verify:core
npm run verify:ai-runtime
```

There is currently **no repository CI status check attached to `main`**, so local verification is important.

---

# Owner retest: what to test now

Do this before M13.3 if possible.

### 1. Realistic full profile

Confirm Jaanch can represent the important facts you expect it to know, including manual diagnoses/concerns, named medicines, walking/activity, supplements and known tests.

### 2. Vegetarian + low/known B12 + recorded Vitamin D

Expected:

- B12 can participate in the interpreted evidence path when entered in the supported format;
- Vitamin D can be recorded with value/unit/date;
- Vitamin D remains clearly **recorded/unassessed** until a sourced interpretation module exists;
- Jaanch does not invent treatment.

### 3. Medicines and unlisted context

Try a cholesterol medicine, blood-pressure medicine, an unlisted diagnosis and an unlisted concern.

Expected: facts are retained even when not deterministically interpreted.

### 4. Walking without formal exercise

Enter regular walking and little/no formal gym exercise.

Expected: walking is not silently treated as inactivity.

### 5. Navigation stress

- reach an adaptive follow-up;
- go Back and Forward;
- edit an earlier answer so the adaptive plan changes.

Expected: eligible content stays reachable, retained answers are not silently deleted, and plan changes are understandable.

### 6. Urgent path

Trigger the concerning chest-pain path.

Expected: urgency dominates and routine wellness planning is suppressed.

### 7. Result comprehension

Without opening technical details, answer:

- What matters?
- What can I do?
- What is known?
- What is uncertain?
- What evidence should I gather next?

### 8. Longitudinal change

Save one check-in, meaningfully change activity/measurement/lab evidence, reassess and compare.

Expected: Jaanch compares against the previous **distinct** saved state and summarizes meaningful changes rather than only showing a raw completeness delta.

---

# Android phone testing

Android is currently the easiest physical-device path.

```bash
npm install
npm run mobile:fix
npm run doctor:mobile
npm run mobile
```

`npm run mobile` explicitly starts Expo in **Expo Go** mode.

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

Use an Expo Go build compatible with **SDK 57**.

## Development client

```bash
cd apps/mobile
npx eas-cli@latest login
npx eas-cli@latest build --platform android --profile development
```

Then:

```bash
npm run mobile:dev
```

## Standalone Android APK

```bash
cd apps/mobile
npx eas-cli@latest login
npx eas-cli@latest build --platform android --profile preview
```

Current Android package:

```text
com.amonaval.jaanch
```

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

Current bundle identifier:

```text
com.amonaval.jaanch
```

Apple signing/provisioning requirements apply.

---

# Local persistence and privacy

Current prototype persistence:

- web: browser `localStorage`;
- mobile: `@react-native-async-storage/async-storage`.

Saved check-ins are immutable versioned snapshots used for longitudinal comparison.

Current limitations:

- not encrypted clinical-record storage;
- clearing browser/app data can erase history;
- no account sync;
- no backup/restore;
- no cross-device history.

Secure identity, retention/delete/export controls, encrypted persistence and cross-device continuity belong to **M13.5** and the later pilot release gate.

---

# Optional AI review

AI is **not required** to use Jaanch.

The optional server-only runtime lives in:

```text
packages/ai-runtime/
```

Never put API keys in `apps/web` or `apps/mobile`.

M10 engineering is implemented, but the **live AI Utility Gate is paused** until intake/result quality is representative enough to judge AI fairly.

M11 remains conditional. AI must prove incremental contradiction/missing-consideration/explanation value; paraphrasing the deterministic engine is not enough.

---

# Troubleshooting

## `EUNSUPPORTEDPROTOCOL` / `workspace:*`

Old error:

```text
npm ERR! code EUNSUPPORTEDPROTOCOL
npm ERR! Unsupported URL Type "workspace:": workspace:*
```

The repo no longer uses `workspace:*` for `@jaanch/core`; consumers reference local package version `0.1.0`, which npm workspaces auto-link.

After pulling latest:

```bash
npm install
```

If stale failed-install state remains, clean it once.

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

Use:

```bash
npm run mobile
```

For an installed development client:

```bash
npm run mobile:dev
```

---

# Next missions

The canonical sequence is in `docs/product/ROADMAP.md`.

Immediate order:

1. **Owner retest M13.1 + M13.2.** Fix trust/result defects first if found.
2. **M13.3 — Clinical Evidence Capture v2 / Report UX — High.**
3. **M13.4 — Narrow Clinical Interpretation Expansion — High.**
4. **M13.5 — Profile + Secure Persistence Architecture v1 — High.**
5. Resume **M10 live AI Utility Gate** only when representative intake/results exist.
6. **M11** only if AI proves useful.
7. **Strategic Review 3.**
8. **M15A — Pilot Safety / Privacy / Release Gate.**
9. **M14 — MCP / ChatGPT App** later.
10. **M15B — Store / Production Hardening** last.

### Next engineering mission: M13.3

M13.3 should make health evidence easier to capture accurately:

- report image/PDF ingestion;
- candidate extraction rather than silent acceptance;
- user confirmation before evidence eligibility;
- marker/date/unit/source/reference-range provenance;
- extraction confidence/errors;
- faster manual entry;
- unsupported markers remain recorded/unassessed.

Do **not** use report extraction as permission to expand clinical interpretation automatically.

---

## Product principle

> **Jaanch organizes what is known, what is uncertain, what evidence matters next, what changed over time, and what safe action follows — with every conclusion traceable.**

AI, account sync, report extraction and ChatGPT integration are supporting layers around that core.

For a fresh development session, start with `HANDOVER_NEXT_SESSION.md`.
