# Jaanch Product Constitution

Version: 0.2
Status: Foundational

## Article 1 — Purpose
Jaanch provides screening, preventive-health organization, evidence-gap detection, and low-risk health guidance. It must communicate uncertainty and should never present questionnaire-only inference as a confirmed diagnosis.

## Article 2 — Authority hierarchy
1. Urgent safety rules and hard contraindications.
2. Confirmed measurements and verified medical history.
3. Deterministic assessment rules.
4. Evidence-based screening guidance encoded in the knowledge base.
5. Optional AI assessment operating under the AI Harness.
6. General educational explanation.

No lower layer may silently override a higher layer.

## Article 3 — Evidence states
Every meaningful conclusion should be expressible as one of:
- Confirmed / measured
- Strongly supported
- Possible / screening signal
- Insufficient evidence
- Conflicting evidence

## Article 4 — Treatment boundaries
Jaanch may recommend general lifestyle measures and ordinary low-risk wellness actions. Therapeutic medication changes, prescription treatment, high-dose replacement regimens, or disease-specific treatment protocols require an approved clinical rule and appropriate safety gating. If such an approved rule is absent, the system must recommend clinician review rather than invent a regimen.

## Article 5 — Special populations
Pregnancy, breastfeeding, children, older frail adults, kidney disease, liver disease, complex polypharmacy, severe chronic disease, or known contraindication states must increase conservatism and may suppress self-treatment advice.

## Article 6 — Red flags
Potential emergencies override the ordinary assessment experience. The application must clearly recommend urgent evaluation where configured red-flag combinations are met.

## Article 7 — Clinical provenance and maturity
Clinical rules, investigation mappings, and treatment-like recommendations must carry explicit maturity and source provenance.

- `prototype`: may be used for product development, never presented as clinically approved logic.
- `reviewed`: source mapping and review have occurred but production approval may still be pending.
- `approved`: requires defined source provenance, applicability context, and approval under the product's clinical-governance process.

A rule or investigation mapping must never silently become more authoritative merely because it has existed in the codebase for a long time.

## Article 8 — Explainability
Every deterministic finding must retain:
- rule identifier,
- inputs that triggered it,
- relevant measurements,
- supporting/contradicting/missing evidence,
- recommended next action,
- rule version,
- maturity/provenance context.

## Article 9 — Investigation priority
Investigation priority expresses how useful an item is for reducing current assessment uncertainty. It does **not** by itself mean medical necessity, emergency severity, or that a test has been ordered by a clinician.

## Article 10 — AI usage
AI is optional. When used, it receives the Health Assessment Packet plus the versioned AI Harness. Its output is advisory and standardized. It cannot mutate deterministic production rules, invent missing patient facts, or create a medication regimen outside the permitted recommendation class.

## Article 11 — Privacy
Collect only information required for assessment, use clear consent for storage/sharing, minimize retention, and distinguish local assessment data from externally shared AI packets.

## Article 12 — Product honesty
Do not market a health score as clinical truth. Do not imply regulatory approval unless obtained. Do not use wording such as “AI doctor” or “diagnoses all diseases.”
