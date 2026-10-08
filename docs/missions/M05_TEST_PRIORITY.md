# M05 — Screening & Test Priority Engine

## Goal
Turn explicit missing-evidence nodes from M04 into a transparent, deduplicated investigation plan without turning Jaanch into a prescribing or test-ordering system.

## Implemented
- Versioned-style investigation catalog with stable IDs, maturity and provenance placeholders.
- Missing-evidence → investigation mappings.
- Priority levels: `essential`, `recommended`, `optional`.
- Priority is explicitly **evidence-reduction priority**, not medical necessity or emergency severity.
- Each recommendation includes rationale, related findings and the exact evidence gaps it can resolve.
- Alternative-group support so multiple tests that address the same gap are not all selected into the minimal set.
- Greedy smallest-useful-set selection based on priority, evidence coverage and configured utility.
- Uncovered evidence gaps remain visible rather than being silently ignored.
- Normal test planning is suppressed when an existing urgent red flag is active.
- Mobile and web Health Map surfaces show the minimal set plus alternatives.
- HAP inherits the structured test plan through `AssessmentResult`.

## Current prototype catalog
- HbA1c → metabolic glycemic-marker gap.
- Fasting glucose → alternative for the same glycemic-marker gap.
- Vitamin B12 → B12 evidence gap.

These are architecture/demo mappings only. Clinical guideline sourcing and medical review are required before production approval.

## Design rules
1. A test is recommended only when it resolves a first-class missing-evidence node linked to a finding.
2. A recommendation must say what uncertainty it reduces.
3. Alternatives for the same evidence gap should not inflate the smallest useful set.
4. The engine must expose evidence gaps for which no investigation mapping exists.
5. Red-flag escalation outranks routine screening plans.
6. Test priority is not a diagnosis, probability, prescription, or medical-necessity determination.
7. Catalog entries remain `prototype` until sourced, reviewed and approved.

## Deferred
- Clinical guideline references and age/sex/population-specific screening rules.
- Cost, availability and laboratory-provider integration.
- Test bundles/panels and specimen requirements.
- Temporal freshness (e.g. whether a recent result already satisfies a gap).
- Special-population safety filtering beyond existing red-flag suppression (M06).
- Clinician-approved investigation protocols.

## Closure
M05 is complete when the engine can answer: what evidence is missing, which investigation(s) can reduce that uncertainty, why each is suggested, which alternatives are redundant, and what the smallest currently useful investigation set is.
