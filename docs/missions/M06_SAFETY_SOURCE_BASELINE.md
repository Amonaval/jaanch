# M06 — Safety Gate + Clinical Source Baseline

## Goal
Make safety context a first-class deterministic engine output and establish clinical-source governance before Jaanch begins generating personalized action recommendations.

## Implemented

### Safety context capture
- Pregnancy / trying-to-conceive / breastfeeding context.
- Prescription medicine use, approximate medicine count, and broad medicine categories.
- Current supplement use and broad supplement categories.
- Medication/supplement allergy or severe-reaction history.
- Kidney disease severity context.
- Liver disease severity context.
- Frailty/fall-risk context for older adults.
- Pediatric context derived from age.

Conditional master questions now respect dependencies, so irrelevant safety questions are not shown to everyone.

### Deterministic Safety Gate v1
`SAFETY-1.0.0` evaluates the supplied answers and produces:
- explicit safety flags;
- urgency state;
- per-action-class disposition: `allowed`, `caution`, `clinician_review`, or `blocked`;
- human-readable reasons for every restriction.

Action classes:
- general lifestyle;
- diet guidance;
- exercise;
- monitoring;
- routine supplements;
- therapeutic/high-dose supplements;
- prescription medicine changes.

Global boundaries:
- Jaanch never autonomously changes prescription medicines.
- Therapeutic/high-dose supplementation requires clinician review by default and may be blocked by special-population context.
- Active urgent red flags block the normal wellness/recommendation flow.

### Clinical source baseline
Added a versioned clinical-source registry containing source identity, issuing body, URL, publication/version metadata where available, population/applicability notes, source status, review status, and last-verification date.

Initial source records:
- ADA Standards of Care in Diabetes—2026, diagnosis/classification section;
- NIH Office of Dietary Supplements Vitamin B12 health-professional fact sheet;
- AASM adult OSA diagnostic-testing guideline;
- CDC heart-attack symptom/urgent-action guidance.

Existing rules and investigation mappings now reference source IDs rather than placeholder prose.

### Governance rules
- Unknown source IDs fail validation.
- Invalid source registry entries fail validation.
- Assessment fails fast on unresolved source references.
- Rule/investigation maturity remains independent of source capture.
- All current clinical rules and investigation mappings remain `prototype` even though sources are captured.
- A source being `captured` does **not** mean the rule was clinician-reviewed or approved.

### Verification
M05.1 was extended to cover:
- default safety posture;
- pregnancy gating;
- advanced kidney disease gating;
- polypharmacy gating;
- red-flag blocking;
- conditional reproductive-context questioning;
- valid clinical-source registry;
- rejection of unknown source IDs;
- deterministic repeatability including safety/governance outputs.

## Important scope boundaries
- M06 does not create treatment protocols.
- M06 does not approve current prototype screening thresholds.
- M06 does not infer medicine interactions from free-text drug names.
- M06 does not broaden Jaanch into new clinical domains.
- Detailed interaction databases and therapeutic dosing remain outside current scope.

## Source-review lifecycle
`captured → reviewed → approved`

`captured` means the source exists in the registry and its applicability notes are recorded.
`reviewed` means a qualified clinical review has assessed the source mapping.
`approved` means the governed rule/mapping is permitted for its defined production use.

Promotion is explicit; time in the codebase never promotes maturity automatically.

## Closure
M06 is complete when special-population context deterministically gates future recommendation classes, urgent states override normal guidance, every current rule/test mapping resolves to a registered source, and prototype logic remains visibly non-approved.
