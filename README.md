# Jaanch

**Jaanch** is a deterministic, evidence-aware personal health assessment and prevention prototype.

It captures health context, separates facts from inference/uncertainty, applies deterministic safety/applicability/evidence gates, supports measured/report evidence and longitudinal check-ins, and now compresses supported results into a **Health Intelligence Brief**.

> Jaanch is a development prototype, not a medical device, diagnosis service or replacement for a clinician. Current clinical rules remain `prototype` unless explicitly promoted by qualified review. Current browser/mobile local storage and exported JSON files can contain sensitive health information.

---

## Current direction after Strategic Review 3

SR3 found that Jaanch's trust/evidence architecture was much stronger than its consumer experience.

Decision:

> **CONTINUE WITH MAJOR CHANGES — maximize visible health insight and repeat-use value before more platform work.**

M13.6 implements the first consumer-value reset.

Current milestone:

> **Health Intelligence Brief + Smart Recheck + user-owned portable history web alpha candidate. Owner value / UX validation remains open.**

Engineering completion is not a claim that the “wow” gate passed.

Full review:

```text
docs/reviews/SR3_CONSUMER_VALUE_WOW_FACTOR.md
```

---

# M13.6 — Health Intelligence Brief

Instead of leading with counters and many independent cards, the first result aims to answer:

1. **What matters most?**
2. **Why does it matter for me?**
3. **What should I do next?**
4. **What can wait?**
5. **What evidence would most change this view?**

The brief shows at most three deterministic health priorities/themes.

Current bounded synthesis includes:

```text
cardiometabolic
  metabolic/body context + BP + lipids

blood / nutrition
  B12/nutrition + anaemia/iron

thyroid
sleep
```

Urgent safety remains separate and authoritative.

Low-risk profiles are allowed to remain quiet instead of receiving generic filler advice.

Full findings, evidence completeness, raw captured context, provenance, governance and HAP JSON remain available under evidence/clinical details rather than dominating the first screen.

---

# Smart Recheck

A returning user no longer needs to rebuild the profile from zero.

```text
latest saved check-in
      ↓
restore stable profile/history/medicines/evidence
      ↓
Quick Recheck asks mainly what changed
      ↓
preview deterministic changes
      ↓
save new immutable check-in
```

The quick path initially emphasizes likely-to-change facts such as:
- weight/waist;
- current concerns;
- sleep;
- activity;
- new tests/measurements.

If medicines, diagnoses or other important history changed, the user can jump into focused/full editing.

Saved derived clinical eligibility is not trusted blindly; evidence is rerun through the current engine.

---

# My Jaanch file — no account required

Jaanch now treats history as **user-owned portable data**.

Primary consumer navigation includes **My Jaanch file**.

The user can:

```text
finish Jaanch
   ↓
download jaanch-health-YYYY-MM-DD.json
   ↓
keep it in a folder/device/storage they control
   ↓
next visit: upload that file
   ↓
restore saved check-ins locally
   ↓
Quick Recheck → what changed?
```

The existing versioned `JAANCH-PROFILE-1.0` format carries:
- latest runnable profile state;
- captured health context;
- evidence needed to rerun the current engine;
- optional longitudinal history.

No name is required by the Jaanch model and this workflow does not require a Jaanch account, remote database or cloud sync.

Important privacy truth:
- the imported/exported file is processed in the browser in this current workflow;
- Jaanch does not need backend custody of that file;
- the file itself can still contain sensitive health data, especially user-entered free text;
- users should store/email it only where they are comfortable keeping personal health information.

Emailing the file to oneself is an optional user choice, not a Jaanch storage mechanism.

### Established facts

A future/repeat session should reuse established facts rather than ask everything again.

Age requires care: an earlier integer age plus a timestamp does **not** reveal the exact birthday, so Jaanch should carry it as a default and ask for correction/confirmation when materially stale rather than silently pretending it knows an exact updated age.

---

# Consumer navigation

Primary:
- Latest Health Brief, when history exists;
- My Jaanch file;
- Import lab report.

Advanced / experimental:
- AI second opinion;
- Profiles & test mocks.

AI does not define the core Health Brief.

---

# Current clinical boundaries

Supported bounded prototype interpretation includes:
- metabolic screening;
- B12/nutrition;
- sleep;
- chest-pain red-flag escalation;
- blood pressure;
- lipids;
- anaemia/iron status;
- thyroid evidence.

Important constraints:
- one measurement is not automatically a diagnosis;
- missing unit/date/source is not guessed;
- no autonomous prescription-medication changes;
- no autonomous therapeutic iron/thyroid/lipid/high-dose supplement regimen;
- unsupported contexts remain recorded/unassessed rather than silently inferred.

---

# Run locally

Prerequisites:
- Node.js **22.13+**
- npm 10+ recommended

```bash
git pull
npm install
npm run verify
npm run web
```

Fresh clone:

```bash
git clone https://github.com/Amonaval/jaanch.git
cd jaanch
npm install
npm run verify
npm run web
```

No GitHub CI success should be assumed; run local verification.

---

# Owner validation now

Test all five mock profiles and judge only the first-screen brief first.

Within ~10 seconds you should know:
- top concern;
- why;
- next action;
- next evidence.

Then test:
1. save a check-in;
2. download **My Jaanch file**;
3. clear/local-reset in a test browser if desired;
4. upload the file;
5. verify history returns;
6. run Quick Recheck;
7. verify established facts are reused and the change preview is useful.

If this still feels merely “okay”, fix M13.6 before expanding scope.

---

# Conditional next — M13.7

**Report-First Intelligence + Friction Reduction — High**

Only after M13.6 value testing is convincingly positive.

Target:

```text
upload report
→ extract structured candidates
→ verify uncertain / safety-critical fields
→ reuse user-owned Jaanch history when supplied
→ ask only minimum missing context
→ Health Intelligence Brief
→ export updated Jaanch file
```

This keeps the product viable as a small, free, frontend-first utility without requiring user accounts or Jaanch-hosted health history.

---

## Frozen until value gates pass

- further AI expansion;
- mobile parity;
- cloud/auth/backend;
- M14 ChatGPT/MCP;
- M12 Rule Studio;
- broad clinical-domain expansion;
- M15A/M15B pilot/production/store work.

## Product north stars

> **Does this materially improve what the user understands or can decide within 60 seconds?**

> **Can the user repeat the key insight after closing Jaanch?**

> **Does the output justify the information the user had to provide?**

For a fresh session, start with `HANDOVER_NEXT_SESSION.md`, STATUS, ROADMAP, M13.6 and SR3.
