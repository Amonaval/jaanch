# Mission Status

## Strategic Review 3 — COMPLETE

Decision: **CONTINUE WITH MAJOR CHANGES — PAUSE FEATURE EXPANSION, RESET THE CONSUMER EXPERIENCE**.

Full review: `docs/reviews/SR3_CONSUMER_VALUE_WOW_FACTOR.md`  
Scorecard: `docs/reviews/SR3_SCORECARD.json`

### Product truth after SR3

Jaanch has a strong trust/evidence architecture but the visible product is not yet “very good” and does not consistently create a wow moment.

Key SR3 scores:
- safety/evidence integrity: 8.5/10;
- deterministic architecture: 8/10;
- immediate user value: 4.5/10;
- ease/friction: 3.5/10;
- longitudinal pull: 2.5/10;
- wow factor: 2.5/10.

The problem is not primarily correctness. It is **value density**: too much input, too many cards/technical surfaces, too little cross-signal synthesis and too much repeat-use friction.

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

Owner/product-value gates remain open.

## SR3 blockers

### 1. Result synthesis
The current Health Map is logically structured but still behaves like a card wall. The product must compress evidence into 1–3 memorable priorities/themes.

### 2. Repeat-use UX
Current `Start new check-in` resets answers/context/labs. This undermines longitudinal value. Returning users should start from the latest saved profile and answer only what changed.

### 3. Report-first friction
Current report flow requires a saved baseline plus pasted report/OCR text and candidate review. Provenance is good; acquisition/value friction is not.

### 4. Generic actionability
Recommendations are safe but often obvious: exercise, improve eating pattern, repeat BP, discuss abnormal labs with a clinician. Jaanch needs personalized decision synthesis rather than more generic recommendation inventory.

### 5. AI over-investment
M11 engineering is sophisticated but was built before live incremental utility was proven. Further AI expansion is frozen.

## Current milestone

> **Consumer-value reset required — trustworthy alpha foundation, not yet a compelling product and not pilot-ready.**

## NEXT — M13.6

**M13.6 — Consumer Value Reset: Health Intelligence Brief + Smart Recheck**  
Effort: **High**

Mission: `docs/missions/M13.6_CONSUMER_VALUE_RESET_PLAN.md`

Required outcomes:
1. one-screen Health Intelligence Brief;
2. maximum 1–3 priorities/themes;
3. cross-rule synthesis where evidence belongs to one health priority;
4. each priority answers what/why/action/what-can-wait/what-evidence-changes-the-view;
5. evidence-completeness percentage demoted;
6. developer/mock/protocol surfaces removed from primary consumer navigation;
7. Smart Recheck prefilled from latest saved profile;
8. pre-save “what changed” review;
9. evidence/provenance remains available behind details;
10. AI stays optional and cannot define the core brief.

### M13.6 exit gate

Across all five mocks, the first result screen must let the user identify within 10 seconds:
- top concern;
- why;
- next action;
- next evidence.

A returning user must not have to rebuild unchanged profile/history data.

## After M13.6

### M13.7 — Report-First Intelligence + Friction Reduction
Target: report → structured extraction → verify uncertain/high-risk fields → minimum missing context → Health Intelligence Brief.

Only after M13.6/M13.7 owner testing says “I would actually use this again” should M15A pilot hardening resume.

## Frozen until value gates pass

- further AI missions;
- mobile parity work;
- cloud/auth/backend;
- M14 ChatGPT/MCP;
- M12 Rule Studio;
- broad clinical-domain expansion;
- M15A/M15B production/pilot/store hardening.

## Non-negotiable safety constraints

- deterministic urgent/safety/applicability/evidence decisions remain authoritative;
- one measurement is not automatically a diagnosis;
- missing unit/date/source is never guessed;
- no autonomous prescription changes or therapeutic iron/thyroid/lipid/high-dose supplement regimens;
- clinical artifacts remain prototype unless qualified review promotes them;
- current local storage is not described as Jaanch-encrypted medical-record storage;
- AI remains explicit-consent/minimized and optional.

## New north-star test

> **Does this materially improve what a user understands or can decide within 60 seconds?**

If not, defer it.

## Session handover

Canonical state: `HANDOVER_NEXT_SESSION.md`.
