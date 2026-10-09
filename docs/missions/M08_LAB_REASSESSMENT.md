# M08 — Lab Reassessment + Normalization/Freshness

## Goal
Turn laboratory values into structured, dated, traceable evidence that can deterministically update an assessment without treating every historical or unverified value as current truth.

## Implemented
- Normalized lab-record model with stable marker IDs.
- Initial markers: HbA1c and Vitamin B12, matching the current narrow domain scope.
- Canonical units, configured plausible ranges, collection date/time, source, verification state and optional reference range capture.
- Jaanch freshness states: recent / aging / stale / future-invalid.
- Freshness windows are product reassessment semantics, not clinical diagnostic-validity periods.
- Only supported-unit, user-confirmed, non-future and non-stale records can affect deterministic reassessment.
- Newest eligible record per marker wins; older records remain visible for history.
- Lab evidence nodes retain originating lab-record IDs plus collection date/source in provenance.
- Deterministic before/after comparison identifies finding changes, resolved/added investigations and resolved evidence gaps.
- Shared `LabReassessmentViewModel` keeps lab status/change wording consistent across React Native and web.
- Manual lab-entry/reassessment flow added to both mobile and web.
- HAP-1.0 can carry normalized lab evidence alongside the engine assessment.

## Verification
Core verification covers:
- recent confirmed B12 applying to reassessment;
- B12 investigation/evidence-gap resolution;
- lab-record provenance on evidence nodes;
- stale lab retained but not applied;
- unverified lab retained but not applied;
- future-dated lab rejection;
- newest eligible result winning when multiple records exist;
- shared lab-reassessment presentation semantics;
- existing safety/evidence/governance scenarios remaining deterministic.

## Scope boundary
M08 does not interpret arbitrary lab panels, parse PDFs, convert every possible lab unit, or establish clinical validity periods. Unit conversion and broader marker coverage should be added only with sourced, testable definitions.

## Product loop unlocked
`Assess → identify missing evidence → enter/ingest lab → normalize → reassess → explain what changed`
