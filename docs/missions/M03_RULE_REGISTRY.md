# M03 — Versioned Rule Registry v1

## Goal
Move clinical/screening logic out of the assessment orchestrator into a deterministic, auditable rule registry.

## Delivered
- Versioned rule definition contract with stable rule IDs.
- Rule kind, domain, enabled state, maturity, and provenance/source fields.
- Registry validation for duplicate IDs/versions, semantic versions, and missing provenance.
- Central rule execution with a per-rule trace.
- Findings now carry the generating rule ID and rule version.
- Red-flag logic is registered alongside ordinary finding rules instead of being hard-coded in the engine.
- Existing metabolic, B12/nutrition, sleep, and chest-pain prototype logic migrated into registry rules.
- Assessment engine reduced to orchestration: plan questions → execute rules → assemble result.

## Maturity model
- `prototype`: development heuristic; not production-clinically approved.
- `reviewed`: source and implementation reviewed.
- `approved`: approved for the product's defined production scope.

The initial rules remain explicitly `prototype`; placeholder provenance text makes this visible rather than implying validated clinical authority.

## Rule invariant
No React/React Native view may contain clinical thresholds or finding logic. UI consumes outputs only.

## Acceptance criteria
1. Duplicate rule versions fail registry validation.
2. Every rule has a semantic version and provenance entry.
3. Every executed rule emits trace metadata.
4. Every finding can identify the rule/version that generated it.
5. Red flags use the same auditable execution path.
6. Assessment orchestration contains no domain scoring logic.

Status: COMPLETE
Effort: High
Next: M04 Evidence Graph + Finding Model after Batch A verification.
