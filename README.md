# Jaanch

**Jaanch** is a deterministic, evidence-aware personal health assessment and prevention product.

It asks adaptive questions, separates known facts from uncertainty, recommends the smallest useful next evidence, reassesses when new lab data arrives, applies deterministic safety/applicability gates, and produces a traceable Health Map plus an action plan.

The deterministic engine remains authoritative. AI is optional, opt-in, privacy-minimized, schema-constrained, and is never allowed to silently override urgent, safety, applicability, or evidence-eligibility rules.

> **Prototype warning**
>
> Jaanch is currently a development prototype, not a medical device, diagnosis service, or replacement for a clinician. Current rules, investigation mappings, applicability policies, and recommendations remain marked `prototype` unless explicitly stated otherwise. Local history storage in the current app is also prototype storage and is not encrypted medical-record storage. Use test/demo data while evaluating the product.

---

## Where the product is today

You can already run a meaningful end-to-end journey:

1. Answer the adaptive questionnaire.
2. See why each question was asked.
3. Get a deterministic Health Map.
4. Inspect supporting, contradicting, and missing evidence.
5. See the smallest useful investigation set.
6. Add HbA1c or vitamin B12 lab evidence with date/unit/source context.
7. Reassess and see what changed.
8. Get a safety-gated action plan.
9. Save the completed assessment as a local check-in.
10. Run another check-in later and compare findings, evidence completeness, investigations, recommendations, and lab trends.

Current implemented depth is intentionally narrow: metabolic screening, B12/nutrition, sleep screening, one urgent chest-pain path, lab reassessment for HbA1c/B12, safety/applicability gating, and longitudinal history.

---

## Repository layout

```text
apps/
  mobile/        React Native + Expo — primary UX
  web/           React + Vite — desktop companion
  ai-runtime/    server-only optional OpenAI review adapter
packages/
  core/          shared deterministic engine, evidence, labs, safety,
                 recommendations, longitudinal history, AI packet contracts
docs/
  product/       vision, constitution, roadmap
  missions/      implementation mission records/status
  reviews/       strategic reviews
  ai-harness/    constrained AI-review policy/harness
```

---

# Quick start — recommended first test

If you have not tested Jaanch before, start with the **web app**. It is the fastest way to verify the product flow before dealing with phone tooling.

## Prerequisites

Use:

- Git
- Node.js **22.13 or newer**
- npm

Expo SDK 57 targets React Native 0.86 / React 19.2.3 and requires Node 22.13.x or newer.

Check your versions:

```bash
node -v
npm -v
git --version
```

## Clone and install

```bash
git clone https://github.com/Amonaval/jaanch.git
cd jaanch
npm install
```

Then run the deterministic verification suites:

```bash
npm run verify
```

The verification command exercises the planner, rules, evidence graph, safety, recommendations, applicability, AI contracts, and longitudinal comparison logic. No live AI request is required.

---

# Run the web app

From the repository root:

```bash
npm run web
```

Vite prints a local URL, normally similar to:

```text
http://localhost:5173
```

Open it in your browser.

## What to test on web

### Test 1 — low-signal baseline

Use a generally healthy adult profile with no major concerns.

Expected behavior:

- questionnaire completes;
- no generic disease diagnosis is shown;
- Health Map separates findings from missing evidence;
- action plan stays bounded;
- clinical-governance section says current logic is prototype.

### Test 2 — metabolic signal

Try something like:

- age around 40+
- low activity
- higher waist/weight
- first-degree family history of diabetes

Expected behavior:

- metabolic finding becomes more prominent;
- Jaanch recommends glycemic evidence rather than claiming diabetes;
- investigation priority is described as assessment uncertainty reduction, not a medical order;
- activity/nutrition guidance appears subject to safety context.

### Test 3 — vegetarian + fatigue

Use:

- vegetarian or vegan diet
- fatigue and/or tingling
- no current B12 result

Expected behavior:

- B12/nutrition uncertainty is surfaced;
- vitamin B12 investigation can appear;
- Jaanch does not invent a B12 value or therapeutic dose.

Then add a B12 value from the result screen, for example:

```text
150 pg/mL
```

with a recent collection date.

Expected behavior:

- reassessment becomes lab-informed;
- the previous missing B12 evidence is resolved;
- the B12 test recommendation can disappear;
- measured low B12 can produce clinician-review guidance;
- Jaanch still does not prescribe a high-dose replacement regimen.

### Test 4 — urgent red flag

Select chest pain/pressure, then answer the concerning chest-pain follow-up positively.

Expected behavior:

- urgent escalation appears first;
- routine investigation/action planning is suppressed;
- the app does not continue with a long wellness plan.

### Test 5 — longitudinal history

At the end of an assessment:

1. save the check-in;
2. start a new check-in;
3. change one or two meaningful facts or add new lab evidence;
4. save again.

Expected behavior:

- both snapshots remain in local history;
- latest vs previous comparison appears;
- changes in evidence completeness/findings/investigations/actions/labs are shown.

---

# Run on an Android or iPhone with Expo Go

This is the easiest phone test and is the path I recommend before creating APKs or store builds.

## 1. Install Expo Go on your phone

Install **Expo Go** from Google Play or the iOS App Store.

Expo Go is appropriate for quickly testing this prototype. Expo recommends development builds for production-grade projects, but Expo Go is ideal for first validation.

## 2. Check/fix Expo dependencies

From the repository root:

```bash
cd apps/mobile
npx expo install --fix
npx expo-doctor
cd ../..
```

`expo install --fix` aligns package versions with the installed Expo SDK.

## 3. Start the mobile bundler

From the repository root:

```bash
npm run mobile
```

Expo will display a QR code.

## 4. Open Jaanch on your phone

- Keep the computer and phone on the same Wi-Fi network.
- Android: open Expo Go and scan the QR code.
- iPhone: scan the QR code / open through Expo Go. Expo may require the CLI and Expo Go to be signed in to the same Expo account on a physical iPhone.

If LAN discovery fails, from `apps/mobile` try:

```bash
npx expo start --tunnel
```

Tunnel mode can be slower but is useful when local networking blocks device discovery.

---

# Install Jaanch as a real Android app (APK)

Expo Go is enough for the first test. When you want a standalone installable **Jaanch** icon/app on Android, use EAS internal distribution.

This repository includes `apps/mobile/eas.json`, because Expo recommends keeping EAS files inside the app directory in a monorepo.

## One-time setup

Create/sign in to an Expo account, then:

```bash
cd apps/mobile
npx eas-cli@latest login
npx eas-cli@latest whoami
```

On the first EAS build, Expo may ask to link/create an EAS project. Follow the prompts. Do not manually invent a project ID.

## Build an installable preview APK

From `apps/mobile`:

```bash
npx eas-cli@latest build --platform android --profile preview
```

The `preview` profile uses internal distribution, which produces an installable Android APK rather than the Play Store AAB format.

After the cloud build finishes, EAS gives you a build page/URL. Open that URL on your Android phone and install the APK.

Android may ask permission to install apps from the browser you used. Grant it only for the install, then disable it again if you prefer.

## Development build instead of preview build

A development build includes Expo developer tools and is useful when we add native capabilities beyond Expo Go.

```bash
cd apps/mobile
npx eas-cli@latest build --platform android --profile development
```

Install the generated APK, then run:

```bash
npm run mobile
```

and open the development build.

---

# iPhone installation

For your first iPhone test, use **Expo Go**.

A standalone internal iOS build is more restrictive than Android because Apple requires signing/provisioning and registered devices. EAS can handle this, but you generally need the relevant Apple Developer account/provisioning setup.

When ready:

```bash
cd apps/mobile
npx eas-cli@latest build --platform ios --profile preview
```

For broader iPhone testing, TestFlight is usually the more practical later-stage path.

---

# Mobile app configuration

Current Expo app identity:

```text
Name: Jaanch
Slug: jaanch
Android package: com.amonaval.jaanch
iOS bundle identifier: com.amonaval.jaanch
```

If you intend to publish publicly later, confirm the final bundle/package identity before creating store records because changing identity after distribution has consequences.

---

# Local history / privacy note

M13 stores check-ins locally so you can test the longitudinal product loop now.

Current prototype persistence:

- web: browser `localStorage`;
- mobile: `@react-native-async-storage/async-storage`.

These are convenient local persistence mechanisms, **not encrypted clinical-record storage**.

For now:

- use demo/test data where possible;
- do not treat the browser/mobile storage as a medical-record vault;
- do not share builds containing somebody else's real health data;
- clearing browser site storage or app data can erase local history.

Secure account-backed persistence, encryption/retention policy, export/delete controls, and threat-model work belong to the pre-pilot/release missions.

---

# Optional AI review

The product does **not** require AI to function.

`apps/ai-runtime` contains a server-only optional OpenAI review adapter. API keys must never be placed in React/React Native code.

Live AI is disabled unless explicitly configured. M10 engineering is implemented, but the real-model AI Utility Gate is still pending. M11 should not be treated as approved until that gate demonstrates useful, safe incremental review value.

For your first product test, **ignore AI completely**. Test deterministic Jaanch first.

---

# Useful commands

From repository root:

```bash
# install
npm install

# run all non-live verification
npm run verify

# web
npm run web

# Expo mobile
npm run mobile

# core verification only
npm run verify:core

# server AI-runtime request-construction verification
npm run verify:ai-runtime
```

Mobile diagnostics:

```bash
cd apps/mobile
npx expo install --fix
npx expo-doctor
npx expo start --clear
```

---

# Troubleshooting

## `npm install` fails

Confirm Node first:

```bash
node -v
```

Use Node 22.13+ for the current Expo SDK baseline.

Delete only generated dependency state and reinstall:

```bash
rm -rf node_modules
npm install
```

On Windows PowerShell, delete `node_modules` using Explorer or PowerShell equivalents.

## Expo reports incompatible package versions

```bash
cd apps/mobile
npx expo install --fix
npx expo-doctor
```

Then restart with cache cleared:

```bash
npx expo start --clear
```

## Phone cannot connect to Expo

- computer + phone should normally be on the same Wi-Fi;
- disable restrictive VPN/firewall temporarily if appropriate;
- try:

```bash
cd apps/mobile
npx expo start --tunnel
```

## Expo Go says the SDK is unsupported

Update Expo Go from the store, then run:

```bash
cd apps/mobile
npx expo install --fix
npx expo-doctor
```

## History disappeared

Current M13 history is local prototype storage. Browser clearing/app-data clearing/reinstalling the app can erase it. Cloud/account persistence is intentionally not implemented yet.

---

# Product-development roadmap

## What you should test **now**

After M13, you should already treat Jaanch as a **working product prototype**, not merely an engine demo.

The key user loop is now:

```text
Assess
  ↓
Health Map
  ↓
Identify missing evidence
  ↓
Add targeted lab evidence
  ↓
Reassess
  ↓
Safe action plan
  ↓
Save check-in
  ↓
Retest later
  ↓
Compare improvement/change
```

This is the right time for **you personally to run it and give UX/product feedback** before we add more medical breadth.

## Next recommended missions

### M13.1 — First-Run UX & Product Usability Hardening — HIGH
Do this immediately after your first hands-on test.

Purpose:
- fix anything blocking installation/startup;
- improve onboarding;
- make questionnaire progress clearer;
- improve Health Map visual hierarchy;
- make “what should I do next?” obvious;
- improve empty/loading/error states;
- add reset/delete-history controls;
- remove developer-looking clutter from the primary user journey;
- retain clinical traceability behind expandable detail.

**After M13.1:** the product should feel like a coherent alpha rather than an engineering prototype.

### M13.2 — Persistence & Profile v1 — HIGH
Only after we validate the UX.

Purpose:
- define user/profile identity;
- secure persistence architecture;
- explicit consent/retention/deletion behavior;
- history backup/sync;
- cross-device continuity;
- prepare for backend persistence without coupling the clinical engine to the backend.

Potential implementation can use Supabase later, but local-first testing should come first.

### M13.3 — Report / Lab Capture UX — MEDIUM/HIGH
Purpose:
- easier lab entry;
- report-image/PDF ingestion pipeline;
- extracted values always require confirmation before becoming eligible evidence;
- provenance retained;
- no OCR/AI extraction silently becomes medical truth.

### M10 Utility Gate — HIGH, parallel/optional
Run real-model fixture evaluation when an API/runtime environment is available.

Outcome:
- if AI adds measurable safe value → proceed to M11;
- if it mostly paraphrases → keep M11 deferred.

### M11 — AI Review Comparison & Safe Escalation — HIGH, CONDITIONAL
Only if M10 Utility Gate passes.

Purpose:
- show deterministic vs AI agreements/disagreements;
- show what evidence would resolve disagreement;
- never merge into a silent AI verdict;
- deterministic safety/applicability remains authoritative.

### M13.4 — Narrow Clinical Expansion — HIGH
After the current product loop is validated by real use.

Add only a few high-value domains at a time, for example:
- blood pressure / cardiovascular screening;
- lipids;
- iron/anemia context;
- vitamin D only if justified;
- thyroid screening context where appropriate.

Each domain must bring source/applicability/test/recommendation/golden-scenario coverage with it.

### Strategic Review 3 — HIGH
Run after longitudinal UX + first real usage feedback + whichever AI path survives.

Decision areas:
- is Jaanch genuinely useful after one and multiple check-ins?
- what do users understand incorrectly?
- which domains are worth adding?
- does AI add anything material?
- is the action plan too weak/too broad?
- is the evidence-gathering loop compelling enough for retention?
- what is required before outside pilots?

### M15A — Pilot Safety / Privacy / Release Gate — HIGH
Required before sharing with real external pilot users.

Purpose:
- qualified clinical review of the narrow supported rule set;
- privacy/data model;
- threat model;
- consent;
- delete/export controls;
- accessibility;
- error/telemetry policy;
- reproducible build and verification gate;
- jurisdiction-specific regulatory/claims review.

**After M15A:** Jaanch can move toward a controlled private pilot.

### M14 — MCP / ChatGPT App — HIGH, later
Do this after the standalone product loop is validated.

ChatGPT should become another conversation surface over Jaanch, not the source of clinical truth.

### M15B — Store / Production Hardening — HIGH
- Android/iOS production builds;
- TestFlight / Play internal track;
- crash monitoring;
- release/version migrations;
- backup/recovery;
- app-store assets/policies;
- production operational readiness.

**After M15B + appropriate clinical/legal review:** consider broader release.

---

# When will you see a working product?

**Now / after M13:** working end-to-end prototype. You should start testing it personally.

**After M13.1:** usable alpha with a much cleaner first-run/user experience.

**After M13.2 + M15A:** controlled private-pilot candidate with proper persistence/privacy/safety foundations.

**After selected clinical expansion + M15B:** production-candidate product, subject to real clinical/regulatory review and pilot evidence.

Do **not** wait until M14/M15 to first look at the app. The highest-value input now is your own hands-on usage of the M13 product loop.

---

## Product philosophy

The strongest positioning remains:

> **Jaanch organizes what is known, what is uncertain, what evidence matters next, what changed over time, and what safe action follows — with every conclusion traceable.**

That is the product. AI, backend sync, report extraction, and ChatGPT integration are supporting layers around it.
