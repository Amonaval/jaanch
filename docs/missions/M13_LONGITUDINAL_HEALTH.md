# M13 — Longitudinal Health + Local Persistence

## Goal
Turn Jaanch from a one-time assessment into a repeatable health-evidence loop:

`assess → collect evidence → reassess → save check-in → retest later → compare change`

M13 deliberately uses local-first prototype persistence so the product loop can be tested before introducing identity, cloud storage, backend security, or account complexity.

## Implemented

### Shared longitudinal core
- Versioned `JAANCH-SNAPSHOT-1.0` immutable assessment snapshots.
- Versioned `JAANCH-HISTORY-1.0` history container.
- A snapshot freezes:
  - questionnaire answers;
  - normalized lab evidence;
  - deterministic `AssessmentResult`;
  - deterministic recommendation plan;
  - capture timestamp and stable snapshot ID.
- Newest-first bounded history with configurable retention count.
- Safe encode/decode boundary; malformed persisted data fails closed to an empty history rather than being interpreted as health evidence.

### Comparison model
Latest-vs-previous comparison includes:
- evidence-completeness delta;
- finding status/urgency changes;
- improved/worsened/changed/new/resolved finding classification;
- resolved and newly-added investigations;
- added/resolved/disposition-changed recommendations;
- latest eligible lab value changes by marker.

A shared `buildLongitudinalViewModel()` keeps comparison semantics consistent across React and React Native.

### Web persistence
- Browser `localStorage` key: `jaanch.history.v1`.
- Explicit **Save check-in** action.
- **Start a new check-in** retains saved history but resets current assessment state.
- Saved-check-in list and latest-vs-previous comparison.
- Clear-local-history control.

### Mobile persistence
- `@react-native-async-storage/async-storage`.
- Same snapshot/history format as web.
- Explicit save/new-check-in/clear-history actions.
- Same shared comparison semantics as web.

### Mobile runnable baseline
- Pinned to current stable Expo SDK 57 baseline.
- React 19.2.3 / React Native 0.86.
- Added Expo application config and stable Android/iOS package identifiers.
- Added `expo-dev-client` for future development builds.
- Added EAS `development`, `preview`, and `production` profiles.
- Android preview profile produces an installable APK.

### Developer/product guide
Root `README.md` now includes:
- first web run;
- verification commands;
- concrete manual test scenarios;
- Expo Go physical-phone testing;
- Android preview APK installation through EAS internal distribution;
- development-build path;
- iPhone notes;
- troubleshooting;
- local-storage privacy warning;
- next mission sequence and product maturity checkpoints.

## Verification
Longitudinal golden scenarios cover:
- newest-first snapshot ordering;
- persistence serialization round-trip;
- measured B12 changing a prior nutrition finding;
- lab trend representation;
- resolution of the B12 investigation after eligible evidence;
- shared longitudinal view-model comparison;
- history retention cap;
- corrupted persisted data failing closed.

These scenarios execute the real deterministic Jaanch engine/reassessment/recommendation path.

## Privacy boundary
Current persistence is **prototype local storage**, not production clinical-record storage.

- Browser `localStorage` is not an encrypted medical vault.
- Mobile AsyncStorage is persistent but unencrypted.
- Users evaluating this build should prefer demo/test data.
- Clearing browser storage/app data/reinstalling can remove history.

Account-backed persistence, encryption/retention, delete/export rights, backup/sync, and threat modeling are intentionally deferred until the user journey has been validated.

## Not in M13
- user accounts/authentication;
- cloud synchronization;
- encrypted medical-record storage;
- clinician portal;
- automatic background uploads;
- report OCR/import;
- broader medical-domain expansion;
- AI reconciliation (M11 remains conditional on the real-model M10 Utility Gate).

## Product milestone
After M13, Jaanch should be treated as a **working end-to-end prototype** suitable for the owner/developer to test personally.

The highest-value next input is hands-on product feedback, not another large architecture layer.

## Next
**M13.1 — First-Run UX & Product Usability Hardening — High**

Use findings from real web/phone testing to improve onboarding, questionnaire experience, Health Map hierarchy, next-step clarity, loading/error states, history controls, and the balance between simple primary UX and expandable clinical traceability.
