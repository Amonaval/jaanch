# Jaanch Product Constitution

Version: 0.3
Status: Foundational

## Article 1 — Purpose
Jaanch provides screening, preventive-health organization, evidence-gap detection, reassessment, and low-risk health guidance. It must communicate uncertainty and must never present questionnaire-only inference as a confirmed diagnosis.

## Article 2 — Authority hierarchy
1. Urgent safety rules and hard contraindications.
2. Population/applicability constraints.
3. Confirmed measurements and verified medical history.
4. Deterministic assessment rules.
5. Evidence-based screening guidance encoded in the knowledge base.
6. Optional AI assessment operating under the AI Harness.
7. General educational explanation.

No lower layer may silently override a higher layer.

## Article 3 — Evidence states
Every meaningful conclusion should be expressible as one of:
- Confirmed / measured
- Strongly supported
- Possible / screening signal
- Insufficient evidence
- Conflicting evidence
- Unsupported context

## Article 4 — Canonical evidence ingestion
A measured value that can materially affect a health finding must pass through its canonical evidence contract.

For lab evidence this includes, where applicable:
- normalized marker identity;
- value and supported unit;
- collection date/time;
- source/provenance;
- verification state;
- freshness/eligibility state;
- stable evidence-record identity.

A bare questionnaire number must not bypass these requirements and silently become current lab-informed evidence.

Historical, stale, future-dated, unverified or otherwise ineligible evidence may be retained for transparency, but it must not silently drive the same interpretation as eligible current evidence.

## Article 5 — Population applicability
Every clinically meaningful rule, investigation mapping, recommendation and treatment-like policy must have a defined applicability context appropriate to its maturity.

Applicability may include:
- age range;
- pregnancy/postpartum/reproductive context;
- sex-specific context where medically relevant;
- kidney/liver status;
- chronic disease context;
- required evidence type;
- explicitly unsupported populations.

If applicability is not satisfied, Jaanch must suppress the inapplicable interpretation or return an explicit unsupported/clinician-review state. A downstream warning is not a substitute for preventing inapplicable upstream logic.

## Article 6 — Treatment boundaries
Jaanch may recommend general lifestyle measures and ordinary low-risk wellness actions. Therapeutic medication changes, prescription treatment, high-dose replacement regimens, or disease-specific treatment protocols require an approved clinical rule and appropriate safety/applicability gating. If such an approved rule is absent, the system must recommend clinician review rather than invent a regimen.

## Article 7 — Special populations
Pregnancy, breastfeeding, children, older frail adults, kidney disease, liver disease, complex polypharmacy, severe chronic disease, transplant/dialysis states, or known contraindication states must increase conservatism and may suppress findings, investigations or self-treatment advice when the underlying rule is not applicable.

## Article 8 — Red flags
Potential emergencies override the ordinary assessment experience. The application must clearly recommend urgent evaluation where configured red-flag combinations are met.

Absence of a configured red flag means only that no configured pattern fired. It must not be represented as proof that no urgent condition exists.

## Article 9 — Clinical provenance and maturity
Clinical rules, investigation mappings, recommendations, and clinically meaningful safety/applicability policies must carry explicit maturity and source/provenance context where appropriate.

- `prototype`: may be used for product development, never presented as clinically approved logic.
- `reviewed`: source mapping and review have occurred but production approval may still be pending.
- `approved`: requires defined source provenance, applicability context, and approval under the product's clinical-governance process.

A clinical artifact must never silently become more authoritative merely because it has existed in the codebase for a long time.

## Article 10 — Explainability
Every deterministic finding must retain:
- rule identifier;
- inputs that triggered it;
- applicable population/context;
- relevant measurements;
- supporting/contradicting/missing evidence;
- recommended next action;
- rule version;
- maturity/provenance context.

Investigation and recommendation outputs must likewise retain source, maturity and applicability context.

## Article 11 — Investigation priority
Investigation priority expresses how useful an item is for reducing current assessment uncertainty. It does **not** by itself mean medical necessity, emergency severity, or that a test has been ordered by a clinician.

An investigation mapping that is not applicable to the current population/context must not be shown as an ordinary next step merely because it resolves a missing evidence node.

## Article 12 — Input consistency
Questionnaire facts must be normalized before clinical rule execution.

Exclusive states such as `none` must not coexist with contradictory positive selections. Impossible or unresolved combinations must be surfaced explicitly rather than silently interpreted differently by separate layers.

## Article 13 — AI usage
AI is optional. When used, it receives a minimized, versioned Health Assessment Packet or derivative AI packet plus the versioned AI Harness. Its output is advisory and standardized.

AI must not:
- mutate deterministic production rules;
- invent missing patient facts;
- relax deterministic urgent/safety/applicability restrictions;
- treat stale/unverified/ineligible evidence as active current evidence;
- upgrade `prototype` or `reviewed` artifacts into clinical authority;
- create a medication regimen outside the permitted recommendation class.

AI failure, timeout or invalid output must not degrade the deterministic assessment.

## Article 14 — Privacy
Collect only information required for assessment. Use clear consent for storage and external sharing. Minimize retention and distinguish local assessment data from externally shared AI packets.

Live AI review must be opt-in and receive the minimum information required for the approved AI-review purpose.

## Article 15 — Product honesty
Do not market a health score as clinical truth. Do not imply regulatory approval unless obtained. Do not use wording such as “AI doctor” or “diagnoses all diseases.” Do not imply that an optional AI reviewer makes prototype rules clinically approved.
