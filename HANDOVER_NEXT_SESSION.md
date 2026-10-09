# Jaanch — New Session Handover Prompt

You are taking over active development of **Jaanch**, a deterministic, evidence-aware personal health assessment and prevention product.

## 1. Start here

Repository: `Amonaval/jaanch`  
Default branch: `main`

Always fetch current `main` before writing.

Read completely:

```text
docs/reviews/SR3_CONSUMER_VALUE_WOW_FACTOR.md
docs/missions/STATUS.md
docs/product/ROADMAP.md
docs/missions/M13.6_CONSUMER_VALUE_RESET_PLAN.md
README.md
```

Then inspect current source relevant to the task.

## 2. Strategic Review 3 is the controlling decision

SR3 decision:

> **CONTINUE WITH MAJOR CHANGES — PAUSE FEATURE EXPANSION, RESET THE CONSUMER EXPERIENCE.**

Do not interpret engineering completion through M11/M13.5 as product success.

SR3 explicitly judged:
- safety/evidence integrity: strong;
- architecture: strong;
- immediate user value: weak/moderate;
- friction: high;
- longitudinal pull: weak;
- wow factor: weak.

The current product is **not pilot-ready** and should not receive more AI/backend/mobile/platform expansion before visible user value improves.

## 3. Core product boundaries remain non-negotiable

Jaanch is not an AI diagnosis chatbot.

1. questionnaire signals are not diagnoses;
2. confidence is not disease probability;
3. no generic overall health score;
4. evidence completeness is not overall health;
5. capture does not automatically authorize interpretation;
6. report extraction creates candidates only;
7. unit/date/source must not be guessed;
8. one measurement does not automatically become a diagnosis;
9. prescription-medication changes are never autonomous;
10. therapeutic/high-dose iron/thyroid/lipid/supplement regimens are not autonomously generated;
11. urgent red flags override routine flow;
12. applicability runs before rules/recommendations;
13. AI cannot override deterministic urgent/safety/applicability/evidence gates;
14. clinical maturity remains explicit (`prototype` / `reviewed` / `approved`);
15. current browser/mobile storage is not Jaanch-encrypted medical-record storage;
16. provider secrets never enter browser/mobile code;
17. AI remains explicit-consent/minimum-necessary and optional.

Do not weaken these boundaries to make the product feel simpler.

## 4. What is already implemented and should be reused

### Deterministic foundation
M01–M09.1:
- adaptive assessment;
- evidence graph;
- rule/source registry;
- safety;
- applicability;
- minimum-useful investigations;
- normalized lab reassessment;
- recommendations;
- verification.

### Product/evidence foundation
M13–M13.5:
- local longitudinal snapshots;
- assessment-quality recovery;
- consumer Health Map;
- reviewed report evidence capture;
- bounded BP/lipids/anaemia-iron/thyroid interpretation;
- profile import/export + five mocks;
- versioned local persistence/security architecture.

### AI infrastructure
M10/M10.1/M11:
- privacy-minimized v1/v2 packets;
- strict output schemas;
- safety invariant validation;
- server-only OpenAI provider;
- contextual capsule;
- latest-two-check-in deltas;
- material-addition gate;
- contradiction/evidence-gap/clinician-prep output;
- v1/v2 live gate commands.

AI utility remains unproven. Keep it optional/experimental.

## 5. Main SR3 product failures

### A. Card-wall result
The result exposes many sections/counters/details but does not compress enough into a memorable health story.

### B. Generic actions
Recommendations are safe but often obvious. The missing value is cross-signal decision synthesis.

### C. Repeat-use failure
`apps/web/src/App.tsx` currently resets answers/context/labs on `Start new check-in`.

This must be replaced by Smart Recheck from the latest saved profile.

### D. Report-first friction
Current report flow requires saved baseline + pasted OCR/text + candidate review before value appears.

### E. Developer surfaces in consumer navigation
Profiles & mocks, protocol versions and runtime traces should not define primary UX.

### F. AI over-investment
No further AI mission until the core Health Brief itself is compelling and live-model utility is proven.

## 6. NEXT MISSION — M13.6

**M13.6 — Consumer Value Reset: Health Intelligence Brief + Smart Recheck**  
Effort: **High**

Mission doc:

```text
docs/missions/M13.6_CONSUMER_VALUE_RESET_PLAN.md
```

Required implementation outcomes:

1. Replace current result card wall with a one-screen **Health Intelligence Brief**.
2. Maximum 1–3 health priorities/themes.
3. Add deterministic cross-rule synthesis where several findings clearly belong to one health priority.
4. Every priority answers:
   - what Jaanch sees;
   - why it matters to this person;
   - evidence chain;
   - next best action;
   - what can wait;
   - what evidence would change the conclusion.
5. Demote evidence-completeness percentage.
6. Move developer/mock/protocol/runtime surfaces out of primary navigation.
7. Smart Recheck starts from latest saved profile instead of blank state.
8. Retain stable profile/history/medicine context.
9. Prioritize time-sensitive or missing fields on recheck.
10. Show a pre-save “what changed” confirmation.
11. Keep evidence/provenance in expandable detail.
12. AI v2 may be shown only as optional compact second-opinion infrastructure; it cannot define the core brief.

## 7. M13.6 mock gates

### Low-risk adult
Must be concise and appropriately quiet. Do not create generic wellness filler just to have content.

### Cardiometabolic + lipids
Must synthesize waist/body composition, HbA1c, BP, LDL/TG and family history into a coherent priority instead of isolated cards.

### Vegetarian + B12 + iron
Must explain concurrent B12 + anaemia/iron evidence, distinguish known facts from cause uncertainty, and prioritize cause-oriented next steps.

### Thyroid signal
Must clearly explain the marked TSH signal and treatment context without diagnosis or autonomous dose advice.

### Severe triglycerides
TG >=1000 must dominate less-important lipid details and preserve clinician-review boundaries.

## 8. M13.6 exit gate

For each mock, within 10 seconds of the first result screen, user should know:

1. top concern;
2. why;
3. next action;
4. next evidence.

Returning-user gate:
- stable data prefilled;
- unchanged routine recheck substantially faster than first intake;
- user does not rebuild profile/history from zero;
- changes previewed before saving.

## 9. After M13.6

Planned next:

**M13.7 — Report-First Intelligence + Friction Reduction — High**

Target:

```text
upload report
→ structured extraction
→ review uncertain/high-risk fields
→ ask minimum missing context
→ Health Intelligence Brief
```

Do not weaken provenance/confirmation/unit/date/freshness rules.

## 10. Frozen until value gates pass

Do not start without explicit owner override:
- further AI expansion;
- mobile parity;
- cloud/auth/backend;
- M14 ChatGPT/MCP;
- M12 Rule Studio;
- broad clinical-domain expansion;
- M15A pilot hardening;
- M15B store/production hardening.

## 11. New north-star tests

Before adding work ask:

> **Does this materially improve what the user understands or can decide within 60 seconds?**

and:

> **Can the user repeat the key insight to another person after closing the app?**

and:

> **Does the output justify the amount of information the user had to provide?**

If not, defer the work.

## 12. Working rules

- Fix value/friction issues before architecture expansion.
- Prefer deletion/simplification to adding another surface.
- Preserve deterministic safety/evidence boundaries.
- Normal mission budget 1–2 coherent commits when practical.
- Do not add GitHub Actions unless requested.
- Do not restore `@jaanch/core: "workspace:*"`.
- Update mission docs, STATUS, ROADMAP and handover at closure.
