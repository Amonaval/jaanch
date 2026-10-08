# M04 — Evidence Graph + Finding Model

## Goal
Make every assessment conclusion inspectable as structured evidence rather than opaque rule output.

## Implemented
- Evidence graph with stable node IDs and finding edges.
- Evidence node kinds: observed, derived, missing.
- Evidence source types: questionnaire, measurement, lab, derived, missing.
- Evidence strength and provenance including source question IDs, rule ID/version and derivation formula where applicable.
- Explicit finding links for supporting, contradicting and missing evidence.
- Finding confidence and evidence-level classification separated from risk score.
- Rule execution now aggregates evidence graphs while rejecting conflicting duplicate node IDs.
- Current metabolic, nutrition/B12 and sleep prototype rules migrated to graph evidence.
- BMI represented as a derived fact with height/weight lineage.
- B12 can express measured support or contradiction against questionnaire-only suspicion.
- HAP packets automatically carry the evidence graph through the engine assessment.

## Design rules
1. A score is not disease probability.
2. Confidence describes confidence in the assessment statement, not chance of disease.
3. Missing evidence is a first-class node, not a sentence buried in recommendations.
4. Derived facts must declare their parent evidence and derivation.
5. Rules may reuse evidence concepts, but stable IDs must not collide with different payloads.
6. Clinical thresholds remain prototype-only until sourced/reviewed; M04 does not promote them.

## Deferred
- Cross-domain shared evidence normalization.
- Evidence temporal validity / expiry.
- Source guideline citations at node level.
- Test-priority conversion from missing evidence (M05).
- Production clinical validation.

## Closure
M04 is complete when engine output can answer, for every finding: what supports it, what contradicts it, what is missing, where each fact came from, and how derived facts were calculated.
