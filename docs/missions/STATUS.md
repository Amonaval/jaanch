# Mission Status

## Completed
- M01 — Foundation + Constitution: IMPLEMENTED (prototype scope)
- M02 — Adaptive Question Planner v1: IMPLEMENTED
- M03 — Versioned Rule Registry: IMPLEMENTED
- M04 — Evidence Graph + Finding Model: IMPLEMENTED

## M04 closure
- Findings reference stable evidence-node IDs instead of anonymous evidence strings.
- Evidence graph distinguishes observed, derived and missing evidence.
- Support, contradiction and missing-for relationships are explicit.
- Provenance carries source questions plus rule ID/version; derived facts carry formula lineage.
- Finding confidence is separate from score and disease probability.
- Current prototype rules were migrated without expanding clinical scope.

## Next
M05 — Screening & Test Priority Engine
Focus: convert missing-evidence nodes into ranked investigations (essential / recommended / optional), explain why each test is useful, suppress redundant tests, and identify the smallest useful evidence set.

After M05: Strategic Review 1.

## Execution agreement
- Repository: `Amonaval/jaanch`
- Commit budget: 1–2 commits per mission
- Default effort: Medium
- High-effort missions: M03, M04, M06, M09, M11, M14, M15
- Strategic reviews: SR1 after M05; SR2 after M09; SR3 after M13
- Mission batching is allowed only for adjacent, tightly-coupled missions; each mission still closes independently.
