# M09.1 — Clinical Applicability & Evidence Integrity Gate

## Goal
Close the SR2 blockers before any live AI reviewer is introduced. Clinical logic must only execute in supported populations, investigation planning must respect the same applicability contract, questionnaire contradictions must be normalized, and lab-informed findings must come through one canonical normalized lab-evidence path.

## Implemented

### 1. First-class applicability policies
- Added versioned applicability policy records with maturity, provenance, source IDs and population constraints.
- Current policies explicitly cover:
  - adult nonpregnant metabolic screening;
  - adult B12/nutrition screening;
  - adult sleep screening;
  - general configured chest-pain red-flag escalation.
- Rule execution checks applicability before creating findings/evidence.
- Unsupported rules remain visible in trace as `unsupported_context` or `clinician_review`; they do not run and then merely receive a downstream warning.

### 2. Applicability-aware investigations
- Investigation definitions carry applicability policy IDs.
- Test planning evaluates applicability before presenting a mapped investigation.
- Inapplicable investigations are suppressed and retained as traceable suppression records with reasons.
- Investigation priority still means uncertainty-reduction priority, not medical necessity.

### 3. Recommendation applicability
- Recommendation candidates carry the same applicability policy contract.
- Recommendation generation normalizes answers and suppresses unsupported candidates before safety disposition is applied.
- M06 safety remains authoritative after applicability; the stricter disposition still wins.

### 4. Canonical lab-evidence path
- Raw `hba1c` and `b12` questionnaire questions were removed.
- Public `assess()` strips bare `hba1c` / `b12` answer fields, even if supplied programmatically.
- Only the M08 normalized `LabRecord` pipeline can mark those internal answer IDs as trusted evidence.
- Trusted lab evidence still requires supported marker/unit, collection date, plausible range, user confirmation and freshness eligibility.
- The trusted helper is intentionally not exported from the package public API.

### 5. Input normalization
- Exclusive `none` selections cannot coexist with positive `diagnosedConditions` or `currentConcerns` in the UI.
- Core normalization also resolves those contradictions defensively, so alternate clients cannot bypass the rule.
- Input-normalization events are retained in `AssessmentResult.inputValidation` and surfaced to users.

### 6. Expanded governance
Clinical governance now inventories:
- rules;
- investigations;
- recommendations;
- applicability policies;
- product safety policy IDs;
- referenced and unresolved clinical sources.

Source capture still does not imply clinical approval. All current mappings/policies remain `prototype` unless explicitly reviewed/approved later.

### 7. Shared UX
Added a platform-neutral applicability/integrity view model consumed by React Native and React web. It explains:
- rule suppression;
- investigation suppression;
- contradictory-input normalization;
- clear state when no configured applicability limitation fired.

## Verification additions
Golden scenarios now prove:
- pediatric users do not receive adult metabolic/B12/sleep findings;
- pregnancy suppresses the current nonpregnant metabolic rule and glycemic test mapping upstream;
- bare B12/HbA1c numbers cannot become lab-informed evidence;
- recent confirmed normalized LabRecords can become lab-informed evidence;
- stale, future-dated and unverified labs remain ineligible;
- contradictory `none + positive` multi-select states normalize deterministically;
- governance includes recommendation/applicability artifacts;
- advanced kidney safety restrictions remain intact;
- deterministic repeatability is preserved.

## Product boundary
Applicability policies express the populations for which the **current Jaanch prototype logic** is configured. They do not claim that excluded populations should never receive the underlying clinical test or evaluation. An `unsupported_context` state means Jaanch should not apply this particular prototype mapping automatically.

## Next
M10 — AI Harness Runtime + Privacy/Evaluation — High effort.

M10 must consume the stronger M09.1 evidence/applicability semantics and prove incremental AI utility before M11 proceeds.
