# Jaanch Assessment Quality Standard

Status: ACTIVE product-quality contract
Date: 2026-10-09

## Why this exists

Hands-on use after M13 exposed a critical gap: the underlying engine is auditable, but the intake experience is still too shallow and too question-by-question to support high-quality assessment.

Jaanch succeeds or fails on the quality of the evidence it captures. A polished inference engine operating on incomplete, constrained or accidentally lost input is not a useful health product.

This document is now a product gate for all future missions.

## Core quality rule

**Capture completeness before inference sophistication.**

Jaanch must distinguish:

1. facts it can capture;
2. facts it can deterministically interpret today;
3. facts it can retain as unassessed context;
4. missing evidence;
5. unsupported clinical contexts.

A fact must not disappear simply because no current Jaanch rule knows how to interpret it.

Example: if a user knows Vitamin D is low, Jaanch should capture the actual value, unit and date. Until a sourced Vitamin-D rule exists, the result can say `recorded — not yet deterministically interpreted` rather than ignoring the value or manufacturing a conclusion.

---

# Assessment architecture target

## Potential evidence/question bank

The original product direction remains correct:

- roughly 10–20 high-information master inputs;
- roughly 50–100 potential questions/evidence fields available across the full bank;
- usually only a relevant subset should be shown;
- answers activate adaptive follow-up blocks;
- high-risk/safety clarification can interrupt the normal flow.

The product must **not** require 50–100 individual Next clicks.

## Navigation target

Typical initial assessment should feel like approximately **4–6 blocks/screens**, for example:

1. **About you & measurements**
   - age / sex context;
   - height;
   - weight;
   - waist;
   - measurement-unit preference.

2. **Health history & medicines**
   - diagnosed conditions;
   - other/manual conditions;
   - prescription medicines;
   - named/manual medicine entries;
   - medicine purpose/indication where useful;
   - supplements;
   - allergies/adverse reactions.

3. **Current health & symptoms**
   - common concerns;
   - broader symptom groups;
   - other/manual concern;
   - free-text context that is preserved as unassessed narrative unless explicitly structured.

4. **Lifestyle**
   - walking;
   - steps when known;
   - structured exercise type;
   - days/week;
   - minutes/session;
   - intensity;
   - sedentary time where useful;
   - diet pattern;
   - sleep;
   - tobacco/alcohol where supported by scope.

5. **Known measurements, tests & abnormalities**
   - blood pressure if known;
   - HbA1c/glucose;
   - Vitamin B12;
   - Vitamin D;
   - lipids;
   - thyroid-related values where known;
   - CBC/iron/ferritin where known;
   - other/manual lab or measurement records.

6. **Adaptive follow-up block(s)**
   - only domains activated by earlier evidence;
   - safety questions can interrupt immediately;
   - follow-ups should normally reveal in grouped sections, not as isolated single-question pages.

The exact number of blocks may vary, but the product goal is **few navigations, richer blocks**.

---

# Navigation integrity requirements

The assessment must never lose or reorder a question in a way that makes the user unable to return to what they just answered.

Required behavior:

- Back returns to the exact previous block/state the user saw.
- Forward returns to the next visited block when possible.
- Dynamic re-planning must not destroy navigation history.
- Previously entered values remain visible and editable.
- Newly activated follow-ups appear predictably in the appropriate block or next adaptive block.
- A summary/edit view can deep-link back to the exact block/field.
- Changing an earlier answer may invalidate downstream answers, but the user must be told what changed; data must not silently disappear.
- Block-level completion/progress replaces a misleading per-question remaining count.
- Safety interruption is explicit and must preserve the user's prior flow state.

A regression test must cover the exact bug observed in hands-on use: going Back and then Next must not lose a dynamically planned question.

---

# Measurement capture requirements

## Height
UI supports:
- cm;
- ft + in.

Store a normalized canonical value internally.

## Waist circumference
UI supports:
- cm;
- inches.

Store normalized canonical value internally.

## Weight
Support kg and optionally lb where platform/user preference warrants it. Store normalized kg internally.

The unit selector must be visible at the point of entry; users should not have to mentally convert.

---

# Diagnoses / conditions

The current short option list is insufficient.

Required model:

- searchable/broader common-condition catalogue;
- category grouping rather than one huge flat list;
- `None / not diagnosed` remains mutually exclusive;
- `Other condition` always available;
- manual text entry preserved;
- optional structured metadata later: diagnosis year, active/resolved, severity, clinician-confirmed.

Capturing a condition does not automatically mean Jaanch has a rule for it.

Unsupported conditions are retained in the user's context and clearly marked as not yet interpreted by the deterministic engine.

---

# Medication and supplement capture

A count + small category list is not enough.

Required model:

- yes/no master question;
- named/manual medicine entries;
- optional category;
- reason/purpose where user knows it (e.g. cholesterol, blood pressure, thyroid, diabetes);
- dose/frequency can be optional structured detail, not mandatory for the first pass;
- supplements support named/manual entries in addition to common chips;
- preserve unrecognized entries as context.

Example quality requirement: a user taking a cholesterol-lowering medicine must be able to record it even if no predefined category exactly matches.

---

# Current concerns / symptoms

The current five-item list is only a starter.

Required behavior:

- broader high-value symptom/concern groups;
- search or expandable categories where appropriate;
- `Other concern` manual entry;
- optional free-text detail;
- red-flag concepts remain deterministic and structured;
- free text does not silently trigger medical rules unless intentionally mapped/validated.

---

# Physical activity model

`exercise days >=30 minutes` is too lossy.

At minimum capture:

- walking for exercise/transport;
- walking days/week;
- approximate walking minutes/day or session;
- structured exercise types (e.g. strength, running/jogging, cycling, sport, yoga/mobility, swimming, other);
- days/week;
- minutes/session;
- rough intensity (light / moderate / vigorous);
- optionally steps/day when known.

The engine may derive normalized activity summaries, but it must preserve raw user-reported components.

A person who walks daily must not be treated the same as someone reporting no activity simply because they do not call it “exercise.”

---

# Known tests / lab evidence

The intake must not ask only HbA1c and B12 because those happen to be the first implemented rules.

Capture and interpretation are decoupled.

## Initial broader capture catalogue

At minimum provide capture paths for commonly known values such as:

- HbA1c;
- fasting/random glucose when appropriate;
- Vitamin B12;
- Vitamin D;
- lipid panel (total cholesterol, LDL, HDL, triglycerides);
- hemoglobin/CBC headline values where known;
- ferritin/iron where known;
- TSH and selected thyroid values where known;
- blood pressure;
- other/manual test/measurement.

Every structured lab record should retain where available:

- marker;
- numeric/text value;
- unit;
- collection date;
- source;
- verification state;
- reference range if supplied by the report.

Only markers with an implemented, sourced and applicable deterministic rule may affect deterministic findings. Other values remain visible as `recorded/unassessed evidence` and may be included in a future consented AI-review packet under explicit policy.

---

# Other/manual input standard

Every bounded list representing user health context should be reviewed for an `Other` path.

Manual input types:

- condition;
- medication;
- supplement;
- symptom/concern;
- exercise/activity;
- lab/test;
- family-history condition where applicable;
- optional additional health context.

Manual/free-text evidence is preserved but must carry a status such as:

- `structured`;
- `user_reported_unstructured`;
- `unassessed`;
- `needs_clarification`.

Unstructured text must not be silently transformed into a confirmed diagnosis or measurement.

---

# Detail / AI readiness

The detailed assessment packet should contain more than the narrow set of currently interpreted findings.

It should preserve:

- structured captured facts;
- unassessed but relevant known conditions;
- medication/supplement names;
- known labs/measurements even when no current deterministic rule exists;
- user-entered concerns/context;
- provenance and uncertainty state.

However, external AI review remains opt-in and privacy-minimized. The external packet should select necessary context rather than automatically transmitting every free-text field.

AI must not be used to compensate for poor intake design.

---

# Consumer UX standard

The current engineering-style UI is not sufficient for alpha quality.

Required direction:

- strong visual hierarchy;
- one clear primary action per block;
- grouped cards/sections instead of dozens of isolated screens;
- useful progress such as `About you → Health history → Lifestyle → Tests → Follow-ups`;
- selected values easy to scan/edit;
- tasteful mobile-first spacing/typography;
- user-facing language first, clinical provenance second;
- technical rule/source details remain accessible in expandable detail;
- Health Map leads with `What matters`, `What is missing`, `What to do next`, and `What changed`;
- no large developer-oriented data dumps on the main journey.

---

# Quality gates before AI or clinical expansion

Before M10 live AI evaluation, M11, or broad disease expansion:

1. block navigation must be stable;
2. no known user fact should be lost because the option list is narrow;
3. manual/Other capture must exist for important context;
4. measurement units must be human-friendly;
5. activity capture must include walking and intensity/duration;
6. known lab capture must be broader than currently interpreted markers;
7. the detailed packet must retain structured + unassessed context;
8. golden scenarios must test navigation and input preservation, not only medical outputs;
9. mobile and web must use shared capture semantics;
10. hands-on owner review must judge the resulting assessment credible enough to continue.

## Product kill criterion

If Jaanch cannot capture a user's material health context accurately enough for the user to trust the Health Map, adding AI or more rules is not a solution. Assessment quality is a release-blocking product criterion.
