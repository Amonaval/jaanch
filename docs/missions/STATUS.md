# Mission Status

## Strategic Review 3 — COMPLETE

Decision: **CONTINUE WITH MAJOR CHANGES — PAUSE FEATURE EXPANSION, RESET THE CONSUMER EXPERIENCE**.

Full review: `docs/reviews/SR3_CONSUMER_VALUE_WOW_FACTOR.md`  
Scorecard: `docs/reviews/SR3_SCORECARD.json`

## Engineering implemented

- M01–M09.1 — deterministic foundation/evidence/safety/applicability/investigations/recommendations
- M10 — AI harness/privacy/runtime
- M10.1 — live web AI review engineering; real-model utility unproven
- M11 — contextual/longitudinal AI review v2 engineering; utility unproven
- M13 — local longitudinal history
- M13.1 — assessment-quality recovery
- M13.2 — consumer Health Map
- M13.3 — reviewed report evidence capture
- M13.4 — bounded BP/lipids/anaemia-iron/thyroid interpretation
- M13.5 — profile + secure-persistence architecture
- **M13.6 — Health Intelligence Brief + Smart Recheck + user-owned portable history — ENGINEERING IMPLEMENTED; OWNER VALUE RETEST OPEN**

## M13.6 implemented

### Health Intelligence Brief
- at most three deterministic consumer priorities/themes;
- cross-rule cardiometabolic synthesis;
- joined B12 + anaemia/iron synthesis;
- thyroid/sleep focused themes;
- urgent safety stays separate/dominant;
- each priority shows what/why/action/what-can-wait/decision-changing evidence;
- low-risk profiles may stay quiet;
- evidence completeness, raw context, governance and HAP detail are demoted behind expandable detail.

### Smart Recheck
- latest saved profile/history prefilled;
- stable medicines/supplements/family/history context retained;
- likely-to-change facts shown first;
- focused routes for changed medicines/history/tests/lifestyle;
- normalized lab eligibility is recomputed rather than blindly reused;
- internal `__m134_*` evidence fields stripped;
- deterministic “what changed” preview before saving.

### User-owned portable history
Primary consumer navigation now includes **My Jaanch file**.

The existing `JAANCH-PROFILE-1.0` bundle is used as the portable file rather than adding another protocol.

Consumer workflow:

```text
save check-in
→ download jaanch-health-YYYY-MM-DD.json
→ keep it in user-controlled storage
→ next visit upload the file
→ history restored locally
→ Quick Recheck
→ inspect what changed
→ export updated file
```

No Jaanch account/backend/database is required for this workflow.

Privacy truth:
- no name is required by Jaanch;
- current file import/export does not require Jaanch backend custody;
- exported files can still contain sensitive health information/free text;
- user chooses where to store or email the file.

An earlier integer age + timestamp does not reveal an exact birthday. Carry forward established age as a default and request confirmation/correction only when materially stale; do not silently manufacture an exact updated age.

### Navigation simplification
Primary:
- Latest Health Brief when history exists;
- My Jaanch file;
- Import lab report.

Advanced / experimental:
- AI second opinion;
- Profiles & test mocks.

## Current milestone

> **Health Intelligence Brief + Smart Recheck + portable-history web alpha candidate — owner 10-second comprehension / repeat-use / wow gate remains open.**

This is not pilot-ready and not a claim that the wow gate passed.

## Owner gate

For each of five mocks, within ~10 seconds user should know:
- top concern;
- why;
- next action;
- next evidence.

Portable/repeat-use gate:
1. save a check-in;
2. download My Jaanch file;
3. import it in a clean/test session;
4. verify history is restored;
5. verify Quick Recheck reuses established facts;
6. confirm change preview is meaningful;
7. export the updated file again.

Any hands-on value/trust defect outranks M13.7.

## Verification

`npm run verify` includes M13.6 deterministic checks for:
- max-three priority cap;
- quiet low-risk behavior;
- cardiometabolic clustering;
- B12 + iron/anaemia clustering;
- thyroid dominance + medication boundary;
- severe-TG dominance without emergency inflation;
- Smart Recheck stable-context retention;
- lab re-eligibility boundary;
- internal evidence stripping;
- deterministic brief repeatability.

Existing profile-bundle verification continues to cover versioned import/export/rerun and history-preserving export semantics.

Full local workspace verification was **not run in the implementation environment**. Do not claim local or CI success until run in a normal checkout.

## Conditional next

If M13.6 owner testing is convincingly positive:

**M13.7 — Report-First Intelligence + Friction Reduction — High**

Target:

```text
upload report
→ structured extraction
→ verify uncertain/high-risk fields
→ optionally load prior Jaanch file
→ ask only minimum missing context
→ Health Intelligence Brief
→ export updated Jaanch file
```

This supports a small frontend-first/free utility model with user-owned history and no backend account requirement.

If M13.6 still feels merely “okay”, fix M13.6 instead of expanding scope.

## Frozen until value gates pass

- further AI missions;
- mobile parity;
- cloud/auth/backend;
- M14 ChatGPT/MCP;
- M12 Rule Studio;
- broad clinical-domain expansion;
- M15A/M15B pilot/production/store hardening.

## Non-negotiable safety constraints

- deterministic urgent/safety/applicability/evidence decisions remain authoritative;
- one measurement is not automatically a diagnosis;
- missing unit/date/source is never guessed;
- no autonomous prescription changes or therapeutic iron/thyroid/lipid/high-dose supplement regimens;
- clinical artifacts remain prototype unless qualified review promotes them;
- current local/exported storage is not described as inherently secure/encrypted medical-record storage;
- AI remains explicit-consent/minimized and optional.

## North-star test

> **Does this materially improve what a user understands or can decide within 60 seconds?**

Canonical handover: `HANDOVER_NEXT_SESSION.md`.
