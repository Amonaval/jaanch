# Strategic Review 3 — Consumer Value / Wow-Factor Review

Date: 2026-10-09  
Scope: Whole-product review through M11 + M13.5  
Decision: **CONTINUE WITH MAJOR CHANGES — PAUSE FEATURE EXPANSION, RESET THE CONSUMER EXPERIENCE**

## Direct answer

If I evaluate Jaanch as a skeptical consumer rather than as the engineer who built it:

> **No, I would not currently describe the product as “very good”, and I would not expect a first-time user to say “wow”.**

I would describe it as **careful, technically thoughtful, trustworthy in its boundaries, but too laborious and too weakly synthesized for the value returned**.

The engineering quality is materially ahead of the user experience.

That is the central SR3 finding.

---

## Scorecard

These are product-review scores, not code-quality scores.

| Area | Score / 10 | Review |
|---|---:|---|
| Safety / evidence integrity | 8.5 | Strongest part of the product. |
| Deterministic architecture | 8.0 | Coherent and reusable. |
| Auditability / provenance | 8.0 | Better than most prototypes. |
| Immediate user value | 4.5 | Some useful signals, but often obvious or generic. |
| Personalization depth | 4.0 | Facts are personalized; conclusions often are not. |
| Actionability | 5.0 | Safe actions exist, but many are generic clinician/lifestyle advice. |
| Ease / friction | 3.5 | Too much input and review work for the output. |
| Longitudinal pull | 2.5 | Architecture exists, but repeat use is inconvenient. |
| Differentiation | 4.0 | Trust architecture is differentiated; visible experience is not yet. |
| “Wow” factor | 2.5 | No consistent moment that justifies the effort. |

**Would I recommend it to a friend today? No.**  
**Would I keep building it? Yes — but only after changing what we optimize for.**

---

# 1. The product has a trust engine, not yet a killer experience

The strongest assets are mostly invisible:

- evidence graph;
- applicability gates;
- provenance;
- freshness/unit/verification checks;
- safe recommendation boundaries;
- report candidate review;
- longitudinal comparison primitives;
- AI privacy and invariant validation.

These are valuable foundations.

But users do not experience architecture. They experience:

> “I entered a lot of information. What did you tell me that I did not already know?”

Today the answer is often not strong enough.

The product needs to turn its internal rigor into **compression, prioritization and useful surprise**.

---

# 2. The current result is a card wall, not a health story

The consumer result currently exposes:

- evidence completeness;
- interpreted-area count;
- uncertainty count;
- retained-context count;
- best next step;
- priorities;
- action plan;
- supported signals;
- evidence gaps;
- change summary;
- raw captured context;
- measured evidence;
- save controls.

This is logically organized, but still asks the user to interpret Jaanch.

The product should instead do the compression itself.

A useful result should answer in the first screen:

1. **What are the 1–3 things I should care about?**
2. **Why, specifically for me?**
3. **What should I do next?**
4. **What can safely wait?**
5. **What information would most change this view?**
6. **What changed since last time?**

Everything else can sit behind “Why?” / “Evidence” / “Details”.

## SR3 conclusion

**The Health Map is semantically good but experientially over-exposed.**

Evidence detail should be available, not dominant.

---

# 3. Evidence-completeness percentage is technically defensible but not valuable enough

The result prominently shows an evidence-completeness percentage with repeated disclaimers that it is not a health score.

That is safe, but it creates a UX smell:

- if we must repeatedly explain what the number is *not*, it may not deserve top-level prominence;
- users care more about the missing fact that changes a decision than about a percentage of configured inputs;
- a 72% completeness number is less useful than “one missing BP repeat is the main thing preventing a stronger conclusion.”

## Decision

Demote evidence completeness from primary KPI to diagnostic/detail information.

Replace it with **decision-changing evidence gaps**.

---

# 4. The deterministic breadth is still too narrow for the apparent product promise

Current core interpretation is concentrated around:

- metabolic screening;
- B12/nutrition;
- sleep;
- chest-pain safety;
- BP;
- lipids;
- haemoglobin/ferritin;
- thyroid.

This is enough for a prototype, but the UI can feel like a broad personal-health assessment.

That creates a mismatch:

> broad intake + broad-looking Health Map + narrow actual interpretation.

A user may enter digestive, skin/hair, mood, urinary, pain, headache, palpitations or other context that is retained but not deeply interpreted.

## Decision

Do **not** solve this by immediately adding 30 more rules.

First make the supported domains excellent and transparently show:

- **interpreted now**;
- **recorded but not yet interpreted**;
- **not enough evidence**.

Breadth expansion remains secondary to value quality.

---

# 5. The recommendations are safe, but often generic

Examples of current recommendation shapes include:

- increase physical activity progressively;
- improve eating-pattern quality;
- repeat BP correctly;
- review lipids in full cardiovascular-risk context;
- review low haemoglobin/ferritin with a clinician;
- confirm thyroid signal with clinician-guided testing.

These are responsible.

But a user can reasonably respond:

> “I already knew I should exercise, eat better, repeat high BP and talk to a doctor about abnormal labs.”

The missing value is **personal decision synthesis**.

For example, a cardiometabolic profile should not feel like five unrelated cards. It should compress to something like:

> “Your waist, HbA1c, BP, LDL/TG and family history cluster into one cardiometabolic priority. The most useful next steps are to confirm BP and review overall cardiovascular/metabolic risk; generic wellness changes are secondary to resolving those two decisions.”

That is much more valuable than repeating each rule separately.

## Decision

Build cross-rule **health themes / priority synthesis** before adding more recommendation inventory.

---

# 6. Repeat use is currently a major product failure

The longitudinal architecture is strong, but the consumer loop is weak.

Current `Start new check-in` resets answers, context and labs.

That means a returning user may have to re-enter profile facts that usually did not change.

This directly undermines the longitudinal proposition.

A repeat health product should feel like:

> “What changed since last time?”

not:

> “Fill the assessment again.”

## Decision — BLOCKER

The next value mission must implement **Smart Recheck**:

- start from the latest saved profile;
- retain stable profile/history/medication context;
- ask only time-sensitive or previously incomplete information;
- highlight what changed before saving;
- target a routine repeat check-in of roughly 60–90 seconds when little has changed.

Until this exists, longitudinal value is mostly architectural rather than experiential.

---

# 7. Report-first use is too much work

Current report flow is safe but cumbersome:

1. user needs a saved baseline;
2. attach PDF/image;
3. paste report text/OCR output manually;
4. extract candidates;
5. review value/unit/date;
6. apply to saved profile.

For a user who arrives because they already have a lab report, this is backwards.

A compelling health product should eventually allow:

> report first → extract → verify only uncertain items → ask only missing personal context → produce brief

## Decision

Report-first experience becomes the mission after the Health Brief / Smart Recheck reset.

Do not weaken provenance or confirmation just to reduce clicks. Reduce friction through better automation and confidence-based review.

---

# 8. Profiles & mocks are developer infrastructure exposed as product

The top navigation exposes:

- Import lab report;
- Profiles & mocks;
- AI Review.

`Profiles & mocks` is useful engineering infrastructure, but it should not look like a primary consumer destination.

Protocol labels, runtime traces and internal version names are similarly useful for debugging but not first-level product value.

## Decision

Create a consumer-first navigation model.

Move test/mocks/protocol/debug surfaces behind **Developer / Advanced tools**.

---

# 9. AI v1/v2 is technically sophisticated but strategically premature

M10/M10.1/M11 added:

- privacy-minimized packets;
- strict schemas;
- safety validation;
- contextual capsule;
- longitudinal deltas;
- material-addition gate;
- contradiction tracking;
- clinician brief.

The engineering is good.

But SR2 had already stated that M11 should be conditional on demonstrated M10 utility.

M11 proceeded because the owner explicitly requested implementation before completing that live utility test. From a product-process perspective, that was still a **validation inversion**.

We built more AI machinery before proving that the existing product result was compelling.

The current AI screen also adds another large set of panels:

- material addition;
- AI explanation;
- longitudinal synthesis;
- prioritized gaps;
- contradictions;
- clinician brief;
- base domain review;
- safety gate;
- runtime trace.

This risks producing *more reading*, not more value.

## Decision

**FREEZE further AI expansion.**

Keep M11 available as an experimental optional reviewer.

Do not build M11.1/M12-style AI sophistication until the core Health Brief itself is very good.

If AI remains, its ideal consumer role is likely one compact “second opinion / insight” section embedded in the result—not a parallel mini-product.

---

# 10. What is actually close to a wow moment?

There are promising ingredients, but none are fully delivered yet.

## Latent wow #1 — “Jaanch connected things I saw as separate”

Example target:

> “These five measurements are not five separate problems; they form one cardiometabolic pattern, and two next decisions matter more than the rest.”

This is the strongest opportunity.

## Latent wow #2 — “It told me what NOT to do”

Examples:
- one BP reading is not a diagnosis;
- one TSH does not justify autonomous medicine change;
- low Hb/ferritin needs cause-oriented review rather than blind iron dosing;
- many recorded measurements do not justify interpretation without unit/date/context.

This creates trust, but needs to be phrased as useful decision guidance rather than repeated disclaimers.

## Latent wow #3 — “It knew exactly what changed”

A 60-second recheck that says:

> “Three things changed. Only one materially changes the plan.”

would be genuinely compelling.

## Latent wow #4 — “I uploaded a report and got a decision brief”

Future target:

> Upload → verify uncertain extraction → Jaanch asks 3 missing questions → one-page result.

That is a much stronger acquisition loop than questionnaire-first.

---

# 11. Critical user-journey review

| Journey | Current value | Verdict |
|---|---|---|
| Healthy / low-risk user | Mostly reassurance + gaps | **Weak** — too much effort for little insight |
| Cardiometabolic high-signal profile | Multiple useful signals | **Promising**, but fragmented; lacks cluster synthesis |
| B12 + iron profile | Useful coexistence of evidence | **Good seed**, still too clinician-generic |
| Thyroid signal on treatment | Correctly cautious | **Useful but obvious**; lacks treatment-context questions/synthesis |
| TG >=1000 profile | Correct high-attention flag | **Important**, but root-cause / prioritization experience is shallow |
| Returning user | Comparison engine exists | **Poor UX** because new check-in resets profile |
| Report-first user | Provenance is strong | **Poor UX** because baseline + pasted OCR + manual review are prerequisites |
| AI reviewer | Strong constraints | **Unproven value** and currently risks extra verbosity |

---

# 12. Product reset: what to keep, hide, freeze and build

## KEEP — this is the foundation

- deterministic engine;
- safety/applicability;
- evidence graph;
- normalized evidence eligibility;
- report provenance;
- clinical source governance;
- longitudinal snapshot/comparison model;
- local persistence contract;
- AI safety/privacy contracts as optional infrastructure.

## HIDE / DEMOTE from normal consumer flow

- Profiles & mocks;
- protocol/version labels;
- runtime/provider trace;
- raw evidence completeness percentage as a hero metric;
- technical maturity labels unless the user opens details;
- raw captured-context wall.

## FREEZE

- further AI missions;
- MCP/ChatGPT integration;
- cloud backend/auth;
- mobile parity work;
- Rule Studio;
- broad clinical-domain expansion;
- production/store hardening.

## BUILD NEXT

### M13.6 — Consumer Value Reset: Health Intelligence Brief + Smart Recheck

Effort: **High**

Mission objective:

> Make supported Jaanch scenarios feel dramatically more useful without adding broad new clinical scope.

Required scope:

1. Replace the card-wall result with a **one-screen Health Intelligence Brief**.
2. Compress findings into maximum **1–3 health priorities/themes**.
3. Add cross-rule synthesis for evidence that clearly belongs to one priority cluster.
4. For every priority show:
   - what Jaanch sees;
   - why it matters for this person;
   - evidence chain;
   - next best action;
   - what can wait;
   - what missing evidence would change the conclusion.
5. Demote evidence-completeness percentage.
6. Hide developer/testing surfaces from primary navigation.
7. Implement **Smart Recheck** from latest saved profile instead of blank reset.
8. Show a pre-save “what changed” review.
9. Keep full evidence/provenance in expandable details.
10. AI v2 remains optional and is not allowed to define the core brief.

### M13.6 exit gate

For each of the five mocks, the first screen must let a user answer within 10 seconds:

- What is my top concern?
- Why?
- What should I do next?
- What information matters next?

A returning unchanged user should be able to complete a repeat check-in without re-entering stable profile data.

---

# 13. Next after M13.6

### M13.7 — Report-First Intelligence + Friction Reduction

Effort: High

Target experience:

```text
Upload report
   ↓
extract structured candidates
   ↓
review only uncertain/high-risk items
   ↓
ask minimum missing context
   ↓
Health Intelligence Brief
```

This mission may evaluate trustworthy OCR/document extraction, but it must preserve candidate review, provenance, units, dates and eligibility gates.

---

# 14. Pilot decision

**M15A is NOT next.**

The product is not yet compelling enough to justify spending effort on production pilot infrastructure.

Pilot preparation only becomes rational after:

1. M13.6 makes the supported scenarios genuinely useful;
2. repeat-use friction is fixed;
3. M13.7 or an equivalent report-first flow materially reduces acquisition friction;
4. owner testing says “I would actually use this again.”

---

# 15. New north-star test

Before every future mission ask:

> **Does this materially improve what a user understands or can decide within 60 seconds?**

If not, it is probably infrastructure we do not need yet.

A second test:

> **Can the user repeat the key insight to a spouse or doctor after closing the app?**

If the answer is no, the product probably has not synthesized enough.

---

# Final SR3 decision

## **CONTINUE WITH MAJOR CHANGES**

Jaanch should continue because the trust/evidence foundation is unusually strong for a prototype.

But the current experience does **not** justify more AI, more backend, more platforms or more rules.

The next phase is a **consumer-value reset**:

> **less architecture visible, less input repetition, fewer cards, stronger synthesis, clearer priorities, much faster repeat use.**

The product should earn “very good” on the five existing mocks before trying to earn “comprehensive”.

Only after that should we pursue wow-level report automation, pilot infrastructure or broader clinical scope.
