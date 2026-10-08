# M05.1 — Core Verification Harness

## Goal
Create executable golden scenarios for the shared deterministic core before adding more safety-critical logic.

## Implemented
- Shared-core verification runner with representative answer fixtures.
- Runnable command: `npm run verify:core`.
- Healthy / low-signal baseline scenario.
- High metabolic screening signal scenario.
- Vegetarian + fatigue/tingling with missing B12.
- Measured low B12.
- Measured B12 contradicting questionnaire-only suspicion under the current prototype cutoff.
- Red-flag chest-pain interruption and test-plan suppression.
- Skip / unknown handling.
- Alternative-investigation de-duplication.
- Uncovered missing-evidence preservation.
- Evidence-graph invariant failure detection.
- Deterministic repeatability for identical inputs.

## Design rule
The verification harness executes the real shared core. It does not duplicate rule logic in expected-value helpers.

## Scope boundary
These scenarios verify software behavior and deterministic consistency. They do not clinically validate the prototype medical thresholds or investigation mappings.

## Closure
M05.1 is complete when a single command exercises the representative scenarios and fails fast when any invariant or expected behavior regresses.
