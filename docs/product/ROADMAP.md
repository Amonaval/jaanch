# Jaanch Roadmap

## Phase 1 — Deterministic foundation — COMPLETE
- adaptive questioning;
- versioned rules;
- evidence graph;
- findings + missing evidence;
- investigation priority;
- core verification.

## Phase 2 — Safety, reassessment and actions — COMPLETE
- M06 Safety Gate + Clinical Source Baseline;
- M07 shared Health Map presentation;
- M08 normalized/fresh lab reassessment;
- M09 bounded safety-gated recommendations;
- SR2 applicability/evidence-integrity review;
- M09.1 applicability gating + canonical lab ingestion.

## Phase 3 — Optional harnessed AI — ENGINEERING READY, VALUE NOT YET PROVEN
### M10 — AI Harness Runtime + Privacy/Evaluation — ENGINEERING COMPLETE
- privacy-minimized external packet;
- explicit opt-in;
- eligible-evidence-only sharing;
- strict structured output + local invariant validation;
- server-only OpenAI adapter;
- model/harness/schema trace;
- deterministic fallback;
- offline utility-gate fixtures.

### AI Utility Gate — PAUSED BEHIND ASSESSMENT QUALITY GATE
A real configured model should **not** be evaluated yet as a product-priority task. Poor intake quality would make AI evaluation misleading.

M10 live evaluation resumes only after M13.1 passes the owner trust gate and the packet contains materially richer, preserved context.

### M11 — AI Review Comparison & Safe Escalation — CONDITIONAL
Only if:
1. M13.1 assessment-quality gate passes; and
2. the M10 live AI Utility Gate demonstrates incremental review value without weakening deterministic safety/applicability/evidence rules.

---

# Phase 4 — Longitudinal product loop

## M13 — Longitudinal Health + Local Persistence — COMPLETE
Jaanch supports explicit saved check-ins, immutable snapshots, local web/mobile persistence, retest/new-check-in flow, latest-vs-previous comparison, investigation/action changes, lab trends and shared longitudinal presentation semantics.

## Hands-on review outcome after M13

The first owner test changed the roadmap.

The engine is auditable, but the intake is too shallow, too constrained and too question-by-question to support trustworthy assessment quality.

Material issues found:
- plain/engineering-style UI;
- one question / Next interaction for almost every small field;
- dynamic navigation can lose a previously reached question after Back;
- narrow diagnosis/concern lists;
- no useful manual/Other path for important facts;
- medicine capture too shallow;
- activity capture misses ordinary walking and activity quality;
- height/waist units are not user-friendly;
- known Vitamin D and other labs can be ignored because only currently interpreted markers are prompted;
- detailed context for future AI is incomplete.

Therefore **assessment quality becomes a release-blocking trust gate**.

Canonical product standard: `docs/product/ASSESSMENT_QUALITY_STANDARD.md`.

---

# M13.1 — Assessment Quality Recovery + Block UX v2 — NEXT — HIGH

This replaces the old narrow “first-run UI polish” definition.

M13.1 must address both **evidence capture quality and interaction quality**.

Required outcomes:

### Block flow
- roughly 4–6 primary assessment blocks instead of dozens of question-level navigations;
- About you & measurements;
- Health history & medicines;
- Current health & symptoms;
- Lifestyle;
- Tests/known measurements;
- adaptive follow-up block(s).

### Navigation integrity
- stable visited-block history separate from dynamic eligibility;
- Back/Forward returns to exact visited state;
- no silently lost adaptive questions;
- visible downstream invalidation when an earlier edit changes the plan;
- deep-link/edit exact section/field.

### Capture breadth
Restore the original adaptive direction:
- ~15–25 high-information master fields;
- ~50–100 potential evidence/follow-up fields in the bank;
- only relevant subsets shown;
- breadth of capture does not imply breadth of diagnosis.

### Measurement UX
- height: cm or ft/in;
- waist: cm or in;
- weight: kg / optional lb;
- canonical normalized internal values.

### Conditions / medicines / concerns
- broader searchable/grouped condition choices;
- `Other`/manual condition;
- named medicines + reason/purpose where known;
- named/manual supplements;
- broader concern/symptom groups;
- Other/manual concern;
- free-form context retained as unassessed evidence.

### Activity
- walking explicitly captured;
- steps when known;
- exercise type;
- days/week;
- minutes/session;
- light/moderate/vigorous intensity;
- preserve raw components + derived activity summary.

### Known evidence
Broaden capture beyond current deterministic rules:
- HbA1c/glucose;
- B12;
- Vitamin D;
- total cholesterol/LDL/HDL/triglycerides;
- hemoglobin/ferritin/iron when known;
- TSH/selected thyroid values when known;
- blood pressure;
- other/manual test/measurement.

Unsupported markers are stored as `recorded/unassessed evidence`; they do not alter deterministic findings until an appropriate rule exists.

### Consumer UX
- materially stronger mobile-first visual hierarchy;
- grouped cards/sections;
- useful block progress;
- fewer developer-looking surfaces;
- technical provenance remains available under expandable details;
- Health Map emphasizes what matters / what is missing / what to do next / what changed.

### M13.1 owner trust gate
Must successfully represent realistic profiles including:
1. healthy adult;
2. vegetarian with known low B12 + low Vitamin D;
3. user taking cholesterol + blood-pressure medicine;
4. daily walker with little formal exercise;
5. unlisted condition + unlisted concern;
6. metabolic-risk user with HbA1c/lipids;
7. Back/Edit navigation after adaptive follow-ups exist;
8. urgent chest-pain path;
9. repeat check-in preserving manual/custom facts.

### Milestone after M13.1
**Credible assessment alpha.**

Do not call the product alpha-ready until the owner says the material health context was captured faithfully.

---

# M13.2 — Result Quality + Health Map Consumer UX v3 — HIGH

Now separated from intake recovery so results can be redesigned using the richer evidence model.

Scope:
- simplify results around `What matters`, `What is missing`, `What to do next`, `What changed`;
- show `Recorded but not yet assessed` context clearly;
- improve finding priority/comprehension;
- separate deterministic conclusions from contextual facts;
- make recommendations and tests easy to understand;
- preserve evidence/provenance behind expandable details;
- improve longitudinal comparison readability;
- add `Review/edit my information` from results;
- user comprehension checks for risk vs diagnosis vs missing evidence.

### Milestone after M13.2
**Usable consumer alpha.**

---

# M13.3 — Clinical Evidence Capture v2 / Report UX — HIGH

Scope:
- complete normalized marker catalogue for the broader captured labs;
- fast manual entry;
- report-image/PDF capture;
- extracted candidate values require explicit confirmation;
- date/unit/source/reference-range provenance;
- extraction confidence/errors shown;
- no OCR/AI extraction silently becomes clinical truth;
- unassessed marker storage remains separate from interpreted evidence.

This mission improves evidence ingestion; it does not automatically add interpretation rules for every captured marker.

---

# M13.4 — Narrow Clinical Interpretation Expansion — HIGH

Only after M13.1/M13.2 hands-on quality gates pass.

Potential high-value interpretation modules, added a few at a time:
- blood pressure / cardiovascular screening;
- lipid context;
- iron/anemia context;
- thyroid screening context where justified;
- Vitamin D only if evidence/product value and safety boundaries justify it.

Each interpreted domain must include:
- authoritative source mapping;
- applicability contract;
- evidence model;
- investigation mapping;
- recommendation boundary;
- safety interactions;
- golden scenarios;
- clear distinction between capture and interpretation.

No “100 diseases” rule expansion.

---

# M13.5 — Profile + Secure Persistence Architecture v1 — HIGH

Moved later. Cloud/account architecture should not solidify an intake model we already know is incomplete.

Scope after capture/result model stabilizes:
- profile/user identity;
- explicit consent/retention/delete/export semantics;
- secure persistence architecture;
- backend boundary;
- backup/sync/cross-device continuity;
- migration/version contract;
- keep clinical core independent of storage vendor.

Supabase or another backend may be evaluated here.

---

# M10 live Utility Gate — RESUME AFTER M13.1/M13.2

Evaluate real AI only when the assessment packet is representative enough to judge AI fairly.

Pass only if AI adds useful contradiction/missing-consideration/explanation value while respecting:
- deterministic urgent rules;
- safety/applicability;
- evidence eligibility;
- prototype vs approved authority;
- privacy minimization.

If it mainly paraphrases, keep M11 deferred.

# M11 — AI Review Comparison & Safe Escalation — CONDITIONAL
If M10 passes:
- engine/AI agreements and disagreements;
- evidence needed to resolve disagreement;
- safest interim action;
- never silently merge into one verdict;
- deterministic safety/applicability remains authoritative.

---

# Strategic Review 3 — HIGH

Run after M13.1 + M13.2 and at least one meaningful owner retest of the new assessment.

Review:
- can Jaanch faithfully capture real-world health context?;
- are results understandable/trustworthy?;
- does the evidence-gathering loop feel useful?;
- which clinical interpretations deserve expansion?;
- does AI add measurable value?;
- is longitudinal comparison meaningful?;
- what persistence/privacy model is justified?;
- pilot readiness.

---

# Phase 5 — Pilot and distribution

## M15A — Pilot Safety / Privacy / Release Gate — HIGH
Required before real external pilot users.

Scope:
- qualified clinical review/approval of the deliberately supported rule set;
- source freshness/review process;
- privacy/consent/data-retention model;
- threat model;
- local/cloud encryption decisions;
- delete/export controls;
- accessibility;
- telemetry/error policy;
- reproducible verification/build gate;
- jurisdiction-specific legal/regulatory/claims assessment;
- pilot release checklist.

### Milestone after M15A
**Controlled private-pilot candidate**, assuming assessment-quality, clinical, privacy and legal gates are actually satisfied.

## M14 — MCP / ChatGPT App — HIGH, LATER
Do after standalone Jaanch demonstrates value and the assessment schema is stable.

ChatGPT remains a conversational surface over Jaanch; Jaanch core controls medical sequencing and safety.

## M15B — Store / Production Hardening — HIGH
- production Android/iOS builds;
- Play internal testing / TestFlight;
- crash/error monitoring;
- app/data migrations;
- backup/recovery;
- production persistence hardening;
- store policies/assets;
- operational runbook;
- production release checklist.

---

# Product maturity checkpoints

| Checkpoint | What Jaanch should be |
|---|---|
| **M13 current build** | Engineering prototype with working deterministic loop; intake quality known to be insufficient |
| **M13.1** | Credible assessment alpha: materially complete capture + stable block navigation |
| **M13.2** | Usable consumer alpha: trustworthy intake plus understandable Health Map/results |
| **M13.3/M13.4** | Better evidence ingestion + deliberately broader interpretation where justified |
| **M13.5 + M15A** | Controlled private-pilot candidate with secure persistence/privacy/safety foundations |
| **M15B** | Production-candidate software, still dependent on real clinical/legal/regulatory readiness |

---

## Active product constraints
- Assessment quality is a release-blocking criterion.
- AI must not be used to compensate for incomplete intake.
- Capturing a fact does not authorize deterministic interpretation of that fact.
- Preserve unsupported/manual facts as recorded/unassessed context.
- Broad medical interpretation remains frozen until M13.1/M13.2 pass owner review.
- M11 remains conditional.
- M12 Rule Studio remains deferred until authoring volume is a demonstrated bottleneck.
- Generic overall health score remains dropped.
- Wearables/provider integrations/clinician portal remain deferred until core user value is proven.

## Execution cadence
- Normal missions: 1–2 commits.
- M13.1 corrective quality mission may use 3–4 commits because it spans shared schema, navigation, both UIs and verification.
- High effort for assessment quality, safety, applicability, AI, persistence, clinical expansion and release gates.
- Strategic reviews can change/drop/defer planned work.
